package com.karatu.sis.finance.service;

import com.karatu.sis.academic.domain.AcademicYear;
import com.karatu.sis.academic.domain.Term;
import com.karatu.sis.academic.repository.AcademicYearRepository;
import com.karatu.sis.academic.repository.TermRepository;
import com.karatu.sis.finance.domain.Charge;
import com.karatu.sis.finance.domain.FeeCategory;
import com.karatu.sis.finance.domain.FinancialAdjustment;
import com.karatu.sis.finance.domain.Invoice;
import com.karatu.sis.finance.domain.Payment;
import com.karatu.sis.finance.dto.InvoiceDTO;
import com.karatu.sis.finance.dto.PaymentDTO;
import com.karatu.sis.finance.repository.ChargeRepository;
import com.karatu.sis.finance.repository.FeeCategoryRepository;
import com.karatu.sis.finance.repository.FinancialAdjustmentRepository;
import com.karatu.sis.finance.repository.InvoiceRepository;
import com.karatu.sis.finance.repository.PaymentAllocationRepository;
import com.karatu.sis.finance.repository.PaymentRepository;
import com.karatu.sis.people.domain.Student;
import com.karatu.sis.people.repository.StudentRepository;
import com.karatu.sis.tenant.TenantContext;
import com.karatu.sis.tenant.domain.School;
import com.karatu.sis.tenant.repository.SchoolRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.junit.jupiter.Container;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.testcontainers.containers.PostgreSQLContainer;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.transaction.support.TransactionTemplate;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicInteger;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Testcontainers
@ActiveProfiles("test")
class FinanceServiceIntegrationTest {

    @Container
    @ServiceConnection
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine");

    @Autowired
    private FinanceService financeService;

    @Autowired
    private ChargeRepository chargeRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private PaymentAllocationRepository paymentAllocationRepository;
    
    @Autowired
    private FinancialAdjustmentRepository financialAdjustmentRepository;

    @Autowired
    private InvoiceRepository invoiceRepository;

    @Autowired
    private FeeCategoryRepository feeCategoryRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private SchoolRepository schoolRepository;

    @Autowired
    private AcademicYearRepository academicYearRepository;

    @Autowired
    private TermRepository termRepository;
    
    @Autowired
    private TransactionTemplate transactionTemplate;

    private School school;
    private School otherSchool;
    private Student student;
    private AcademicYear academicYear;
    private Term term;
    private FeeCategory tuitionFee;

    @BeforeEach
    void setUp() {
        school = new School();
        school.setName("Test School");
        school.setSlug("test-school-" + java.util.UUID.randomUUID().toString());
        school.setAddress("123 Test St");
        school.setEmail("test@school.com");
        school = schoolRepository.save(school);
        
        otherSchool = new School();
        otherSchool.setName("Other School");
        otherSchool.setSlug("other-school-" + java.util.UUID.randomUUID().toString());
        otherSchool.setAddress("456 Other St");
        otherSchool.setEmail("other@school.com");
        otherSchool = schoolRepository.save(otherSchool);

        TenantContext.setSchoolId(school.getId());

        academicYear = new AcademicYear();
        academicYear.setName("2026/2027");
        academicYear.setStartDate(LocalDate.of(2026, 9, 1));
        academicYear.setEndDate(LocalDate.of(2027, 7, 31));
        academicYear.setSchoolId(school.getId());
        academicYear = academicYearRepository.save(academicYear);

        term = new Term();
        term.setName("Term 1");
        term.setAcademicYear(academicYear);
        term.setStartDate(LocalDate.of(2026, 9, 1));
        term.setEndDate(LocalDate.of(2026, 12, 15));
        term.setSchoolId(school.getId());
        term = termRepository.save(term);

        student = new Student();
        student.setFirstName("John");
        student.setLastName("Doe");
        student.setAdmissionNumber("STU-001");
        student.setDateOfBirth(LocalDate.of(2010, 1, 1));
        student.setSchoolId(school.getId());
        student = studentRepository.save(student);

        tuitionFee = new FeeCategory("Tuition Fee", "Description");
        tuitionFee.setSchoolId(school.getId());
        tuitionFee = feeCategoryRepository.save(tuitionFee);
    }

    @AfterEach
    void tearDown() {
        financialAdjustmentRepository.deleteAll();
        paymentAllocationRepository.deleteAll();
        paymentRepository.deleteAll();
        chargeRepository.deleteAll();
        invoiceRepository.deleteAll();
        feeCategoryRepository.deleteAll();
        studentRepository.deleteAll();
        termRepository.deleteAll();
        academicYearRepository.deleteAll();
        
        TenantContext.clear();
        schoolRepository.deleteAll();
    }

