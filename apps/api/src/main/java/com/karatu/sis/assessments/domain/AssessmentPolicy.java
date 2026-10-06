package com.karatu.sis.assessments.domain;

import com.karatu.sis.grading.domain.GradingScheme;
import com.karatu.sis.tenant.domain.SchoolOwnedEntity;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "assessment_policies")
public class AssessmentPolicy extends SchoolOwnedEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "grading_scheme_id")
    private GradingScheme gradingScheme;

    @Column(name = "pass_mark", precision = 5, scale = 2)
    private BigDecimal passMark;

    @Enumerated(EnumType.STRING)
    @Column(name = "rounding_rule", nullable = false, length = 50)
    private RoundingRule roundingRule = RoundingRule.NEAREST_WHOLE;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public AssessmentPolicy() {
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

    public BigDecimal getPassMark() {
        return passMark;
    }

    public void setPassMark(BigDecimal passMark) {
        this.passMark = passMark;
    }

    public RoundingRule getRoundingRule() {
        return roundingRule;
    }

    public void setRoundingRule(RoundingRule roundingRule) {
        this.roundingRule = roundingRule;
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
