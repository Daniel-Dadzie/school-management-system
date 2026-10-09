package com.karatu.sis.reporting.api;

import com.karatu.sis.reporting.service.ReportSnapshotService;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
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

    @GetMapping("/{id}/pdf")
    @PreAuthorize("hasAuthority('reporting.read')")
    public ResponseEntity<byte[]> downloadPdf(@PathVariable UUID id) {
        byte[] pdfBytes = reportSnapshotService.downloadReportCardPdf(id);
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", "report-card-" + id + ".pdf");
        
        return ResponseEntity.ok()
                .headers(headers)
                .body(pdfBytes);
    }

    @GetMapping("/student/{studentId}")
    @PreAuthorize("hasAuthority('reporting.read') or hasAnyRole('PARENT', 'TEACHER', 'ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ReportSnapshotDto> getStudentSnapshot(
            @PathVariable UUID studentId,
            @RequestParam UUID academicYearId,
            @RequestParam UUID termId) {
            
        ReportSnapshotDto snapshot = reportSnapshotService.getSnapshotForStudent(studentId, academicYearId, termId);
        return ResponseEntity.ok(snapshot);
    }

    @GetMapping("/student/{studentId}/pdf")
    @PreAuthorize("hasAuthority('reporting.read') or hasAnyRole('PARENT', 'TEACHER', 'ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<byte[]> downloadStudentPdf(
            @PathVariable UUID studentId,
            @RequestParam UUID academicYearId,
            @RequestParam UUID termId) {
            
        byte[] pdfBytes = reportSnapshotService.downloadReportCardPdfByStudent(studentId, academicYearId, termId);
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", "report-card-" + studentId + ".pdf");
        
        return ResponseEntity.ok()
                .headers(headers)
                .body(pdfBytes);
    }

    @PostMapping("/student/{studentId}/publish")
    @PreAuthorize("hasAuthority('reporting.manage')")
    public ResponseEntity<Void> publishSnapshotForStudent(
            @PathVariable UUID studentId,
            @RequestBody java.util.Map<String, UUID> request) {
        
        UUID academicYearId = request.get("academicYearId");
        UUID termId = request.get("termId");
        
        reportSnapshotService.publishSnapshotForStudent(studentId, academicYearId, termId);
        return ResponseEntity.noContent().build();
    }
}
