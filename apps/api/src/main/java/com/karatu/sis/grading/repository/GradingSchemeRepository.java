package com.karatu.sis.grading.repository;

import com.karatu.sis.grading.domain.GradingScheme;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface GradingSchemeRepository extends JpaRepository<GradingScheme, UUID> {
    List<GradingScheme> findBySchoolId(UUID schoolId);
    Optional<GradingScheme> findByIdAndSchoolId(UUID id, UUID schoolId);
    boolean existsByIdAndSchoolId(UUID id, UUID schoolId);
}
