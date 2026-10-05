package com.karatu.sis.academic.repository;

import com.karatu.sis.academic.domain.AcademicYear;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.karatu.sis.academic.domain.AcademicYearStatus;

import java.util.UUID;
import java.util.List;

@Repository
public interface AcademicYearRepository extends JpaRepository<AcademicYear, UUID> {
    List<AcademicYear> findAllBySchoolId(UUID schoolId);
    boolean existsBySchoolIdAndStatus(UUID schoolId, AcademicYearStatus status);
}
