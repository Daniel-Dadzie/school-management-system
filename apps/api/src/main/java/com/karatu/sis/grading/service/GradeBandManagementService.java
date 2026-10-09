package com.karatu.sis.grading.service;

import com.karatu.sis.common.exception.ResourceNotFoundException;
import com.karatu.sis.grading.domain.GradeBand;
import com.karatu.sis.grading.domain.GradingScheme;
import com.karatu.sis.grading.dto.GradeBandRequest;
import com.karatu.sis.grading.dto.GradeBandResponse;
import com.karatu.sis.grading.repository.GradeBandRepository;
import com.karatu.sis.grading.repository.GradingSchemeRepository;
import com.karatu.sis.tenant.TenantContext;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class GradeBandManagementService {

    private final GradeBandRepository gradeBandRepository;
    private final GradingSchemeRepository gradingSchemeRepository;

    public GradeBandManagementService(GradeBandRepository gradeBandRepository,
                                      GradingSchemeRepository gradingSchemeRepository) {
        this.gradeBandRepository = gradeBandRepository;
        this.gradingSchemeRepository = gradingSchemeRepository;
    }

    @Transactional(readOnly = true)
    public List<GradeBandResponse> getBandsForScheme(UUID schemeId) {
        UUID schoolId = TenantContext.requireSchoolId();
        // Ensure scheme belongs to this school
        if (!gradingSchemeRepository.existsByIdAndSchoolId(schemeId, schoolId)) {
            throw new ResourceNotFoundException("Grading scheme not found");
        }
        return gradeBandRepository.findByGradingSchemeIdAndSchoolIdOrderBySequenceAsc(schemeId, schoolId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public GradeBandResponse createBand(UUID schemeId, GradeBandRequest request) {
        UUID schoolId = TenantContext.requireSchoolId();

        GradingScheme scheme = gradingSchemeRepository.findByIdAndSchoolId(schemeId, schoolId)
                .orElseThrow(() -> new ResourceNotFoundException("Grading scheme not found"));

        validateBandRequest(request);
        validateNoOverlapForNew(schemeId, schoolId, null, request.minimumScore(), request.maximumScore(), request.grade());

        GradeBand band = new GradeBand();
        band.setSchoolId(schoolId);
        band.setGradingScheme(scheme);
        applyRequest(band, request);

        return toResponse(gradeBandRepository.save(band));
    }

    @Transactional
    public GradeBandResponse updateBand(UUID schemeId, UUID bandId, GradeBandRequest request) {
        UUID schoolId = TenantContext.requireSchoolId();

        // Ensure scheme belongs to this school
        if (!gradingSchemeRepository.existsByIdAndSchoolId(schemeId, schoolId)) {
            throw new ResourceNotFoundException("Grading scheme not found");
        }

        GradeBand band = gradeBandRepository.findByIdAndSchoolId(bandId, schoolId)
                .orElseThrow(() -> new ResourceNotFoundException("Grade band not found"));

        // Ensure band belongs to the specified scheme
        if (!band.getGradingScheme().getId().equals(schemeId)) {
            throw new ResourceNotFoundException("Grade band does not belong to the specified scheme");
        }

        validateBandRequest(request);
        validateNoOverlapForNew(schemeId, schoolId, bandId, request.minimumScore(), request.maximumScore(), request.grade());

        applyRequest(band, request);
        return toResponse(gradeBandRepository.save(band));
    }

    @Transactional
    public void deleteBand(UUID schemeId, UUID bandId) {
        UUID schoolId = TenantContext.requireSchoolId();

        if (!gradingSchemeRepository.existsByIdAndSchoolId(schemeId, schoolId)) {
            throw new ResourceNotFoundException("Grading scheme not found");
        }

        GradeBand band = gradeBandRepository.findByIdAndSchoolId(bandId, schoolId)
                .orElseThrow(() -> new ResourceNotFoundException("Grade band not found"));

        if (!band.getGradingScheme().getId().equals(schemeId)) {
            throw new ResourceNotFoundException("Grade band does not belong to the specified scheme");
        }

        gradeBandRepository.delete(band);
    }

    // ---- Validation ----

    /**
     * Validates the request fields are self-consistent.
     */
    private void validateBandRequest(GradeBandRequest request) {
        if (request.minimumScore().compareTo(request.maximumScore()) > 0) {
            throw new IllegalArgumentException(
                    "minimumScore (" + request.minimumScore() + ") must be <= maximumScore (" + request.maximumScore() + ")");
        }
    }

    /**
     * Validates that the new/updated band does not overlap with any existing band in the scheme,
     * and that the grade label is not duplicated (for a different band).
     *
     * @param excludeBandId null for a new band, or the ID of the band being updated
     */
    private void validateNoOverlapForNew(UUID schemeId, UUID schoolId,
                                         UUID excludeBandId,
                                         BigDecimal newMin, BigDecimal newMax, String newGrade) {
        List<GradeBand> existing = gradeBandRepository
                .findByGradingSchemeIdAndSchoolIdOrderBySequenceAsc(schemeId, schoolId);

        for (GradeBand band : existing) {
            // Skip self when updating
            if (excludeBandId != null && band.getId().equals(excludeBandId)) {
                continue;
            }

            // Check duplicate grade label
            if (band.getGrade().equalsIgnoreCase(newGrade)) {
                throw new IllegalArgumentException(
                        "A grade band with grade label '" + newGrade + "' already exists in this scheme");
            }

            // Check numeric overlap: two ranges overlap when one's min <= other's max AND other's min <= one's max
            boolean overlaps = newMin.compareTo(band.getMaximumScore()) <= 0
                    && band.getMinimumScore().compareTo(newMax) <= 0;
            if (overlaps) {
                throw new IllegalArgumentException(
                        "Score range [" + newMin + ", " + newMax + "] overlaps with existing band '"
                        + band.getGrade() + "' [" + band.getMinimumScore() + ", " + band.getMaximumScore() + "]");
            }
        }
    }

    private void applyRequest(GradeBand band, GradeBandRequest request) {
        band.setGrade(request.grade());
        band.setMinimumScore(request.minimumScore());
        band.setMaximumScore(request.maximumScore());
        band.setRemark(request.remark());
        band.setSequence(request.sequence());
        band.setPass(request.isPass());
    }

    private GradeBandResponse toResponse(GradeBand band) {
        return new GradeBandResponse(
                band.getId(),
                band.getSchoolId(),
                band.getGradingScheme().getId(),
                band.getGrade(),
                band.getMinimumScore(),
                band.getMaximumScore(),
                band.getRemark(),
                band.getSequence(),
                band.isPass(),
                band.getCreatedAt(),
                band.getUpdatedAt()
        );
    }
}
