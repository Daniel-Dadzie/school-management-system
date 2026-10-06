package com.karatu.sis.academic.repository;

import java.util.Optional;

import com.karatu.sis.academic.domain.AttendanceRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface AttendanceRepository extends JpaRepository<AttendanceRecord, UUID> {

    List<AttendanceRecord> findByTermIdAndSchoolClassIdAndSubjectIdAndAttendanceDateAndSchoolId(
        UUID termId,
        UUID classId,
        UUID subjectId,
        LocalDate date,
        UUID schoolId
    );

    List<AttendanceRecord> findByTermIdAndSchoolClassIdAndSubjectIdAndSchoolId(
        UUID termId,
        UUID classId,
        UUID subjectId,
        UUID schoolId
    );

    List<AttendanceRecord> findByTermIdAndStudentIdAndSchoolId(
        UUID termId,
        UUID studentId,
        UUID schoolId
    );

    List<AttendanceRecord> findByTermIdAndStudentIdAndSubjectIdAndSchoolId(
        UUID termId,
        UUID studentId,
        UUID subjectId,
        UUID schoolId
    );

    Optional<AttendanceRecord> findByIdAndSchoolId(UUID id, UUID schoolId);
    boolean existsByIdAndSchoolId(UUID id, UUID schoolId);
    void deleteByIdAndSchoolId(UUID id, UUID schoolId);
}
