package com.karatu.sis.grading.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;

import java.math.BigDecimal;
import java.util.UUID;

public record AssessmentPolicyUpdateRequest(
        // ID of the grading scheme to use as default for this school. Null to unlink.
        UUID gradingSchemeId,

        @DecimalMin(value = "0.00", message = "Pass mark cannot be negative")
        @DecimalMax(value = "100.00", message = "Pass mark cannot exceed 100")
        BigDecimal passMark,

        // NONE, NEAREST_WHOLE, ONE_DECIMAL
        String roundingRule
) {}
