package com.karatu.sis.tenant.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record SchoolProfileUpdateRequest(
        @Size(min = 1, max = 200) String name,
        @Email @Size(max = 255) String email,
        @Size(max = 30) String phone,
        @Size(max = 500) String address,
        @Size(max = 1000) String logoUrl,
        @Size(max = 64) String timezone,
        @Pattern(regexp = "[A-Z]{3}") String currency
) {}
