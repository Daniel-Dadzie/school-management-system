package com.karatu.sis.grading.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public record GradeBandResponse(
        UUID id,
        UUID schoolId,
        UUID gradingSchemeId,
        String grade,
        BigDecimal minimumScore,
        BigDecimal maximumScore,
        String remark,
        int sequence,
        boolean isPass,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}
