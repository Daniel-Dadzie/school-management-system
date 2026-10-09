-- ============================================================
-- V19__add_finance_optimistic_locking_and_idempotency.sql
-- CarePoint School Management System - Finance Optimistic Locking
-- ============================================================

ALTER TABLE charges ADD COLUMN version BIGINT NOT NULL DEFAULT 0;
ALTER TABLE payments ADD COLUMN version BIGINT NOT NULL DEFAULT 0;
