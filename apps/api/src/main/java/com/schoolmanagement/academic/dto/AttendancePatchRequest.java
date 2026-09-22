package com.schoolmanagement.academic.dto;

import com.schoolmanagement.academic.domain.AttendanceStatus;
import jakarta.validation.constraints.NotNull;

public record AttendancePatchRequest(
    @NotNull(message = "Status is required")
    AttendanceStatus status
) {}
