package com.schoolmanagement.academic.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record AttendanceBulkRequest(
    @NotNull(message = "Term ID is required")
    UUID termId,

    @NotNull(message = "Class ID is required")
    UUID classId,

    @NotNull(message = "Subject ID is required")
    UUID subjectId,

    @NotNull(message = "Attendance date is required")
    LocalDate attendanceDate,

    @NotEmpty(message = "Records cannot be empty")
    @Valid
    List<AttendanceRecordSubmitRequest> records
) {}
