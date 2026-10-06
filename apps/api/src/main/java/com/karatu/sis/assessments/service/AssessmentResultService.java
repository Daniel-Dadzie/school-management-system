package com.karatu.sis.assessments.service;

import com.karatu.sis.academic.domain.Assessment;
import com.karatu.sis.academic.domain.AssessmentResult;
import com.karatu.sis.academic.domain.Enrollment;
import com.karatu.sis.academic.domain.ScoreStatus;
import com.karatu.sis.academic.dto.AssessmentResultCreateRequest;
import com.karatu.sis.academic.dto.AssessmentResultResponse;
import com.karatu.sis.academic.repository.AssessmentRepository;
import com.karatu.sis.academic.repository.AssessmentResultRepository;
import com.karatu.sis.academic.repository.EnrollmentRepository;
import com.karatu.sis.common.exception.ResourceNotFoundException;
import com.karatu.sis.tenant.TenantContext;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class AssessmentResultService {

    private final AssessmentResultRepository resultRepository;
    private final AssessmentRepository assessmentRepository;
    private final EnrollmentRepository enrollmentRepository;

    public AssessmentResultService(AssessmentResultRepository resultRepository,
                                   AssessmentRepository assessmentRepository,
                                   EnrollmentRepository enrollmentRepository) {
        this.resultRepository = resultRepository;
        this.assessmentRepository = assessmentRepository;
        this.enrollmentRepository = enrollmentRepository;
    }

    @Transactional(readOnly = true)
    public List<AssessmentResultResponse> getResults(UUID assessmentId) {
        UUID schoolId = TenantContext.requireSchoolId();
        return resultRepository.findByAssessmentIdAndSchoolId(assessmentId, schoolId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public AssessmentResultResponse saveResult(UUID assessmentId, AssessmentResultCreateRequest request) {
        UUID schoolId = TenantContext.requireSchoolId();
        
        Assessment assessment = assessmentRepository.findByIdAndSchoolId(assessmentId, schoolId)
                .orElseThrow(() -> new ResourceNotFoundException("Assessment not found"));

        Enrollment enrollment = enrollmentRepository.findByIdAndSchoolId(request.enrollmentId(), schoolId)
                .orElseThrow(() -> new ResourceNotFoundException("Enrollment not found"));

        AssessmentResult result = resultRepository.findByAssessmentIdAndEnrollmentIdAndSchoolId(assessmentId, request.enrollmentId(), schoolId)
                .orElseGet(() -> {
                    AssessmentResult r = new AssessmentResult();
                    r.setAssessment(assessment);
                    r.setEnrollment(enrollment);
                    return r;
                });

        result.setScore(request.score());
        result.setScoreStatus(ScoreStatus.RECORDED);
        
        return mapToResponse(resultRepository.save(result));
    }

    @Transactional
    public List<AssessmentResultResponse> saveResults(UUID assessmentId, List<AssessmentResultCreateRequest> requests) {
        return requests.stream()
                .map(request -> saveResult(assessmentId, request))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AssessmentResultResponse> previewResults(UUID assessmentId, List<AssessmentResultCreateRequest> requests) {
        UUID schoolId = TenantContext.requireSchoolId();
        Assessment assessment = assessmentRepository.findByIdAndSchoolId(assessmentId, schoolId)
                .orElseThrow(() -> new ResourceNotFoundException("Assessment not found"));

        return requests.stream().map(req -> {
            Enrollment enrollment = enrollmentRepository.findByIdAndSchoolId(req.enrollmentId(), schoolId)
                    .orElseThrow(() -> new ResourceNotFoundException("Enrollment not found"));
            
            return new AssessmentResultResponse(
                    UUID.randomUUID(), // Mock ID for preview
                    schoolId,
                    assessmentId,
                    req.enrollmentId(),
                    enrollment.getStudent().getId(),
                    req.score(),
                    "SYSTEM",
                    ScoreStatus.RECORDED.name(),
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null
            );
        }).collect(Collectors.toList());
    }

    private AssessmentResultResponse mapToResponse(AssessmentResult result) {
        return new AssessmentResultResponse(
                result.getId(),
                result.getSchoolId(),
                result.getAssessment().getId(),
                result.getEnrollment().getId(),
                result.getEnrollment().getStudent().getId(),
                result.getScore(),
                "SYSTEM", // TODO: Add real user tracking
                result.getScoreStatus().name(),
                null, // finalizedAt
                null, // percentage
                null, // grade
                null, // gradePoint
                null, // remark
                null, // weightedContribution
                result.getCreatedAt(),
                result.getUpdatedAt()
        );
    }
}
