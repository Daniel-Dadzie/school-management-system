package com.schoolmanagement.academic.repository;

import com.schoolmanagement.academic.domain.Assessment;
import com.schoolmanagement.academic.domain.AssessmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AssessmentRepository extends JpaRepository<Assessment, UUID> {

    List<Assessment> findByTeacherAssignmentId(UUID teacherAssignmentId);

    List<Assessment> findByTeacherAssignmentIdAndStatus(UUID teacherAssignmentId, AssessmentStatus status);

    @Query("""
            SELECT a FROM Assessment a
            JOIN FETCH a.teacherAssignment ta
            JOIN FETCH ta.teacher
            JOIN FETCH ta.subject
            JOIN FETCH ta.schoolClass
            JOIN FETCH ta.academicYear
            JOIN FETCH ta.term
            WHERE a.id = :id
            """)
    Optional<Assessment> findByIdWithDetails(@Param("id") UUID id);
}
