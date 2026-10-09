package com.karatu.sis.grading.service;

import com.karatu.sis.grading.domain.GradeBand;
import com.karatu.sis.grading.repository.GradeBandRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class GradingServiceTest {

    @Mock
    private GradeBandRepository gradeBandRepository;

    @InjectMocks
    private GradingService gradingService;

    private UUID schemeId;
    private UUID schoolId;

    @BeforeEach
    void setUp() {
        schemeId = UUID.randomUUID();
        schoolId = UUID.randomUUID();
    }

    @Test
    void determineGradeBand_ReturnsEmpty_WhenScoreIsNull() {
        Optional<GradeBand> result = gradingService.determineGradeBand(schemeId, schoolId, null);
        assertThat(result).isEmpty();
    }

    @Test
    void determineGradeBand_ReturnsCorrectBand_WhenScoreFallsInRange() {
        // Arrange
        GradeBand band1 = new GradeBand();
        band1.setGrade("B");
        band1.setMinimumScore(new BigDecimal("70.00"));
        band1.setMaximumScore(new BigDecimal("79.99"));

        GradeBand band2 = new GradeBand();
        band2.setGrade("A");
        band2.setMinimumScore(new BigDecimal("80.00"));
        band2.setMaximumScore(new BigDecimal("100.00"));

        when(gradeBandRepository.findByGradingSchemeIdAndSchoolIdOrderBySequenceAsc(schemeId, schoolId))
                .thenReturn(List.of(band1, band2));

        // Act
        Optional<GradeBand> resultA = gradingService.determineGradeBand(schemeId, schoolId, new BigDecimal("85.50"));
        Optional<GradeBand> resultB = gradingService.determineGradeBand(schemeId, schoolId, new BigDecimal("75.00"));
        Optional<GradeBand> resultC = gradingService.determineGradeBand(schemeId, schoolId, new BigDecimal("60.00"));

        // Assert
        assertThat(resultA).isPresent().contains(band2);
        assertThat(resultB).isPresent().contains(band1);
        assertThat(resultC).isEmpty(); // No band for 60
    }

    @Test
    void determineGradeBand_MatchesInclusiveBoundaries() {
        // Arrange
        GradeBand band1 = new GradeBand();
        band1.setGrade("C");
        band1.setMinimumScore(new BigDecimal("60.00"));
        band1.setMaximumScore(new BigDecimal("69.99"));

        when(gradeBandRepository.findByGradingSchemeIdAndSchoolIdOrderBySequenceAsc(schemeId, schoolId))
                .thenReturn(List.of(band1));

        // Act
        Optional<GradeBand> resultLower = gradingService.determineGradeBand(schemeId, schoolId, new BigDecimal("60.00"));
        Optional<GradeBand> resultUpper = gradingService.determineGradeBand(schemeId, schoolId, new BigDecimal("69.99"));
        Optional<GradeBand> resultJustBelow = gradingService.determineGradeBand(schemeId, schoolId, new BigDecimal("59.99"));
        Optional<GradeBand> resultJustAbove = gradingService.determineGradeBand(schemeId, schoolId, new BigDecimal("70.00"));

        // Assert
        assertThat(resultLower).isPresent().contains(band1);
        assertThat(resultUpper).isPresent().contains(band1);
        assertThat(resultJustBelow).isEmpty();
        assertThat(resultJustAbove).isEmpty();
    }
}
