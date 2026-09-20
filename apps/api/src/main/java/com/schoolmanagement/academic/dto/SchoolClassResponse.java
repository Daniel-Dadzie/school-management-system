package com.schoolmanagement.academic.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public record SchoolClassResponse(
        UUID id,
        String name,
        String level,
        Integer capacity,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}
