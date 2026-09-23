package com.schoolmanagement.academic.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.UUID;

public record AssessmentResultCreateRequest(
        @NotNull(message = "Assessment ID is required")
        UUID assessmentId,

        @NotNull(message = "Enrollment ID is required")
        UUID enrollmentId,

        @NotNull(message = "Score is required")
        @DecimalMin(value = "0.00", message = "Score cannot be negative")
        BigDecimal score
) {}
