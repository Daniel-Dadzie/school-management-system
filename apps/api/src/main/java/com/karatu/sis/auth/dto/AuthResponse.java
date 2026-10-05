package com.karatu.sis.auth.dto;

import com.karatu.sis.auth.domain.Role;

import java.util.UUID;

public record AuthResponse(
    String accessToken,
    UserDto user
) {
    public record UserDto(
        UUID id,
        String email,
        String username,
        Role role,
        boolean passwordChangeRequired
    ) {}
}
