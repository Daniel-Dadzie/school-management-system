package com.karatu.sis.academic.dto;

import java.util.UUID;

public record CurriculumOfferingResponse(
    UUID id,
    UUID academicYearId,
    String gradeLevel,
    SubjectResponse subject,
    boolean isRequired,
    boolean isActive,
    Integer periodsPerWeek,
    boolean assessmentEnabled,
    boolean reportEnabled
) {}
