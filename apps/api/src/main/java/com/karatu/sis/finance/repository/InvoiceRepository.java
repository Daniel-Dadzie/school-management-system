package com.karatu.sis.finance.repository;

import com.karatu.sis.finance.domain.Invoice;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;
import java.util.Optional;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, UUID> {
    List<Invoice> findAllBySchoolId(UUID schoolId);
    List<Invoice> findAllBySchoolIdAndStudentId(UUID schoolId, UUID studentId);
    Optional<Invoice> findByIdAndSchoolId(UUID id, UUID schoolId);
    boolean existsByIdAndSchoolId(UUID id, UUID schoolId);
    void deleteByIdAndSchoolId(UUID id, UUID schoolId);
}
