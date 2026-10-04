package com.schoolmanagement.tenant.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public record SchoolResponse(
        UUID id,
        String slug,
        String name,
        String email,
        String phone,
        String address,
        String logoUrl,
        String timezone,
        String currency,
        boolean active,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}
