package com.karatu.sis.reporting.api;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public class ReportGenerationRequest {

    @NotNull
    private UUID academicYearId;

    @NotNull
    private UUID termId;

    @NotNull
    private UUID classId;

    @NotNull
    private UUID templateId;

    public UUID getAcademicYearId() {
        return academicYearId;
    }

    public void setAcademicYearId(UUID academicYearId) {
        this.academicYearId = academicYearId;
    }

    public UUID getTermId() {
        return termId;
    }

    public void setTermId(UUID termId) {
        this.termId = termId;
    }

    public UUID getClassId() {
        return classId;
    }

    public void setClassId(UUID classId) {
        this.classId = classId;
    }

    public UUID getTemplateId() {
        return templateId;
    }

    public void setTemplateId(UUID templateId) {
        this.templateId = templateId;
    }
}
