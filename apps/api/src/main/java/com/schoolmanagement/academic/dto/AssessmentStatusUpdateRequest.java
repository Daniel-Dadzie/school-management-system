package com.schoolmanagement.academic.dto;

import com.schoolmanagement.academic.domain.AssessmentStatus;
import jakarta.validation.constraints.NotNull;

public record AssessmentStatusUpdateRequest(
        @NotNull(message = "Status is required")
        AssessmentStatus status
) {}
