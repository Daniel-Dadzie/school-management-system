package com.schoolmanagement.academic.dto;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record EnrollmentRequest(
        @NotNull(message = "Student ID is required")
        UUID studentId,

        @NotNull(message = "School Class ID is required")
        UUID schoolClassId,

        @NotNull(message = "Academic Year ID is required")
        UUID academicYearId
) {}
