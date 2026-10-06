package com.karatu.sis.academic.repository;

import com.karatu.sis.academic.domain.Enrollment;
import com.karatu.sis.academic.domain.EnrollmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;
import java.util.Optional;

@Repository
public interface EnrollmentRepository extends JpaRepository<Enrollment, UUID> {
    List<Enrollment> findAllBySchoolId(UUID schoolId);
    boolean existsByStudentIdAndAcademicYearIdAndStatusInAndSchoolId(UUID studentId, UUID academicYearId, List<EnrollmentStatus> statuses, UUID schoolId);

    long countBySchoolClassIdAndStatusInAndSchoolId(UUID schoolClassId, List<EnrollmentStatus> statuses, UUID schoolId);
    boolean existsByStudentIdAndSchoolClassIdAndAcademicYearIdAndStatusAndSchoolId(UUID studentId, UUID schoolClassId, UUID academicYearId, EnrollmentStatus status, UUID schoolId);

    Optional<Enrollment> findByStudentIdAndAcademicYearIdAndStatusAndSchoolId(UUID studentId, UUID academicYearId, EnrollmentStatus status, UUID schoolId);
    List<Enrollment> findBySchoolIdAndSchoolClassIdAndAcademicYearIdAndStatus(UUID schoolId, UUID schoolClassId, UUID academicYearId, EnrollmentStatus status);
    Optional<Enrollment> findByIdAndSchoolId(UUID id, UUID schoolId);
    boolean existsByIdAndSchoolId(UUID id, UUID schoolId);
    void deleteByIdAndSchoolId(UUID id, UUID schoolId);
}
