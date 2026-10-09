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
import com.karatu.sis.assessments.domain.AssessmentPolicy;
import com.karatu.sis.assessments.exception.AssessmentLifecycleException;
import com.karatu.sis.assessments.repository.AssessmentPolicyRepository;
import com.karatu.sis.common.exception.ResourceNotFoundException;
import com.karatu.sis.grading.domain.GradeBand;
import com.karatu.sis.grading.service.GradingService;
import com.karatu.sis.tenant.TenantContext;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class AssessmentResultService {

    private final AssessmentResultRepository resultRepository;
    private final AssessmentRepository assessmentRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final GradingService gradingService;
    private final AssessmentCalculationService calculationService;
    private final AssessmentPolicyRepository policyRepository;

    public AssessmentResultService(AssessmentResultRepository resultRepository,
                                   AssessmentRepository assessmentRepository,
                                   EnrollmentRepository enrollmentRepository,
                                   GradingService gradingService,
                                   AssessmentCalculationService calculationService,
                                   AssessmentPolicyRepository policyRepository) {
        this.resultRepository = resultRepository;
        this.assessmentRepository = assessmentRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.gradingService = gradingService;
        this.calculationService = calculationService;
        this.policyRepository = policyRepository;
    }

    @Transactional(readOnly = true)
    public List<AssessmentResultResponse> getResults(UUID assessmentId) {
        UUID schoolId = TenantContext.requireSchoolId();
        return resultRepository.findByAssessmentIdAndSchoolId(assessmentId, schoolId)
                .stream()
                .map(r -> mapToResponse(r, schoolId))
                .collect(Collectors.toList());
    }

    @Transactional
    public AssessmentResultResponse saveResult(UUID assessmentId, AssessmentResultCreateRequest request) {
        UUID schoolId = TenantContext.requireSchoolId();

        Assessment assessment = assessmentRepository.findByIdAndSchoolId(assessmentId, schoolId)
                .orElseThrow(() -> new ResourceNotFoundException("Assessment not found"));

        // Guard: results cannot be modified once the assessment is PUBLISHED or LOCKED
        if (!AssessmentLifecycleService.isResultEditAllowed(assessment.getLifecycleStatus())) {
            throw new AssessmentLifecycleException(
                    "Results cannot be modified when assessment is in state: "
                    + assessment.getLifecycleStatus());
        }

        Enrollment enrollment = enrollmentRepository.findByIdAndSchoolId(request.enrollmentId(), schoolId)
                .orElseThrow(() -> new ResourceNotFoundException("Enrollment not found"));

        AssessmentResult result = resultRepository
                .findByAssessmentIdAndEnrollmentIdAndSchoolId(assessmentId, request.enrollmentId(), schoolId)
                .orElseGet(() -> {
                    AssessmentResult r = new AssessmentResult();
                    r.setSchoolId(schoolId);
                    r.setAssessment(assessment);
                    r.setEnrollment(enrollment);
                    return r;
                });

        // Determine correct score status — do NOT collapse absent/excused into RECORDED
        if (request.isAbsent()) {
            result.setScore(null);
            result.setScoreStatus(ScoreStatus.ABSENT);
        } else if (request.isExcused()) {
            result.setScore(null);
            result.setScoreStatus(ScoreStatus.EXCUSED);
        } else if (request.score() == null) {
            result.setScore(null);
            result.setScoreStatus(ScoreStatus.MISSING);
        } else {
            // Validate score does not exceed maximum
            if (request.score().compareTo(assessment.getMaximumScore()) > 0) {
                throw new IllegalArgumentException(
                        "Score " + request.score() + " exceeds maximum score " + assessment.getMaximumScore());
            }
            result.setScore(request.score());
            result.setScoreStatus(ScoreStatus.RECORDED);
        }

        AssessmentResult saved = resultRepository.save(result);
        return mapToResponse(saved, schoolId);
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

            AssessmentResult temp = new AssessmentResult();
            temp.setId(UUID.randomUUID());
            temp.setSchoolId(schoolId);
            temp.setAssessment(assessment);
            temp.setEnrollment(enrollment);

            if (req.isAbsent()) {
                temp.setScore(null);
                temp.setScoreStatus(ScoreStatus.ABSENT);
            } else if (req.isExcused()) {
                temp.setScore(null);
                temp.setScoreStatus(ScoreStatus.EXCUSED);
            } else if (req.score() == null) {
                temp.setScore(null);
                temp.setScoreStatus(ScoreStatus.MISSING);
            } else {
                temp.setScore(req.score());
                temp.setScoreStatus(ScoreStatus.RECORDED);
            }
            return mapToResponse(temp, schoolId);
        }).collect(Collectors.toList());
    }

    /**
     * Maps an AssessmentResult to its response DTO, computing percentage,
     * weighted contribution, and grade via the grading engine.
     */
    private AssessmentResultResponse mapToResponse(AssessmentResult result, UUID schoolId) {
        BigDecimal score = result.getScore();
        BigDecimal percentage = null;
        BigDecimal weightedContribution = null;
        String grade = null;
        BigDecimal gradePoint = null;
        String remark = null;
        Boolean isPass = null;

        if (result.getScoreStatus() == ScoreStatus.RECORDED && score != null) {
            BigDecimal maxScore = result.getAssessment().getMaximumScore();
            BigDecimal weight = result.getAssessment().getWeight();

            // Compute percentage
            percentage = calculationService.calculatePercentageScore(score, maxScore);

            // Compute weighted contribution
            weightedContribution = calculationService.calculateWeightedScore(score, maxScore, weight);

            // Apply rounding from school policy if available
            Optional<AssessmentPolicy> policyOpt = policyRepository.findBySchoolId(schoolId);
            if (policyOpt.isPresent()) {
                percentage = calculationService.applyRoundingRule(percentage, policyOpt.get());
            }

            // Look up grade band using the school's active grading scheme (via policy)
            if (policyOpt.isPresent() && policyOpt.get().getGradingScheme() != null) {
                UUID schemeId = policyOpt.get().getGradingScheme().getId();
                Optional<GradeBand> bandOpt = gradingService.determineGradeBand(schemeId, schoolId, percentage);
                if (bandOpt.isPresent()) {
                    GradeBand band = bandOpt.get();
                    grade = band.getGrade();
                    remark = band.getRemark();
                    isPass = band.isPass();
                }
            }

            // Set is_pass on result for persistence
            result.setIsPass(isPass);
        }

        return new AssessmentResultResponse(
                result.getId(),
                result.getSchoolId(),
                result.getAssessment().getId(),
                result.getEnrollment().getId(),
                result.getEnrollment().getStudent().getId(),
                score,
                "SYSTEM", // TODO: track actual user who entered the score
                result.getScoreStatus().name(),
                null, // finalizedAt — set on publication
                percentage,
                grade,
                gradePoint,
                remark,
                weightedContribution,
                result.getCreatedAt(),
                result.getUpdatedAt()
        );
    }
}
