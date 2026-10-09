package com.karatu.sis.grading.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record GradeBandRequest(
        @NotBlank(message = "Grade label is required")
        @Size(max = 10, message = "Grade label must be 10 characters or fewer")
        String grade,

        @NotNull(message = "Minimum score is required")
        @DecimalMin(value = "0.00", message = "Minimum score cannot be negative")
        BigDecimal minimumScore,

        @NotNull(message = "Maximum score is required")
        @DecimalMin(value = "0.00", message = "Maximum score cannot be negative")
        BigDecimal maximumScore,

        @Size(max = 100, message = "Remark must be 100 characters or fewer")
        String remark,

        @NotNull(message = "Sequence is required")
        @Min(value = 1, message = "Sequence must be at least 1")
        Integer sequence,

        boolean isPass
) {}
