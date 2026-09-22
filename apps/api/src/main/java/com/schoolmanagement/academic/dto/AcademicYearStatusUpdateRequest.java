package com.schoolmanagement.academic.dto;

import com.schoolmanagement.academic.domain.AcademicYearStatus;
import jakarta.validation.constraints.NotNull;

public record AcademicYearStatusUpdateRequest(
        @NotNull(message = "Status is required")
        AcademicYearStatus status
) {}

