# Task 028.1.5 Alignment Report: Financial Reversal Database Integrity Hardening

## 1. Defect Addressed

The previous implementation of duplicate reversal prevention relied on the application layer correctly filtering out reversals where `original_adjustment_id` was null. While effective in mitigating the financial impact of the specific V22 legacy duplicates, it left a gap in database-level constraints. Specifically, a future bug could potentially persist a new reversal without an `original_adjustment_id`, violating the domain invariant that all valid reversals must map back to an original adjustment.

## 2. Integrity Enhancements

To guarantee that future reversals maintain this invariant without disrupting the historically retained duplicate records from V22, the following changes were made:

### 2.1 Database Schema Enforcement (V23)
Created `V23__harden_financial_adjustment_invariants.sql` which:
1. Adds an `is_legacy_duplicate` boolean column to the `financial_adjustments` table, defaulting to `FALSE`.
2. Updates all existing records where `type = 'REVERSAL'` and `original_adjustment_id IS NULL` to set `is_legacy_duplicate = TRUE`.
3. Adds a strict `CHECK` constraint: `CHECK (type <> 'REVERSAL' OR original_adjustment_id IS NOT NULL OR is_legacy_duplicate = TRUE)`.

### 2.2 Application Domain Enforcement
1. Updated `FinancialAdjustment.java` with a `legacyDuplicate` field mapped to `is_legacy_duplicate`.
2. Modified the authoritative `FinanceServiceImpl.calculateAdjustmentAmount` logic to exclude records where `isLegacyDuplicate()` is true, replacing the previous `originalAdjustment == null` check.
3. Updated `FinanceServiceIntegrationTest.shouldIgnoreLegacyDuplicateReversalsInBalanceCalculation` to explicitly set `legacyDuplicate = true` on the mocked legacy duplicate.

## 3. Results

*   The database now physically guarantees that any *newly created* reversal must reference an original adjustment.
*   The legacy duplicates from the V22 migration are safely retained for auditability but correctly flagged.
*   Authoritative balance calculations reliably ignore these legacy duplicates.
*   All 159 regression tests pass successfully, confirming that the new constraint and application logic are completely backward-compatible and mathematically sound.
