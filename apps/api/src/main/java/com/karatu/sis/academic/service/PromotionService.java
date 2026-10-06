package com.karatu.sis.academic.service;

import com.karatu.sis.academic.domain.Enrollment;
import com.karatu.sis.academic.domain.EnrollmentStatus;
import com.karatu.sis.academic.domain.AcademicYear;
import com.karatu.sis.academic.domain.SchoolClass;
import com.karatu.sis.academic.dto.PromotionCandidateDTO;
import com.karatu.sis.academic.dto.PromotionRequestDTO;
import com.karatu.sis.academic.repository.EnrollmentRepository;
import com.karatu.sis.academic.repository.AcademicYearRepository;
import com.karatu.sis.academic.repository.SchoolClassRepository;
import com.karatu.sis.reporting.domain.ReportSnapshot;
import com.karatu.sis.reporting.repository.ReportSnapshotRepository;
import com.karatu.sis.tenant.TenantContext;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class PromotionService {

    private final EnrollmentRepository enrollmentRepository;
    private final ReportSnapshotRepository reportSnapshotRepository;
    private final AcademicYearRepository academicYearRepository;
    private final SchoolClassRepository schoolClassRepository;

    public PromotionService(
            EnrollmentRepository enrollmentRepository,
            ReportSnapshotRepository reportSnapshotRepository,
            AcademicYearRepository academicYearRepository,
            SchoolClassRepository schoolClassRepository) {
        this.enrollmentRepository = enrollmentRepository;
        this.reportSnapshotRepository = reportSnapshotRepository;
        this.academicYearRepository = academicYearRepository;
        this.schoolClassRepository = schoolClassRepository;
    }

    public List<PromotionCandidateDTO> getPromotionCandidates(UUID academicYearId, UUID termId, UUID classId) {
        UUID schoolId = TenantContext.requireSchoolId();

        // Find active enrollments in the source class
        List<Enrollment> enrollments = enrollmentRepository.findBySchoolIdAndSchoolClassIdAndAcademicYearIdAndStatus(
                schoolId, classId, academicYearId, EnrollmentStatus.ACTIVE);

        // Find report snapshots for the term and class
        List<ReportSnapshot> snapshots = reportSnapshotRepository.findBySchoolIdAndAcademicYearIdAndTermIdAndEnrollmentSchoolClassId(
                schoolId, academicYearId, termId, classId);

        Map<UUID, ReportSnapshot> snapshotByStudent = snapshots.stream()
                .collect(Collectors.toMap(s -> s.getStudent().getId(), s -> s, (s1, s2) -> s1)); // Pick first if duplicates

        return enrollments.stream().map(enrollment -> {
            ReportSnapshot snapshot = snapshotByStudent.get(enrollment.getStudent().getId());
            return new PromotionCandidateDTO(
                    enrollment.getStudent().getId(),
                    enrollment.getStudent().getFirstName() + " " + enrollment.getStudent().getLastName(),
                    snapshot != null ? snapshot.getOverallScore() : null,
                    snapshot != null ? snapshot.getOverallGrade() : null
            );
        }).collect(Collectors.toList());
    }

    public void promoteStudents(PromotionRequestDTO request) {
        UUID schoolId = TenantContext.requireSchoolId();

        AcademicYear targetYear = academicYearRepository.findByIdAndSchoolId(request.getTargetAcademicYearId(), schoolId)
                .orElseThrow(() -> new IllegalArgumentException("Target academic year not found"));
        
        SchoolClass targetClass = schoolClassRepository.findByIdAndSchoolId(request.getTargetClassId(), schoolId)
                .orElseThrow(() -> new IllegalArgumentException("Target class not found"));

        List<Enrollment> sourceEnrollments = enrollmentRepository.findBySchoolIdAndSchoolClassIdAndAcademicYearIdAndStatus(
                schoolId, request.getSourceClassId(), request.getSourceAcademicYearId(), EnrollmentStatus.ACTIVE);

        for (Enrollment enrollment : sourceEnrollments) {
            if (request.getStudentIds().contains(enrollment.getStudent().getId())) {
                // Check if already enrolled in target year
                if (enrollmentRepository.existsByStudentIdAndAcademicYearIdAndStatusInAndSchoolId(
                        enrollment.getStudent().getId(), 
                        request.getTargetAcademicYearId(), 
                        List.of(EnrollmentStatus.ACTIVE), 
                        schoolId)) {
                    continue; // Skip if already enrolled
                }

                // Mark current as promoted
                enrollment.setStatus(EnrollmentStatus.PROMOTED);
                enrollmentRepository.save(enrollment);

                // Create new enrollment
                Enrollment newEnrollment = new Enrollment();
                newEnrollment.setSchoolId(enrollment.getSchoolId());
                newEnrollment.setStudent(enrollment.getStudent());
                newEnrollment.setAcademicYear(targetYear);
                newEnrollment.setSchoolClass(targetClass);
                newEnrollment.setStatus(EnrollmentStatus.ACTIVE);
                
                enrollmentRepository.save(newEnrollment);
            }
        }
    }
}
