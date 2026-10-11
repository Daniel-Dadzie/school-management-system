-- ============================================================
-- V22__add_financial_adjustment_reversal_unique_constraint.sql
-- CarePoint School Management System - Finance Adjustments
-- ============================================================

-- Ensure no more than one reversal can exist for the same original adjustment within the same school.
-- If duplicate reversals already exist due to the previous race condition,
-- we reconcile them by retaining the first one and detaching the duplicates 
-- to prevent data loss while allowing the unique index to be created.

WITH numbered_reversals AS (
    SELECT id,
           school_id,
           original_adjustment_id,
           ROW_NUMBER() OVER (PARTITION BY school_id, original_adjustment_id ORDER BY created_at ASC, id ASC) as rn
    FROM financial_adjustments
    WHERE type = 'REVERSAL' AND original_adjustment_id IS NOT NULL
),
duplicates AS (
    SELECT id, original_adjustment_id
    FROM numbered_reversals
    WHERE rn > 1
)
UPDATE financial_adjustments
SET reason = reason || ' (DUPLICATE REVERSAL OF ' || original_adjustment_id || ')',
    original_adjustment_id = NULL
WHERE id IN (SELECT id FROM duplicates);

CREATE UNIQUE INDEX idx_financial_adjustments_reversal ON financial_adjustments(school_id, original_adjustment_id) WHERE original_adjustment_id IS NOT NULL;
