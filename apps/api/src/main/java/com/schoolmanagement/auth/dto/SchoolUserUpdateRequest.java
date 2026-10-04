package com.schoolmanagement.auth.dto;

import com.schoolmanagement.auth.domain.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;

public record SchoolUserUpdateRequest(
        @Email @Size(max = 255) String email,
        @Size(max = 255) String username,
        @Size(min = 12, max = 72) String password,
        Role role,
        Boolean enabled
) {}
