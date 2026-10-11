-- ============================================================
-- V23__harden_financial_adjustment_invariants.sql
-- CarePoint School Management System - Finance Adjustments
-- ============================================================

ALTER TABLE financial_adjustments ADD COLUMN is_legacy_duplicate BOOLEAN NOT NULL DEFAULT FALSE;

UPDATE financial_adjustments
SET is_legacy_duplicate = TRUE
WHERE type = 'REVERSAL' AND original_adjustment_id IS NULL;

ALTER TABLE financial_adjustments ADD CONSTRAINT financial_adjustments_reversal_check 
CHECK (type <> 'REVERSAL' OR original_adjustment_id IS NOT NULL OR is_legacy_duplicate = TRUE);
