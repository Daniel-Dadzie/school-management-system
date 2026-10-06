package com.karatu.sis.grading.service;

import com.karatu.sis.grading.domain.GradeBand;
import com.karatu.sis.grading.repository.GradeBandRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class GradingService {
    private final GradeBandRepository gradeBandRepository;

    public GradingService(GradeBandRepository gradeBandRepository) {
        this.gradeBandRepository = gradeBandRepository;
    }

    /**
     * Determines the GradeBand for a given score within a specific GradingScheme.
     * Assumes grade bands do not overlap and the score falls between minimumScore (inclusive) and maximumScore (exclusive/inclusive based on policy, typically inclusive of min and up to max).
     */
    @Transactional(readOnly = true)
    public Optional<GradeBand> determineGradeBand(UUID gradingSchemeId, UUID schoolId, BigDecimal score) {
        if (score == null) {
            return Optional.empty();
        }
        
        List<GradeBand> bands = gradeBandRepository.findByGradingSchemeIdAndSchoolIdOrderBySequenceAsc(gradingSchemeId, schoolId);
        
        for (GradeBand band : bands) {
            if (score.compareTo(band.getMinimumScore()) >= 0 && score.compareTo(band.getMaximumScore()) <= 0) {
                return Optional.of(band);
            }
        }
        
        return Optional.empty();
    }
}
