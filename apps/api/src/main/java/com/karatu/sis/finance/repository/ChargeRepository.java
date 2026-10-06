package com.karatu.sis.finance.repository;

import com.karatu.sis.finance.domain.Charge;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;
import java.util.Optional;

@Repository
public interface ChargeRepository extends JpaRepository<Charge, UUID> {
    List<Charge> findAllBySchoolId(UUID schoolId);
    List<Charge> findAllBySchoolIdAndStudentId(UUID schoolId, UUID studentId);
    Optional<Charge> findByIdAndSchoolId(UUID id, UUID schoolId);
    boolean existsByIdAndSchoolId(UUID id, UUID schoolId);
    void deleteByIdAndSchoolId(UUID id, UUID schoolId);
}
