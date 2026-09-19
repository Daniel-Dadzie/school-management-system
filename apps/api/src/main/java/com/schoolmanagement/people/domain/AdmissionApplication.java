package com.schoolmanagement.people.domain;

import jakarta.persistence.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "admission_applications")
public class AdmissionApplication {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    // Prospective student details
    @Column(name = "student_first_name", nullable = false, length = 100)
    private String studentFirstName;

    @Column(name = "student_last_name", nullable = false, length = 100)
    private String studentLastName;

    @Column(name = "date_of_birth", nullable = false)
    private LocalDate dateOfBirth;

    @Column(nullable = false, length = 10)
    private String gender;

    @Column(name = "applying_for_class", nullable = false, length = 100)
    private String applyingForClass;

    // Parent/guardian contact details
    @Column(name = "parent_name", nullable = false, length = 200)
    private String parentName;

    @Column(name = "parent_email", nullable = false, length = 255)
    private String parentEmail;

    @Column(name = "parent_phone", nullable = false, length = 20)
    private String parentPhone;

    @Column(nullable = false, length = 50)
    private String relationship;

    // Optional
    @Column(name = "additional_notes", columnDefinition = "TEXT")
    private String additionalNotes;

    // Lifecycle
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private AdmissionStatus status = AdmissionStatus.PENDING;

    @Column(name = "submitted_at", nullable = false, updatable = false)
    private LocalDateTime submittedAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        submittedAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // --- Getters & Setters ---

    public UUID getId() { return id; }

    public String getStudentFirstName() { return studentFirstName; }
    public void setStudentFirstName(String studentFirstName) { this.studentFirstName = studentFirstName; }

    public String getStudentLastName() { return studentLastName; }
    public void setStudentLastName(String studentLastName) { this.studentLastName = studentLastName; }

    public LocalDate getDateOfBirth() { return dateOfBirth; }
    public void setDateOfBirth(LocalDate dateOfBirth) { this.dateOfBirth = dateOfBirth; }

    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }

    public String getApplyingForClass() { return applyingForClass; }
    public void setApplyingForClass(String applyingForClass) { this.applyingForClass = applyingForClass; }

    public String getParentName() { return parentName; }
    public void setParentName(String parentName) { this.parentName = parentName; }

    public String getParentEmail() { return parentEmail; }
    public void setParentEmail(String parentEmail) { this.parentEmail = parentEmail; }

    public String getParentPhone() { return parentPhone; }
    public void setParentPhone(String parentPhone) { this.parentPhone = parentPhone; }

    public String getRelationship() { return relationship; }
    public void setRelationship(String relationship) { this.relationship = relationship; }

    public String getAdditionalNotes() { return additionalNotes; }
    public void setAdditionalNotes(String additionalNotes) { this.additionalNotes = additionalNotes; }

    public AdmissionStatus getStatus() { return status; }
    public void setStatus(AdmissionStatus status) { this.status = status; }

    public LocalDateTime getSubmittedAt() { return submittedAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}

