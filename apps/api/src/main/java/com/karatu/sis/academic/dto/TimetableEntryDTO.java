package com.karatu.sis.academic.dto;

import java.util.UUID;

public record TimetableEntryDTO(
        UUID id,
        UUID termId,
        UUID schoolClassId,
        String schoolClassName,
        UUID periodId,
        String periodName,
        int dayOfWeek,
        UUID subjectId,
        String subjectName,
        UUID teacherId,
        String teacherName,
        String activityName
) {}
