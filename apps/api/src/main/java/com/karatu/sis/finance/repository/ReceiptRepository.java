package com.karatu.sis.finance.repository;

import com.karatu.sis.finance.domain.Receipt;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;
import java.util.Optional;

@Repository
public interface ReceiptRepository extends JpaRepository<Receipt, UUID> {
    List<Receipt> findAllBySchoolId(UUID schoolId);
    Optional<Receipt> findBySchoolIdAndReceiptNumber(UUID schoolId, String receiptNumber);
    Optional<Receipt> findByIdAndSchoolId(UUID id, UUID schoolId);
    boolean existsByIdAndSchoolId(UUID id, UUID schoolId);
    void deleteByIdAndSchoolId(UUID id, UUID schoolId);
}
