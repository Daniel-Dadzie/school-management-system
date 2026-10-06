package com.karatu.sis.academic.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public record AssessmentResultResponse(
        UUID id,
        UUID tenantId,
        UUID assessmentId,
        UUID enrollmentId,
        UUID studentId,
        BigDecimal score,
        String enteredBy,
        String status,
        LocalDateTime finalizedAt,
        BigDecimal percentage,
        String grade,
        BigDecimal gradePoint,
        String remark,
        BigDecimal weightedContribution,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}
