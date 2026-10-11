# Task 028: Financial Integrity Hardening

## Overview
This document outlines the changes made to the Karatu finance module to strengthen financial integrity, concurrency, authorization, idempotency, and auditability based on the Task 027 verification audit. 

## 1. Concurrency and Data Integrity
- Implemented `@Version` based Optimistic Locking on the `Charge` entity to prevent concurrent over-allocation of funds or adjustments.
- Both `recordPayment` and `applyAdjustment` now use `EntityManager.lock(charge, LockModeType.OPTIMISTIC_FORCE_INCREMENT)` to explicitly force a version increment when related allocations or adjustments are created.
- This ensures that two concurrent operations (e.g., two threads attempting to apply a $500 scholarship to a $500 charge) will not both succeed if the combined amount exceeds the outstanding balance. One thread will successfully commit while the other throws an `ObjectOptimisticLockingFailureException`.

## 2. Settlement Status Transitions
- Added a new `ChargeStatus`, `SETTLED_BY_ADJUSTMENT`, to distinguish charges fully settled by non-payment adjustments (such as waivers, scholarships, or discounts) from those settled by actual payments (`PAID`).
- Adjusted the settlement logic in `FinanceServiceImpl`: if the total allocated payments equal the charge amount, it's `PAID`. If the combination of payments and adjustments equals the charge amount, and adjustments were involved in the final settlement, it becomes `SETTLED_BY_ADJUSTMENT`.
- Created Flyway migration `V21__add_charge_status_settled_by_adjustment.sql` to apply this new status to the database schema constraint `charges_status_check`.

## 3. Duplicate Reversal Prevention
- Implemented `existsBySchoolIdAndOriginalAdjustmentId` in the `FinancialAdjustmentRepository` to strictly prevent duplicate reversal attempts on a single adjustment.
- Reversal workflow now explicitly validates that an adjustment hasn't already been reversed before attempting to create a REVERSAL record. Attempting a duplicate reversal throws an `IllegalArgumentException`.

## 4. Authorization and Auditability
- Enforced strict dependency on authenticated `User` context. `getCurrentUser()` was replaced with `requireCurrentUser()`, ensuring that an `IllegalStateException` is thrown if no authenticated user is present in the `SecurityContext`.
- All financial mutations (creating payments, allocations, adjustments, and reversals) securely record the actor responsible.
- Ensured `originalAdjustmentId` is set when reversing, maintaining an immutable ledger trail where historical records are never deleted.

## 5. Tenant Isolation
- Operations enforce `TenantContext.requireSchoolId()` at all points.
- Repository operations use exact tenant scoping (e.g., `findBySchoolIdAndId()`, `existsBySchoolIdAndOriginalAdjustmentId()`), preventing IDOR and cross-tenant data mutation.

## 6. Integration Testing
- Extended `FinanceServiceIntegrationTest` with robust concurrent testing to prove the `@Version` locking mechanism works.
- Added explicit tests for `SETTLED_BY_ADJUSTMENT` state transition.
- Added tests verifying rejection of duplicate reversals and correct idempotency handling.
- Ensured thread execution blocks explicitly pass `SecurityContext` downstream to satisfy authorization rules during concurrent execution testing. All tests have passed successfully.
