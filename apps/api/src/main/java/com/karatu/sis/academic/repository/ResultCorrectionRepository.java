package com.karatu.sis.academic.repository;

import com.karatu.sis.academic.domain.ResultCorrection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ResultCorrectionRepository extends JpaRepository<ResultCorrection, UUID> {
    List<ResultCorrection> findBySchoolId(UUID schoolId);
    List<ResultCorrection> findByResultIdAndSchoolId(UUID resultId, UUID schoolId);
    Optional<ResultCorrection> findByIdAndSchoolId(UUID id, UUID schoolId);
    boolean existsByIdAndSchoolId(UUID id, UUID schoolId);
}
