package com.karatu.sis.academic.dto;

import com.karatu.sis.academic.domain.EnrollmentStatus;
import java.time.LocalDateTime;
import java.util.UUID;

public record EnrollmentResponse(
        UUID id,
        UUID studentId,
        UUID schoolClassId,
        UUID academicYearId,
        EnrollmentStatus status,
        LocalDateTime enrolledAt,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}
