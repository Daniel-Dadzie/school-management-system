package com.karatu.sis.finance.service;

import com.karatu.sis.academic.domain.AcademicYear;
import com.karatu.sis.academic.domain.Term;
import com.karatu.sis.academic.repository.AcademicYearRepository;
import com.karatu.sis.academic.repository.TermRepository;
import com.karatu.sis.common.exception.ResourceNotFoundException;
import com.karatu.sis.finance.domain.Charge;
import com.karatu.sis.finance.domain.FeeCategory;
import com.karatu.sis.finance.domain.FinancialAdjustment;
import com.karatu.sis.finance.domain.Invoice;
import com.karatu.sis.finance.domain.Payment;
import com.karatu.sis.finance.domain.PaymentAllocation;
import com.karatu.sis.finance.dto.InvoiceDTO;
import com.karatu.sis.finance.dto.PaymentDTO;
import com.karatu.sis.finance.dto.InvoiceLineItemDTO;
import com.karatu.sis.finance.dto.FinancialAdjustmentDTO;
import java.util.Collections;
import com.karatu.sis.finance.repository.ChargeRepository;
import com.karatu.sis.finance.repository.FeeCategoryRepository;
import com.karatu.sis.finance.repository.InvoiceRepository;
import com.karatu.sis.finance.repository.PaymentAllocationRepository;
import com.karatu.sis.finance.repository.PaymentRepository;
import com.karatu.sis.finance.repository.FinancialAdjustmentRepository;
import com.karatu.sis.people.domain.Student;
import com.karatu.sis.people.repository.StudentRepository;
import com.karatu.sis.tenant.TenantContext;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
public class FinanceServiceImpl implements FinanceService {

    private final InvoiceRepository invoiceRepository;
    private final ChargeRepository chargeRepository;
    private final PaymentRepository paymentRepository;
    private final PaymentAllocationRepository paymentAllocationRepository;
    private final FeeCategoryRepository feeCategoryRepository;
    private final StudentRepository studentRepository;
    private final AcademicYearRepository academicYearRepository;
    private final TermRepository termRepository;
    private final FinancialAdjustmentRepository financialAdjustmentRepository;

    public FinanceServiceImpl(
            InvoiceRepository invoiceRepository,
            ChargeRepository chargeRepository,
            PaymentRepository paymentRepository,
            PaymentAllocationRepository paymentAllocationRepository,
            FeeCategoryRepository feeCategoryRepository,
            StudentRepository studentRepository,
            AcademicYearRepository academicYearRepository,
            TermRepository termRepository,
            FinancialAdjustmentRepository financialAdjustmentRepository) {
        this.invoiceRepository = invoiceRepository;
        this.chargeRepository = chargeRepository;
        this.paymentRepository = paymentRepository;
        this.paymentAllocationRepository = paymentAllocationRepository;
        this.feeCategoryRepository = feeCategoryRepository;
        this.studentRepository = studentRepository;
        this.academicYearRepository = academicYearRepository;
        this.termRepository = termRepository;
        this.financialAdjustmentRepository = financialAdjustmentRepository;
    }

