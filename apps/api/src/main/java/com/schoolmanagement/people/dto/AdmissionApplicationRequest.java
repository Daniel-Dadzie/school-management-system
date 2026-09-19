package com.schoolmanagement.people.dto;

import jakarta.validation.constraints.*;

import java.time.LocalDate;

/**
 * Request DTO for submitting a public admission application.
 * All validation mirrors the backend constraints — never trust client-side only.
 */
public record AdmissionApplicationRequest(

        // --- Prospective student details ---

        @NotBlank(message = "Student first name is required")
        @Size(max = 100, message = "Student first name must not exceed 100 characters")
        String studentFirstName,

        @NotBlank(message = "Student last name is required")
        @Size(max = 100, message = "Student last name must not exceed 100 characters")
        String studentLastName,

        @NotNull(message = "Date of birth is required")
        @Past(message = "Date of birth must be in the past")
        LocalDate dateOfBirth,

        @NotBlank(message = "Gender is required")
        @Pattern(regexp = "^(MALE|FEMALE|OTHER)$", message = "Gender must be MALE, FEMALE, or OTHER")
        String gender,

        @NotBlank(message = "Applying-for class is required")
        @Size(max = 100, message = "Class name must not exceed 100 characters")
        String applyingForClass,

        // --- Parent/guardian contact details ---

        @NotBlank(message = "Parent name is required")
        @Size(max = 200, message = "Parent name must not exceed 200 characters")
        String parentName,

        @NotBlank(message = "Parent email is required")
        @Email(message = "Parent email must be a valid email address")
        @Size(max = 255, message = "Parent email must not exceed 255 characters")
        String parentEmail,

        @NotBlank(message = "Parent phone number is required")
        @Size(max = 20, message = "Parent phone number must not exceed 20 characters")
        String parentPhone,

        @NotBlank(message = "Relationship is required")
        @Pattern(regexp = "^(MOTHER|FATHER|GUARDIAN|OTHER)$",
                 message = "Relationship must be MOTHER, FATHER, GUARDIAN, or OTHER")
        String relationship,

        // --- Optional ---

        @Size(max = 2000, message = "Additional notes must not exceed 2000 characters")
        String additionalNotes

) {}

