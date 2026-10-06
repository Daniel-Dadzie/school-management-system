package com.karatu.sis.reporting.repository;

import com.karatu.sis.reporting.domain.ReportSnapshotResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ReportSnapshotResultRepository extends JpaRepository<ReportSnapshotResult, UUID> {
    List<ReportSnapshotResult> findByReportSnapshotId(UUID reportSnapshotId);
    Optional<ReportSnapshotResult> findByReportSnapshotIdAndSubjectId(UUID reportSnapshotId, UUID subjectId);
}
