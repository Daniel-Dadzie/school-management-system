# Financial Ledger Integrity Audit

## Objective
Audit Karatu's existing finance implementation to establish a correct, testable financial model for charges, payments, adjustments, overpayments, receipts, statements, and reversals, prior to implementing Phase 1 ledger improvements.

## 1. Current Implementation Inventory

- **Entities**: `Charge`, `Invoice`, `Payment`, `PaymentAllocation`, `FinancialAdjustment`, `Receipt`.
- **Database Schema**: `V15__create_finance_foundation.sql` creates these tables with tenant-scoped indexing and basic `amount > 0` constraints.
- **Service**: `FinanceServiceImpl` implements basic invoice creation, payment recording (with FIFO allocation), and fetching lists of invoices and payments.
- **API Contracts**: `FinanceController` provides endpoints for creating/fetching invoices and payments.
- **Missing Features**: Financial adjustments are not processed, receipts are not generated, overpayments are discarded, reversals are not supported, and there is no chronological statement endpoint.

## 2. Financial Model Documentation

### Charges and Invoices
- **Implementation Status**: Charges are the authoritative balance-bearing obligations. Invoices do not have an `amount` column; they serve as a grouping document. The `mapToInvoiceDTO` correctly calculates invoice totals dynamically from associated charges.
- **Defects/Risks**: Duplicate billing can occur. There is no unique constraint on `(student_id, fee_category_id, term_id)` in the database, nor does the service verify if a charge already exists for a term before creating it.

### Payments and Allocations
- **Implementation Status**: The FIFO allocation loop in `FinanceServiceImpl.recordPayment` attempts to allocate payment amounts to unpaid charges.
- **Defects/Risks**: 
  - **Performance**: The loop retrieves *all* payment allocations for the entire school (`paymentAllocationRepository.findAllBySchoolId(schoolId)`) to compute the balance of a single charge. This will severely degrade performance.
  - **Concurrency**: There is no locking (optimistic or pessimistic) on `Charge`. Concurrent payments could over-allocate against the same charge.
  - **Overpayments (Lost Funds)**: If a payment amount exceeds the total outstanding charges, the `remainingAmount` is simply ignored. The `Payment` entity saves the full amount, but the sum of its `PaymentAllocation`s will be less than the payment amount, and the excess is lost to the student (it does not automatically create a `CREDIT` adjustment).

### Adjustments
- **Implementation Status**: The `FinancialAdjustment` entity and table exist (supporting `DISCOUNT`, `WAIVER`, `SCHOLARSHIP`, `CREDIT`).
- **Defects/Risks**: Adjustments are currently entirely ignored by the backend logic. They do not affect charge balances or invoice totals. There is no protection against applying the same discount multiple times.

### Receipts
- **Implementation Status**: The `Receipt` entity and `receipts` table exist.
- **Defects/Risks**: No receipt generation logic exists. `FinanceServiceImpl.recordPayment` does not create a receipt. The DTO merely falls back to the payment reference.

### Reversals and Refunds
- **Implementation Status**: Not implemented.
- **Defects/Risks**: The `PaymentStatus.REVERSED` enum exists, but there is no mechanism to reverse a payment, delete/negate its allocations, or reinstate the charge balances.

### Statements
- **Implementation Status**: Not implemented. There is no unified chronological ledger view combining charges, payments, and adjustments.

## 3. Financial Invariants

