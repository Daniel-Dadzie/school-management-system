package com.schoolmanagement.academic.dto;

import jakarta.validation.constraints.NotBlank;

public record SubjectRequest(
        @NotBlank(message = "Name is required")
        String name,

        @NotBlank(message = "Code is required")
        String code,

        String department
) {}
