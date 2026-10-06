package com.karatu.sis.academic.controller;

import com.karatu.sis.academic.dto.CurriculumOfferingRequest;
import com.karatu.sis.academic.dto.CurriculumOfferingResponse;
import com.karatu.sis.academic.service.CurriculumOfferingService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/academic/curriculum-offerings")
public class CurriculumOfferingController {

    private final CurriculumOfferingService curriculumOfferingService;

    public CurriculumOfferingController(CurriculumOfferingService curriculumOfferingService) {
        this.curriculumOfferingService = curriculumOfferingService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN', 'TEACHER')")
    public ResponseEntity<List<CurriculumOfferingResponse>> getOfferings(
            @RequestParam UUID academicYearId,
            @RequestParam(required = false) String gradeLevel) {
        
        List<CurriculumOfferingResponse> offerings;
        if (gradeLevel != null) {
            offerings = curriculumOfferingService.getOfferingsForGrade(academicYearId, gradeLevel);
        } else {
            offerings = curriculumOfferingService.getAllOfferings(academicYearId);
        }
        return ResponseEntity.ok(offerings);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN')")
    public ResponseEntity<CurriculumOfferingResponse> createOffering(
            @Valid @RequestBody CurriculumOfferingRequest request) {
        return new ResponseEntity<>(curriculumOfferingService.createOffering(request), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN')")
    public ResponseEntity<CurriculumOfferingResponse> updateOffering(
            @PathVariable UUID id,
            @Valid @RequestBody CurriculumOfferingRequest request) {
        return ResponseEntity.ok(curriculumOfferingService.updateOffering(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN')")
    public ResponseEntity<Void> deleteOffering(@PathVariable UUID id) {
        curriculumOfferingService.deleteOffering(id);
        return ResponseEntity.noContent().build();
    }
}
