package com.schoolmanagement.academic.repository;

import com.schoolmanagement.academic.domain.AttendanceRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface AttendanceRepository extends JpaRepository<AttendanceRecord, UUID> {

    List<AttendanceRecord> findByTermIdAndSchoolClassIdAndSubjectIdAndAttendanceDate(
        UUID termId,
        UUID classId,
        UUID subjectId,
        LocalDate date
    );

    List<AttendanceRecord> findByTermIdAndSchoolClassIdAndSubjectId(
        UUID termId,
        UUID classId,
        UUID subjectId
    );

    List<AttendanceRecord> findByTermIdAndStudentId(
        UUID termId,
        UUID studentId
    );

    List<AttendanceRecord> findByTermIdAndStudentIdAndSubjectId(
        UUID termId,
        UUID studentId,
        UUID subjectId
    );

}
