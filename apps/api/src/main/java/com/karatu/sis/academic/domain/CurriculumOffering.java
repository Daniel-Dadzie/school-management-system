package com.karatu.sis.academic.domain;

import jakarta.persistence.*;
import com.karatu.sis.tenant.domain.SchoolOwnedEntity;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "curriculum_offerings", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"school_id", "academic_year_id", "grade_level", "subject_id"})
})
public class CurriculumOffering extends SchoolOwnedEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "academic_year_id", nullable = false)
    private AcademicYear academicYear;

    @Column(name = "grade_level", nullable = false)
    private String gradeLevel;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "subject_id", nullable = false)
    private Subject subject;

    @Column(name = "is_required", nullable = false)
    private boolean isRequired = true;

    @Column(name = "is_active", nullable = false)
    private boolean isActive = true;

    @Column(name = "periods_per_week")
    private Integer periodsPerWeek;

    @Column(name = "assessment_enabled", nullable = false)
    private boolean assessmentEnabled = true;

    @Column(name = "report_enabled", nullable = false)
    private boolean reportEnabled = true;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public CurriculumOffering() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public AcademicYear getAcademicYear() { return academicYear; }
    public void setAcademicYear(AcademicYear academicYear) { this.academicYear = academicYear; }
    public String getGradeLevel() { return gradeLevel; }
    public void setGradeLevel(String gradeLevel) { this.gradeLevel = gradeLevel; }
    public Subject getSubject() { return subject; }
    public void setSubject(Subject subject) { this.subject = subject; }
    public boolean isRequired() { return isRequired; }
    public void setRequired(boolean required) { this.isRequired = required; }
    public boolean isActive() { return isActive; }
    public void setActive(boolean active) { this.isActive = active; }
    public Integer getPeriodsPerWeek() { return periodsPerWeek; }
    public void setPeriodsPerWeek(Integer periodsPerWeek) { this.periodsPerWeek = periodsPerWeek; }
    public boolean isAssessmentEnabled() { return assessmentEnabled; }
    public void setAssessmentEnabled(boolean assessmentEnabled) { this.assessmentEnabled = assessmentEnabled; }
    public boolean isReportEnabled() { return reportEnabled; }
    public void setReportEnabled(boolean reportEnabled) { this.reportEnabled = reportEnabled; }
}
