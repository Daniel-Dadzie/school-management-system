package com.karatu.sis.academic.repository;

import com.karatu.sis.academic.domain.TimetablePeriod;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TimetablePeriodRepository extends JpaRepository<TimetablePeriod, UUID> {

    List<TimetablePeriod> findBySchoolIdOrderBySortOrderAsc(UUID schoolId);

    Optional<TimetablePeriod> findByIdAndSchoolId(UUID id, UUID schoolId);

    boolean existsByIdAndSchoolId(UUID id, UUID schoolId);
}
