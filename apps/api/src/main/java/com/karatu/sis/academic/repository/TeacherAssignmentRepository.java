package com.karatu.sis.academic.repository;

import com.karatu.sis.academic.domain.AssignmentStatus;
import java.util.Optional;
import com.karatu.sis.academic.domain.SchoolClass;
import com.karatu.sis.academic.domain.Subject;
import com.karatu.sis.academic.domain.TeacherAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface TeacherAssignmentRepository extends JpaRepository<TeacherAssignment, UUID> {
    List<TeacherAssignment> findAllBySchoolId(UUID schoolId);
    List<TeacherAssignment> findByTeacherIdAndSchoolId(UUID teacherId, UUID schoolId);

    @Query("""
            SELECT DISTINCT ta.schoolClass
            FROM TeacherAssignment ta
            WHERE ta.teacher.id = :teacherId
              AND ta.schoolId = :schoolId
              AND ta.status = com.karatu.sis.academic.domain.AssignmentStatus.ACTIVE
            """)
    List<SchoolClass> findActiveClassesByTeacherIdAndSchoolId(@Param("teacherId") UUID teacherId, @Param("schoolId") UUID schoolId);

    @Query("""
            SELECT DISTINCT ta.subject
            FROM TeacherAssignment ta
            WHERE ta.teacher.id = :teacherId
              AND ta.schoolId = :schoolId
              AND ta.status = com.karatu.sis.academic.domain.AssignmentStatus.ACTIVE
            """)
    List<Subject> findActiveSubjectsByTeacherIdAndSchoolId(@Param("teacherId") UUID teacherId, @Param("schoolId") UUID schoolId);

    boolean existsByTeacherIdAndSubjectIdAndSchoolClassIdAndAcademicYearIdAndTermIdAndSchoolId(
            UUID teacherId,
            UUID subjectId,
            UUID schoolClassId,
            UUID academicYearId,
            UUID termId,
            UUID schoolId);
    Optional<TeacherAssignment> findByIdAndSchoolId(UUID id, UUID schoolId);
    boolean existsByIdAndSchoolId(UUID id, UUID schoolId);
    void deleteByIdAndSchoolId(UUID id, UUID schoolId);
}
