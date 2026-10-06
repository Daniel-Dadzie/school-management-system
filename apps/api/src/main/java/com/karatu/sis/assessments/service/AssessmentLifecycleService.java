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

    @Transactional
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN', 'SUPER_ADMIN')")
    public Assessment submitAssessment(UUID assessmentId, UUID schoolId) {
        Assessment assessment = getAssessment(assessmentId, schoolId);
        
        if (assessment.getLifecycleStatus() != AssessmentLifecycleStatus.DRAFT) {
            throw new AssessmentLifecycleException("Only assessments in DRAFT state can be submitted.");
        }
        
        assessment.setLifecycleStatus(AssessmentLifecycleStatus.SUBMITTED);
        return assessmentRepository.save(assessment);
    }

    @Transactional
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public Assessment reviewAssessment(UUID assessmentId, UUID schoolId) {
        Assessment assessment = getAssessment(assessmentId, schoolId);
        
        if (assessment.getLifecycleStatus() != AssessmentLifecycleStatus.SUBMITTED) {
            throw new AssessmentLifecycleException("Only assessments in SUBMITTED state can be reviewed.");
        }
        
        assessment.setLifecycleStatus(AssessmentLifecycleStatus.REVIEWED);
        return assessmentRepository.save(assessment);
    }

    @Transactional
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public Assessment publishAssessment(UUID assessmentId, UUID schoolId) {
        Assessment assessment = getAssessment(assessmentId, schoolId);
        
        if (assessment.getLifecycleStatus() != AssessmentLifecycleStatus.REVIEWED) {
            throw new AssessmentLifecycleException("Only assessments in REVIEWED state can be published.");
        }
        
        assessment.setLifecycleStatus(AssessmentLifecycleStatus.PUBLISHED);
        return assessmentRepository.save(assessment);
    }
    @Transactional
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public Assessment rejectAssessment(UUID assessmentId, UUID schoolId, String reason) {
        Assessment assessment = getAssessment(assessmentId, schoolId);
        
        if (assessment.getLifecycleStatus() == AssessmentLifecycleStatus.PUBLISHED) {
            throw new AssessmentLifecycleException("PUBLISHED assessments cannot be rejected.");
        }
        
        assessment.setLifecycleStatus(AssessmentLifecycleStatus.DRAFT);
        // Note: For a real rejection, the reason could be saved to a comment/audit log, but for now we just change status
        return assessmentRepository.save(assessment);
    }


    @Transactional
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public Assessment revertToDraft(UUID assessmentId, UUID schoolId) {
        Assessment assessment = getAssessment(assessmentId, schoolId);
        
        if (assessment.getLifecycleStatus() == AssessmentLifecycleStatus.PUBLISHED) {
            throw new AssessmentLifecycleException("PUBLISHED assessments cannot be reverted to DRAFT.");
        }
        
        assessment.setLifecycleStatus(AssessmentLifecycleStatus.DRAFT);
        return assessmentRepository.save(assessment);
    }

    private Assessment getAssessment(UUID assessmentId, UUID schoolId) {
        return assessmentRepository.findByIdAndSchoolId(assessmentId, schoolId)
                .orElseThrow(() -> new ResourceNotFoundException("Assessment not found"));
    }
}
