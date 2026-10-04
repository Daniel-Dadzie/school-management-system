package com.schoolmanagement.tenant.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record SchoolCreateRequest(
        @NotBlank @Size(max = 200) String name,
        @NotBlank @Size(max = 80) @Pattern(regexp = "[a-z0-9]+(?:-[a-z0-9]+)*") String slug,
        @Email @Size(max = 255) String email,
        @Size(max = 30) String phone,
        @Size(max = 500) String address,
        @Size(max = 1000) String logoUrl,
        @Size(max = 64) String timezone,
        @Pattern(regexp = "[A-Z]{3}") String currency,
        @NotBlank @Email @Size(max = 255) String administratorEmail,
        @NotBlank @Size(max = 255) String administratorUsername,
        @NotBlank @Size(min = 12, max = 72) String temporaryPassword
) {}
