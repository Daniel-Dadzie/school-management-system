package com.karatu.sis.finance.repository;

import com.karatu.sis.finance.domain.FinancialAdjustment;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;
import java.util.Optional;

@Repository
public interface FinancialAdjustmentRepository extends JpaRepository<FinancialAdjustment, UUID> {
    List<FinancialAdjustment> findAllBySchoolId(UUID schoolId);
    List<FinancialAdjustment> findAllBySchoolIdAndStudentId(UUID schoolId, UUID studentId);
    Optional<FinancialAdjustment> findByIdAndSchoolId(UUID id, UUID schoolId);
    boolean existsByIdAndSchoolId(UUID id, UUID schoolId);
    void deleteByIdAndSchoolId(UUID id, UUID schoolId);
}
