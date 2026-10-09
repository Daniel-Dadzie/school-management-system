package com.karatu.sis.academic.repository;

import com.karatu.sis.academic.domain.Assessment;
import com.karatu.sis.academic.domain.AssessmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AssessmentRepository extends JpaRepository<Assessment, UUID> {

    List<Assessment> findByTeacherAssignmentIdAndSchoolId(UUID teacherAssignmentId, UUID schoolId);

    List<Assessment> findByTeacherAssignmentIdAndStatusAndSchoolId(UUID teacherAssignmentId, AssessmentStatus status, UUID schoolId);

    @Query("""
            SELECT a FROM Assessment a
            JOIN FETCH a.teacherAssignment ta
            JOIN FETCH ta.teacher
            JOIN FETCH ta.subject
            JOIN FETCH ta.schoolClass
            JOIN FETCH ta.academicYear
            JOIN FETCH ta.term
            WHERE a.id = :id
              AND a.schoolId = :schoolId
            """)
    Optional<Assessment> findByIdWithDetailsAndSchoolId(@Param("id") UUID id, @Param("schoolId") UUID schoolId);
    Optional<Assessment> findByIdAndSchoolId(UUID id, UUID schoolId);
    boolean existsByIdAndSchoolId(UUID id, UUID schoolId);
    void deleteByIdAndSchoolId(UUID id, UUID schoolId);
    List<Assessment> findBySchoolId(UUID schoolId);
}
