package com.karatu.sis.finance.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record InvoiceDTO(
        UUID id,
        String invoiceNumber,
        LocalDate issueDate,
        LocalDate dueDate,
        String status,
        UUID studentId,
        String studentName,
        String yearName,
        String termName,
        BigDecimal totalAmount,
        BigDecimal paidAmount,
        BigDecimal outstandingAmount,
        List<InvoiceLineItemDTO> lineItems
) {}
