package com.schoolmanagement.academic.repository;

import com.schoolmanagement.academic.domain.AssignmentStatus;
import com.schoolmanagement.academic.domain.SchoolClass;
import com.schoolmanagement.academic.domain.Subject;
import com.schoolmanagement.academic.domain.TeacherAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface TeacherAssignmentRepository extends JpaRepository<TeacherAssignment, UUID> {

    List<TeacherAssignment> findByTeacherId(UUID teacherId);

    @Query("""
            SELECT DISTINCT ta.schoolClass
            FROM TeacherAssignment ta
            WHERE ta.teacher.id = :teacherId
              AND ta.status = com.schoolmanagement.academic.domain.AssignmentStatus.ACTIVE
            """)
    List<SchoolClass> findActiveClassesByTeacherId(@Param("teacherId") UUID teacherId);

    @Query("""
            SELECT DISTINCT ta.subject
            FROM TeacherAssignment ta
            WHERE ta.teacher.id = :teacherId
              AND ta.status = com.schoolmanagement.academic.domain.AssignmentStatus.ACTIVE
            """)
    List<Subject> findActiveSubjectsByTeacherId(@Param("teacherId") UUID teacherId);

    boolean existsByTeacherIdAndSubjectIdAndSchoolClassIdAndAcademicYearIdAndTermId(
            UUID teacherId,
            UUID subjectId,
            UUID schoolClassId,
            UUID academicYearId,
            UUID termId);
}