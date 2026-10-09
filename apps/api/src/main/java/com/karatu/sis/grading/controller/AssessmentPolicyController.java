package com.karatu.sis.grading.controller;

import com.karatu.sis.grading.dto.AssessmentPolicyResponse;
import com.karatu.sis.grading.dto.AssessmentPolicyUpdateRequest;
import com.karatu.sis.grading.service.AssessmentPolicyService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * Exposes the school's assessment policy — the grading scheme link,
 * pass mark, and rounding rule for score calculations.
 */
@RestController
@RequestMapping("/api/v1/assessment-policy")
public class AssessmentPolicyController {

    private final AssessmentPolicyService policyService;

    public AssessmentPolicyController(AssessmentPolicyService policyService) {
        this.policyService = policyService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN', 'TEACHER')")
    public ResponseEntity<AssessmentPolicyResponse> getPolicy() {
        return ResponseEntity.ok(policyService.getPolicy());
    }

    @PutMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<AssessmentPolicyResponse> upsertPolicy(
            @Valid @RequestBody AssessmentPolicyUpdateRequest request) {
        return ResponseEntity.ok(policyService.upsertPolicy(request));
    }
}
