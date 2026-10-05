package com.karatu.sis.academic.controller;

import com.karatu.sis.academic.dto.SchoolClassRequest;
import com.karatu.sis.academic.dto.SchoolClassResponse;
import com.karatu.sis.academic.service.SchoolClassService;
import com.karatu.sis.auth.domain.User;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/classes")
public class SchoolClassController {

    private final SchoolClassService schoolClassService;

    public SchoolClassController(SchoolClassService schoolClassService) {
        this.schoolClassService = schoolClassService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<List<SchoolClassResponse>> getClasses(
            @AuthenticationPrincipal User principal) {

        return ResponseEntity.ok(schoolClassService.getClasses(principal));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SchoolClassResponse> createClass(
            @Valid @RequestBody SchoolClassRequest request) {

        SchoolClassResponse response = schoolClassService.createClass(request);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
 
