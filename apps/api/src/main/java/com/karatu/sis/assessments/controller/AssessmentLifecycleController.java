package com.karatu.sis.assessments.controller;

import com.karatu.sis.academic.domain.Assessment;
import com.karatu.sis.academic.dto.AssessmentResponse;
import com.karatu.sis.assessments.service.AssessmentLifecycleService;
import com.karatu.sis.tenant.TenantContext;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/assessments/{id}")
public class AssessmentLifecycleController {

    private final AssessmentLifecycleService lifecycleService;

    public AssessmentLifecycleController(AssessmentLifecycleService lifecycleService) {
        this.lifecycleService = lifecycleService;
    }

    @PostMapping("/submit")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN', 'TEACHER')")
    public ResponseEntity<AssessmentResponse> submitAssessment(@PathVariable UUID id) {
        Assessment assessment = lifecycleService.submitAssessment(id, TenantContext.requireSchoolId());
        return ResponseEntity.ok(mapToResponse(assessment));
    }

    @PostMapping("/review")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN')")
    public ResponseEntity<AssessmentResponse> reviewAssessment(@PathVariable UUID id) {
        Assessment assessment = lifecycleService.reviewAssessment(id, TenantContext.requireSchoolId());
        return ResponseEntity.ok(mapToResponse(assessment));
    }

    @PostMapping("/approve")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN')")
    public ResponseEntity<AssessmentResponse> approveAssessment(@PathVariable UUID id) {
        Assessment assessment = lifecycleService.approveAssessment(id, TenantContext.requireSchoolId());
        return ResponseEntity.ok(mapToResponse(assessment));
    }

    @PostMapping("/publish")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN')")
    public ResponseEntity<AssessmentResponse> publishAssessment(@PathVariable UUID id) {
        Assessment assessment = lifecycleService.publishAssessment(id, TenantContext.requireSchoolId());
        return ResponseEntity.ok(mapToResponse(assessment));
    }

    @PostMapping("/lock")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN')")
    public ResponseEntity<AssessmentResponse> lockAssessment(@PathVariable UUID id) {
        Assessment assessment = lifecycleService.lockAssessment(id, TenantContext.requireSchoolId());
        return ResponseEntity.ok(mapToResponse(assessment));
    }

    public record RejectRequest(String reason) {}

    @PostMapping("/reject")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN')")
    public ResponseEntity<AssessmentResponse> rejectAssessment(
            @PathVariable UUID id,
            @RequestBody(required = false) RejectRequest request) {
        String reason = request != null ? request.reason() : null;
        Assessment assessment = lifecycleService.rejectAssessment(id, TenantContext.requireSchoolId(), reason);
        return ResponseEntity.ok(mapToResponse(assessment));
    }

    private AssessmentResponse mapToResponse(Assessment assessment) {
        UUID termId = assessment.getTeacherAssignment() != null
                && assessment.getTeacherAssignment().getTerm() != null
                ? assessment.getTeacherAssignment().getTerm().getId() : null;
        UUID classId = assessment.getTeacherAssignment() != null
                && assessment.getTeacherAssignment().getSchoolClass() != null
                ? assessment.getTeacherAssignment().getSchoolClass().getId() : null;
        UUID subjectId = assessment.getTeacherAssignment() != null
                && assessment.getTeacherAssignment().getSubject() != null
                ? assessment.getTeacherAssignment().getSubject().getId() : null;
        UUID categoryId = assessment.getCategory() != null ? assessment.getCategory().getId() : null;

        return new AssessmentResponse(
                assessment.getId(),
                assessment.getSchoolId(),
                assessment.getTitle(),
                assessment.getTeacherAssignment() != null ? assessment.getTeacherAssignment().getId() : null,
                termId,
                classId,
                subjectId,
                categoryId,
                null, // description not on entity
                assessment.getAssessmentDate(),
                assessment.getMaximumScore(),
                assessment.getWeight(),
                assessment.getStatus(),
                assessment.getLifecycleStatus(),
                assessment.isCountsTowardFinalResult(),
                assessment.getCreatedAt(),
                assessment.getUpdatedAt()
        );
    }
}
