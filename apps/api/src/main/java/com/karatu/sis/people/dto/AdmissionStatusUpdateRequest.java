package com.karatu.sis.people.dto;

import com.karatu.sis.people.domain.AdmissionStatus;
import jakarta.validation.constraints.NotNull;

public record AdmissionStatusUpdateRequest(
        @NotNull(message = "Status is required")
        AdmissionStatus status
) {}