package com.karatu.sis.academic.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record AssessmentUpdateRequest(
        @Size(max = 120, message = "Title must not exceed 120 characters")
        String title,

        UUID termId,
        UUID classId,
        UUID subjectId,
        UUID categoryId,

        @Size(max = 500, message = "Description must not exceed 500 characters")
        String description,

        LocalDate assessmentDate,

        @DecimalMin(value = "0.01", message = "Maximum score must be greater than zero")
        BigDecimal maximumScore,

        @DecimalMin(value = "0.01", message = "Weight must be greater than zero")
        @DecimalMax(value = "100.00", message = "Weight must not exceed 100")
        BigDecimal weightPercent,
        
        Boolean isCurrentFinal
) {}
