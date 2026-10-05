package com.karatu.sis.academic.dto;

import com.karatu.sis.academic.domain.AssessmentStatus;
import com.karatu.sis.academic.domain.AssessmentType;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public record AssessmentResponse(
        UUID id,
        String title,
        AssessmentType type,
        UUID teacherAssignmentId,
        LocalDate assessmentDate,
        BigDecimal maximumScore,
        BigDecimal weight,
        AssessmentStatus status,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}
