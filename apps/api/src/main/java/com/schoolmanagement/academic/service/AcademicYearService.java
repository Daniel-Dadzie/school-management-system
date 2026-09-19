package com.schoolmanagement.academic.service;

import com.schoolmanagement.academic.domain.AcademicYear;
import com.schoolmanagement.academic.dto.AcademicYearRequest;
import com.schoolmanagement.academic.dto.AcademicYearResponse;
import com.schoolmanagement.academic.repository.AcademicYearRepository;
import com.schoolmanagement.common.exception.BusinessValidationException;
import com.schoolmanagement.common.exception.ResourceConflictException;
import com.schoolmanagement.common.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class AcademicYearService {

    private final AcademicYearRepository academicYearRepository;

    public AcademicYearService(AcademicYearRepository academicYearRepository) {
        this.academicYearRepository = academicYearRepository;
    }

    @Transactional(readOnly = true)
    public List<AcademicYearResponse> getAllAcademicYears() {
        return academicYearRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public AcademicYearResponse getAcademicYearById(UUID id) {
        return academicYearRepository.findById(id)
                .map(this::mapToResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Academic year not found"));
    }

    @Transactional
    public AcademicYearResponse createAcademicYear(AcademicYearRequest request) {
        if (request.startDate().isAfter(request.endDate())) {
            throw new BusinessValidationException("Start date must be before end date");
        }
        
        // Manual check for uniqueness just in case (though DB has unique constraint)
        // academicYearRepository.findByName is not defined yet, skipping explicit DB query 
        // to avoid touching repo unless needed, DataIntegrityViolationException will happen and be caught.

        AcademicYear academicYear = new AcademicYear();
        academicYear.setName(request.name().trim());
        academicYear.setStartDate(request.startDate());
        academicYear.setEndDate(request.endDate());

        try {
            AcademicYear saved = academicYearRepository.saveAndFlush(academicYear);
            return mapToResponse(saved);
        } catch (org.springframework.dao.DataIntegrityViolationException ex) {
            throw new ResourceConflictException("Academic year with this name already exists");
        }
    }

    private AcademicYearResponse mapToResponse(AcademicYear academicYear) {
        return new AcademicYearResponse(
                academicYear.getId(),
                academicYear.getName(),
                academicYear.getStartDate(),
                academicYear.getEndDate(),
                academicYear.getStatus().name(),
                academicYear.getCreatedAt(),
                academicYear.getUpdatedAt()
        );
    }
}
