package com.karatu.sis.reporting.service;

import com.karatu.sis.reporting.api.ReportSnapshotDto;
import com.karatu.sis.reporting.domain.ReportSnapshot;
import com.karatu.sis.reporting.domain.ReportSnapshotStatus;
import com.karatu.sis.reporting.repository.ReportSnapshotRepository;
import com.karatu.sis.tenant.TenantContext;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import com.karatu.sis.reporting.repository.ReportSnapshotResultRepository;
import com.karatu.sis.reporting.domain.ReportSnapshotResult;
import com.karatu.sis.tenant.repository.SchoolRepository;
import com.karatu.sis.tenant.domain.School;

@Service
public class ReportSnapshotService {

    private final ReportSnapshotRepository reportSnapshotRepository;
    private final ReportSnapshotResultRepository resultRepository;
    private final SchoolRepository schoolRepository;
    private final PdfGenerationService pdfGenerationService;

    public ReportSnapshotService(ReportSnapshotRepository reportSnapshotRepository,
                                 ReportSnapshotResultRepository resultRepository,
                                 SchoolRepository schoolRepository,
                                 PdfGenerationService pdfGenerationService) {
        this.reportSnapshotRepository = reportSnapshotRepository;
        this.resultRepository = resultRepository;
        this.schoolRepository = schoolRepository;
        this.pdfGenerationService = pdfGenerationService;
    }

    @Transactional(readOnly = true)
    public List<ReportSnapshotDto> getSnapshotsForClass(UUID academicYearId, UUID termId, UUID classId) {
        UUID schoolId = TenantContext.requireSchoolId();
        
        List<ReportSnapshot> snapshots = reportSnapshotRepository.findBySchoolIdAndAcademicYearIdAndTermIdAndEnrollmentSchoolClassId(
                schoolId, academicYearId, termId, classId);
                
        return snapshots.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Transactional
    public void publishSnapshot(UUID snapshotId) {
        UUID schoolId = TenantContext.requireSchoolId();
        ReportSnapshot snapshot = reportSnapshotRepository.findByIdAndSchoolId(snapshotId, schoolId)
                .orElseThrow(() -> new RuntimeException("Snapshot not found"));
                
        snapshot.setStatus(ReportSnapshotStatus.PUBLISHED);
        snapshot.setPublishedAt(LocalDateTime.now());
        reportSnapshotRepository.save(snapshot);
    }
    
    @Transactional
    public void bulkPublishSnapshots(List<UUID> snapshotIds) {
        UUID schoolId = TenantContext.requireSchoolId();
        
        for (UUID id : snapshotIds) {
            ReportSnapshot snapshot = reportSnapshotRepository.findByIdAndSchoolId(id, schoolId)
                    .orElse(null);
                    
            if (snapshot != null && snapshot.getStatus() != ReportSnapshotStatus.PUBLISHED) {
                snapshot.setStatus(ReportSnapshotStatus.PUBLISHED);
                snapshot.setPublishedAt(LocalDateTime.now());
                reportSnapshotRepository.save(snapshot);
            }
        }
    }

    @Transactional(readOnly = true)
    public byte[] downloadReportCardPdf(UUID snapshotId) {
        UUID schoolId = TenantContext.requireSchoolId();
        
        ReportSnapshot snapshot = reportSnapshotRepository.findByIdAndSchoolId(snapshotId, schoolId)
                .orElseThrow(() -> new RuntimeException("Snapshot not found"));
                
        List<ReportSnapshotResult> results = resultRepository.findByReportSnapshotId(snapshotId);
        
        School school = schoolRepository.findById(schoolId)
                .orElseThrow(() -> new RuntimeException("School not found"));
                
        return pdfGenerationService.generateReportCardPdf(snapshot, results, school);
    }

    @Transactional(readOnly = true)
    public byte[] downloadReportCardPdfByStudent(UUID studentId, UUID academicYearId, UUID termId) {
        UUID schoolId = TenantContext.requireSchoolId();
        
        ReportSnapshot snapshot = reportSnapshotRepository.findByStudentIdAndAcademicYearIdAndTermIdAndSchoolId(studentId, academicYearId, termId, schoolId)
                .orElseThrow(() -> new RuntimeException("Snapshot not found"));
                
        List<ReportSnapshotResult> results = resultRepository.findByReportSnapshotId(snapshot.getId());
        
        School school = schoolRepository.findById(schoolId)
                .orElseThrow(() -> new RuntimeException("School not found"));
                
        return pdfGenerationService.generateReportCardPdf(snapshot, results, school);
    }

    private ReportSnapshotDto mapToDto(ReportSnapshot snapshot) {
        ReportSnapshotDto dto = new ReportSnapshotDto();
        dto.setId(snapshot.getId());
        dto.setStudentId(snapshot.getStudent().getId());
        dto.setEnrollmentId(snapshot.getEnrollment().getId());
        dto.setAcademicYearId(snapshot.getAcademicYear().getId());
        dto.setTermId(snapshot.getTerm().getId());
        dto.setTemplateId(snapshot.getTemplate().getId());
        dto.setStatus(snapshot.getStatus());
        dto.setPdfUrl(snapshot.getPdfUrl());
        dto.setOverallScore(snapshot.getOverallScore());
        dto.setOverallGrade(snapshot.getOverallGrade());
        dto.setOverallRank(snapshot.getOverallRank());
        dto.setHeadteacherComment(snapshot.getHeadteacherComment());
        dto.setTeacherComment(snapshot.getTeacherComment());
        dto.setPublishedAt(snapshot.getPublishedAt());
        return dto;
    }
}
