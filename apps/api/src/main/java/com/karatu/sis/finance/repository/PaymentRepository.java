package com.karatu.sis.finance.repository;

import com.karatu.sis.finance.domain.Payment;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, UUID> {
    List<Payment> findAllBySchoolId(UUID schoolId);
    List<Payment> findAllBySchoolIdAndStudentId(UUID schoolId, UUID studentId);
    Optional<Payment> findByIdAndSchoolId(UUID id, UUID schoolId);
    boolean existsByIdAndSchoolId(UUID id, UUID schoolId);
    void deleteByIdAndSchoolId(UUID id, UUID schoolId);
}
