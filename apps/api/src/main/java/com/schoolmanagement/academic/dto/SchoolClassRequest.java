package com.schoolmanagement.academic.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Min;

public record SchoolClassRequest(
        @NotBlank(message = "Name is required")
        String name,

        @NotBlank(message = "Level is required")
        String level,

        @Min(value = 1, message = "Capacity must be positive")
        Integer capacity
) {}
