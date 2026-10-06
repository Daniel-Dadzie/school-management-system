package com.karatu.sis.reporting.api;

import com.karatu.sis.reporting.service.ReportSnapshotService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/reporting/snapshots")
public class ReportSnapshotController {

    private final ReportSnapshotService reportSnapshotService;

    public ReportSnapshotController(ReportSnapshotService reportSnapshotService) {
        this.reportSnapshotService = reportSnapshotService;
    }

    @GetMapping
    @PreAuthorize("hasAuthority('reporting.read')")
    public ResponseEntity<List<ReportSnapshotDto>> getSnapshots(
            @RequestParam UUID academicYearId,
            @RequestParam UUID termId,
            @RequestParam UUID classId) {
        
        List<ReportSnapshotDto> snapshots = reportSnapshotService.getSnapshotsForClass(
                academicYearId, termId, classId);
        
        return ResponseEntity.ok(snapshots);
    }

    @PostMapping("/{id}/publish")
    @PreAuthorize("hasAuthority('reporting.manage')")
    public ResponseEntity<Void> publishSnapshot(@PathVariable UUID id) {
        reportSnapshotService.publishSnapshot(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/bulk-publish")
    @PreAuthorize("hasAuthority('reporting.manage')")
    public ResponseEntity<Void> bulkPublishSnapshots(@RequestBody List<UUID> snapshotIds) {
        reportSnapshotService.bulkPublishSnapshots(snapshotIds);
        return ResponseEntity.noContent().build();
    }
}
