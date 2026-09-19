package com.schoolmanagement.academic.dto;

import com.schoolmanagement.academic.domain.AssignmentStatus;
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
