package com.schoolmanagement.people.dto;

import com.schoolmanagement.people.domain.AdmissionStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Response DTO for an admission application.
 * No JPA entity is exposed directly.
 */
public record AdmissionApplicationResponse(
        UUID id,
        String studentFirstName,
        String studentLastName,
        LocalDate dateOfBirth,
        String gender,
        String applyingForClass,
        String parentName,
        String parentEmail,
        String parentPhone,
        String relationship,
        String additionalNotes,
        AdmissionStatus status,
        LocalDateTime submittedAt
) {}

