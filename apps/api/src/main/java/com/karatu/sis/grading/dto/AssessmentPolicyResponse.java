package com.karatu.sis.grading.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public record AssessmentPolicyResponse(
        UUID id,
        UUID schoolId,
        UUID gradingSchemeId,
        String gradingSchemeName,
        BigDecimal passMark,
        String roundingRule,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}
