package com.karatu.sis.academic.service;

import com.karatu.sis.academic.domain.AcademicYear;
import com.karatu.sis.academic.domain.CurriculumOffering;
import com.karatu.sis.academic.domain.Subject;
import com.karatu.sis.academic.dto.CurriculumOfferingRequest;
import com.karatu.sis.academic.dto.CurriculumOfferingResponse;
import com.karatu.sis.academic.dto.SubjectResponse;
import com.karatu.sis.academic.repository.AcademicYearRepository;
import com.karatu.sis.academic.repository.CurriculumOfferingRepository;
import com.karatu.sis.academic.repository.SubjectRepository;
import com.karatu.sis.tenant.TenantContext;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class CurriculumOfferingService {

    private final CurriculumOfferingRepository curriculumOfferingRepository;
    private final AcademicYearRepository academicYearRepository;
    private final SubjectRepository subjectRepository;

    public CurriculumOfferingService(CurriculumOfferingRepository curriculumOfferingRepository,
                                     AcademicYearRepository academicYearRepository,
                                     SubjectRepository subjectRepository) {
        this.curriculumOfferingRepository = curriculumOfferingRepository;
        this.academicYearRepository = academicYearRepository;
        this.subjectRepository = subjectRepository;
    }

    @Transactional(readOnly = true)
    public List<CurriculumOfferingResponse> getOfferingsForGrade(UUID academicYearId, String gradeLevel) {
        UUID schoolId = TenantContext.requireSchoolId();
        return curriculumOfferingRepository.findAllBySchoolIdAndAcademicYearIdAndGradeLevel(schoolId, academicYearId, gradeLevel)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<CurriculumOfferingResponse> getAllOfferings(UUID academicYearId) {
        UUID schoolId = TenantContext.requireSchoolId();
        return curriculumOfferingRepository.findAllBySchoolIdAndAcademicYearId(schoolId, academicYearId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public CurriculumOfferingResponse createOffering(CurriculumOfferingRequest request) {
        UUID schoolId = TenantContext.requireSchoolId();
        
        if (curriculumOfferingRepository.existsBySchoolIdAndAcademicYearIdAndGradeLevelAndSubjectId(
                schoolId, request.academicYearId(), request.gradeLevel(), request.subjectId())) {
            throw new IllegalStateException("Subject is already offered for this grade level in the given academic year.");
        }

        AcademicYear academicYear = academicYearRepository.findByIdAndSchoolId(request.academicYearId(), schoolId)
                .orElseThrow(() -> new EntityNotFoundException("Academic Year not found"));

        Subject subject = subjectRepository.findByIdAndSchoolId(request.subjectId(), schoolId)
                .orElseThrow(() -> new EntityNotFoundException("Subject not found"));

        CurriculumOffering offering = new CurriculumOffering();
        offering.setSchoolId(schoolId);
        offering.setAcademicYear(academicYear);
        offering.setGradeLevel(request.gradeLevel());
        offering.setSubject(subject);
        offering.setRequired(request.isRequired());
        offering.setActive(request.isActive());
        offering.setPeriodsPerWeek(request.periodsPerWeek());
        offering.setAssessmentEnabled(request.assessmentEnabled());
        offering.setReportEnabled(request.reportEnabled());

        offering = curriculumOfferingRepository.save(offering);
        return mapToResponse(offering);
    }

    public CurriculumOfferingResponse updateOffering(UUID id, CurriculumOfferingRequest request) {
        UUID schoolId = TenantContext.requireSchoolId();
        
        CurriculumOffering offering = curriculumOfferingRepository.findByIdAndSchoolId(id, schoolId)
                .orElseThrow(() -> new EntityNotFoundException("Curriculum Offering not found"));

        offering.setRequired(request.isRequired());
        offering.setActive(request.isActive());
        offering.setPeriodsPerWeek(request.periodsPerWeek());
        offering.setAssessmentEnabled(request.assessmentEnabled());
        offering.setReportEnabled(request.reportEnabled());

        offering = curriculumOfferingRepository.save(offering);
        return mapToResponse(offering);
    }

    public void deleteOffering(UUID id) {
        UUID schoolId = TenantContext.requireSchoolId();
        CurriculumOffering offering = curriculumOfferingRepository.findByIdAndSchoolId(id, schoolId)
                .orElseThrow(() -> new EntityNotFoundException("Curriculum Offering not found"));
        curriculumOfferingRepository.delete(offering);
    }

    private CurriculumOfferingResponse mapToResponse(CurriculumOffering offering) {
        return new CurriculumOfferingResponse(
                offering.getId(),
                offering.getAcademicYear().getId(),
                offering.getGradeLevel(),
                new SubjectResponse(
                        offering.getSubject().getId(),
                        offering.getSubject().getName(),
                        offering.getSubject().getCode(),
                        offering.getSubject().getDepartment(),
                        null,
                        null
                ),
                offering.isRequired(),
                offering.isActive(),
                offering.getPeriodsPerWeek(),
                offering.isAssessmentEnabled(),
                offering.isReportEnabled()
        );
    }
}
