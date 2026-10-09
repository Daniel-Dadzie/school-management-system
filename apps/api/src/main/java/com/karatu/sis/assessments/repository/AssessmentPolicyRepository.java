package com.karatu.sis.assessments.repository;

import com.karatu.sis.assessments.domain.AssessmentPolicy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AssessmentPolicyRepository extends JpaRepository<AssessmentPolicy, UUID> {
    /**
     * At most one policy per school — the table has a UNIQUE constraint on school_id.
     */
    Optional<AssessmentPolicy> findBySchoolId(UUID schoolId);
    Optional<AssessmentPolicy> findByIdAndSchoolId(UUID id, UUID schoolId);
    Optional<AssessmentPolicy> findBySchoolIdAndGradingSchemeId(UUID schoolId, UUID gradingSchemeId);
    boolean existsByIdAndSchoolId(UUID id, UUID schoolId);
    boolean existsBySchoolId(UUID schoolId);
}
