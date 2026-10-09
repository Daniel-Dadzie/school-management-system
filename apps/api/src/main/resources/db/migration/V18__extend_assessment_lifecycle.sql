-- V18: Extend assessment lifecycle statuses and fix assessment query performance
-- Adds APPROVED and LOCKED to the lifecycle constraint
-- Adds a school_id index to assessments for efficient tenant-scoped queries

-- 1. Extend lifecycle status constraint to include APPROVED and LOCKED
ALTER TABLE assessments DROP CONSTRAINT IF EXISTS check_assessments_lifecycle;
ALTER TABLE assessments ADD CONSTRAINT check_assessments_lifecycle
    CHECK (lifecycle_status IN ('DRAFT', 'SUBMITTED', 'REVIEWED', 'APPROVED', 'PUBLISHED', 'LOCKED', 'RETURNED'));

-- 2. Add index on assessments(school_id) for efficient tenant-scoped queries
--    (skipped if already exists)
CREATE INDEX IF NOT EXISTS idx_assessments_school_id ON assessments(school_id);

-- 3. Add index on assessments(school_id, lifecycle_status) for lifecycle filter queries
CREATE INDEX IF NOT EXISTS idx_assessments_school_lifecycle ON assessments(school_id, lifecycle_status);
