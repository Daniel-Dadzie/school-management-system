package com.karatu.sis.reporting.api;

import java.math.BigDecimal;
import java.util.UUID;

public class ReportSnapshotResultDto {
    private UUID id;
    private String subjectName;
    private BigDecimal classScore;
    private BigDecimal examScore;
    private BigDecimal totalScore;
    private String grade;
    private String remark;
    private Integer rank;

    public ReportSnapshotResultDto() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getSubjectName() { return subjectName; }
    public void setSubjectName(String subjectName) { this.subjectName = subjectName; }

    public BigDecimal getClassScore() { return classScore; }
    public void setClassScore(BigDecimal classScore) { this.classScore = classScore; }

    public BigDecimal getExamScore() { return examScore; }
    public void setExamScore(BigDecimal examScore) { this.examScore = examScore; }

    public BigDecimal getTotalScore() { return totalScore; }
    public void setTotalScore(BigDecimal totalScore) { this.totalScore = totalScore; }

    public String getGrade() { return grade; }
    public void setGrade(String grade) { this.grade = grade; }

    public String getRemark() { return remark; }
    public void setRemark(String remark) { this.remark = remark; }

    public Integer getRank() { return rank; }
    public void setRank(Integer rank) { this.rank = rank; }
}
