package com.karatu.sis.academic.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public record AssessmentResultBulkUpdateRequest(
        @NotNull(message = "Results list cannot be null")
        @Valid
        List<AssessmentResultCreateRequest> results
) {}
