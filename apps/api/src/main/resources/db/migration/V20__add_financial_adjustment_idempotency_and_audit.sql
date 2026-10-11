-- ============================================================
-- V20__add_financial_adjustment_idempotency_and_audit.sql
-- CarePoint School Management System - Finance Adjustments
-- ============================================================

ALTER TABLE financial_adjustments ADD COLUMN idempotency_key VARCHAR(255);
ALTER TABLE financial_adjustments ADD COLUMN original_adjustment_id UUID REFERENCES financial_adjustments(id);

ALTER TABLE financial_adjustments DROP CONSTRAINT financial_adjustments_type_check;
ALTER TABLE financial_adjustments ADD CONSTRAINT financial_adjustments_type_check CHECK (type IN ('DISCOUNT', 'WAIVER', 'SCHOLARSHIP', 'CREDIT', 'REVERSAL'));

CREATE UNIQUE INDEX idx_adjustments_idempotency ON financial_adjustments(school_id, idempotency_key) WHERE idempotency_key IS NOT NULL;
