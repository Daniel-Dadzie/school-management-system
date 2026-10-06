package com.karatu.sis.grading.domain;

import com.karatu.sis.tenant.domain.SchoolOwnedEntity;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "grade_bands", uniqueConstraints = {
        @UniqueConstraint(name = "uq_grade_bands_school_scheme_grade", columnNames = {"school_id", "scheme_id", "grade"})
})
public class GradeBand extends SchoolOwnedEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "scheme_id", nullable = false)
    private GradingScheme gradingScheme;

    @Column(nullable = false, length = 10)
    private String grade;

    @Column(name = "minimum_score", nullable = false, precision = 5, scale = 2)
    private BigDecimal minimumScore;

    @Column(name = "maximum_score", nullable = false, precision = 5, scale = 2)
    private BigDecimal maximumScore;

    @Column(length = 100)
    private String remark;

    @Column(nullable = false)
    private Integer sequence;

    @Column(name = "is_pass", nullable = false)
    private boolean isPass = true;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public GradeBand() {
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public GradingScheme getGradingScheme() {
        return gradingScheme;
    }

    public void setGradingScheme(GradingScheme gradingScheme) {
        this.gradingScheme = gradingScheme;
    }

    public String getGrade() {
        return grade;
    }

    public void setGrade(String grade) {
        this.grade = grade;
    }

    public BigDecimal getMinimumScore() {
        return minimumScore;
    }

    public void setMinimumScore(BigDecimal minimumScore) {
        this.minimumScore = minimumScore;
    }

    public BigDecimal getMaximumScore() {
        return maximumScore;
    }

    public void setMaximumScore(BigDecimal maximumScore) {
        this.maximumScore = maximumScore;
    }

    public String getRemark() {
        return remark;
    }

    public void setRemark(String remark) {
        this.remark = remark;
    }

    public Integer getSequence() {
        return sequence;
    }

    public void setSequence(Integer sequence) {
        this.sequence = sequence;
    }

    public boolean isPass() {
        return isPass;
    }

    public void setPass(boolean pass) {
        isPass = pass;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
