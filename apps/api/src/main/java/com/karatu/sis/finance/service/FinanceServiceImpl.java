package com.karatu.sis.finance.service;

import com.karatu.sis.academic.domain.AcademicYear;
import com.karatu.sis.academic.domain.Term;
import com.karatu.sis.academic.repository.AcademicYearRepository;
import com.karatu.sis.academic.repository.TermRepository;
import com.karatu.sis.auth.domain.User;
import com.karatu.sis.common.exception.ResourceNotFoundException;
import com.karatu.sis.common.exception.ResourceConflictException;
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
import jakarta.persistence.EntityManager;
import jakarta.persistence.LockModeType;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.dao.DataIntegrityViolationException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
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
    private final EntityManager entityManager;

    public FinanceServiceImpl(
            InvoiceRepository invoiceRepository,
            ChargeRepository chargeRepository,
            PaymentRepository paymentRepository,
            PaymentAllocationRepository paymentAllocationRepository,
            FeeCategoryRepository feeCategoryRepository,
            StudentRepository studentRepository,
            AcademicYearRepository academicYearRepository,
            TermRepository termRepository,
            FinancialAdjustmentRepository financialAdjustmentRepository,
            EntityManager entityManager) {
        this.invoiceRepository = invoiceRepository;
        this.chargeRepository = chargeRepository;
        this.paymentRepository = paymentRepository;
        this.paymentAllocationRepository = paymentAllocationRepository;
        this.feeCategoryRepository = feeCategoryRepository;
        this.studentRepository = studentRepository;
        this.academicYearRepository = academicYearRepository;
        this.termRepository = termRepository;
        this.financialAdjustmentRepository = financialAdjustmentRepository;
        this.entityManager = entityManager;
    }

    private User requireCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof User user) {
            return user;
        }
        throw new IllegalStateException("Authenticated user required to perform this action");
    }

    private BigDecimal calculateAdjustmentAmount(List<FinancialAdjustment> adjustments, UUID chargeId) {
        return adjustments.stream()
                .filter(a -> a.getCharge() != null && a.getCharge().getId().equals(chargeId) && a.getType() != FinancialAdjustment.AdjustmentType.CREDIT)
                .filter(a -> !a.isLegacyDuplicate())
                .map(a -> a.getType() == FinancialAdjustment.AdjustmentType.REVERSAL ? a.getAmount().negate() : a.getAmount())
                .reduce(BigDecimal.ZERO, BigDecimal::add);
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

            // Force increment version to prevent concurrent over-allocation even if status doesn't change
            entityManager.lock(charge, LockModeType.OPTIMISTIC_FORCE_INCREMENT);

            BigDecimal allocatedAmountToCharge = currentAllocations.stream()
                    .filter(pa -> pa.getCharge().getId().equals(charge.getId()))
                    .map(PaymentAllocation::getAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            BigDecimal adjustmentAmountToCharge = calculateAdjustmentAmount(adjustments, charge.getId());

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
            creditAdjustment.setRecordedBy(requireCurrentUser());
            financialAdjustmentRepository.save(creditAdjustment);
        }

        return mapToPaymentDTO(payment);
    }

    @Override
    @Transactional
    public FinancialAdjustmentDTO applyAdjustment(UUID studentId, UUID chargeId, BigDecimal amount, String type, String reason, String idempotencyKey) {
        UUID schoolId = TenantContext.requireSchoolId();

        if (idempotencyKey != null && !idempotencyKey.isBlank()) {
            Optional<FinancialAdjustment> existing = financialAdjustmentRepository.findBySchoolIdAndIdempotencyKey(schoolId, idempotencyKey);
            if (existing.isPresent()) {
                FinancialAdjustment adj = existing.get();
                if (adj.getAmount().compareTo(amount) != 0 || !adj.getType().name().equals(type.toUpperCase())) {
                    throw new IllegalArgumentException("Idempotency key reused with different payload");
                }
                return mapToFinancialAdjustmentDTO(adj);
            }
        }

        Student student = studentRepository.findByIdAndSchoolId(studentId, schoolId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        Charge charge = chargeRepository.findByIdAndSchoolId(chargeId, schoolId)
                .orElseThrow(() -> new ResourceNotFoundException("Charge not found"));

        if (!charge.getStudent().getId().equals(studentId)) {
            throw new IllegalArgumentException("Charge does not belong to the specified student");
        }

        entityManager.lock(charge, LockModeType.OPTIMISTIC_FORCE_INCREMENT);

        FinancialAdjustment.AdjustmentType adjustmentType;
        try {
            adjustmentType = FinancialAdjustment.AdjustmentType.valueOf(type.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid adjustment type");
        }

        if (adjustmentType == FinancialAdjustment.AdjustmentType.CREDIT || adjustmentType == FinancialAdjustment.AdjustmentType.REVERSAL) {
            throw new IllegalArgumentException(adjustmentType.name() + " adjustments cannot be applied directly via this method");
        }

        List<PaymentAllocation> allocations = paymentAllocationRepository.findAllBySchoolIdAndChargeIn(schoolId, List.of(charge));
        BigDecimal allocatedAmountToCharge = allocations.stream()
                .map(PaymentAllocation::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<FinancialAdjustment> existingAdjustments = financialAdjustmentRepository.findAllBySchoolIdAndStudentId(schoolId, studentId);
        BigDecimal existingAdjustmentAmount = calculateAdjustmentAmount(existingAdjustments, charge.getId());

        BigDecimal balanceRemainingOnCharge = charge.getAmount().subtract(allocatedAmountToCharge).subtract(existingAdjustmentAmount);

        if (amount.compareTo(balanceRemainingOnCharge) > 0) {
            throw new IllegalArgumentException("Adjustment amount cannot exceed outstanding balance");
        }

        FinancialAdjustment adjustment = new FinancialAdjustment(student, amount, adjustmentType, reason);
        adjustment.setCharge(charge);
        adjustment.setSchoolId(schoolId);
        adjustment.setIdempotencyKey(idempotencyKey);
        adjustment.setRecordedBy(requireCurrentUser());
        adjustment = financialAdjustmentRepository.save(adjustment);

        if (amount.compareTo(balanceRemainingOnCharge) == 0) {
            if (allocatedAmountToCharge.compareTo(BigDecimal.ZERO) > 0) {
                charge.setStatus(Charge.ChargeStatus.PAID);
            } else {
                charge.setStatus(Charge.ChargeStatus.SETTLED_BY_ADJUSTMENT);
            }
            chargeRepository.save(charge);
        }

        return mapToFinancialAdjustmentDTO(adjustment);
    }

    @Override
    @Transactional
    public FinancialAdjustmentDTO reverseAdjustment(UUID studentId, UUID adjustmentId, String reason) {
        UUID schoolId = TenantContext.requireSchoolId();

        FinancialAdjustment original = financialAdjustmentRepository.findByIdAndSchoolId(adjustmentId, schoolId)
                .orElseThrow(() -> new ResourceNotFoundException("Adjustment not found"));

        if (!original.getStudent().getId().equals(studentId)) {
            throw new IllegalArgumentException("Adjustment does not belong to the specified student");
        }
        if (original.getType() == FinancialAdjustment.AdjustmentType.REVERSAL) {
            throw new IllegalArgumentException("Cannot reverse a reversal");
        }
        if (original.getType() == FinancialAdjustment.AdjustmentType.CREDIT) {
            throw new IllegalArgumentException("Cannot reverse a CREDIT directly via this method");
        }

        if (financialAdjustmentRepository.existsBySchoolIdAndOriginalAdjustmentId(schoolId, adjustmentId)) {
            throw new ResourceConflictException("Adjustment has already been reversed");
        }

        FinancialAdjustment reversal = new FinancialAdjustment(original.getStudent(), original.getAmount(), FinancialAdjustment.AdjustmentType.REVERSAL, reason);
        reversal.setCharge(original.getCharge());
        reversal.setSchoolId(schoolId);
        reversal.setOriginalAdjustment(original);
        reversal.setRecordedBy(requireCurrentUser());
        final FinancialAdjustment savedReversal;
        try {
            savedReversal = financialAdjustmentRepository.saveAndFlush(reversal);
        } catch (DataIntegrityViolationException e) {
            throw new ResourceConflictException("Adjustment has already been reversed", e);
        }

        if (original.getCharge() != null) {
            Charge charge = original.getCharge();
            entityManager.lock(charge, LockModeType.OPTIMISTIC_FORCE_INCREMENT);

            if (charge.getStatus() == Charge.ChargeStatus.PAID || charge.getStatus() == Charge.ChargeStatus.SETTLED_BY_ADJUSTMENT) {
                List<PaymentAllocation> allocations = paymentAllocationRepository.findAllBySchoolIdAndChargeIn(schoolId, List.of(charge));
                BigDecimal allocatedAmount = allocations.stream().map(PaymentAllocation::getAmount).reduce(BigDecimal.ZERO, BigDecimal::add);

                List<FinancialAdjustment> existingAdjustments = financialAdjustmentRepository.findAllBySchoolIdAndStudentId(schoolId, studentId);
                // The new reversal is already saved, so it's in existingAdjustments or we add it to the sum
                BigDecimal existingAdjustmentAmount = calculateAdjustmentAmount(existingAdjustments, charge.getId());

                // Add the new reversal if it's not yet flushed/visible in the query
                if (existingAdjustments.stream().noneMatch(a -> a.getId() != null && a.getId().equals(savedReversal.getId()))) {
                    existingAdjustmentAmount = existingAdjustmentAmount.subtract(savedReversal.getAmount());
                }

                BigDecimal balance = charge.getAmount().subtract(allocatedAmount).subtract(existingAdjustmentAmount);
                if (balance.compareTo(BigDecimal.ZERO) > 0) {
                    if (allocatedAmount.compareTo(BigDecimal.ZERO) > 0 || existingAdjustmentAmount.compareTo(BigDecimal.ZERO) > 0) {
                        charge.setStatus(Charge.ChargeStatus.PARTIALLY_PAID);
                    } else {
                        charge.setStatus(Charge.ChargeStatus.UNPAID);
                    }
                    chargeRepository.save(charge);
                }
            }
        }

        return mapToFinancialAdjustmentDTO(savedReversal);
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
                .map(c -> calculateAdjustmentAmount(adjustments, c.getId()))
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

    private FinancialAdjustmentDTO mapToFinancialAdjustmentDTO(FinancialAdjustment adjustment) {
        return new FinancialAdjustmentDTO(
                adjustment.getId(),
                adjustment.getStudent().getId(),
                adjustment.getCharge() != null ? adjustment.getCharge().getId() : null,
                adjustment.getAmount(),
                adjustment.getType().name(),
                adjustment.getReason(),
                adjustment.getIdempotencyKey(),
                adjustment.getOriginalAdjustment() != null ? adjustment.getOriginalAdjustment().getId() : null,
                adjustment.getRecordedBy() != null ? adjustment.getRecordedBy().getId() : null
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
