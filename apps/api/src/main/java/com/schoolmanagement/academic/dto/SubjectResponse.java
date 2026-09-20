package com.schoolmanagement.academic.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public record SubjectResponse(
        UUID id,
        String name,
        String code,
        String department,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}
