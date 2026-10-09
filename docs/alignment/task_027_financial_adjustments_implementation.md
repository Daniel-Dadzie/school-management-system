# Task 027: Financial Adjustments and Balance Integrity - Implementation Report

## 1. Overview
This report verifies the implementation of financial adjustment workflows as governed by `docs/architecture/FINANCE_SOURCE_OF_TRUTH.md` and Task 027 requirements.

The core implementation correctly supports applying discounts, waivers, and scholarships while maintaining proper invariant checks such as balance bounds and tenant isolation.

## 2. Implementation Summary

### 2.1 Adjustment Semantics
The ledger now correctly factors in non-transactional adjustments. The `applyAdjustment` method in `FinanceServiceImpl` enforces:
* **Types Supported:** `DISCOUNT`, `WAIVER`, `SCHOLARSHIP`.
* **Restriction:** Explicitly prevents creating `CREDIT` adjustments through the direct application method, keeping `CREDIT` exclusively for overpayment derivation scenarios.
* **Balance Enforcement:** Throws an `IllegalArgumentException` if the adjustment amount exceeds the current outstanding balance, thereby ensuring `Outstanding balances cannot become negative through ordinary allocation.`

### 2.2 Balance Calculations
Outstanding balance calculation dynamically incorporates standard `FinancialAdjustment`s (excluding `CREDIT` type):
* `getStudentInvoices`: Aggregates the existing adjustments for the charge when calculating the outstanding amount on the invoice.
* `recordPayment`: Calculates `balanceRemainingOnCharge` by subtracting both payment allocations and adjustments before distributing new payment allocations, preventing overallocation against adjusted charges.

### 2.3 Status Updates
* Applying an adjustment that brings the outstanding balance to exactly `0.00` correctly transitions the `Charge` status to `PAID`.

### 2.4 Tenant Isolation and Safety
* Validates `studentId` mapping against the actual `Charge` to prevent IDOR vulnerabilities.
* Every transactional boundary correctly accesses tenant-scoped queries (`TenantContext.requireSchoolId()`).
* Database lookups explicitly match `schoolId` using `findByIdAndSchoolId` and `findAllBySchoolIdAndStudentId` pattern across repositories.

## 3. Regression & Integration Testing
The `FinanceServiceIntegrationTest` suite was expanded, now passing 10/10 tests, covering:
* Applying a `DISCOUNT` reduces the outstanding balance in the returned `InvoiceDTO`.
* Applying a full `SCHOLARSHIP` transitions the charge state to `PAID`.
* Applying an adjustment larger than the remaining balance properly throws an exception.
* Applying an invalid `CREDIT` type directly throws an exception.

## 4. Next Steps
The backend logic is sound and satisfies the ledger semantics for non-transactional adjustments. We are ready to proceed with the next task, such as creating receipts, student statements, or the frontend integration.
