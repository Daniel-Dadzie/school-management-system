package com.schoolmanagement.academic.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record AssessmentResultUpdateRequest(
        @NotNull(message = "Score is required")
        @DecimalMin(value = "0.00", message = "Score cannot be negative")
        BigDecimal score
) {}
