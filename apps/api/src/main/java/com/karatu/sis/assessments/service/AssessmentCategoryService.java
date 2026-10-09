package com.karatu.sis.assessments.service;

import com.karatu.sis.assessments.api.AssessmentCategoryCreateRequest;
import com.karatu.sis.assessments.api.AssessmentCategoryDto;
import com.karatu.sis.assessments.domain.AssessmentCategory;
import com.karatu.sis.assessments.repository.AssessmentCategoryRepository;
import com.karatu.sis.tenant.TenantContext;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class AssessmentCategoryService {

    private final AssessmentCategoryRepository repository;

    public AssessmentCategoryService(AssessmentCategoryRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public List<AssessmentCategoryDto> getAllCategories() {
        UUID schoolId = TenantContext.requireSchoolId();
        return repository.findBySchoolId(schoolId).stream()
                .filter(AssessmentCategory::isActive)
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public AssessmentCategoryDto createCategory(AssessmentCategoryCreateRequest request) {
        UUID schoolId = TenantContext.requireSchoolId();

        AssessmentCategory category = new AssessmentCategory();
        category.setSchoolId(schoolId);
        category.setName(request.getName());
        
        String code = request.getCode();
        if (code == null || code.trim().isEmpty()) {
            code = generateCode(request.getName());
        }
        category.setCode(code);
        
        category.setDescription(request.getDescription());
        category.setActive(true);

        category = repository.save(category);
        return mapToDto(category);
    }

    private String generateCode(String name) {
        if (name == null || name.trim().isEmpty()) return "CAT";
        String cleanName = name.replaceAll("[^a-zA-Z0-9]", "").toUpperCase();
        return cleanName.substring(0, Math.min(cleanName.length(), 10));
    }

    private AssessmentCategoryDto mapToDto(AssessmentCategory category) {
        AssessmentCategoryDto dto = new AssessmentCategoryDto();
        dto.setId(category.getId());
        dto.setName(category.getName());
        dto.setCode(category.getCode());
        dto.setDescription(category.getDescription());
        dto.setActive(category.isActive());
        dto.setCreatedAt(category.getCreatedAt());
        dto.setUpdatedAt(category.getUpdatedAt());
        return dto;
    }
}
