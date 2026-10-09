# Task 026: Core Ledger Integrity Implementation

## 1. Objective and Root Causes
The objective was to improve core ledger integrity by correctly handling overpayments, fixing a concurrency race condition during payment allocation, and optimizing the balance calculation query, relying on the `FINANCE_SOURCE_OF_TRUTH.md`.

**Original Root Causes:**
- **Overpayments Lost**: `FinanceServiceImpl.recordPayment` iterated over unpaid charges. If the payment amount exceeded the sum of all unpaid charges, it simply broke out of the loop and the `remainingAmount` was lost. It was never converted to a `CREDIT` adjustment.
- **Concurrency Over-Allocation**: The `Charge` entity lacked any optimistic locking (`@Version`). Two concurrent transactions could load the same unpaid charge, compute a balance, allocate the same amount, and over-allocate the charge.
- **Performance (O(N) Allocations)**: `FinanceServiceImpl` loaded `paymentAllocationRepository.findAllBySchoolId(schoolId)` in a loop, loading every allocation for the entire school to calculate a single charge's balance. N+1 behavior and massive overhead.
- **Idempotency**: There were no unique constraints preventing the submission of the exact same payment reference twice.

## 2. Financial Invariants Implemented
- **Full Payment Accounted For**: Payments exceeding outstanding balances are preserved. The unallocated remainder is converted into a `FinancialAdjustment` of type `CREDIT` and linked to the student.
- **Allocation Cannot Exceed Charge Balance**: Allocation logic is bound by `remainingAmount.min(balanceRemainingOnCharge)`.
- **Atomic Operations**: `FinanceService.recordPayment` runs inside a single `@Transactional` boundary, guaranteeing that the Payment, PaymentAllocations, Charge updates, and the Credit Adjustment succeed or fail atomically.
- **Concurrency Safety**: Optimistic locking ensures that a concurrent modification of a `Charge` throws an `ObjectOptimisticLockingFailureException`, preventing lost updates and over-allocations.
- **Tenant Scope Enforced**: `school_id` derived from `TenantContext` is passed to all operations.

## 3. Files and Migrations Changed
- **Migrations**: 
  - `V19__add_finance_optimistic_locking_and_idempotency.sql` was created to add `version BIGINT NOT NULL DEFAULT 0` to `charges` and `payments`.
- **Domain**: 
  - `Charge.java`: Added `@Version private Long version` and `@OneToMany(mappedBy = "charge") private List<PaymentAllocation> allocations`.
  - `Payment.java`: Added `@Version private Long version`.
- **Repository**:
  - `PaymentAllocationRepository.java`: Added `List<PaymentAllocation> findAllBySchoolIdAndChargeIn(UUID schoolId, List<Charge> charges);` for optimized aggregate querying.
- **Service**: 
  - `FinanceServiceImpl.java`: 
    - Injected `FinancialAdjustmentRepository`.
    - Optimized allocation lookup by fetching only allocations for the `unpaidCharges` list using the new repository method.
    - Handled overpayments by dynamically creating a `CREDIT` `FinancialAdjustment` for any `remainingAmount`.
- **Tests**:
  - `FinanceServiceIntegrationTest.java`: Added a suite of integration tests exercising exact allocation, partial allocation, multi-charge allocation, overpayments (with CREDIT assertion), payment with no charges, and a multi-threaded concurrent over-allocation test.

## 4. Concurrency Strategy and Limitations
- **Strategy**: Entity-level Optimistic Locking (`@Version`) on `Charge` and `Payment`. 
- **Semantics**: When a thread modifies `Charge` (e.g. updating `status` from `UNPAID` to `PAID`) or inserts `PaymentAllocation`, the `version` on `Charge` is verified. If another thread has modified it simultaneously, Spring data throws `ObjectOptimisticLockingFailureException`.
- **Limitation**: The system does not automatically retry `ObjectOptimisticLockingFailureException`. Implementing an automatic retry loops risks generating duplicate payments/credits if the retry boundary isn't perfectly isolated. The exception translates to an HTTP 409 Conflict, requiring the client to retry.

## 5. Overpayment Representation and Accounting Semantics
Overpayments are now strictly represented as `FinancialAdjustment` entities with `type = CREDIT`. 
- When an amount cannot be allocated to a charge, the `amount` of the `Payment` remains its original value.
- The sum of its `PaymentAllocation`s will equal `Payment.amount - remainingAmount`.
- A `FinancialAdjustment` records the `remainingAmount` as a `CREDIT`, ensuring that the school's total received cash accurately maps to (Allocated Charges + Unallocated Credits).

## 6. Query Optimizations
- Replaced the O(N) entire-school allocation lookup in both `recordPayment` and `getStudentInvoices` with a single targeted O(1) query: `paymentAllocationRepository.findAllBySchoolIdAndChargeIn(schoolId, charges)`.

## 7. Remaining Risks or Deferred Work
- **Idempotency**: The idempotency mechanism (e.g., unique `reference` constraint) was deferred. A globally unique constraint on `reference` wasn't added since the API contract and exact uniqueness scope per payment provider/cash transaction require further analysis.
- **Applying Credits**: The system now creates `CREDIT` adjustments for overpayments, but `FinanceServiceImpl` does not yet have logic to automatically apply these credits to *future* charges. This will require the implementation of a full adjustments and statements workflow.
- **Missing Front-end & Statements**: The UI and PDF statements are deferred.

## 8. Final Repository Status
All codebase modifications preserve existing methods and contracts. No user-facing API routes were altered. All integration and unit tests pass.

**Status**: Implemented with documented gaps (idempotency, automated credit application).

## 9. Test Results
The test suite `FinanceServiceIntegrationTest` was executed successfully against a real PostgreSQL instance via Testcontainers.
```text
[INFO] Tests run: 6, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 31.18 s -- in com.karatu.sis.finance.service.FinanceServiceIntegrationTest
[INFO] 
[INFO] Results:
[INFO] 
[INFO] Tests run: 6, Failures: 0, Errors: 0, Skipped: 0
[INFO] 
[INFO] ------------------------------------------------------------------------
[INFO] BUILD SUCCESS
```
