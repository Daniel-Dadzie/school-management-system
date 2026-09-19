package com.schoolmanagement.academic.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public record AcademicYearResponse(
        UUID id,
        String name,
        LocalDate startDate,
        LocalDate endDate,
        String status,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}
