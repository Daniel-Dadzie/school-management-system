package com.karatu.sis.academic.dto;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record CurriculumOfferingRequest(
    @NotNull(message = "Academic Year ID is required")
    UUID academicYearId,
    
    @NotNull(message = "Grade Level is required")
    String gradeLevel,
    
    @NotNull(message = "Subject ID is required")
    UUID subjectId,
    
    boolean isRequired,
    boolean isActive,
    Integer periodsPerWeek,
    boolean assessmentEnabled,
    boolean reportEnabled
) {}
