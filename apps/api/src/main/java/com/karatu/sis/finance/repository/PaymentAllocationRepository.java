package com.karatu.sis.finance.repository;

import com.karatu.sis.finance.domain.PaymentAllocation;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;
import java.util.Optional;

@Repository
public interface PaymentAllocationRepository extends JpaRepository<PaymentAllocation, UUID> {
    List<PaymentAllocation> findAllBySchoolId(UUID schoolId);
    List<PaymentAllocation> findAllBySchoolIdAndPaymentId(UUID schoolId, UUID paymentId);
    Optional<PaymentAllocation> findByIdAndSchoolId(UUID id, UUID schoolId);
    boolean existsByIdAndSchoolId(UUID id, UUID schoolId);
    void deleteByIdAndSchoolId(UUID id, UUID schoolId);
}
