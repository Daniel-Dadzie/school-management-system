package com.schoolmanagement.academic.dto;

import com.schoolmanagement.academic.domain.AssignmentStatus;
import jakarta.validation.constraints.NotNull;

public record AssignmentStatusUpdateRequest(
        @NotNull(message = "Status is required")
        AssignmentStatus status
) {}
