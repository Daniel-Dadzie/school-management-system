package com.karatu.sis.academic.dto;

import java.util.UUID;
import java.math.BigDecimal;

public class PromotionCandidateDTO {
    private UUID studentId;
    private String studentName;
    private BigDecimal overallScore;
    private String overallGrade;

    public PromotionCandidateDTO(UUID studentId, String studentName, BigDecimal overallScore, String overallGrade) {
        this.studentId = studentId;
        this.studentName = studentName;
        this.overallScore = overallScore;
        this.overallGrade = overallGrade;
    }

    public UUID getStudentId() { return studentId; }
    public void setStudentId(UUID studentId) { this.studentId = studentId; }

    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }

    public BigDecimal getOverallScore() { return overallScore; }
    public void setOverallScore(BigDecimal overallScore) { this.overallScore = overallScore; }

    public String getOverallGrade() { return overallGrade; }
    public void setOverallGrade(String overallGrade) { this.overallGrade = overallGrade; }
}
