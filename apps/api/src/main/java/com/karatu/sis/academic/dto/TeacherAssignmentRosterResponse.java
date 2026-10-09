package com.karatu.sis.academic.dto;

import com.karatu.sis.people.dto.StudentResponse;

import java.util.UUID;

public record TeacherAssignmentRosterResponse(
        UUID enrollmentId,
        StudentResponse student
) {}
