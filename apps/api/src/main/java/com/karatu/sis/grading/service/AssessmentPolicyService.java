package com.karatu.sis.grading.service;

import com.karatu.sis.assessments.domain.AssessmentPolicy;
import com.karatu.sis.assessments.domain.RoundingRule;
import com.karatu.sis.assessments.repository.AssessmentPolicyRepository;
import com.karatu.sis.common.exception.ResourceNotFoundException;
import com.karatu.sis.grading.domain.GradingScheme;
import com.karatu.sis.grading.dto.AssessmentPolicyResponse;
import com.karatu.sis.grading.dto.AssessmentPolicyUpdateRequest;
import com.karatu.sis.grading.repository.GradingSchemeRepository;
import com.karatu.sis.tenant.TenantContext;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class AssessmentPolicyService {

    private final AssessmentPolicyRepository policyRepository;
    private final GradingSchemeRepository gradingSchemeRepository;

    public AssessmentPolicyService(AssessmentPolicyRepository policyRepository,
                                   GradingSchemeRepository gradingSchemeRepository) {
        this.policyRepository = policyRepository;
        this.gradingSchemeRepository = gradingSchemeRepository;
    }

    @Transactional(readOnly = true)
    public AssessmentPolicyResponse getPolicy() {
        UUID schoolId = TenantContext.requireSchoolId();
        AssessmentPolicy policy = policyRepository.findBySchoolId(schoolId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No assessment policy configured for this school. Create one via PUT /api/v1/assessment-policy"));
        return toResponse(policy);
    }

    @Transactional
    public AssessmentPolicyResponse upsertPolicy(AssessmentPolicyUpdateRequest request) {
        UUID schoolId = TenantContext.requireSchoolId();

        AssessmentPolicy policy = policyRepository.findBySchoolId(schoolId)
                .orElseGet(() -> {
                    AssessmentPolicy p = new AssessmentPolicy();
                    p.setSchoolId(schoolId);
                    return p;
                });

        // Link grading scheme if provided — must belong to this school
        if (request.gradingSchemeId() != null) {
            GradingScheme scheme = gradingSchemeRepository
                    .findByIdAndSchoolId(request.gradingSchemeId(), schoolId)
                    .orElseThrow(() -> new ResourceNotFoundException("Grading scheme not found"));
            policy.setGradingScheme(scheme);
        } else {
            policy.setGradingScheme(null);
        }

        if (request.passMark() != null) {
            policy.setPassMark(request.passMark());
        }

        if (request.roundingRule() != null) {
            try {
                policy.setRoundingRule(RoundingRule.valueOf(request.roundingRule().toUpperCase()));
            } catch (IllegalArgumentException e) {
                throw new IllegalArgumentException(
                        "Invalid roundingRule: '" + request.roundingRule()
                        + "'. Allowed values: NONE, NEAREST_WHOLE, ONE_DECIMAL");
            }
        }

        return toResponse(policyRepository.save(policy));
    }

    private AssessmentPolicyResponse toResponse(AssessmentPolicy policy) {
        UUID schemeId = policy.getGradingScheme() != null ? policy.getGradingScheme().getId() : null;
        String schemeName = policy.getGradingScheme() != null ? policy.getGradingScheme().getName() : null;
        return new AssessmentPolicyResponse(
                policy.getId(),
                policy.getSchoolId(),
                schemeId,
                schemeName,
                policy.getPassMark(),
                policy.getRoundingRule() != null ? policy.getRoundingRule().name() : null,
                policy.getCreatedAt(),
                policy.getUpdatedAt()
        );
    }
}
