package com.schoolmanagement.academic.repository;

import com.schoolmanagement.academic.domain.AssessmentResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AssessmentResultRepository extends JpaRepository<AssessmentResult, UUID> {

    List<AssessmentResult> findByAssessmentId(UUID assessmentId);

    Optional<AssessmentResult> findByAssessmentIdAndEnrollmentId(UUID assessmentId, UUID enrollmentId);

    List<AssessmentResult> findByEnrollmentId(UUID enrollmentId);
}
