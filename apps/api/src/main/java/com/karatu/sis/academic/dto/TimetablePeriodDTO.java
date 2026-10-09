package com.karatu.sis.academic.dto;

import com.karatu.sis.academic.domain.TimetablePeriodType;

import java.time.LocalTime;
import java.util.UUID;

public record TimetablePeriodDTO(
        UUID id,
        String name,
        LocalTime startTime,
        LocalTime endTime,
        TimetablePeriodType type,
        int sortOrder
) {}
