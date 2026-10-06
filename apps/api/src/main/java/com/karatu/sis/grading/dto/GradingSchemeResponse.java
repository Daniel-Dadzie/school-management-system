package com.karatu.sis.grading.dto;

import com.karatu.sis.grading.domain.GradingSchemeSourceType;
import java.time.LocalDateTime;
import java.util.UUID;

public record GradingSchemeResponse(
    UUID id,
    String name,
    String description,
    GradingSchemeSourceType sourceType,
    boolean active,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {}
