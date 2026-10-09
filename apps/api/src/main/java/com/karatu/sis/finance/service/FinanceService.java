package com.karatu.sis.finance.service;

import com.karatu.sis.finance.domain.Invoice;
import com.karatu.sis.finance.domain.Payment;
import com.karatu.sis.finance.dto.InvoiceDTO;
import com.karatu.sis.finance.dto.PaymentDTO;
import com.karatu.sis.finance.dto.FinancialAdjustmentDTO;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public interface FinanceService {

    /**
     * Creates an invoice and associated charges for a student.
     */
    InvoiceDTO createInvoice(UUID studentId, UUID academicYearId, UUID termId, List<ChargeRequest> charges);

    /**
     * Records a payment and allocates it to outstanding charges.
     */
    PaymentDTO recordPayment(UUID studentId, BigDecimal amount, String paymentMethod, String reference);

    /**
     * Applies a financial adjustment (DISCOUNT, WAIVER, SCHOLARSHIP) to a specific charge.
     */
    FinancialAdjustmentDTO applyAdjustment(UUID studentId, UUID chargeId, BigDecimal amount, String type, String reason);

    /**
     * Retrieves all invoices for a student.
     */
    List<InvoiceDTO> getStudentInvoices(UUID studentId);

    /**
     * Retrieves all payments for a student.
     */
    List<PaymentDTO> getStudentPayments(UUID studentId);

    record ChargeRequest(UUID feeCategoryId, BigDecimal amount, String description) {}
}