    @Test
    void shouldAllocateExactPayment() {
        // Given
        Charge charge = new Charge(student, tuitionFee, "Tuition Term 1", new BigDecimal("500.00"));
        charge.setSchoolId(school.getId());
        charge = chargeRepository.save(charge);

        // When
        financeService.recordPayment(student.getId(), new BigDecimal("500.00"), "CASH", "REF-01");

        // Then
        Charge updatedCharge = chargeRepository.findById(charge.getId()).orElseThrow();
        assertThat(updatedCharge.getStatus()).isEqualTo(Charge.ChargeStatus.PAID);
        
        List<FinancialAdjustment> adjustments = financialAdjustmentRepository.findAll();
        assertThat(adjustments).isEmpty();
    }

    @Test
    void shouldAllocatePartialPayment() {
        // Given
        Charge charge = new Charge(student, tuitionFee, "Tuition Term 1", new BigDecimal("500.00"));
        charge.setSchoolId(school.getId());
        charge = chargeRepository.save(charge);

        // When
        financeService.recordPayment(student.getId(), new BigDecimal("200.00"), "CASH", "REF-02");

        // Then
        Charge updatedCharge = chargeRepository.findById(charge.getId()).orElseThrow();
        assertThat(updatedCharge.getStatus()).isEqualTo(Charge.ChargeStatus.PARTIALLY_PAID);
        
        List<FinancialAdjustment> adjustments = financialAdjustmentRepository.findAll();
        assertThat(adjustments).isEmpty();
    }

    @Test
    void shouldAllocatePaymentAcrossMultipleCharges() {
        // Given
        Charge charge1 = new Charge(student, tuitionFee, "Term 1", new BigDecimal("300.00"));
        charge1.setSchoolId(school.getId());
        charge1 = chargeRepository.save(charge1);
        
        Charge charge2 = new Charge(student, tuitionFee, "Term 2", new BigDecimal("400.00"));
        charge2.setSchoolId(school.getId());
        charge2 = chargeRepository.save(charge2);

        // When
        financeService.recordPayment(student.getId(), new BigDecimal("500.00"), "CASH", "REF-03");

        // Then
        Charge updatedCharge1 = chargeRepository.findById(charge1.getId()).orElseThrow();
        Charge updatedCharge2 = chargeRepository.findById(charge2.getId()).orElseThrow();
        
        assertThat(updatedCharge1.getStatus()).isEqualTo(Charge.ChargeStatus.PAID);
        assertThat(updatedCharge2.getStatus()).isEqualTo(Charge.ChargeStatus.PARTIALLY_PAID);
    }

    @Test
    void shouldHandleOverpaymentByCreatingCreditAdjustment() {
        // Given
        Charge charge = new Charge(student, tuitionFee, "Term 1", new BigDecimal("300.00"));
        charge.setSchoolId(school.getId());
        charge = chargeRepository.save(charge);

        // When
        financeService.recordPayment(student.getId(), new BigDecimal("500.00"), "CASH", "REF-04");

        // Then
        Charge updatedCharge = chargeRepository.findById(charge.getId()).orElseThrow();
        assertThat(updatedCharge.getStatus()).isEqualTo(Charge.ChargeStatus.PAID);
        
        List<FinancialAdjustment> adjustments = financialAdjustmentRepository.findAll();
        assertThat(adjustments).hasSize(1);
        assertThat(adjustments.get(0).getType()).isEqualTo(FinancialAdjustment.AdjustmentType.CREDIT);
        assertThat(adjustments.get(0).getAmount()).isEqualByComparingTo(new BigDecimal("200.00"));
    }

    @Test
    void shouldHandlePaymentWithNoOutstandingCharges() {
        // When
        financeService.recordPayment(student.getId(), new BigDecimal("500.00"), "CASH", "REF-05");

        // Then
        List<FinancialAdjustment> adjustments = financialAdjustmentRepository.findAll();
        assertThat(adjustments).hasSize(1);
        assertThat(adjustments.get(0).getType()).isEqualTo(FinancialAdjustment.AdjustmentType.CREDIT);
        assertThat(adjustments.get(0).getAmount()).isEqualByComparingTo(new BigDecimal("500.00"));
    }

