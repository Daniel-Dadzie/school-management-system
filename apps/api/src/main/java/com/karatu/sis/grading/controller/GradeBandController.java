package com.karatu.sis.grading.controller;

import com.karatu.sis.grading.dto.GradeBandRequest;
import com.karatu.sis.grading.dto.GradeBandResponse;
import com.karatu.sis.grading.service.GradeBandManagementService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * Manages grade bands within a grading scheme.
 * All operations are tenant-scoped via TenantContext.
 */
@RestController
@RequestMapping("/api/v1/grading-schemes/{schemeId}/bands")
public class GradeBandController {

    private final GradeBandManagementService gradeBandService;

    public GradeBandController(GradeBandManagementService gradeBandService) {
        this.gradeBandService = gradeBandService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN', 'TEACHER')")
    public ResponseEntity<List<GradeBandResponse>> getBands(@PathVariable UUID schemeId) {
        return ResponseEntity.ok(gradeBandService.getBandsForScheme(schemeId));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<GradeBandResponse> createBand(
            @PathVariable UUID schemeId,
            @Valid @RequestBody GradeBandRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(gradeBandService.createBand(schemeId, request));
    }

    @PutMapping("/{bandId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<GradeBandResponse> updateBand(
            @PathVariable UUID schemeId,
            @PathVariable UUID bandId,
            @Valid @RequestBody GradeBandRequest request) {
        return ResponseEntity.ok(gradeBandService.updateBand(schemeId, bandId, request));
    }

    @DeleteMapping("/{bandId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<Void> deleteBand(
            @PathVariable UUID schemeId,
            @PathVariable UUID bandId) {
        gradeBandService.deleteBand(schemeId, bandId);
        return ResponseEntity.noContent().build();
    }
}
