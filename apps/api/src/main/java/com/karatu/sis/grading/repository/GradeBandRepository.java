package com.karatu.sis.grading.repository;

import com.karatu.sis.grading.domain.GradeBand;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface GradeBandRepository extends JpaRepository<GradeBand, UUID> {
    List<GradeBand> findBySchoolId(UUID schoolId);
    List<GradeBand> findByGradingSchemeIdAndSchoolIdOrderBySequenceAsc(UUID gradingSchemeId, UUID schoolId);
    Optional<GradeBand> findByIdAndSchoolId(UUID id, UUID schoolId);
    boolean existsByIdAndSchoolId(UUID id, UUID schoolId);
}
