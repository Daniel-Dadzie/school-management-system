package com.karatu.sis.assessments.controller;

import com.karatu.sis.academic.domain.Assessment;
import com.karatu.sis.assessments.service.AssessmentLifecycleService;
import com.karatu.sis.tenant.TenantContext;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/assessments/{id}/lifecycle")
public class AssessmentLifecycleController {

    private final AssessmentLifecycleService lifecycleService;

    public AssessmentLifecycleController(AssessmentLifecycleService lifecycleService) {
        this.lifecycleService = lifecycleService;
    }

    @PostMapping("/submit")
    public ResponseEntity<Void> submitAssessment(@PathVariable UUID id) {
        lifecycleService.submitAssessment(id, TenantContext.requireSchoolId());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/review")
    public ResponseEntity<Void> reviewAssessment(@PathVariable UUID id) {
        lifecycleService.reviewAssessment(id, TenantContext.requireSchoolId());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/publish")
    public ResponseEntity<Void> publishAssessment(@PathVariable UUID id) {
        lifecycleService.publishAssessment(id, TenantContext.requireSchoolId());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/revert-to-draft")
    public ResponseEntity<Void> revertToDraft(@PathVariable UUID id) {
        lifecycleService.revertToDraft(id, TenantContext.requireSchoolId());
        return ResponseEntity.ok().build();
    }
}
