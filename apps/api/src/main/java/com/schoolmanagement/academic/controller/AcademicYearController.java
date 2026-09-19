package com.schoolmanagement.academic.controller;

import com.schoolmanagement.academic.dto.AcademicYearRequest;
import com.schoolmanagement.academic.dto.AcademicYearResponse;
import com.schoolmanagement.academic.dto.TermRequest;
import com.schoolmanagement.academic.dto.TermResponse;
import com.schoolmanagement.academic.service.AcademicYearService;
import com.schoolmanagement.academic.service.TermService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/academic-years")
public class AcademicYearController {

    private final AcademicYearService academicYearService;
    private final TermService termService;

    public AcademicYearController(AcademicYearService academicYearService, TermService termService) {
        this.academicYearService = academicYearService;
        this.termService = termService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN', 'TEACHER')")
    public ResponseEntity<List<AcademicYearResponse>> getAllAcademicYears() {
        return ResponseEntity.ok(academicYearService.getAllAcademicYears());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<AcademicYearResponse> createAcademicYear(@Valid @RequestBody AcademicYearRequest request) {
        AcademicYearResponse response = academicYearService.createAcademicYear(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}/terms")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN', 'TEACHER')")
    public ResponseEntity<List<TermResponse>> getTerms(@PathVariable UUID id) {
        return ResponseEntity.ok(termService.getTermsByAcademicYear(id));
    }

    @PostMapping("/{id}/terms")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<TermResponse> createTerm(@PathVariable UUID id, @Valid @RequestBody TermRequest request) {
        TermResponse response = termService.createTerm(id, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
