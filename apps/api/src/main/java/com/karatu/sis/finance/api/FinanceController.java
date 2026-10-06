package com.karatu.sis.finance.api;

import com.karatu.sis.finance.domain.Invoice;
import com.karatu.sis.finance.domain.Payment;
import com.karatu.sis.finance.dto.InvoiceDTO;
import com.karatu.sis.finance.dto.PaymentDTO;
import com.karatu.sis.finance.service.FinanceService;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import java.util.UUID;
import org.springframework.web.bind.annotation.GetMapping;
import java.util.UUID;
import org.springframework.web.bind.annotation.PathVariable;
import java.util.UUID;
import org.springframework.web.bind.annotation.PostMapping;
import java.util.UUID;
import org.springframework.web.bind.annotation.RequestBody;
import java.util.UUID;
import org.springframework.web.bind.annotation.RequestMapping;
import java.util.UUID;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/finance")
public class FinanceController {

    private final FinanceService financeService;

    public FinanceController(FinanceService financeService) {
        this.financeService = financeService;
    }

    @PostMapping("/invoices/student/{studentId}")
    public ResponseEntity<InvoiceDTO> createInvoice(
            @PathVariable UUID studentId,
            @RequestBody CreateInvoiceRequest request) {
        InvoiceDTO invoice = financeService.createInvoice(
                studentId,
                request.academicYearId(),
                request.termId(),
                request.charges()
        );
        return ResponseEntity.ok(invoice);
    }

    @PostMapping("/payments/student/{studentId}")
    public ResponseEntity<PaymentDTO> recordPayment(
            @PathVariable UUID studentId,
            @RequestBody RecordPaymentRequest request) {
        PaymentDTO payment = financeService.recordPayment(
                studentId,
                request.amount(),
                request.paymentMethod(),
                request.reference()
        );
        return ResponseEntity.ok(payment);
    }

    @GetMapping("/invoices/student/{studentId}")
    public ResponseEntity<List<InvoiceDTO>> getStudentInvoices(@PathVariable UUID studentId) {
        return ResponseEntity.ok(financeService.getStudentInvoices(studentId));
    }

    @GetMapping("/payments/student/{studentId}")
    public ResponseEntity<List<PaymentDTO>> getStudentPayments(@PathVariable UUID studentId) {
        return ResponseEntity.ok(financeService.getStudentPayments(studentId));
    }

    public record CreateInvoiceRequest(UUID academicYearId, UUID termId, List<FinanceService.ChargeRequest> charges) {}
    public record RecordPaymentRequest(BigDecimal amount, String paymentMethod, String reference) {}
}
