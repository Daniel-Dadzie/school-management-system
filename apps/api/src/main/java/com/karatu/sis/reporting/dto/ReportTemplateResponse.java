package com.karatu.sis.reporting.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public record ReportTemplateResponse(
    UUID id,
    String name,
    String description,
    boolean isActive,
    String config,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {}
