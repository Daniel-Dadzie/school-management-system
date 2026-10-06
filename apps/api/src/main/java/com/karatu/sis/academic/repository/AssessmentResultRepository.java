package com.karatu.sis.academic.repository;

import com.karatu.sis.academic.domain.AssessmentResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AssessmentResultRepository extends JpaRepository<AssessmentResult, UUID> {

    List<AssessmentResult> findByAssessmentIdAndSchoolId(UUID assessmentId, UUID schoolId);

    Optional<AssessmentResult> findByAssessmentIdAndEnrollmentIdAndSchoolId(UUID assessmentId, UUID enrollmentId, UUID schoolId);

    List<AssessmentResult> findByEnrollmentIdAndSchoolId(UUID enrollmentId, UUID schoolId);
    Optional<AssessmentResult> findByIdAndSchoolId(UUID id, UUID schoolId);
    boolean existsByIdAndSchoolId(UUID id, UUID schoolId);
    void deleteByIdAndSchoolId(UUID id, UUID schoolId);
}
