-- ============================================================
-- V3__create_core_people.sql
-- CarePoint School Management System — Core People Schema
-- ============================================================
-- Scope: teachers, parents, students, parent_student,
--        admission_applications
--
-- EXCLUDED from this migration:
--   academic_years, terms, classes, subjects,
--   enrollments, teacher_assignments
-- Those are created in V4.
--
-- Historical integrity rules:
--   - NO ON DELETE CASCADE on any core historical relationship.
--   - Records are preserved; lifecycle managed via status columns.
-- ============================================================

-- ============================================================
-- TEACHERS
-- Linked 1:1 to a users record.
-- Teacher records survive user account deactivation.
-- ============================================================
CREATE TABLE teachers (
    id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID        NOT NULL UNIQUE REFERENCES users(id),
    staff_number VARCHAR(50) NOT NULL UNIQUE,
    first_name  VARCHAR(100) NOT NULL,
    last_name   VARCHAR(100) NOT NULL,
    phone       VARCHAR(20),
    status      VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at  TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CHECK: status must be a known value
ALTER TABLE teachers
    ADD CONSTRAINT chk_teachers_status
    CHECK (status IN ('ACTIVE', 'INACTIVE'));

CREATE INDEX idx_teachers_user_id     ON teachers(user_id);
CREATE INDEX idx_teachers_staff_number ON teachers(staff_number);
CREATE INDEX idx_teachers_status       ON teachers(status);

-- ============================================================
-- PARENTS
-- Linked 1:1 to a users record.
-- ============================================================
CREATE TABLE parents (
    id         UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id    UUID        NOT NULL UNIQUE REFERENCES users(id),
    first_name VARCHAR(100) NOT NULL,
    last_name  VARCHAR(100) NOT NULL,
    phone      VARCHAR(20),
    address    TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_parents_user_id ON parents(user_id);

-- ============================================================
-- STUDENTS
-- Students do NOT authenticate in the MVP.
-- No user_id column.
-- ============================================================
CREATE TABLE students (
    id               UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    admission_number VARCHAR(50) NOT NULL UNIQUE,
    first_name       VARCHAR(100) NOT NULL,
    last_name        VARCHAR(100) NOT NULL,
    date_of_birth    DATE        NOT NULL,
    gender           VARCHAR(10),
    status           VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at       TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CHECK: status must be a known value
ALTER TABLE students
    ADD CONSTRAINT chk_students_status
    CHECK (status IN ('ACTIVE', 'SUSPENDED', 'TRANSFERRED', 'WITHDRAWN'));

CREATE INDEX idx_students_admission_number ON students(admission_number);
CREATE INDEX idx_students_status           ON students(status);

-- ============================================================
-- PARENT_STUDENT
-- Resolves the many-to-many relationship between parents
-- and students. Carries relationship metadata.
-- Composite PK prevents duplicate relationships.
-- ============================================================
CREATE TABLE parent_student (
    parent_id            UUID        NOT NULL REFERENCES parents(id),
    student_id           UUID        NOT NULL REFERENCES students(id),
    relationship_type    VARCHAR(50) NOT NULL,
    is_primary           BOOLEAN     NOT NULL DEFAULT FALSE,
    is_emergency_contact BOOLEAN     NOT NULL DEFAULT FALSE,
    PRIMARY KEY (parent_id, student_id)
);

-- CHECK: relationship_type must be a known value
ALTER TABLE parent_student
    ADD CONSTRAINT chk_parent_student_relationship_type
    CHECK (relationship_type IN ('MOTHER', 'FATHER', 'GUARDIAN', 'OTHER'));

CREATE INDEX idx_parent_student_student_id ON parent_student(student_id);

-- ============================================================
-- ADMISSION_APPLICATIONS
-- Public submissions from prospective parents.
-- Submitting does NOT automatically create a Student.
-- Admission statuses follow the project requirements.
-- ============================================================
CREATE TABLE admission_applications (
    id                  UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Applicant (prospective student) details
    student_first_name  VARCHAR(100) NOT NULL,
    student_last_name   VARCHAR(100) NOT NULL,
    date_of_birth       DATE        NOT NULL,
    gender              VARCHAR(10)  NOT NULL,
    applying_for_class  VARCHAR(100) NOT NULL,

    -- Parent/guardian contact details
    parent_name         VARCHAR(200) NOT NULL,
    parent_email        VARCHAR(255) NOT NULL,
    parent_phone        VARCHAR(20)  NOT NULL,
    relationship        VARCHAR(50)  NOT NULL,

    -- Optional additional information
    additional_notes    TEXT,

    -- Lifecycle
    status              VARCHAR(20)  NOT NULL DEFAULT 'PENDING',
    submitted_at        TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CHECK: status must be a known value
ALTER TABLE admission_applications
    ADD CONSTRAINT chk_admission_applications_status
    CHECK (status IN ('PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED'));

-- CHECK: gender must be a known value
ALTER TABLE admission_applications
    ADD CONSTRAINT chk_admission_applications_gender
    CHECK (gender IN ('MALE', 'FEMALE', 'OTHER'));

CREATE INDEX idx_admission_applications_status       ON admission_applications(status);
CREATE INDEX idx_admission_applications_parent_email ON admission_applications(parent_email);

