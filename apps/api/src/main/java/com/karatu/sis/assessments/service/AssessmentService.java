package com.karatu.sis.assessments.service;

import com.karatu.sis.academic.domain.Assessment;
import com.karatu.sis.academic.domain.AssessmentStatus;
import com.karatu.sis.academic.domain.AssessmentType;
import com.karatu.sis.academic.domain.TeacherAssignment;
import com.karatu.sis.academic.dto.AssessmentCreateRequest;
import com.karatu.sis.academic.dto.AssessmentResponse;
import com.karatu.sis.academic.dto.AssessmentUpdateRequest;
import com.karatu.sis.academic.repository.AssessmentRepository;
import com.karatu.sis.academic.repository.TeacherAssignmentRepository;
import com.karatu.sis.assessments.domain.AssessmentCategory;
import com.karatu.sis.assessments.repository.AssessmentCategoryRepository;
import com.karatu.sis.common.exception.ResourceNotFoundException;
import com.karatu.sis.tenant.TenantContext;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class AssessmentService {

    private final AssessmentRepository assessmentRepository;
    private final TeacherAssignmentRepository teacherAssignmentRepository;
    private final AssessmentCategoryRepository assessmentCategoryRepository;

    public AssessmentService(
            AssessmentRepository assessmentRepository,
            TeacherAssignmentRepository teacherAssignmentRepository,
            AssessmentCategoryRepository assessmentCategoryRepository) {
        this.assessmentRepository = assessmentRepository;
        this.teacherAssignmentRepository = teacherAssignmentRepository;
        this.assessmentCategoryRepository = assessmentCategoryRepository;
    }

    public AssessmentResponse createAssessment(AssessmentCreateRequest request) {
        UUID schoolId = TenantContext.requireSchoolId();

        TeacherAssignment assignment = teacherAssignmentRepository
                .findByIdAndSchoolId(request.teacherAssignmentId(), schoolId)
                .orElseThrow(() -> new ResourceNotFoundException("No teacher assignment found for the specified ID"));

        AssessmentCategory category = assessmentCategoryRepository
                .findByIdAndSchoolId(request.categoryId(), schoolId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        Assessment assessment = new Assessment();
        assessment.setTitle(request.title());
        assessment.setType(AssessmentType.EXAM); // default, or could be mapped if provided
        assessment.setTeacherAssignment(assignment);
        assessment.setAssessmentDate(request.assessmentDate());
        assessment.setMaximumScore(request.maximumScore());
        assessment.setWeight(request.weightPercent());
        assessment.setCategory(category);
        assessment.setCountsTowardFinalResult(request.isCurrentFinal());
        assessment.setSchoolId(schoolId);
        
        // Wait, Assessment has a `description` field?
        // Let's check Assessment entity. It doesn't have a description field. Wait.
        // I'll skip description if not present.
        
        Assessment saved = assessmentRepository.save(assessment);
        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<AssessmentResponse> getAllAssessments() {
        UUID schoolId = TenantContext.requireSchoolId();
        // Here we could filter by term, class, etc. For now, fetch all for tenant.
        // In a real app, this should have pagination or filters.
        return assessmentRepository.findBySchoolId(schoolId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public AssessmentResponse getAssessment(UUID id) {
        UUID schoolId = TenantContext.requireSchoolId();
        Assessment assessment = assessmentRepository.findByIdWithDetailsAndSchoolId(id, schoolId)
                .orElseThrow(() -> new ResourceNotFoundException("Assessment not found"));
        return toResponse(assessment);
    }

    public AssessmentResponse updateAssessment(UUID id, AssessmentUpdateRequest request) {
        UUID schoolId = TenantContext.requireSchoolId();
        Assessment assessment = assessmentRepository.findByIdAndSchoolId(id, schoolId)
                .orElseThrow(() -> new ResourceNotFoundException("Assessment not found"));

        if (request.title() != null) assessment.setTitle(request.title());
        if (request.assessmentDate() != null) assessment.setAssessmentDate(request.assessmentDate());
        if (request.maximumScore() != null) assessment.setMaximumScore(request.maximumScore());
        if (request.weightPercent() != null) assessment.setWeight(request.weightPercent());
        if (request.isCurrentFinal() != null) assessment.setCountsTowardFinalResult(request.isCurrentFinal());

        if (request.categoryId() != null) {
            AssessmentCategory category = assessmentCategoryRepository
                    .findByIdAndSchoolId(request.categoryId(), schoolId)
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
            assessment.setCategory(category);
        }

        Assessment updated = assessmentRepository.save(assessment);
        return toResponse(updated);
    }

    public void deleteAssessment(UUID id) {
        UUID schoolId = TenantContext.requireSchoolId();
        if (!assessmentRepository.existsByIdAndSchoolId(id, schoolId)) {
            throw new ResourceNotFoundException("Assessment not found");
        }
        assessmentRepository.deleteByIdAndSchoolId(id, schoolId);
    }

    private AssessmentResponse toResponse(Assessment a) {
        return new AssessmentResponse(
                a.getId(),
                a.getSchoolId(),
                a.getTitle(),
                a.getTeacherAssignment() != null ? a.getTeacherAssignment().getId() : null,
                a.getTeacherAssignment() != null && a.getTeacherAssignment().getTerm() != null ? a.getTeacherAssignment().getTerm().getId() : null,
                a.getTeacherAssignment() != null && a.getTeacherAssignment().getSchoolClass() != null ? a.getTeacherAssignment().getSchoolClass().getId() : null,
                a.getTeacherAssignment() != null && a.getTeacherAssignment().getSubject() != null ? a.getTeacherAssignment().getSubject().getId() : null,
                a.getCategory() != null ? a.getCategory().getId() : null,
                null, // description
                a.getAssessmentDate(),
                a.getMaximumScore(),
                a.getWeight(),
                a.getStatus(),
                a.getLifecycleStatus(),
                a.isCountsTowardFinalResult(),
                a.getCreatedAt(),
                a.getUpdatedAt()
        );
    }
}
