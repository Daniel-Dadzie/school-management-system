package com.karatu.sis.academic.dto;

import com.karatu.sis.academic.domain.AssignmentStatus;
import java.time.LocalDateTime;
import java.util.UUID;

public record TeacherAssignmentResponse(
        UUID id,
        UUID teacherId,
        UUID subjectId,
        UUID schoolClassId,
        UUID academicYearId,
        UUID termId,
        AssignmentStatus status,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}
