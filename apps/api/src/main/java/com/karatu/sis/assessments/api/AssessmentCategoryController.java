package com.karatu.sis.assessments.api;

import com.karatu.sis.assessments.service.AssessmentCategoryService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/assessment-categories")
public class AssessmentCategoryController {

    private final AssessmentCategoryService service;

    public AssessmentCategoryController(AssessmentCategoryService service) {
        this.service = service;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<List<AssessmentCategoryDto>> getAllCategories() {
        return ResponseEntity.ok(service.getAllCategories());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<AssessmentCategoryDto> createCategory(@RequestBody AssessmentCategoryCreateRequest request) {
        AssessmentCategoryDto created = service.createCategory(request);
        return ResponseEntity.ok(created);
    }
}
