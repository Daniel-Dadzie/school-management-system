package com.karatu.sis.assessments.controller;

import com.karatu.sis.academic.dto.AssessmentResultCreateRequest;
import com.karatu.sis.academic.dto.AssessmentResultResponse;
import com.karatu.sis.assessments.service.AssessmentResultService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/assessments/{assessmentId}/results")
public class AssessmentResultController {

    private final AssessmentResultService resultService;

    public AssessmentResultController(AssessmentResultService resultService) {
        this.resultService = resultService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN', 'TEACHER')")
    public ResponseEntity<List<AssessmentResultResponse>> getResults(@PathVariable UUID assessmentId) {
        return ResponseEntity.ok(resultService.getResults(assessmentId));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN', 'TEACHER')")
    public ResponseEntity<AssessmentResultResponse> saveResult(
            @PathVariable UUID assessmentId,
            @Valid @RequestBody AssessmentResultCreateRequest request) {
        return ResponseEntity.ok(resultService.saveResult(assessmentId, request));
    }

    @PutMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN', 'TEACHER')")
    public ResponseEntity<List<AssessmentResultResponse>> saveResults(
            @PathVariable UUID assessmentId,
            @Valid @RequestBody com.karatu.sis.academic.dto.AssessmentResultBulkUpdateRequest request) {
        return ResponseEntity.ok(resultService.saveResults(assessmentId, request.results()));
    }

    @PostMapping("/preview")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN', 'TEACHER')")
    public ResponseEntity<List<AssessmentResultResponse>> previewResults(
            @PathVariable UUID assessmentId,
            @Valid @RequestBody List<AssessmentResultCreateRequest> requests) {
        return ResponseEntity.ok(resultService.previewResults(assessmentId, requests));
    }
}
