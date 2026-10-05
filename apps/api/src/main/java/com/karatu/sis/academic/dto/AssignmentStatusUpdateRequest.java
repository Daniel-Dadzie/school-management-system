package com.karatu.sis.academic.dto;

import com.karatu.sis.academic.domain.AssignmentStatus;
import jakarta.validation.constraints.NotNull;

public record AssignmentStatusUpdateRequest(
        @NotNull(message = "Status is required")
        AssignmentStatus status
) {}
