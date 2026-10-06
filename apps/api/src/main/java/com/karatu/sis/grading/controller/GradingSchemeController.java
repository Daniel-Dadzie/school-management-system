package com.karatu.sis.grading.controller;

import com.karatu.sis.grading.dto.GradingSchemeRequest;
import com.karatu.sis.grading.dto.GradingSchemeResponse;
import com.karatu.sis.grading.service.GradingSchemeManagementService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/grading-schemes")
public class GradingSchemeController {

    private final GradingSchemeManagementService gradingSchemeService;

    public GradingSchemeController(GradingSchemeManagementService gradingSchemeService) {
        this.gradingSchemeService = gradingSchemeService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN', 'TEACHER')")
    public ResponseEntity<List<GradingSchemeResponse>> getSchemes() {
        return ResponseEntity.ok(gradingSchemeService.getSchemes());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<GradingSchemeResponse> createScheme(@Valid @RequestBody GradingSchemeRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(gradingSchemeService.createScheme(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<GradingSchemeResponse> updateScheme(@PathVariable UUID id, @Valid @RequestBody GradingSchemeRequest request) {
        return ResponseEntity.ok(gradingSchemeService.updateScheme(id, request));
    }
}
