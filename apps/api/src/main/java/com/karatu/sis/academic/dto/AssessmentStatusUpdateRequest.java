package com.karatu.sis.academic.dto;

import com.karatu.sis.academic.domain.AssessmentStatus;
import jakarta.validation.constraints.NotNull;

public record AssessmentStatusUpdateRequest(
        @NotNull(message = "Status is required")
        AssessmentStatus status
) {}
