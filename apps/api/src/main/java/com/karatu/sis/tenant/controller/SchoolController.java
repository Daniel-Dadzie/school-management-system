package com.karatu.sis.tenant.controller;

import com.karatu.sis.tenant.dto.SchoolCreateRequest;
import com.karatu.sis.tenant.dto.SchoolProfileUpdateRequest;
import com.karatu.sis.tenant.dto.SchoolResponse;
import com.karatu.sis.tenant.service.SchoolService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1")
public class SchoolController {
    private final SchoolService schoolService;

    public SchoolController(SchoolService schoolService) {
        this.schoolService = schoolService;
    }

    @PostMapping("/platform/schools")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<SchoolResponse> provision(@Valid @RequestBody SchoolCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(schoolService.provision(request));
    }

    @GetMapping("/schools/current")
    @PreAuthorize("hasAnyRole('IT_ADMIN', 'ADMIN', 'TEACHER', 'PARENT')")
    public SchoolResponse getCurrentSchool() {
        return schoolService.getCurrentSchool();
    }

    @PatchMapping("/schools/current")
    @PreAuthorize("hasAnyRole('IT_ADMIN', 'ADMIN')")
    public SchoolResponse updateCurrentSchool(@Valid @RequestBody SchoolProfileUpdateRequest request) {
        return schoolService.updateCurrentSchool(request);
    }
    @GetMapping("/platform/schools")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public java.util.List<SchoolResponse> getAllSchools() {
        return schoolService.getAllSchools();
    }
}

