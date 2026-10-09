package com.karatu.sis.academic.dto;

import com.karatu.sis.academic.domain.AssessmentStatus;
import com.karatu.sis.academic.domain.AssessmentLifecycleStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public record AssessmentResponse(
        UUID id,
        UUID tenantId,
        String title,
        UUID teacherAssignmentId,
        UUID termId,
        UUID classId,
        UUID subjectId,
        UUID categoryId,
        String description,
        LocalDate assessmentDate,
        BigDecimal maximumScore,
        BigDecimal weightPercent,
        AssessmentStatus status,
        AssessmentLifecycleStatus lifecycleStatus,
        boolean isCurrentFinal,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}
