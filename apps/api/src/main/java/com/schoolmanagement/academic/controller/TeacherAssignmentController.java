package com.schoolmanagement.academic.controller;

import com.schoolmanagement.academic.dto.AssignmentStatusUpdateRequest;
import com.schoolmanagement.academic.dto.TeacherAssignmentRequest;
import com.schoolmanagement.academic.dto.TeacherAssignmentResponse;
import com.schoolmanagement.academic.service.TeacherAssignmentService;
import com.schoolmanagement.auth.domain.User;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/teacher-assignments")
public class TeacherAssignmentController {

    private final TeacherAssignmentService teacherAssignmentService;

    public TeacherAssignmentController(TeacherAssignmentService teacherAssignmentService) {
        this.teacherAssignmentService = teacherAssignmentService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<List<TeacherAssignmentResponse>> getAllAssignments() {
        return ResponseEntity.ok(teacherAssignmentService.getAllAssignments());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<TeacherAssignmentResponse> assignTeacher(@Valid @RequestBody TeacherAssignmentRequest request) {
        TeacherAssignmentResponse response = teacherAssignmentService.assignTeacher(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<TeacherAssignmentResponse> updateStatus(@PathVariable UUID id, @Valid @RequestBody AssignmentStatusUpdateRequest request) {
        TeacherAssignmentResponse response = teacherAssignmentService.updateAssignmentStatus(id, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<List<TeacherAssignmentResponse>> getMyAssignments(@AuthenticationPrincipal User principal) {
        return ResponseEntity.ok(teacherAssignmentService.getMyAssignments(principal));
    }
}
