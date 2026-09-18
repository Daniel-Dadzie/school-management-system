package com.schoolmanagement.auth.dto;

import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
    @NotBlank(message = "Identifier must not be blank")
    String identifier,
    
    @NotBlank(message = "Password must not be blank")
    String password
) {}

