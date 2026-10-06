package com.karatu.sis.academic.dto;

import java.util.List;
import java.util.UUID;

public class PromotionRequestDTO {
    private UUID sourceAcademicYearId;
    private UUID sourceClassId;
    private UUID targetAcademicYearId;
    private UUID targetClassId;
    private List<UUID> studentIds;

    public UUID getSourceAcademicYearId() { return sourceAcademicYearId; }
    public void setSourceAcademicYearId(UUID sourceAcademicYearId) { this.sourceAcademicYearId = sourceAcademicYearId; }

    public UUID getSourceClassId() { return sourceClassId; }
    public void setSourceClassId(UUID sourceClassId) { this.sourceClassId = sourceClassId; }

    public UUID getTargetAcademicYearId() { return targetAcademicYearId; }
    public void setTargetAcademicYearId(UUID targetAcademicYearId) { this.targetAcademicYearId = targetAcademicYearId; }

    public UUID getTargetClassId() { return targetClassId; }
    public void setTargetClassId(UUID targetClassId) { this.targetClassId = targetClassId; }

    public List<UUID> getStudentIds() { return studentIds; }
    public void setStudentIds(List<UUID> studentIds) { this.studentIds = studentIds; }
}
