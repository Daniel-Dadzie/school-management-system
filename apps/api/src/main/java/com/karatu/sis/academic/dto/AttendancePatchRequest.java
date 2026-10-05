package com.karatu.sis.academic.dto;

import com.karatu.sis.academic.domain.AttendanceStatus;
import jakarta.validation.constraints.NotNull;

public record AttendancePatchRequest(
    @NotNull(message = "Status is required")
    AttendanceStatus status
) {}
