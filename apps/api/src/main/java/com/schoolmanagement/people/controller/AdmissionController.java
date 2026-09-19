package com.schoolmanagement.people.controller;

import com.schoolmanagement.people.dto.AdmissionApplicationRequest;
import com.schoolmanagement.people.dto.AdmissionApplicationResponse;
import com.schoolmanagement.people.service.AdmissionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
}

