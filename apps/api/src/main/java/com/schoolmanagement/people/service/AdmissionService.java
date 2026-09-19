package com.schoolmanagement.people.service;

import com.schoolmanagement.people.domain.AdmissionApplication;
import com.schoolmanagement.people.dto.AdmissionApplicationRequest;
import com.schoolmanagement.people.dto.AdmissionApplicationResponse;
import com.schoolmanagement.people.repository.AdmissionApplicationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

