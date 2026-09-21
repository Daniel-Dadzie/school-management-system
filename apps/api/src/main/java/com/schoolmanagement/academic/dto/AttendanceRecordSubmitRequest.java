package com.schoolmanagement.academic.dto;

import com.schoolmanagement.academic.domain.AttendanceStatus;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record AttendanceRecordSubmitRequest(
    @NotNull(message = "Student ID is required")
    UUID studentId,

    @NotNull(message = "Status is required")
    AttendanceStatus status
) {}
