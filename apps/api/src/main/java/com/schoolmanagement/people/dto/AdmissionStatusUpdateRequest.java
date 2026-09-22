package com.schoolmanagement.people.dto;

import com.schoolmanagement.people.domain.AdmissionStatus;
import jakarta.validation.constraints.NotNull;

public record AdmissionStatusUpdateRequest(
        @NotNull(message = "Status is required")
        AdmissionStatus status
) {}