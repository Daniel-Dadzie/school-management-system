package com.karatu.sis.assessments.service;

import com.karatu.sis.academic.domain.Assessment;
import com.karatu.sis.academic.domain.AssessmentResult;
import com.karatu.sis.assessments.domain.AssessmentPolicy;
import com.karatu.sis.assessments.domain.RoundingRule;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
public class AssessmentCalculationService {

    /**
     * Calculates the normalized score as a percentage or fraction based on the maximum score.
     * E.g., if score is 40 and max score is 50, returns 80.00
     */
    public BigDecimal calculatePercentageScore(BigDecimal score, BigDecimal maximumScore) {
        if (score == null || maximumScore == null || maximumScore.compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.ZERO;
        }
        return score.multiply(new BigDecimal("100")).divide(maximumScore, 2, RoundingMode.HALF_UP);
    }

    /**
     * Calculates the weighted score of an assessment result.
     * E.g., if a student scores 40/50, and the assessment has a weight of 20%,
     * the weighted score is (40 / 50) * 20 = 16.00
     */
    public BigDecimal calculateWeightedScore(BigDecimal score, BigDecimal maximumScore, BigDecimal weight) {
        if (score == null || maximumScore == null || maximumScore.compareTo(BigDecimal.ZERO) == 0 || weight == null) {
            return BigDecimal.ZERO;
        }
        return score.divide(maximumScore, 4, RoundingMode.HALF_UP).multiply(weight).setScale(2, RoundingMode.HALF_UP);
    }

    /**
     * Applies the rounding rule from the AssessmentPolicy to a given score.
     */
    public BigDecimal applyRoundingRule(BigDecimal score, AssessmentPolicy policy) {
        if (score == null) {
            return null;
        }
        if (policy == null || policy.getRoundingRule() == null) {
            return score;
        }
        
        return switch (policy.getRoundingRule()) {
            case NEAREST_WHOLE -> score.setScale(0, RoundingMode.HALF_UP);
            case ONE_DECIMAL -> score.setScale(1, RoundingMode.HALF_UP);
            case NONE -> score;
        };
    }
}
