package com.karatu.sis.academic.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.UUID;

public record AssessmentResultCreateRequest(
        @NotNull(message = "Enrollment ID is required")
        UUID enrollmentId,

        // Null when student is absent or excused
        @DecimalMin(value = "0.00", message = "Score cannot be negative")
        BigDecimal score,

        boolean isAbsent,

        boolean isExcused,

        String remarks
) {}
