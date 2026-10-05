package com.karatu.sis.academic.dto;

import com.karatu.sis.academic.domain.EnrollmentStatus;
import jakarta.validation.constraints.NotNull;

public record EnrollmentStatusUpdateRequest(
        @NotNull(message = "Status is required")
        EnrollmentStatus status
) {}
