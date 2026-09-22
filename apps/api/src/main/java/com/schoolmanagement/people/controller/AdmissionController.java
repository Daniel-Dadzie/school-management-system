package com.schoolmanagement.people.controller;

import com.schoolmanagement.people.dto.AdmissionApplicationRequest;
import com.schoolmanagement.people.dto.AdmissionApplicationResponse;
import com.schoolmanagement.people.dto.AdmissionStatusUpdateRequest;
import com.schoolmanagement.people.service.AdmissionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * Public admission application endpoint.
 * No authentication required — configured in SecurityConfig.
 */
@RestController
@RequestMapping("/api/v1/admissions")
public class AdmissionController {

    private final AdmissionService admissionService;

    public AdmissionController(AdmissionService admissionService) {
        this.admissionService = admissionService;
    }

    /**
     * POST /api/v1/admissions
     * Submit a new admission application.
     * Public endpoint — no JWT required.
     * Returns 201 Created with the persisted application.
     */
    @PostMapping
    public ResponseEntity<AdmissionApplicationResponse> submitApplication(
            @Valid @RequestBody AdmissionApplicationRequest request
    ) {
        AdmissionApplicationResponse response = admissionService.submitApplication(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * GET /api/v1/admissions
     * Get all admission applications.
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<List<AdmissionApplicationResponse>> getAllApplications() {
        return ResponseEntity.ok(admissionService.getAllApplications());
    }

    /**
     * GET /api/v1/admissions/{id}
     * Get a specific admission application.
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<AdmissionApplicationResponse> getApplicationById(@PathVariable UUID id) {
        return ResponseEntity.ok(admissionService.getApplicationById(id));
    }

    /**
     * PATCH /api/v1/admissions/{id}/status
     * Update the status of an admission application.
     */
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<AdmissionApplicationResponse> updateApplicationStatus(
            @PathVariable UUID id,
            @Valid @RequestBody AdmissionStatusUpdateRequest request
    ) {
        return ResponseEntity.ok(admissionService.updateApplicationStatus(id, request));
    }
}

