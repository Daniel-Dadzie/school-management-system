package com.schoolmanagement.people.service;

import com.schoolmanagement.people.domain.AdmissionApplication;
import com.schoolmanagement.people.domain.AdmissionStatus;
import com.schoolmanagement.people.dto.AdmissionApplicationRequest;
import com.schoolmanagement.people.dto.AdmissionApplicationResponse;
import com.schoolmanagement.people.repository.AdmissionApplicationRepository;
import com.schoolmanagement.people.dto.AdmissionStatusUpdateRequest;
import com.schoolmanagement.common.exception.ResourceNotFoundException;
import com.schoolmanagement.common.exception.BusinessValidationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class AdmissionService {

    private final AdmissionApplicationRepository repository;

    public AdmissionService(AdmissionApplicationRepository repository) {
        this.repository = repository;
    }

    /**
     * Accepts a public admission application and persists it with PENDING status.
     * This operation does NOT create a Student record.
     */
    @Transactional
    public AdmissionApplicationResponse submitApplication(AdmissionApplicationRequest request) {
        AdmissionApplication application = new AdmissionApplication();
        application.setStudentFirstName(request.studentFirstName().trim());
        application.setStudentLastName(request.studentLastName().trim());
        application.setDateOfBirth(request.dateOfBirth());
        application.setGender(request.gender());
        application.setApplyingForClass(request.applyingForClass().trim());
        application.setParentName(request.parentName().trim());
        application.setParentEmail(request.parentEmail().trim().toLowerCase());
        application.setParentPhone(request.parentPhone().trim());
        application.setRelationship(request.relationship());
        application.setAdditionalNotes(
                request.additionalNotes() != null ? request.additionalNotes().trim() : null
        );

        AdmissionApplication saved = repository.save(application);
        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<AdmissionApplicationResponse> getAllApplications() {
        return repository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public AdmissionApplicationResponse getApplicationById(UUID id) {
        AdmissionApplication app = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Admission application not found with ID: " + id));
        return toResponse(app);
    }

    @Transactional
    public AdmissionApplicationResponse updateApplicationStatus(UUID id, AdmissionStatusUpdateRequest request) {
        AdmissionApplication app = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Admission application not found with ID: " + id));

        AdmissionStatus currentStatus = app.getStatus();
        AdmissionStatus newStatus = request.status();

        validateTransition(currentStatus, newStatus);

        app.setStatus(newStatus);
        AdmissionApplication saved = repository.save(app);

        return toResponse(saved);
    }

    private void validateTransition(AdmissionStatus currentStatus, AdmissionStatus newStatus) {
        if (newStatus == null) {
            throw new BusinessValidationException("New status cannot be null");
        }

        boolean isValidTransition = false;

        switch (currentStatus) {
            case PENDING:
                if (newStatus == AdmissionStatus.UNDER_REVIEW) {
                    isValidTransition = true;
                }
                break;
            case UNDER_REVIEW:
                if (newStatus == AdmissionStatus.APPROVED || newStatus == AdmissionStatus.REJECTED) {
                    isValidTransition = true;
                }
                break;
            case APPROVED:
            case REJECTED:
                // Terminal states
                break;
        }

        if (!isValidTransition) {
            throw new BusinessValidationException(
                    String.format("Invalid status transition from %s to %s", currentStatus, newStatus));
        }
    }

    private AdmissionApplicationResponse toResponse(AdmissionApplication app) {
        return new AdmissionApplicationResponse(
                app.getId(),
                app.getStudentFirstName(),
                app.getStudentLastName(),
                app.getDateOfBirth(),
                app.getGender(),
                app.getApplyingForClass(),
                app.getParentName(),
                app.getParentEmail(),
                app.getParentPhone(),
                app.getRelationship(),
                app.getAdditionalNotes(),
                app.getStatus(),
                app.getSubmittedAt()
        );
    }
}

