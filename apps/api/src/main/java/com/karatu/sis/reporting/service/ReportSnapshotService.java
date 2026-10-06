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

@Service
public class ReportSnapshotService {

    private final ReportSnapshotRepository reportSnapshotRepository;

    public ReportSnapshotService(ReportSnapshotRepository reportSnapshotRepository) {
        this.reportSnapshotRepository = reportSnapshotRepository;
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
