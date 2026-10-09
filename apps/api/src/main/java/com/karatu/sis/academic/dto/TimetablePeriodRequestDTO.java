package com.karatu.sis.academic.dto;

import com.karatu.sis.academic.domain.TimetablePeriodType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalTime;

public record TimetablePeriodRequestDTO(
        @NotBlank String name,
        @NotNull LocalTime startTime,
        @NotNull LocalTime endTime,
        TimetablePeriodType type,
        int sortOrder
) {}
