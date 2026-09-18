package com.schoolmanagement.auth.dto;

import com.schoolmanagement.auth.domain.Role;
import java.util.UUID;

public record AuthResponse(
    String token,
    UserDto user
) {
    public record UserDto(
        UUID id,
        String email,
        String username,
        Role role
    ) {}
}

