package com.karatu.sis.assessments.repository;

import com.karatu.sis.assessments.domain.AssessmentCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AssessmentCategoryRepository extends JpaRepository<AssessmentCategory, UUID> {
    List<AssessmentCategory> findBySchoolId(UUID schoolId);
    Optional<AssessmentCategory> findByIdAndSchoolId(UUID id, UUID schoolId);
    Optional<AssessmentCategory> findBySchoolIdAndCode(UUID schoolId, String code);
    boolean existsByIdAndSchoolId(UUID id, UUID schoolId);
}
