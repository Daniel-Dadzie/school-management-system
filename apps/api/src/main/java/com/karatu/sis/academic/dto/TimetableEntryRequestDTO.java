package com.karatu.sis.academic.dto;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record TimetableEntryRequestDTO(
        @NotNull UUID academicYearId,
        @NotNull UUID termId,
        @NotNull UUID schoolClassId,
        @NotNull UUID periodId,
        @NotNull Integer dayOfWeek,   // 1=Mon .. 5=Fri
        UUID subjectId,               // null for BREAK/ASSEMBLY
        UUID teacherId,               // null for non-lesson
        String activityName           // label for non-lesson slots
) {}
