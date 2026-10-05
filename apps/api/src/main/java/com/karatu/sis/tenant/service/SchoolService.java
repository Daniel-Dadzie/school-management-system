package com.karatu.sis.tenant.service;

import com.karatu.sis.auth.domain.Role;
import com.karatu.sis.auth.domain.User;
import com.karatu.sis.auth.repository.UserRepository;
import com.karatu.sis.common.exception.BusinessValidationException;
import com.karatu.sis.common.exception.ResourceConflictException;
import com.karatu.sis.common.exception.ResourceNotFoundException;
import com.karatu.sis.tenant.TenantContext;
import com.karatu.sis.tenant.domain.School;
import com.karatu.sis.tenant.dto.SchoolCreateRequest;
import com.karatu.sis.tenant.dto.SchoolProfileUpdateRequest;
import com.karatu.sis.tenant.dto.SchoolResponse;
import com.karatu.sis.tenant.repository.SchoolRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZoneId;
import java.util.Locale;

@Service
public class SchoolService {
    private final SchoolRepository schoolRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public SchoolService(SchoolRepository schoolRepository, UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.schoolRepository = schoolRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public SchoolResponse provision(SchoolCreateRequest request) {
        if (schoolRepository.existsBySlug(request.slug().toLowerCase(Locale.ROOT))) {
            throw new ResourceConflictException("School URL is already in use");
        }
        String email = request.administratorEmail().trim().toLowerCase(Locale.ROOT);
        String username = request.administratorUsername().trim().toLowerCase(Locale.ROOT);
        if (userRepository.existsByEmailIgnoreCase(email) || userRepository.existsByUsernameIgnoreCase(username)) {
            throw new ResourceConflictException("Administrator email or username is already in use");
        }

        School school = new School();
        school.setSlug(request.slug().toLowerCase(Locale.ROOT));
        school.setName(request.name().trim());
        school.setEmail(normalize(request.email()));
        school.setPhone(normalize(request.phone()));
        school.setAddress(normalize(request.address()));
        school.setLogoUrl(normalize(request.logoUrl()));
        school.setTimezone(validTimezone(request.timezone()));
        school.setCurrency(request.currency() == null ? "GHS" : request.currency());
        school = schoolRepository.saveAndFlush(school);

        User administrator = new User();
        administrator.setSchoolId(school.getId());
        administrator.setEmail(email);
        administrator.setUsername(username);
        administrator.setPasswordHash(passwordEncoder.encode(request.temporaryPassword()));
        administrator.setRole(Role.IT_ADMIN);
        administrator.setEnabled(true);
        userRepository.save(administrator);
        return toResponse(school);
    }

    @Transactional(readOnly = true)
    public SchoolResponse getCurrentSchool() {
        return schoolRepository.findById(TenantContext.requireSchoolId())
                .map(this::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("School not found"));
    }

    @Transactional
    public SchoolResponse updateCurrentSchool(SchoolProfileUpdateRequest request) {
        School school = schoolRepository.findById(TenantContext.requireSchoolId())
                .orElseThrow(() -> new ResourceNotFoundException("School not found"));
        if (request.name() != null) school.setName(request.name().trim());
        if (request.email() != null) school.setEmail(normalize(request.email()));
        if (request.phone() != null) school.setPhone(normalize(request.phone()));
        if (request.address() != null) school.setAddress(normalize(request.address()));
        if (request.logoUrl() != null) school.setLogoUrl(normalize(request.logoUrl()));
        if (request.timezone() != null) school.setTimezone(validTimezone(request.timezone()));
        if (request.currency() != null) school.setCurrency(request.currency());
        return toResponse(schoolRepository.save(school));
    }


    @Transactional(readOnly = true)
    public java.util.List<SchoolResponse> getAllSchools() {
        return schoolRepository.findAll().stream()
                .map(this::toResponse)
                .collect(java.util.stream.Collectors.toList());
    }

    @Transactional(readOnly = true)
    public School requirePublicSchool(String slug) {
        if (slug == null || slug.isBlank()) {
            throw new BusinessValidationException("X-School-Slug header is required");
        }
        return schoolRepository.findBySlug(slug.trim().toLowerCase(Locale.ROOT))
                .filter(School::isActive)
                .orElseThrow(() -> new ResourceNotFoundException("School not found"));
    }

    private String validTimezone(String timezone) {
        if (timezone == null || timezone.isBlank()) return "Africa/Accra";
        try {
            return ZoneId.of(timezone).getId();
        } catch (RuntimeException ex) {
            throw new BusinessValidationException("Timezone must be a valid IANA time zone");
        }
    }

    private String normalize(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private SchoolResponse toResponse(School school) {
        return new SchoolResponse(school.getId(), school.getSlug(), school.getName(), school.getEmail(),
                school.getPhone(), school.getAddress(), school.getLogoUrl(), school.getTimezone(),
                school.getCurrency(), school.isActive(), school.getCreatedAt(), school.getUpdatedAt());
    }
}

