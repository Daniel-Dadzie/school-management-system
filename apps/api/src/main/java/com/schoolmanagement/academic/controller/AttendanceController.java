package com.schoolmanagement.academic.controller;

import com.schoolmanagement.academic.dto.AttendanceBulkRequest;
import com.schoolmanagement.academic.dto.AttendancePatchRequest;
import com.schoolmanagement.academic.dto.AttendanceResponse;
import com.schoolmanagement.academic.service.AttendanceService;
import com.schoolmanagement.auth.domain.User;
import com.schoolmanagement.common.exception.BusinessValidationException;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/attendance")
public class AttendanceController {

    private final AttendanceService attendanceService;

    public AttendanceController(AttendanceService attendanceService) {
        this.attendanceService = attendanceService;
    }

    @PostMapping("/bulk")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN', 'TEACHER')")
    public ResponseEntity<List<AttendanceResponse>> bulkSubmit(
            @Valid @RequestBody AttendanceBulkRequest request,
            @AuthenticationPrincipal User principal) {

        List<AttendanceResponse> responses = attendanceService.bulkSubmit(request, principal);
        return ResponseEntity.status(HttpStatus.CREATED).body(responses);
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN', 'TEACHER')")
    public ResponseEntity<AttendanceResponse> updateAttendanceStatus(
            @PathVariable UUID id,
            @Valid @RequestBody AttendancePatchRequest request,
            @AuthenticationPrincipal User principal) {

        AttendanceResponse response = attendanceService.updateAttendanceStatus(id, request, principal);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN', 'TEACHER')")
    public ResponseEntity<List<AttendanceResponse>> getAttendance(
            @RequestParam UUID termId,
            @RequestParam(required = false) UUID classId,
            @RequestParam(required = false) UUID subjectId,
            @RequestParam(required = false) LocalDate date,
            @RequestParam(required = false) UUID studentId,
            @AuthenticationPrincipal User principal) {

        if (classId != null && subjectId != null) {
            if (date != null && studentId == null) {
                // Daily class/subject attendance
                return ResponseEntity.ok(attendanceService.getDailyClassAttendance(termId, classId, subjectId, date, principal));
            } else if (date == null && studentId == null) {
                // Class/subject term history
                return ResponseEntity.ok(attendanceService.getClassSubjectHistory(termId, classId, subjectId, principal));
            }
        } else if (studentId != null && classId == null && date == null) {
            if (subjectId != null) {
                // Student subject history
                return ResponseEntity.ok(attendanceService.getStudentSubjectHistory(termId, studentId, subjectId, principal));
            } else {
                // Student term history
                return ResponseEntity.ok(attendanceService.getStudentTermHistory(termId, studentId, principal));
            }
        }

        throw new BusinessValidationException("Unsupported or incomplete filter combination");
    }
}
