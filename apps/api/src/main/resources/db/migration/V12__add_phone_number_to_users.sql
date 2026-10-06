-- V12: Add phone number to users for identity model

ALTER TABLE users ADD COLUMN phone_number VARCHAR(20) UNIQUE;

-- Allow users to be invited via phone only (without an email or username initially)
ALTER TABLE users ALTER COLUMN email DROP NOT NULL;
ALTER TABLE users ALTER COLUMN username DROP NOT NULL;

-- Enforce that a user must have at least one valid login identifier
ALTER TABLE users ADD CONSTRAINT chk_users_contact_info CHECK (email IS NOT NULL OR phone_number IS NOT NULL);

-- Index for phone number login lookups
CREATE INDEX idx_users_phone_number ON users(phone_number);

