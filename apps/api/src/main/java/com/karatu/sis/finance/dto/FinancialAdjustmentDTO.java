package com.karatu.sis.finance.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record FinancialAdjustmentDTO(
        UUID id,
        UUID studentId,
        UUID chargeId,
        BigDecimal amount,
        String type,
        String reason
) {}
