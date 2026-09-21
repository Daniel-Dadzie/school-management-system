package com.schoolmanagement.academic.repository;

import com.schoolmanagement.academic.domain.Enrollment;
import com.schoolmanagement.academic.domain.EnrollmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;
import java.util.Optional;

@Repository
public interface EnrollmentRepository extends JpaRepository<Enrollment, UUID> {
    boolean existsByStudentIdAndAcademicYearIdAndStatusIn(UUID studentId, UUID academicYearId, List<EnrollmentStatus> statuses);

    long countBySchoolClassIdAndStatusIn(UUID schoolClassId, List<EnrollmentStatus> statuses);
    boolean existsByStudentIdAndSchoolClassIdAndAcademicYearIdAndStatus(UUID studentId, UUID schoolClassId, UUID academicYearId, EnrollmentStatus status);

    Optional<Enrollment> findByStudentIdAndAcademicYearIdAndStatus(UUID studentId, UUID academicYearId, EnrollmentStatus status);
}
