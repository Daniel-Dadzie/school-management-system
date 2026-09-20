package com.schoolmanagement.academic.dto;

import jakarta.validation.constraints.NotBlank;

public record SchoolClassRequest(
        @NotBlank(message = "Name is required")
        String name,

        @NotBlank(message = "Level is required")
        String level,

        Integer capacity
) {}
