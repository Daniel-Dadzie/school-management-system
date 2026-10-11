# Task 028.1: Concurrent Reversal Integrity Alignment Report

## Objective
Fix the race condition allowing concurrent requests to potentially reverse the same financial adjustment more than once, leading to incorrect ledger balances. 

## 1. Root Cause
The `FinanceServiceImpl.reverseAdjustment` method relied on an application-level existence check (`financialAdjustmentRepository.existsBySchoolIdAndOriginalAdjustmentId(...)`) to prevent duplicate reversals. Without a database-level unique constraint on `original_adjustment_id`, this check suffered from a race condition: multiple concurrent threads could read that no reversal existed and proceed to persist duplicate reversal records for the same original adjustment.

## 2. Migration and Database Constraint
Created Flyway migration `V22__add_financial_adjustment_reversal_unique_constraint.sql`:
```sql
CREATE UNIQUE INDEX idx_financial_adjustments_reversal 
ON financial_adjustments(school_id, original_adjustment_id) 
WHERE original_adjustment_id IS NOT NULL;
```
This partial unique index guarantees that for any given `original_adjustment_id` within a school's tenant scope, only one reversal record can be inserted.

## 3. Service Changes and Exception Handling
- Preserved the existing `existsBySchoolIdAndOriginalAdjustmentId` check to reject serial duplicates early with an `IllegalArgumentException`.
- Updated the persistence logic to use `financialAdjustmentRepository.saveAndFlush(reversal)` instead of `save()`.
- Added a `try-catch` block around `saveAndFlush()` to synchronously capture the `DataIntegrityViolationException` that Spring Data JPA throws when the unique database constraint is violated during concurrent execution.
- Translated the `DataIntegrityViolationException` into the established domain exception: `IllegalArgumentException("Adjustment has already been reversed")`, ensuring clients receive a consistent conflict response identical to serial requests.

## 4. Concurrent Test Design and Assertions
Added `shouldPreventConcurrentDuplicateReversals` to `FinanceServiceIntegrationTest`:
1. **Setup**: Created a charge and an adjustment.
2. **Concurrency**: Launched 2 background threads sharing a `CountDownLatch` to synchronize execution of the `reverseAdjustment` operation. Propagated explicit `SecurityContext` and `TenantContext` to both threads to satisfy isolation requirements.
3. **Execution**: Both threads call `reverseAdjustment` simultaneously.
4. **Assertions**: 
   - Verified that exactly 1 thread succeeds and 1 fails (`IllegalArgumentException`).
   - Queried the database via `financialAdjustmentRepository` post-execution.
   - Verified that `adjustments.stream().filter(a -> a.getType() == FinancialAdjustment.AdjustmentType.REVERSAL).count()` is exactly 1, confirming no duplicate state leakage.

## 5. Exact Test Results
- **Focused test (`mvn test -Dtest=FinanceServiceIntegrationTest`)**: 
  - Result: `[INFO] Tests run: 18, Failures: 0, Errors: 0, Skipped: 0`
- **Full Backend Suite (`./mvnw test`)**: 
  - Result: `[INFO] Tests run: 157, Failures: 0, Errors: 0, Skipped: 0` (Includes the 1 new integration test).

## 6. Remaining Gaps
- **HTTP 409 Exception Mapping**: `IllegalArgumentException` thrown during duplicate reversal attempts is not currently mapped to an HTTP 409 Conflict in `GlobalExceptionHandler`. This results in an HTTP 500 Internal Server Error for clients instead of a graceful conflict response.
- **Migration Safety for V22**: The `V22` migration introduces a unique index. If duplicate reversal records already exist in production databases, this migration will fail. A data deduplication or cleanup step must be added prior to creating the constraint to ensure safe deployment.
- Payment idempotency remains outstanding but has been formally documented in `FINANCE_SOURCE_OF_TRUTH.md`.

## Status
IMPLEMENTED AND VERIFIED. (Pending resolution of remaining gaps).
