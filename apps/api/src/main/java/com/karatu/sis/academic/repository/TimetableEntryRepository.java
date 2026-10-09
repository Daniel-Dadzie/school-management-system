package com.karatu.sis.academic.repository;

import com.karatu.sis.academic.domain.TimetableEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TimetableEntryRepository extends JpaRepository<TimetableEntry, UUID> {

    /** All entries for a class in a given term — used by the timetable grid view. */
    List<TimetableEntry> findBySchoolIdAndTermIdAndSchoolClassId(UUID schoolId, UUID termId, UUID schoolClassId);

    /** Check teacher conflict: teacher already assigned in same period/day/term. */
    @Query("""
        SELECT COUNT(e) > 0 FROM TimetableEntry e
        WHERE e.schoolId = :schoolId
          AND e.term.id = :termId
          AND e.period.id = :periodId
          AND e.dayOfWeek = :dayOfWeek
          AND e.teacher.id = :teacherId
          AND (:excludeId IS NULL OR e.id <> :excludeId)
        """)
    boolean existsTeacherConflict(
        @Param("schoolId") UUID schoolId,
        @Param("termId") UUID termId,
        @Param("periodId") UUID periodId,
        @Param("dayOfWeek") int dayOfWeek,
        @Param("teacherId") UUID teacherId,
        @Param("excludeId") UUID excludeId
    );

    Optional<TimetableEntry> findByIdAndSchoolId(UUID id, UUID schoolId);
}
