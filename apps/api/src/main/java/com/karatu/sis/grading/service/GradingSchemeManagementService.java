package com.karatu.sis.grading.service;

import com.karatu.sis.common.exception.ResourceNotFoundException;
import com.karatu.sis.grading.domain.GradingScheme;
import com.karatu.sis.grading.domain.GradingSchemeSourceType;
import com.karatu.sis.grading.dto.GradingSchemeRequest;
import com.karatu.sis.grading.dto.GradingSchemeResponse;
import com.karatu.sis.grading.repository.GradingSchemeRepository;
import com.karatu.sis.tenant.TenantContext;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class GradingSchemeManagementService {
    
    private final GradingSchemeRepository gradingSchemeRepository;

    public GradingSchemeManagementService(GradingSchemeRepository gradingSchemeRepository) {
        this.gradingSchemeRepository = gradingSchemeRepository;
    }

    @Transactional(readOnly = true)
    public List<GradingSchemeResponse> getSchemes() {
        return gradingSchemeRepository.findBySchoolId(TenantContext.requireSchoolId())
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public GradingSchemeResponse createScheme(GradingSchemeRequest request) {
        GradingScheme scheme = new GradingScheme();
        scheme.setSchoolId(TenantContext.requireSchoolId());
        scheme.setName(request.name());
        scheme.setDescription(request.description());
        scheme.setSourceType(GradingSchemeSourceType.SCHOOL_CUSTOM);
        scheme.setActive(request.active());
        
        GradingScheme saved = gradingSchemeRepository.save(scheme);
        return mapToResponse(saved);
    }
    
    @Transactional
    public GradingSchemeResponse updateScheme(UUID id, GradingSchemeRequest request) {
        GradingScheme scheme = gradingSchemeRepository.findByIdAndSchoolId(id, TenantContext.requireSchoolId())
                .orElseThrow(() -> new ResourceNotFoundException("Grading Scheme not found"));
                
        scheme.setName(request.name());
        scheme.setDescription(request.description());
        scheme.setActive(request.active());
        
        GradingScheme saved = gradingSchemeRepository.save(scheme);
        return mapToResponse(saved);
    }

    private GradingSchemeResponse mapToResponse(GradingScheme scheme) {
        return new GradingSchemeResponse(
                scheme.getId(),
                scheme.getName(),
                scheme.getDescription(),
                scheme.getSourceType(),
                scheme.isActive(),
                scheme.getCreatedAt(),
                scheme.getUpdatedAt()
        );
    }
}
