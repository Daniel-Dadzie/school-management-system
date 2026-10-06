package com.karatu.sis.reporting.dto;

import com.karatu.sis.reporting.domain.ReportTemplate;
import org.springframework.stereotype.Component;

@Component
public class ReportTemplateMapper {

    public ReportTemplateResponse toResponse(ReportTemplate entity) {
        if (entity == null) {
            return null;
        }
        return new ReportTemplateResponse(
                entity.getId(),
                entity.getName(),
                entity.getDescription(),
                entity.isActive(),
                entity.getConfig(),
                entity.getCreatedAt(),
                entity.getUpdatedAt()
        );
    }
}
