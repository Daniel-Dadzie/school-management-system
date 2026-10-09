package com.karatu.sis.assessments.service;

import com.karatu.sis.academic.domain.Assessment;
import com.karatu.sis.academic.domain.AssessmentLifecycleStatus;
import com.karatu.sis.academic.repository.AssessmentRepository;
import com.karatu.sis.assessments.exception.AssessmentLifecycleException;
import com.karatu.sis.common.exception.ResourceNotFoundException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class AssessmentLifecycleService {

    private final AssessmentRepository assessmentRepository;

    public AssessmentLifecycleService(AssessmentRepository assessmentRepository) {
        this.assessmentRepository = assessmentRepository;
    }

    /**
     * Teacher submits a DRAFT assessment for review.
     */
    @Transactional
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN', 'SUPER_ADMIN')")
    public Assessment submitAssessment(UUID assessmentId, UUID schoolId) {
        Assessment assessment = getAssessment(assessmentId, schoolId);

        if (assessment.getLifecycleStatus() != AssessmentLifecycleStatus.DRAFT
                && assessment.getLifecycleStatus() != AssessmentLifecycleStatus.RETURNED) {
            throw new AssessmentLifecycleException(
                    "Only assessments in DRAFT or RETURNED state can be submitted. Current state: "
                    + assessment.getLifecycleStatus());
        }

        assessment.setLifecycleStatus(AssessmentLifecycleStatus.SUBMITTED);
        return assessmentRepository.save(assessment);
    }

    /**
     * Admin reviews a SUBMITTED assessment. Moves to REVIEWED.
     */
    @Transactional
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public Assessment reviewAssessment(UUID assessmentId, UUID schoolId) {
        Assessment assessment = getAssessment(assessmentId, schoolId);

        if (assessment.getLifecycleStatus() != AssessmentLifecycleStatus.SUBMITTED) {
            throw new AssessmentLifecycleException(
                    "Only SUBMITTED assessments can be reviewed. Current state: "
                    + assessment.getLifecycleStatus());
        }

        assessment.setLifecycleStatus(AssessmentLifecycleStatus.REVIEWED);
        return assessmentRepository.save(assessment);
    }

    /**
     * Admin approves a REVIEWED assessment. Moves to APPROVED.
     * APPROVED is required before publication.
     */
    @Transactional
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public Assessment approveAssessment(UUID assessmentId, UUID schoolId) {
        Assessment assessment = getAssessment(assessmentId, schoolId);

        if (assessment.getLifecycleStatus() != AssessmentLifecycleStatus.REVIEWED) {
            throw new AssessmentLifecycleException(
                    "Only REVIEWED assessments can be approved. Current state: "
                    + assessment.getLifecycleStatus());
        }

        assessment.setLifecycleStatus(AssessmentLifecycleStatus.APPROVED);
        return assessmentRepository.save(assessment);
    }

    /**
     * Admin publishes an APPROVED assessment. Once PUBLISHED results are visible
     * in parent portals and report cards. Results cannot be edited directly after this.
     */
    @Transactional
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public Assessment publishAssessment(UUID assessmentId, UUID schoolId) {
        Assessment assessment = getAssessment(assessmentId, schoolId);

        if (assessment.getLifecycleStatus() != AssessmentLifecycleStatus.APPROVED) {
            throw new AssessmentLifecycleException(
                    "Only APPROVED assessments can be published. Current state: "
                    + assessment.getLifecycleStatus());
        }

        assessment.setLifecycleStatus(AssessmentLifecycleStatus.PUBLISHED);
        return assessmentRepository.save(assessment);
    }

    /**
     * Admin locks a PUBLISHED assessment. LOCKED assessments cannot be corrected
     * without an explicit correction workflow.
     */
    @Transactional
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public Assessment lockAssessment(UUID assessmentId, UUID schoolId) {
        Assessment assessment = getAssessment(assessmentId, schoolId);

        if (assessment.getLifecycleStatus() != AssessmentLifecycleStatus.PUBLISHED) {
            throw new AssessmentLifecycleException(
                    "Only PUBLISHED assessments can be locked. Current state: "
                    + assessment.getLifecycleStatus());
        }

        assessment.setLifecycleStatus(AssessmentLifecycleStatus.LOCKED);
        return assessmentRepository.save(assessment);
    }

    /**
     * Admin rejects a SUBMITTED or REVIEWED assessment, returning it to RETURNED state.
     * The reason should be recorded in an audit log (TODO: wire audit log).
     */
    @Transactional
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public Assessment rejectAssessment(UUID assessmentId, UUID schoolId, String reason) {
        Assessment assessment = getAssessment(assessmentId, schoolId);

        if (assessment.getLifecycleStatus() != AssessmentLifecycleStatus.SUBMITTED
                && assessment.getLifecycleStatus() != AssessmentLifecycleStatus.REVIEWED) {
            throw new AssessmentLifecycleException(
                    "Only SUBMITTED or REVIEWED assessments can be rejected. Current state: "
                    + assessment.getLifecycleStatus());
        }

        assessment.setLifecycleStatus(AssessmentLifecycleStatus.RETURNED);
        // TODO: Persist rejection reason to audit/comment log
        return assessmentRepository.save(assessment);
    }

    /**
     * Checks whether an assessment is in a state that allows result editing.
     * PUBLISHED and LOCKED assessments are immutable via standard result endpoints.
     */
    public static boolean isResultEditAllowed(AssessmentLifecycleStatus status) {
        return status == AssessmentLifecycleStatus.DRAFT
                || status == AssessmentLifecycleStatus.RETURNED;
    }

    private Assessment getAssessment(UUID assessmentId, UUID schoolId) {
        return assessmentRepository.findByIdAndSchoolId(assessmentId, schoolId)
                .orElseThrow(() -> new ResourceNotFoundException("Assessment not found"));
    }
}