    @Override
    @Transactional
    public InvoiceDTO createInvoice(UUID studentId, UUID academicYearId, UUID termId, List<ChargeRequest> charges) {
        UUID schoolId = TenantContext.requireSchoolId();

        Student student = studentRepository.findByIdAndSchoolId(studentId, schoolId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        AcademicYear academicYear = null;
        if (academicYearId != null) {
            academicYear = academicYearRepository.findByIdAndSchoolId(academicYearId, schoolId)
                    .orElseThrow(() -> new ResourceNotFoundException("Academic Year not found"));
        }

        Term term = null;
        if (termId != null) {
            term = termRepository.findByIdAndSchoolId(termId, schoolId)
                    .orElseThrow(() -> new ResourceNotFoundException("Term not found"));
        }

        Invoice invoice = new Invoice(
                student,
                academicYear,
                term,
                generateInvoiceNumber(),
                LocalDate.now(),
                LocalDate.now().plusDays(30)
        );
        invoice.setSchoolId(schoolId);
        invoice = invoiceRepository.save(invoice);

        for (ChargeRequest cr : charges) {
            FeeCategory category = feeCategoryRepository.findByIdAndSchoolId(cr.feeCategoryId(), schoolId)
                    .orElseThrow(() -> new ResourceNotFoundException("Fee Category not found"));

            Charge charge = new Charge(student, category, cr.description(), cr.amount());
            charge.setInvoice(invoice);
            charge.setAcademicYear(academicYear);
            charge.setTerm(term);
            charge.setSchoolId(schoolId);
            chargeRepository.save(charge);
        }

        invoice.setStatus(Invoice.InvoiceStatus.ISSUED);
        Invoice savedInvoice = invoiceRepository.save(invoice);
        List<Charge> savedCharges = chargeRepository.findAllBySchoolIdAndStudentId(schoolId, studentId);
        return mapToInvoiceDTO(savedInvoice, savedCharges, Collections.emptyList(), Collections.emptyList());
    }

    @Override
    @Transactional
    public PaymentDTO recordPayment(UUID studentId, BigDecimal amount, String paymentMethod, String reference) {
        UUID schoolId = TenantContext.requireSchoolId();

        Student student = studentRepository.findByIdAndSchoolId(studentId, schoolId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        Payment payment = new Payment(student, amount, paymentMethod, LocalDate.now());
        payment.setReference(reference);
        payment.setSchoolId(schoolId);
        payment.setStatus(Payment.PaymentStatus.VERIFIED);
        payment = paymentRepository.save(payment);

        // Optimized allocation logic
        List<Charge> unpaidCharges = chargeRepository.findAllBySchoolIdAndStudentId(schoolId, studentId).stream()
                .filter(c -> c.getStatus() == Charge.ChargeStatus.UNPAID || c.getStatus() == Charge.ChargeStatus.PARTIALLY_PAID)
                .toList();

        List<PaymentAllocation> currentAllocations = unpaidCharges.isEmpty() ?
                Collections.emptyList() : paymentAllocationRepository.findAllBySchoolIdAndChargeIn(schoolId, unpaidCharges);

        List<FinancialAdjustment> adjustments = financialAdjustmentRepository.findAllBySchoolIdAndStudentId(schoolId, studentId);

        BigDecimal remainingAmount = amount;

        for (Charge charge : unpaidCharges) {
            if (remainingAmount.compareTo(BigDecimal.ZERO) <= 0) {
                break;
            }

            BigDecimal allocatedAmountToCharge = currentAllocations.stream()
                    .filter(pa -> pa.getCharge().getId().equals(charge.getId()))
                    .map(PaymentAllocation::getAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            BigDecimal adjustmentAmountToCharge = adjustments.stream()
                    .filter(a -> a.getCharge() != null && a.getCharge().getId().equals(charge.getId()) && a.getType() != FinancialAdjustment.AdjustmentType.CREDIT)
                    .map(FinancialAdjustment::getAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            BigDecimal balanceRemainingOnCharge = charge.getAmount().subtract(allocatedAmountToCharge).subtract(adjustmentAmountToCharge);

            if (balanceRemainingOnCharge.compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal allocateNow = remainingAmount.min(balanceRemainingOnCharge);

                PaymentAllocation allocation = new PaymentAllocation(payment, charge, allocateNow);
                allocation.setSchoolId(schoolId);
                paymentAllocationRepository.save(allocation);

                remainingAmount = remainingAmount.subtract(allocateNow);

                if (allocateNow.compareTo(balanceRemainingOnCharge) == 0) {
                    charge.setStatus(Charge.ChargeStatus.PAID);
                } else {
                    charge.setStatus(Charge.ChargeStatus.PARTIALLY_PAID);
                }
                chargeRepository.save(charge);
            }
        }

        if (remainingAmount.compareTo(BigDecimal.ZERO) > 0) {
            FinancialAdjustment creditAdjustment = new FinancialAdjustment(
                    student, remainingAmount, FinancialAdjustment.AdjustmentType.CREDIT,
                    "Overpayment from payment reference: " + (reference != null ? reference : payment.getId())
            );
            creditAdjustment.setSchoolId(schoolId);
            financialAdjustmentRepository.save(creditAdjustment);
        }

        return mapToPaymentDTO(payment);
    }

    @Override
    @Transactional
    public FinancialAdjustmentDTO applyAdjustment(UUID studentId, UUID chargeId, BigDecimal amount, String type, String reason) {
        UUID schoolId = TenantContext.requireSchoolId();

        Student student = studentRepository.findByIdAndSchoolId(studentId, schoolId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        Charge charge = chargeRepository.findByIdAndSchoolId(chargeId, schoolId)
                .orElseThrow(() -> new ResourceNotFoundException("Charge not found"));

        if (!charge.getStudent().getId().equals(studentId)) {
            throw new IllegalArgumentException("Charge does not belong to the specified student");
        }

        FinancialAdjustment.AdjustmentType adjustmentType;
        try {
            adjustmentType = FinancialAdjustment.AdjustmentType.valueOf(type.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid adjustment type");
        }

        if (adjustmentType == FinancialAdjustment.AdjustmentType.CREDIT) {
            throw new IllegalArgumentException("CREDIT adjustments cannot be applied to a specific charge directly via this method");
        }

        // Calculate outstanding balance
        List<PaymentAllocation> allocations = paymentAllocationRepository.findAllBySchoolIdAndChargeIn(schoolId, List.of(charge));
        BigDecimal allocatedAmountToCharge = allocations.stream()
                .map(PaymentAllocation::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<FinancialAdjustment> existingAdjustments = financialAdjustmentRepository.findAllBySchoolIdAndStudentId(schoolId, studentId);
        BigDecimal existingAdjustmentAmount = existingAdjustments.stream()
                .filter(a -> a.getCharge() != null && a.getCharge().getId().equals(charge.getId()) && a.getType() != FinancialAdjustment.AdjustmentType.CREDIT)
                .map(FinancialAdjustment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal balanceRemainingOnCharge = charge.getAmount().subtract(allocatedAmountToCharge).subtract(existingAdjustmentAmount);

        if (amount.compareTo(balanceRemainingOnCharge) > 0) {
            throw new IllegalArgumentException("Adjustment amount cannot exceed outstanding balance");
        }

        FinancialAdjustment adjustment = new FinancialAdjustment(student, amount, adjustmentType, reason);
        adjustment.setCharge(charge);
        adjustment.setSchoolId(schoolId);
        adjustment = financialAdjustmentRepository.save(adjustment);

        if (amount.compareTo(balanceRemainingOnCharge) == 0) {
            charge.setStatus(Charge.ChargeStatus.PAID);
            chargeRepository.save(charge);
        }

        return new FinancialAdjustmentDTO(
                adjustment.getId(),
                adjustment.getStudent().getId(),
                adjustment.getCharge() != null ? adjustment.getCharge().getId() : null,
                adjustment.getAmount(),
                adjustment.getType().name(),
                adjustment.getReason()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public List<InvoiceDTO> getStudentInvoices(UUID studentId) {
        UUID schoolId = TenantContext.requireSchoolId();
        List<Invoice> invoices = invoiceRepository.findAllBySchoolIdAndStudentId(schoolId, studentId);
        List<Charge> charges = chargeRepository.findAllBySchoolIdAndStudentId(schoolId, studentId);
        List<PaymentAllocation> allocations = charges.isEmpty() ?
                Collections.emptyList() : paymentAllocationRepository.findAllBySchoolIdAndChargeIn(schoolId, charges);
        List<FinancialAdjustment> adjustments = financialAdjustmentRepository.findAllBySchoolIdAndStudentId(schoolId, studentId);
        return invoices.stream()
                .map(invoice -> mapToInvoiceDTO(invoice, charges, allocations, adjustments))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<PaymentDTO> getStudentPayments(UUID studentId) {
        UUID schoolId = TenantContext.requireSchoolId();
        return paymentRepository.findAllBySchoolIdAndStudentId(schoolId, studentId)
                .stream()
                .map(this::mapToPaymentDTO)
                .toList();
    }

    private InvoiceDTO mapToInvoiceDTO(Invoice invoice, List<Charge> charges, List<PaymentAllocation> allocations, List<FinancialAdjustment> adjustments) {
        BigDecimal totalAmount = charges.stream()
                .filter(c -> c.getInvoice() != null && c.getInvoice().getId().equals(invoice.getId()))
                .map(Charge::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal paidAmount = charges.stream()
                .filter(c -> c.getInvoice() != null && c.getInvoice().getId().equals(invoice.getId()))
                .flatMap(c -> allocations.stream().filter(a -> a.getCharge().getId().equals(c.getId())))
                .map(PaymentAllocation::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal adjustmentAmount = charges.stream()
                .filter(c -> c.getInvoice() != null && c.getInvoice().getId().equals(invoice.getId()))
                .flatMap(c -> adjustments.stream().filter(a -> a.getCharge() != null && a.getCharge().getId().equals(c.getId()) && a.getType() != FinancialAdjustment.AdjustmentType.CREDIT))
                .map(FinancialAdjustment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal outstandingAmount = totalAmount.subtract(paidAmount).subtract(adjustmentAmount);

        List<InvoiceLineItemDTO> lineItems = charges.stream()
                .filter(c -> c.getInvoice() != null && c.getInvoice().getId().equals(invoice.getId()))
                .map(c -> new InvoiceLineItemDTO(c.getId(), c.getDescription(), c.getAmount()))
                .toList();

        String studentName = invoice.getStudent().getFirstName() + " " + invoice.getStudent().getLastName();
        String yearName = invoice.getAcademicYear() != null ? invoice.getAcademicYear().getName() : "";
        String termName = invoice.getTerm() != null ? invoice.getTerm().getName() : "";

        return new InvoiceDTO(
                invoice.getId(),
                invoice.getInvoiceNumber(),
                invoice.getIssueDate(),
                invoice.getDueDate(),
                invoice.getStatus().name(),
                invoice.getStudent().getId(),
                studentName,
                yearName,
                termName,
                totalAmount,
                paidAmount,
                outstandingAmount,
                lineItems
        );
    }

    private PaymentDTO mapToPaymentDTO(Payment payment) {
        String studentName = payment.getStudent().getFirstName() + " " + payment.getStudent().getLastName();
        return new PaymentDTO(
                payment.getId(),
                payment.getReference(), // Fallback for receipt number if missing
                payment.getReference(),
                payment.getAmount(),
                payment.getPaymentDate(),
                payment.getPaymentMethod(),
                payment.getStatus().name(),
                payment.getStudent().getId(),
                studentName
        );
    }

    private String generateInvoiceNumber() {
        return "INV-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
}
