package com.karatu.sis.assessments.service;

import com.karatu.sis.assessments.domain.AssessmentPolicy;
import com.karatu.sis.assessments.domain.RoundingRule;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;

class AssessmentCalculationServiceTest {

    private AssessmentCalculationService calculationService;

    @BeforeEach
    void setUp() {
        calculationService = new AssessmentCalculationService();
    }

    @Test
    void calculatePercentageScore_ReturnsCorrectValue() {
        BigDecimal score = new BigDecimal("15.00");
        BigDecimal maxScore = new BigDecimal("20.00");

        BigDecimal percentage = calculationService.calculatePercentageScore(score, maxScore);

        assertThat(percentage).isEqualByComparingTo("75.00");
    }

    @Test
    void calculatePercentageScore_ReturnsZero_WhenScoreIsZero() {
        BigDecimal score = new BigDecimal("0.00");
        BigDecimal maxScore = new BigDecimal("50.00");

        BigDecimal percentage = calculationService.calculatePercentageScore(score, maxScore);

        assertThat(percentage).isEqualByComparingTo("0.00");
    }

    @Test
    void calculateWeightedScore_ReturnsCorrectValue() {
        BigDecimal score = new BigDecimal("40.00");
        BigDecimal maxScore = new BigDecimal("50.00");
        BigDecimal weight = new BigDecimal("30.00");

        // (40/50) * 30 = 24.00
        BigDecimal weighted = calculationService.calculateWeightedScore(score, maxScore, weight);

        assertThat(weighted).isEqualByComparingTo("24.00");
    }

    @Test
    void applyRoundingRule_NoRounding() {
        AssessmentPolicy policy = new AssessmentPolicy();
        policy.setRoundingRule(RoundingRule.NONE);

        BigDecimal val = new BigDecimal("75.45");
        BigDecimal rounded = calculationService.applyRoundingRule(val, policy);

        assertThat(rounded).isEqualByComparingTo("75.45");
    }

    @Test
    void applyRoundingRule_NearestWhole() {
        AssessmentPolicy policy = new AssessmentPolicy();
        policy.setRoundingRule(RoundingRule.NEAREST_WHOLE);

        assertThat(calculationService.applyRoundingRule(new BigDecimal("75.49"), policy)).isEqualByComparingTo("75.00");
        assertThat(calculationService.applyRoundingRule(new BigDecimal("75.50"), policy)).isEqualByComparingTo("76.00");
        assertThat(calculationService.applyRoundingRule(new BigDecimal("75.51"), policy)).isEqualByComparingTo("76.00");
    }

    @Test
    void applyRoundingRule_OneDecimal() {
        AssessmentPolicy policy = new AssessmentPolicy();
        policy.setRoundingRule(RoundingRule.ONE_DECIMAL);

        assertThat(calculationService.applyRoundingRule(new BigDecimal("75.44"), policy)).isEqualByComparingTo("75.40");
        assertThat(calculationService.applyRoundingRule(new BigDecimal("75.45"), policy)).isEqualByComparingTo("75.50");
    }
}
