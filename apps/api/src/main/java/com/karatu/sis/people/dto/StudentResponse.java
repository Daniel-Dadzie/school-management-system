package com.karatu.sis.people.dto;

import java.util.UUID;

public record StudentResponse(
        UUID id,
        String firstName,
        String lastName,
        String admissionNumber
) {}
