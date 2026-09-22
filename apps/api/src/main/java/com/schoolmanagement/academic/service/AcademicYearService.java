package com.schoolmanagement.academic.service;

import com.schoolmanagement.academic.domain.AcademicYear;
import com.schoolmanagement.academic.domain.AcademicYearStatus;
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

        AcademicYear academicYear = new AcademicYear();
        academicYear.setName(request.name().trim());
        academicYear.setStartDate(request.startDate());
        academicYear.setEndDate(request.endDate());

        try {
            AcademicYear saved = academicYearRepository.saveAndFlush(academicYear);
            return mapToResponse(saved);
        } catch (org.springframework.dao.DataIntegrityViolationException ex) {
            handleDataIntegrityViolation(ex, "academic_years_name_key", "Academic year with this name already exists");
            throw ex;
        }
    }

    @Transactional
    public AcademicYearResponse updateAcademicYearStatus(UUID id, AcademicYearStatus newStatus) {
        AcademicYear academicYear = academicYearRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Academic year not found"));

        AcademicYearStatus currentStatus = academicYear.getStatus();

        if (newStatus == null) {
            throw new BusinessValidationException("Status is required");
        }

        if (currentStatus == newStatus) {
            throw new BusinessValidationException("Academic year is already in status " + newStatus);
        }

        if (currentStatus == AcademicYearStatus.PLANNED && newStatus == AcademicYearStatus.ACTIVE) {
            if (academicYearRepository.existsByStatus(AcademicYearStatus.ACTIVE)) {
                throw new ResourceConflictException("An active academic year already exists");
            }
        } else if (currentStatus == AcademicYearStatus.ACTIVE && newStatus == AcademicYearStatus.COMPLETED) {
            // Valid transition
        } else if (currentStatus == AcademicYearStatus.ACTIVE && newStatus == AcademicYearStatus.PLANNED) {
            throw new BusinessValidationException("Invalid status transition from ACTIVE to PLANNED");
        } else if (currentStatus == AcademicYearStatus.COMPLETED && newStatus == AcademicYearStatus.PLANNED) {
            throw new BusinessValidationException("Invalid status transition from COMPLETED to PLANNED");
        } else if (currentStatus == AcademicYearStatus.COMPLETED && newStatus == AcademicYearStatus.ACTIVE) {
            throw new BusinessValidationException("Invalid status transition from COMPLETED to ACTIVE");
        } else {
            throw new BusinessValidationException("Invalid status transition from " + currentStatus + " to " + newStatus);
        }

        academicYear.setStatus(newStatus);
        try {
            AcademicYear saved = academicYearRepository.saveAndFlush(academicYear);
            return mapToResponse(saved);
        } catch (org.springframework.dao.DataIntegrityViolationException ex) {
            handleDataIntegrityViolation(ex, "idx_academic_years_active_status", "An active academic year already exists");
            throw ex;
        }
    }

    private void handleDataIntegrityViolation(org.springframework.dao.DataIntegrityViolationException ex, String expectedConstraint, String defaultMessage) {
        String msg = ex.getMostSpecificCause().getMessage();
        if (msg != null && msg.contains(expectedConstraint)) {
            throw new ResourceConflictException(defaultMessage);
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
