package com.karatu.sis.finance.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record PaymentDTO(
        UUID id,
        String receiptNumber,
        String reference,
        BigDecimal amount,
        LocalDate paymentDate,
        String method,
        String status,
        UUID studentId,
        String studentName
) {}
