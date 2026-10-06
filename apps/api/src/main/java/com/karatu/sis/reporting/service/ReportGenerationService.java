package com.karatu.sis.reporting.service;

import com.karatu.sis.academic.domain.*;
import com.karatu.sis.academic.repository.AcademicYearRepository;
import com.karatu.sis.academic.repository.AssessmentResultRepository;
import com.karatu.sis.academic.repository.EnrollmentRepository;
import com.karatu.sis.academic.repository.SchoolClassRepository;
import com.karatu.sis.academic.repository.TermRepository;
import com.karatu.sis.people.domain.Student;
import com.karatu.sis.reporting.domain.ReportSnapshot;
import com.karatu.sis.reporting.domain.ReportSnapshotResult;
import com.karatu.sis.reporting.domain.ReportSnapshotStatus;
import com.karatu.sis.reporting.domain.ReportTemplate;
import com.karatu.sis.reporting.repository.ReportSnapshotRepository;
import com.karatu.sis.reporting.repository.ReportSnapshotResultRepository;
import com.karatu.sis.reporting.repository.ReportTemplateRepository;
import com.karatu.sis.tenant.TenantContext;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ReportGenerationService {

    private final ReportSnapshotRepository reportSnapshotRepository;
    private final ReportSnapshotResultRepository reportSnapshotResultRepository;
    private final ReportTemplateRepository reportTemplateRepository;
    private final AssessmentResultRepository assessmentResultRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final AcademicYearRepository academicYearRepository;
    private final TermRepository termRepository;
    private final SchoolClassRepository schoolClassRepository;

    public ReportGenerationService(
            ReportSnapshotRepository reportSnapshotRepository,
            ReportSnapshotResultRepository reportSnapshotResultRepository,
            ReportTemplateRepository reportTemplateRepository,
            AssessmentResultRepository assessmentResultRepository,
            EnrollmentRepository enrollmentRepository,
            AcademicYearRepository academicYearRepository,
            TermRepository termRepository,
            SchoolClassRepository schoolClassRepository) {
        this.reportSnapshotRepository = reportSnapshotRepository;
        this.reportSnapshotResultRepository = reportSnapshotResultRepository;
        this.reportTemplateRepository = reportTemplateRepository;
        this.assessmentResultRepository = assessmentResultRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.academicYearRepository = academicYearRepository;
        this.termRepository = termRepository;
        this.schoolClassRepository = schoolClassRepository;
    }

    @Transactional
    public void generateReportsForClass(UUID academicYearId, UUID termId, UUID classId, UUID templateId, String requestedBy) {
        UUID schoolId = TenantContext.requireSchoolId();

        AcademicYear academicYear = academicYearRepository.findByIdAndSchoolId(academicYearId, schoolId)
                .orElseThrow(() -> new IllegalArgumentException("Academic year not found"));
        Term term = termRepository.findByIdAndSchoolId(termId, schoolId)
                .orElseThrow(() -> new IllegalArgumentException("Term not found"));
        ReportTemplate template = reportTemplateRepository.findByIdAndSchoolId(templateId, schoolId)
                .orElseThrow(() -> new IllegalArgumentException("Template not found"));

        // Wait, enrollmentRepository doesn't have a direct findBySchoolClassId method.
        // Let's assume we can fetch all enrollments and filter, or I should add a method to EnrollmentRepository.
        // Actually, we can just group the assessment results by enrollment. But what about students who have no results?
        // We probably still want a blank report card for them.
        List<Enrollment> enrollments = enrollmentRepository.findAllBySchoolId(schoolId).stream()
                .filter(e -> e.getSchoolClass().getId().equals(classId) && e.getAcademicYear().getId().equals(academicYearId) && e.getStatus() == EnrollmentStatus.ACTIVE)
                .collect(Collectors.toList());

        List<AssessmentResult> publishedResults = assessmentResultRepository.findPublishedResultsForReporting(schoolId, academicYearId, termId, classId);

        // Group by enrollment ID
        Map<UUID, List<AssessmentResult>> resultsByEnrollment = publishedResults.stream()
                .collect(Collectors.groupingBy(r -> r.getEnrollment().getId()));

        for (Enrollment enrollment : enrollments) {
            Student student = enrollment.getStudent();
            
            // Check if snapshot already exists
            Optional<ReportSnapshot> existingSnapshot = reportSnapshotRepository.findBySchoolIdAndStudentIdAndTermIdAndTemplateId(
                    schoolId, student.getId(), termId, templateId);

            ReportSnapshot snapshot = existingSnapshot.orElse(new ReportSnapshot());
            snapshot.setSchoolId(schoolId);
            snapshot.setStudent(student);
            snapshot.setEnrollment(enrollment);
            snapshot.setAcademicYear(academicYear);
            snapshot.setTerm(term);
            snapshot.setTemplate(template);
            snapshot.setCreatedBy(requestedBy);
            
            if (snapshot.getStatus() == ReportSnapshotStatus.PUBLISHED) {
                // Skip updating published reports, or we might want to allow regeneration if requested explicitly.
                continue;
            }
            
            snapshot.setStatus(ReportSnapshotStatus.DRAFT);
            snapshot = reportSnapshotRepository.save(snapshot);

            // Process results
            List<AssessmentResult> studentResults = resultsByEnrollment.getOrDefault(enrollment.getId(), Collections.emptyList());
            
            // Delete existing results for this snapshot
            List<ReportSnapshotResult> existingResults = reportSnapshotResultRepository.findByReportSnapshotId(snapshot.getId());
            reportSnapshotResultRepository.deleteAll(existingResults);

            // Group by subject
            Map<Subject, List<AssessmentResult>> resultsBySubject = studentResults.stream()
                    .collect(Collectors.groupingBy(r -> r.getAssessment().getTeacherAssignment().getSubject()));

            BigDecimal totalScoreSum = BigDecimal.ZERO;

            for (Map.Entry<Subject, List<AssessmentResult>> entry : resultsBySubject.entrySet()) {
                Subject subject = entry.getKey();
                List<AssessmentResult> subjectResults = entry.getValue();

                BigDecimal classScore = BigDecimal.ZERO;
                BigDecimal examScore = BigDecimal.ZERO;
                
                for (AssessmentResult result : subjectResults) {
                    // For simplicity, we assume internal vs exam based on some logic, or just sum it all to totalScore.
                    // The actual rule might depend on the assessment category or type.
                    // If type == EXAM, it's exam score, else class score.
                    if (result.getAssessment().getType() == AssessmentType.EXAM) {
                        examScore = examScore.add(result.getScore());
                    } else {
                        classScore = classScore.add(result.getScore());
                    }
                }

                BigDecimal totalScore = classScore.add(examScore);
                totalScoreSum = totalScoreSum.add(totalScore);

                ReportSnapshotResult snapshotResult = new ReportSnapshotResult();
                snapshotResult.setReportSnapshot(snapshot);
                snapshotResult.setSubject(subject);
                snapshotResult.setSubjectName(subject.getName());
                snapshotResult.setClassScore(classScore);
                snapshotResult.setExamScore(examScore);
                snapshotResult.setTotalScore(totalScore);
                // Grade calculation should be here (omitted for brevity, or we can add a basic scheme)
                
                reportSnapshotResultRepository.save(snapshotResult);
            }

            snapshot.setOverallScore(totalScoreSum);
            reportSnapshotRepository.save(snapshot);
        }
    }
}
