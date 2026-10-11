-- ============================================================
-- V21__add_charge_status_settled_by_adjustment.sql
-- CarePoint School Management System - Charge Status Update
-- ============================================================

ALTER TABLE charges DROP CONSTRAINT charges_status_check;
ALTER TABLE charges ADD CONSTRAINT charges_status_check CHECK (status IN ('UNPAID', 'PARTIALLY_PAID', 'PAID', 'CANCELLED', 'SETTLED_BY_ADJUSTMENT'));
