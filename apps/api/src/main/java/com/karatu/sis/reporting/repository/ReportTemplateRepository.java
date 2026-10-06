package com.karatu.sis.reporting.repository;

import com.karatu.sis.reporting.domain.ReportTemplate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ReportTemplateRepository extends JpaRepository<ReportTemplate, UUID> {
    
    Page<ReportTemplate> findAllBySchoolId(UUID schoolId, Pageable pageable);
    
    Optional<ReportTemplate> findByIdAndSchoolId(UUID id, UUID schoolId);
    
    boolean existsByIdAndSchoolId(UUID id, UUID schoolId);
}