| Scenario | Expected Specification Behavior | Actual Implemented Behavior | Status |
| :--- | :--- | :--- | :--- |
| **1. Payment exactly covers charge** | Charge -> PAID, Allocation created. | Charge -> PAID, Allocation created. | ✅ Works |
| **2. Payment partially covers charge** | Charge -> PARTIALLY_PAID, Allocation created. | Charge -> PARTIALLY_PAID, Allocation created. | ✅ Works |
| **3. Payment covers several charges** | Allocates sequentially across charges. | Allocates sequentially via FIFO. | ✅ Works |
| **4. Payment exceeds all charges** | Excess becomes a `CREDIT` adjustment. | Excess amount is discarded/unallocated. | ❌ Defect |
| **5. Student has no charges** | Entire payment becomes a `CREDIT`. | Payment saved, but amount is fully discarded/unallocated. | ❌ Defect |
| **6. Discount/Waiver applied** | Reduces effective outstanding charge balance. | Ignored by calculation logic entirely. | ❌ Defect |
| **7. Adjustment attempted twice** | Rejected or idempotent. | DB allows duplicates. Service lacks check. | ❌ Defect |
| **8. Payment recorded twice** | Rejected or idempotent (via reference). | DB/Service allows duplicates (no unique constraints). | ❌ Defect |
| **9. Allocation attempted twice** | Prevented by DB/Service constraint. | Handled implicitly, but concurrent requests can bypass. | ❌ Defect |
| **10. Payment reversed** | Allocations negated, charge balances restored. | Not implemented. | ❌ Defect |
| **11. Balance but no payment history** | Returns outstanding invoices. | Works correctly. | ✅ Works |
| **12. Credit but no charges** | Reflected in student statement. | Overpayments are discarded, not converted to credits. | ❌ Defect |
| **13. Cross-tenant access** | Rejected. | `school_id` derived from `TenantContext` prevents this. | ✅ Works |
| **14. Concurrent payment allocation** | Safely serialized or fails safely. | No locking. Causes over-allocation race condition. | ❌ Defect |

## 4. Money and Transaction Safety

- **Data Types**: `BigDecimal` is correctly used everywhere. Floating-point arithmetic is avoided.
- **Transaction Boundaries**: Standard `@Transactional` annotations are present, preventing partial persistence within a single thread.
- **Concurrency**: **Critical vulnerability.** The lack of `@Version` (optimistic locking) on the `Charge` entity means concurrent payment recordings can calculate balances based on stale data and over-allocate a charge.
- **Idempotency**: **Vulnerability.** Missing unique constraints on payments and charges (e.g., duplicate billing or double-submission of payments).
- **Tenant Isolation**: Excellent. `TenantContext.requireSchoolId()` is strictly enforced.

## 5. Recommended Implementation Sequence

To safely bring the ledger to production readiness, implement the following steps in sequence:

### Step 1: Concurrency, Performance, and Overpayments (Immediate Priority)
- **Fix**: Add `@Version` to `Charge` and `Payment` for optimistic locking.
- **Fix**: Replace the O(N) allocation lookup (`findAllBySchoolId`) with an optimized query or by mapping the `@OneToMany` allocations directly onto the `Charge` entity.
- **Feature**: Modify `recordPayment` so that any unallocated `remainingAmount` generates a `FinancialAdjustment` of type `CREDIT` linked to the student.

### Step 2: Financial Adjustments Integration
- **Feature**: Create a service method to record discounts/waivers against specific charges.
- **Fix**: Update the `mapToInvoiceDTO` balance calculation to subtract total discounts/waivers from the charge's original amount when determining `balanceRemainingOnCharge`.

### Step 3: Receipt Generation and Idempotency
- **Feature**: Automatically generate a unique `Receipt` record at the end of `recordPayment`.
- **Fix**: Add database-level unique constraints (via Flyway migration) for idempotency (e.g., unique `reference` per `school_id` for external payments, unique charge per term/category).

### Step 4: Chronological Student Statement
- **Feature**: Build the `getStudentStatement` endpoint, unioning Charges, Payments, Allocations, and Adjustments into a sorted, running-balance DTO.

### Step 5: Reversals
- **Feature**: Implement `reversePayment`. This must mark the `Payment` as `REVERSED`, soft-delete or reverse the associated `PaymentAllocation`s, and recalculate `Charge` statuses.

## 6. Acceptance Criteria for Task 1 (Concurrency & Overpayments)
- `Charge` entity has a `@Version` field and optimistic locking is verified via a concurrent test.
- `recordPayment` completes in O(1) database queries relative to total school allocations.
- Submitting a payment of GHS 500 against a student with GHS 300 in unpaid charges results in:
  - GHS 300 allocated.
  - A `FinancialAdjustment` of type `CREDIT` created for GHS 200.
- All existing tests pass.
