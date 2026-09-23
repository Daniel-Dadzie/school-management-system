package com.schoolmanagement.academic.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

public record AssessmentUpdateRequest(
        @NotBlank(message = "Title is required")
        @Size(max = 255, message = "Title must not exceed 255 characters")
        String title,

        @NotNull(message = "Assessment date is required")
        LocalDate assessmentDate,

        @NotNull(message = "Maximum score is required")
        @DecimalMin(value = "0.01", message = "Maximum score must be greater than zero")
        BigDecimal maximumScore,

        @NotNull(message = "Weight is required")
        @DecimalMin(value = "0.01", message = "Weight must be greater than zero")
        @DecimalMax(value = "100.00", message = "Weight must not exceed 100")
        BigDecimal weight
) {}
