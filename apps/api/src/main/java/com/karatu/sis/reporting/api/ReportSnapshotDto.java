package com.karatu.sis.reporting.api;

import com.karatu.sis.reporting.domain.ReportSnapshotStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public class ReportSnapshotDto {
    private UUID id;
    private UUID studentId;
    private UUID enrollmentId;
    private UUID academicYearId;
    private UUID termId;
    private UUID templateId;
    private ReportSnapshotStatus status;
    private String pdfUrl;
    private BigDecimal overallScore;
    private String overallGrade;
    private Integer overallRank;
    private String headteacherComment;
    private String teacherComment;
    private LocalDateTime publishedAt;
    private java.util.List<ReportSnapshotResultDto> results;
    
    // Default constructor
    public ReportSnapshotDto() {}
    
    // Getters and Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    
    public UUID getStudentId() { return studentId; }
    public void setStudentId(UUID studentId) { this.studentId = studentId; }
    
    public UUID getEnrollmentId() { return enrollmentId; }
    public void setEnrollmentId(UUID enrollmentId) { this.enrollmentId = enrollmentId; }
    
    public UUID getAcademicYearId() { return academicYearId; }
    public void setAcademicYearId(UUID academicYearId) { this.academicYearId = academicYearId; }
    
    public UUID getTermId() { return termId; }
    public void setTermId(UUID termId) { this.termId = termId; }
    
    public UUID getTemplateId() { return templateId; }
    public void setTemplateId(UUID templateId) { this.templateId = templateId; }
    
    public ReportSnapshotStatus getStatus() { return status; }
    public void setStatus(ReportSnapshotStatus status) { this.status = status; }
    
    public String getPdfUrl() { return pdfUrl; }
    public void setPdfUrl(String pdfUrl) { this.pdfUrl = pdfUrl; }
    
    public BigDecimal getOverallScore() { return overallScore; }
    public void setOverallScore(BigDecimal overallScore) { this.overallScore = overallScore; }
    
    public String getOverallGrade() { return overallGrade; }
    public void setOverallGrade(String overallGrade) { this.overallGrade = overallGrade; }
    
    public Integer getOverallRank() { return overallRank; }
    public void setOverallRank(Integer overallRank) { this.overallRank = overallRank; }
    
    public String getHeadteacherComment() { return headteacherComment; }
    public void setHeadteacherComment(String headteacherComment) { this.headteacherComment = headteacherComment; }
    
    public String getTeacherComment() { return teacherComment; }
    public void setTeacherComment(String teacherComment) { this.teacherComment = teacherComment; }
    
    public LocalDateTime getPublishedAt() { return publishedAt; }
    public void setPublishedAt(LocalDateTime publishedAt) { this.publishedAt = publishedAt; }
    
    public java.util.List<ReportSnapshotResultDto> getResults() { return results; }
    public void setResults(java.util.List<ReportSnapshotResultDto> results) { this.results = results; }
}
