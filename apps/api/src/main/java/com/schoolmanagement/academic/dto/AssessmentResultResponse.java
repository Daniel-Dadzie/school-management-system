package com.schoolmanagement.academic.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public record AssessmentResultResponse(
        UUID id,
        UUID assessmentId,
        UUID enrollmentId,
        BigDecimal score,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}
