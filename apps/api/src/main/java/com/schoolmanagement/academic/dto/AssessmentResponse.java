package com.schoolmanagement.academic.dto;

import com.schoolmanagement.academic.domain.AssessmentStatus;
import com.schoolmanagement.academic.domain.AssessmentType;

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
