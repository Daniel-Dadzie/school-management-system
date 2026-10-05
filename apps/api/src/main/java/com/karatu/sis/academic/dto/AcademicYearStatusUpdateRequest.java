package com.karatu.sis.academic.dto;

import com.karatu.sis.academic.domain.AcademicYearStatus;
import jakarta.validation.constraints.NotNull;

public record AcademicYearStatusUpdateRequest(
        @NotNull(message = "Status is required")
        AcademicYearStatus status
) {}

