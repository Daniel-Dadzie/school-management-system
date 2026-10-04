package com.schoolmanagement.auth.dto;

import com.schoolmanagement.auth.domain.Role;

import java.time.LocalDateTime;
import java.util.UUID;

public record SchoolUserResponse(
        UUID id,
        String email,
        String username,
        Role role,
        boolean enabled,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}
