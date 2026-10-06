package com.karatu.sis.reporting.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record ReportTemplateRequest(
    @NotBlank(message = "Name is required")
    String name,
    
    String description,
    
    @NotNull(message = "isActive flag is required")
    Boolean isActive,
    
    @NotBlank(message = "Config JSON is required")
    String config
) {}
