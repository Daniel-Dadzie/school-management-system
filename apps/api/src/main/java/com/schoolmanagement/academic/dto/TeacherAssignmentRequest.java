package com.schoolmanagement.academic.dto;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record TeacherAssignmentRequest(
        @NotNull(message = "Teacher ID is required")
        UUID teacherId,

        @NotNull(message = "Subject ID is required")
        UUID subjectId,

        @NotNull(message = "School Class ID is required")
        UUID schoolClassId,

        @NotNull(message = "Academic Year ID is required")
        UUID academicYearId,

        @NotNull(message = "Term ID is required")
        UUID termId
) {}
