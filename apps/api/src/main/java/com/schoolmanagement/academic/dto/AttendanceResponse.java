package com.schoolmanagement.academic.dto;

import com.schoolmanagement.academic.domain.AttendanceStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public record AttendanceResponse(
    UUID id,
    UUID studentId,
    UUID classId,
    UUID subjectId,
    UUID termId,
    LocalDate attendanceDate,
    AttendanceStatus status,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {}
