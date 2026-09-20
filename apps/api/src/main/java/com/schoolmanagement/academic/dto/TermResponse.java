package com.schoolmanagement.academic.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public record TermResponse(
        UUID id,
        UUID academicYearId,
        String name,
        LocalDate startDate,
        LocalDate endDate,
        Boolean isMandatory,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}
