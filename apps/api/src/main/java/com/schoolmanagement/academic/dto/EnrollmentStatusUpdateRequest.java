package com.schoolmanagement.academic.dto;

import com.schoolmanagement.academic.domain.EnrollmentStatus;
import jakarta.validation.constraints.NotNull;

public record EnrollmentStatusUpdateRequest(
        @NotNull(message = "Status is required")
        EnrollmentStatus status
) {}