    @Test
    void shouldPreventConcurrentOverAllocation() throws InterruptedException {
        // Given
        Charge charge = new Charge(student, tuitionFee, "Term 1", new BigDecimal("500.00"));
        charge.setSchoolId(school.getId());
        final Charge savedCharge = chargeRepository.save(charge);
        
        int threadCount = 2;
        ExecutorService executor = Executors.newFixedThreadPool(threadCount);
        CountDownLatch latch = new CountDownLatch(1);
        CountDownLatch done = new CountDownLatch(threadCount);
        
        AtomicInteger successCount = new AtomicInteger(0);
        AtomicInteger failureCount = new AtomicInteger(0);

        // When - Two concurrent threads trying to pay 500 each for a 500 charge
        for (int i = 0; i < threadCount; i++) {
            executor.submit(() -> {
                try {
                    latch.await();
                    TenantContext.setSchoolId(school.getId());
                    financeService.recordPayment(student.getId(), new BigDecimal("500.00"), "CASH", "CONC-01");
                    successCount.incrementAndGet();
                } catch (ObjectOptimisticLockingFailureException e) {
                    failureCount.incrementAndGet();
                } catch (Exception e) {
                    // unexpected
                } finally {
                    TenantContext.clear();
                    done.countDown();
                }
            });
        }
        
        latch.countDown();
        done.await();
        executor.shutdown();

        // Then
        // One thread succeeds, the other gets OptimisticLockingFailure
        assertThat(successCount.get()).isEqualTo(1);
        assertThat(failureCount.get()).isEqualTo(1);
        
        Charge updatedCharge = chargeRepository.findById(savedCharge.getId()).orElseThrow();
        assertThat(updatedCharge.getStatus()).isEqualTo(Charge.ChargeStatus.PAID);
        assertThat(updatedCharge.getVersion()).isGreaterThan(0L);
    }

    @Test
    void shouldApplyDiscountAndReduceOutstandingBalance() {
        // Given
        Charge charge = new Charge(student, tuitionFee, "Term 1", new BigDecimal("500.00"));
        charge.setSchoolId(school.getId());
        charge = chargeRepository.save(charge);
        
        Invoice invoice = new Invoice(student, academicYear, term, "INV-123", LocalDate.now(), LocalDate.now().plusDays(30));
        invoice.setSchoolId(school.getId());
        invoice.setStatus(Invoice.InvoiceStatus.ISSUED);
        invoice = invoiceRepository.save(invoice);
        
        charge.setInvoice(invoice);
        chargeRepository.save(charge);

        // When
        financeService.applyAdjustment(student.getId(), charge.getId(), new BigDecimal("100.00"), "DISCOUNT", "Early bird");

        // Then
        List<FinancialAdjustment> adjustments = financialAdjustmentRepository.findAll();
        assertThat(adjustments).hasSize(1);
        assertThat(adjustments.get(0).getType()).isEqualTo(FinancialAdjustment.AdjustmentType.DISCOUNT);
        
        List<InvoiceDTO> invoices = financeService.getStudentInvoices(student.getId());
        assertThat(invoices).hasSize(1);
        assertThat(invoices.get(0).totalAmount()).isEqualByComparingTo(new BigDecimal("500.00"));
        assertThat(invoices.get(0).paidAmount()).isEqualByComparingTo(BigDecimal.ZERO);
        assertThat(invoices.get(0).outstandingAmount()).isEqualByComparingTo(new BigDecimal("400.00"));
    }

    @Test
    void shouldApplyScholarshipAndRecordAsPaidIfFullyCovered() {
        // Given
        Charge charge = new Charge(student, tuitionFee, "Term 1", new BigDecimal("500.00"));
        charge.setSchoolId(school.getId());
        charge = chargeRepository.save(charge);

        // When
        financeService.applyAdjustment(student.getId(), charge.getId(), new BigDecimal("500.00"), "SCHOLARSHIP", "Full scholarship");

        // Then
        Charge updatedCharge = chargeRepository.findById(charge.getId()).orElseThrow();
        assertThat(updatedCharge.getStatus()).isEqualTo(Charge.ChargeStatus.PAID);
    }

    @Test
    void shouldThrowExceptionIfAdjustmentExceedsOutstandingBalance() {
        // Given
        Charge charge = new Charge(student, tuitionFee, "Term 1", new BigDecimal("500.00"));
        charge.setSchoolId(school.getId());
        Charge savedCharge = chargeRepository.save(charge);
        
        financeService.recordPayment(student.getId(), new BigDecimal("300.00"), "CASH", "REF-01");

        // When/Then
        assertThatThrownBy(() -> financeService.applyAdjustment(student.getId(), savedCharge.getId(), new BigDecimal("250.00"), "WAIVER", "Too much"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Adjustment amount cannot exceed outstanding balance");
    }

    @Test
    void shouldNotAllowCreditTypeInApplyAdjustment() {
        // Given
        Charge charge = new Charge(student, tuitionFee, "Term 1", new BigDecimal("500.00"));
        charge.setSchoolId(school.getId());
        Charge savedCharge = chargeRepository.save(charge);

        // When/Then
        assertThatThrownBy(() -> financeService.applyAdjustment(student.getId(), savedCharge.getId(), new BigDecimal("100.00"), "CREDIT", "Invalid"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("CREDIT adjustments cannot be applied to a specific charge directly via this method");
    }
}
