package com.karatu.sis.finance.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record InvoiceLineItemDTO(
        UUID id,
        String description,
        BigDecimal amount
) {}
