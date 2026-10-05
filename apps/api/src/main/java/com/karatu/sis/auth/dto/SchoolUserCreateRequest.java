package com.karatu.sis.auth.dto;

import com.karatu.sis.auth.domain.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record SchoolUserCreateRequest(
        @NotBlank @Email @Size(max = 255) String email,
        @NotBlank @Size(max = 255) String username,
        @NotBlank @Size(min = 12, max = 72) String password,
        @NotNull Role role
) {}
