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
import com.karatu.sis.finance.dto.FinancialAdjustmentDTO;
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
import com.karatu.sis.auth.domain.User;
import com.karatu.sis.auth.repository.UserRepository;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
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

    @Autowired
    private UserRepository userRepository;

    private School school;
    private School otherSchool;
    private User testUser;
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

        testUser = new User();
        testUser.setUsername("testadmin");
        testUser.setEmail("admin@test.com");
        testUser.setPasswordHash("hashed_pass");
        testUser.setSchoolId(school.getId());
        testUser.setRole(com.karatu.sis.auth.domain.Role.ADMIN);
        testUser = userRepository.save(testUser);

        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(testUser, null, testUser.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(auth);

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
        financialAdjustmentRepository.deleteAllInBatch();
        paymentAllocationRepository.deleteAllInBatch();
        paymentRepository.deleteAllInBatch();
        chargeRepository.deleteAllInBatch();
        invoiceRepository.deleteAllInBatch();
        feeCategoryRepository.deleteAllInBatch();
        studentRepository.deleteAllInBatch();
        termRepository.deleteAllInBatch();
        academicYearRepository.deleteAllInBatch();
        userRepository.deleteAllInBatch();

        SecurityContextHolder.clearContext();
        TenantContext.clear();
        schoolRepository.deleteAllInBatch();
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
        final var auth = SecurityContextHolder.getContext().getAuthentication();

        // When - Two concurrent threads trying to pay 500 each for a 500 charge
        for (int i = 0; i < threadCount; i++) {
            executor.submit(() -> {
                try {
                    latch.await();
                    TenantContext.setSchoolId(school.getId());
                    SecurityContextHolder.getContext().setAuthentication(auth);
                    financeService.recordPayment(student.getId(), new BigDecimal("500.00"), "CASH", "CONC-01");
                    successCount.incrementAndGet();
                } catch (ObjectOptimisticLockingFailureException | IllegalArgumentException e) {
                    failureCount.incrementAndGet();
                } catch (Exception e) {
                    e.printStackTrace();
                } finally {
                    TenantContext.clear();
                    SecurityContextHolder.clearContext();
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
        financeService.applyAdjustment(student.getId(), charge.getId(), new BigDecimal("100.00"), "DISCOUNT", "Early bird", null);

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
    void shouldApplyScholarshipAndRecordAsSettledByAdjustmentIfFullyCovered() {
        // Given
        Charge charge = new Charge(student, tuitionFee, "Term 1", new BigDecimal("500.00"));
        charge.setSchoolId(school.getId());
        charge = chargeRepository.save(charge);

        // When
        financeService.applyAdjustment(student.getId(), charge.getId(), new BigDecimal("500.00"), "SCHOLARSHIP", "Full scholarship", null);

        // Then
        Charge updatedCharge = chargeRepository.findById(charge.getId()).orElseThrow();
        assertThat(updatedCharge.getStatus()).isEqualTo(Charge.ChargeStatus.SETTLED_BY_ADJUSTMENT);
    }

    @Test
    void shouldThrowExceptionIfAdjustmentExceedsOutstandingBalance() {
        // Given
        Charge charge = new Charge(student, tuitionFee, "Term 1", new BigDecimal("500.00"));
        charge.setSchoolId(school.getId());
        Charge savedCharge = chargeRepository.save(charge);

        financeService.recordPayment(student.getId(), new BigDecimal("300.00"), "CASH", "REF-01");

        // When/Then
        assertThatThrownBy(() -> financeService.applyAdjustment(student.getId(), savedCharge.getId(), new BigDecimal("250.00"), "WAIVER", "Too much", null))
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
        assertThatThrownBy(() -> financeService.applyAdjustment(student.getId(), savedCharge.getId(), new BigDecimal("100.00"), "CREDIT", "Invalid", null))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("CREDIT adjustments cannot be applied directly via this method");
    }

    @Test
    void shouldHandleIdempotencyForApplyAdjustment() {
        // Given
        Charge charge = new Charge(student, tuitionFee, "Term 1", new BigDecimal("500.00"));
        charge.setSchoolId(school.getId());
        charge = chargeRepository.save(charge);

        String idempotencyKey = "idemp-key-123";

        // When
        financeService.applyAdjustment(student.getId(), charge.getId(), new BigDecimal("100.00"), "DISCOUNT", "Reason 1", idempotencyKey);
        financeService.applyAdjustment(student.getId(), charge.getId(), new BigDecimal("100.00"), "DISCOUNT", "Reason 1", idempotencyKey);

        // Then
        List<FinancialAdjustment> adjustments = financialAdjustmentRepository.findAll();
        assertThat(adjustments).hasSize(1);
    }

    @Test
    void shouldReverseAdjustmentAndRestoreChargeStatus() {
        // Given
        Charge charge = new Charge(student, tuitionFee, "Term 1", new BigDecimal("500.00"));
        charge.setSchoolId(school.getId());
        charge = chargeRepository.save(charge);

        FinancialAdjustmentDTO adj = financeService.applyAdjustment(student.getId(), charge.getId(), new BigDecimal("500.00"), "WAIVER", "Full waiver", null);

        Charge updatedCharge = chargeRepository.findById(charge.getId()).orElseThrow();
        assertThat(updatedCharge.getStatus()).isEqualTo(Charge.ChargeStatus.SETTLED_BY_ADJUSTMENT);

        // When
        financeService.reverseAdjustment(student.getId(), adj.id(), "Mistake");

        // Then
        List<FinancialAdjustment> adjustments = financialAdjustmentRepository.findAll();
        assertThat(adjustments).hasSize(2);

        Charge revertedCharge = chargeRepository.findById(charge.getId()).orElseThrow();
        assertThat(revertedCharge.getStatus()).isEqualTo(Charge.ChargeStatus.UNPAID);
    }

    @Test
    void shouldPreventConcurrentOverAllocationForAdjustments() throws InterruptedException {
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
        final var auth = SecurityContextHolder.getContext().getAuthentication();

        for (int i = 0; i < threadCount; i++) {
            executor.submit(() -> {
                try {
                    latch.await();
                    TenantContext.setSchoolId(school.getId());
                    SecurityContextHolder.getContext().setAuthentication(auth);
                    financeService.applyAdjustment(student.getId(), savedCharge.getId(), new BigDecimal("500.00"), "SCHOLARSHIP", "Full", null);
                    successCount.incrementAndGet();
                } catch (ObjectOptimisticLockingFailureException | IllegalArgumentException e) {
                    failureCount.incrementAndGet();
                } catch (Exception e) {
                    e.printStackTrace();
                } finally {
                    TenantContext.clear();
                    SecurityContextHolder.clearContext();
                    done.countDown();
                }
            });
        }

        latch.countDown();
        done.await();
        executor.shutdown();

        assertThat(successCount.get()).isEqualTo(1);
        assertThat(failureCount.get()).isEqualTo(1);

        Charge updatedCharge = chargeRepository.findById(savedCharge.getId()).orElseThrow();
        assertThat(updatedCharge.getStatus()).isEqualTo(Charge.ChargeStatus.SETTLED_BY_ADJUSTMENT);
    }

    @Test
    void shouldPreventConcurrentPaymentAndAdjustment() throws InterruptedException {
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
        final var auth = SecurityContextHolder.getContext().getAuthentication();

        executor.submit(() -> {
            try {
                latch.await();
                TenantContext.setSchoolId(school.getId());
                SecurityContextHolder.getContext().setAuthentication(auth);
                financeService.recordPayment(student.getId(), new BigDecimal("500.00"), "CASH", "CONC-PAY");
                successCount.incrementAndGet();
            } catch (ObjectOptimisticLockingFailureException | IllegalArgumentException e) {
                failureCount.incrementAndGet();
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            } catch (Exception e) {
                e.printStackTrace();
            } finally {
                TenantContext.clear();
                SecurityContextHolder.clearContext();
                done.countDown();
            }
        });

        executor.submit(() -> {
            try {
                latch.await();
                TenantContext.setSchoolId(school.getId());
                SecurityContextHolder.getContext().setAuthentication(auth);
                financeService.applyAdjustment(student.getId(), savedCharge.getId(), new BigDecimal("500.00"), "SCHOLARSHIP", "Full", null);
                successCount.incrementAndGet();
            } catch (ObjectOptimisticLockingFailureException | IllegalArgumentException e) {
                failureCount.incrementAndGet();
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            } catch (Exception e) {
                e.printStackTrace();
            } finally {
                TenantContext.clear();
                SecurityContextHolder.clearContext();
                done.countDown();
            }
        });

        latch.countDown();
        done.await();
        executor.shutdown();

        assertThat(successCount.get()).isEqualTo(1);
        assertThat(failureCount.get()).isEqualTo(1);

        Charge updatedCharge = chargeRepository.findById(savedCharge.getId()).orElseThrow();
        assertThat(updatedCharge.getStatus()).isIn(Charge.ChargeStatus.PAID, Charge.ChargeStatus.SETTLED_BY_ADJUSTMENT);
    }

    @Test
    void shouldRejectDuplicateReversalAttempt() {
        Charge charge = new Charge(student, tuitionFee, "Term 1", new BigDecimal("500.00"));
        charge.setSchoolId(school.getId());
        charge = chargeRepository.save(charge);

        FinancialAdjustmentDTO adj = financeService.applyAdjustment(student.getId(), charge.getId(), new BigDecimal("500.00"), "WAIVER", "Waiver", null);

        financeService.reverseAdjustment(student.getId(), adj.id(), "Mistake");

        assertThatThrownBy(() -> financeService.reverseAdjustment(student.getId(), adj.id(), "Mistake again"))
                .isInstanceOf(com.karatu.sis.common.exception.ResourceConflictException.class)
                .hasMessage("Adjustment has already been reversed");
    }

    @Test
    void shouldPreventUnauthenticatedUser() {
        SecurityContextHolder.clearContext();

        Charge charge = new Charge(student, tuitionFee, "Term 1", new BigDecimal("500.00"));
        charge.setSchoolId(school.getId());
        Charge savedCharge = chargeRepository.save(charge);

        assertThatThrownBy(() -> financeService.applyAdjustment(student.getId(), savedCharge.getId(), new BigDecimal("100.00"), "DISCOUNT", "Reason", null))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Authenticated user required");
    }

    @Test
    void shouldThrowExceptionIfIdempotencyKeyReusedWithDifferentPayload() {
        Charge charge = new Charge(student, tuitionFee, "Term 1", new BigDecimal("500.00"));
        charge.setSchoolId(school.getId());
        final Charge savedCharge = chargeRepository.save(charge);

        financeService.applyAdjustment(student.getId(), savedCharge.getId(), new BigDecimal("100.00"), "DISCOUNT", "Reason 1", "key-1");

        assertThatThrownBy(() -> financeService.applyAdjustment(student.getId(), savedCharge.getId(), new BigDecimal("200.00"), "DISCOUNT", "Reason 2", "key-1"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Idempotency key reused with different payload");
    }

    @Test
    void shouldPreventConcurrentDuplicateReversals() throws InterruptedException {
        Charge charge = new Charge(student, tuitionFee, "Term 1", new BigDecimal("500.00"));
        charge.setSchoolId(school.getId());
        charge = chargeRepository.save(charge);

        FinancialAdjustmentDTO adj = financeService.applyAdjustment(student.getId(), charge.getId(), new BigDecimal("500.00"), "WAIVER", "Waiver", null);

        int threadCount = 2;
        ExecutorService executor = Executors.newFixedThreadPool(threadCount);
        CountDownLatch latch = new CountDownLatch(1);
        CountDownLatch done = new CountDownLatch(threadCount);

        AtomicInteger successCount = new AtomicInteger(0);
        AtomicInteger failureCount = new AtomicInteger(0);
        final var auth = SecurityContextHolder.getContext().getAuthentication();

        for (int i = 0; i < threadCount; i++) {
            executor.submit(() -> {
                try {
                    latch.await();
                    TenantContext.setSchoolId(school.getId());
                    SecurityContextHolder.getContext().setAuthentication(auth);
                    financeService.reverseAdjustment(student.getId(), adj.id(), "Mistake");
                    successCount.incrementAndGet();
                } catch (com.karatu.sis.common.exception.ResourceConflictException e) {
                    failureCount.incrementAndGet();
                } catch (Exception e) {
                    e.printStackTrace();
                } finally {
                    TenantContext.clear();
                    SecurityContextHolder.clearContext();
                    done.countDown();
                }
            });
        }

        latch.countDown();
        done.await();
        executor.shutdown();

        assertThat(successCount.get()).isEqualTo(1);
        assertThat(failureCount.get()).isEqualTo(1);

        List<FinancialAdjustment> adjustments = financialAdjustmentRepository.findAll();
        long reversalCount = adjustments.stream().filter(a -> a.getType() == FinancialAdjustment.AdjustmentType.REVERSAL).count();
        assertThat(reversalCount).isEqualTo(1);
    }

    @Test
    void shouldIgnoreLegacyDuplicateReversalsInBalanceCalculation() {
        // Given
        Invoice invoice = new Invoice(student, academicYear, term, "INV-12345", LocalDate.now(), LocalDate.now().plusDays(30));
        invoice.setSchoolId(school.getId());
        invoice.setStatus(Invoice.InvoiceStatus.ISSUED);
        invoice = invoiceRepository.save(invoice);

        Charge charge = new Charge(student, tuitionFee, "Term 1", new BigDecimal("500.00"));
        charge.setSchoolId(school.getId());
        charge.setInvoice(invoice);
        charge = chargeRepository.save(charge);

        FinancialAdjustment original = new FinancialAdjustment(student, new BigDecimal("100.00"), FinancialAdjustment.AdjustmentType.DISCOUNT, "Early bird");
        original.setCharge(charge);
        original.setSchoolId(school.getId());
        original.setRecordedBy(testUser);
        original = financialAdjustmentRepository.save(original);

        charge.setStatus(Charge.ChargeStatus.PARTIALLY_PAID);
        chargeRepository.save(charge);

        // A valid reversal
        FinancialAdjustment validReversal = new FinancialAdjustment(student, new BigDecimal("100.00"), FinancialAdjustment.AdjustmentType.REVERSAL, "Mistake");
        validReversal.setCharge(charge);
        validReversal.setSchoolId(school.getId());
        validReversal.setOriginalAdjustment(original);
        validReversal.setRecordedBy(testUser);
        financialAdjustmentRepository.save(validReversal);

        // A legacy duplicate reversal from V22 (marked as legacy duplicate)
        FinancialAdjustment duplicateReversal = new FinancialAdjustment(student, new BigDecimal("100.00"), FinancialAdjustment.AdjustmentType.REVERSAL, "Mistake (DUPLICATE REVERSAL OF ...)");
        duplicateReversal.setCharge(charge);
        duplicateReversal.setSchoolId(school.getId());
        duplicateReversal.setLegacyDuplicate(true);
        duplicateReversal.setOriginalAdjustment(null);
        duplicateReversal.setRecordedBy(testUser);
        financialAdjustmentRepository.save(duplicateReversal);

        // When
        // Invoices fetch triggers calculateAdjustmentAmount
        List<InvoiceDTO> invoices = financeService.getStudentInvoices(student.getId());

        // Then
        // Without ignoring the duplicate, the balance would incorrectly be 500 - 100(Discount) + 100(ValidReversal) + 100(DupReversal) = 600.
        // With ignoring, it should be 500 - 100(Discount) + 100(ValidReversal) = 500.
        // Wait, invoice logic: outstanding = total(500) - paid(0) - adjustments(0) = 500.

        List<InvoiceDTO> fetchedInvoices = financeService.getStudentInvoices(student.getId());
        assertThat(fetchedInvoices).hasSize(1);
        assertThat(fetchedInvoices.get(0).totalAmount()).isEqualByComparingTo(new BigDecimal("500.00"));
        assertThat(fetchedInvoices.get(0).paidAmount()).isEqualByComparingTo(BigDecimal.ZERO);
        // Adjustment amount = 100 (discount) - 100 (valid reversal) = 0. So outstanding = 500
        assertThat(fetchedInvoices.get(0).outstandingAmount()).isEqualByComparingTo(new BigDecimal("500.00"));
    }
}
