package com.karatu.sis.reporting.service;

import com.karatu.sis.reporting.domain.ReportTemplate;
import com.karatu.sis.reporting.dto.ReportTemplateMapper;
import com.karatu.sis.reporting.dto.ReportTemplateRequest;
import com.karatu.sis.reporting.dto.ReportTemplateResponse;
import com.karatu.sis.reporting.repository.ReportTemplateRepository;
import com.karatu.sis.common.exception.ResourceNotFoundException;
import com.karatu.sis.tenant.TenantContext;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class ReportTemplateService {

    private final ReportTemplateRepository reportTemplateRepository;
    private final ReportTemplateMapper reportTemplateMapper;

    public ReportTemplateService(ReportTemplateRepository reportTemplateRepository, ReportTemplateMapper reportTemplateMapper) {
        this.reportTemplateRepository = reportTemplateRepository;
        this.reportTemplateMapper = reportTemplateMapper;
    }

    @Transactional(readOnly = true)
    public Page<ReportTemplateResponse> getTemplates(Pageable pageable) {
        UUID schoolId = TenantContext.requireSchoolId();
        return reportTemplateRepository.findAllBySchoolId(schoolId, pageable)
                .map(reportTemplateMapper::toResponse);
    }

    @Transactional(readOnly = true)
    public ReportTemplateResponse getTemplate(UUID id) {
        UUID schoolId = TenantContext.requireSchoolId();
        ReportTemplate template = reportTemplateRepository.findByIdAndSchoolId(id, schoolId)
                .orElseThrow(() -> new ResourceNotFoundException("Report Template not found"));
        return reportTemplateMapper.toResponse(template);
    }

    @Transactional
    public ReportTemplateResponse createTemplate(ReportTemplateRequest request) {
        UUID schoolId = TenantContext.requireSchoolId();
        
        ReportTemplate template = new ReportTemplate();
        template.setSchoolId(schoolId);
        template.setName(request.name());
        template.setDescription(request.description());
        template.setActive(request.isActive());
        template.setConfig(request.config());

        ReportTemplate saved = reportTemplateRepository.save(template);
        return reportTemplateMapper.toResponse(saved);
    }

    @Transactional
    public ReportTemplateResponse updateTemplate(UUID id, ReportTemplateRequest request) {
        UUID schoolId = TenantContext.requireSchoolId();
        
        ReportTemplate template = reportTemplateRepository.findByIdAndSchoolId(id, schoolId)
                .orElseThrow(() -> new ResourceNotFoundException("Report Template not found"));
                
        template.setName(request.name());
        template.setDescription(request.description());
        template.setActive(request.isActive());
        template.setConfig(request.config());

        ReportTemplate saved = reportTemplateRepository.save(template);
        return reportTemplateMapper.toResponse(saved);
    }

    @Transactional
    public void deleteTemplate(UUID id) {
        UUID schoolId = TenantContext.requireSchoolId();
        
        if (!reportTemplateRepository.existsByIdAndSchoolId(id, schoolId)) {
            throw new ResourceNotFoundException("Report Template not found");
        }
        
        reportTemplateRepository.deleteById(id);
    }
}
