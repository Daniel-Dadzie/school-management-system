package com.karatu.sis.reporting.domain;

import com.karatu.sis.academic.domain.Subject;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "report_snapshot_results")
public class ReportSnapshotResult {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "report_snapshot_id", nullable = false)
    private ReportSnapshot reportSnapshot;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "subject_id", nullable = false)
    private Subject subject;

    @Column(name = "subject_name", nullable = false, length = 255)
    private String subjectName;

    @Column(name = "class_score", precision = 10, scale = 2)
    private BigDecimal classScore;

    @Column(name = "exam_score", precision = 10, scale = 2)
    private BigDecimal examScore;

    @Column(name = "total_score", precision = 10, scale = 2)
    private BigDecimal totalScore;

    @Column(name = "grade", length = 10)
    private String grade;

    @Column(name = "remark", length = 255)
    private String remark;

    @Column(name = "rank")
    private Integer rank;

    public ReportSnapshotResult() {
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public ReportSnapshot getReportSnapshot() {
        return reportSnapshot;
    }

    public void setReportSnapshot(ReportSnapshot reportSnapshot) {
        this.reportSnapshot = reportSnapshot;
    }

    public Subject getSubject() {
        return subject;
    }

    public void setSubject(Subject subject) {
        this.subject = subject;
    }

    public String getSubjectName() {
        return subjectName;
    }

    public void setSubjectName(String subjectName) {
        this.subjectName = subjectName;
    }

    public BigDecimal getClassScore() {
        return classScore;
    }

    public void setClassScore(BigDecimal classScore) {
        this.classScore = classScore;
    }

    public BigDecimal getExamScore() {
        return examScore;
    }

    public void setExamScore(BigDecimal examScore) {
        this.examScore = examScore;
    }

    public BigDecimal getTotalScore() {
        return totalScore;
    }

    public void setTotalScore(BigDecimal totalScore) {
        this.totalScore = totalScore;
    }

    public String getGrade() {
        return grade;
    }

    public void setGrade(String grade) {
        this.grade = grade;
    }

    public String getRemark() {
        return remark;
    }

    public void setRemark(String remark) {
        this.remark = remark;
    }

    public Integer getRank() {
        return rank;
    }

    public void setRank(Integer rank) {
        this.rank = rank;
    }
}
