-- ============================================================
-- V16__create_curriculum_offerings.sql
-- CarePoint School Management System - Curriculum Offerings
-- ============================================================

CREATE TABLE curriculum_offerings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID NOT NULL REFERENCES schools(id),
    academic_year_id UUID NOT NULL REFERENCES academic_years(id),
    grade_level VARCHAR(50) NOT NULL,
    subject_id UUID NOT NULL REFERENCES subjects(id),
    is_required BOOLEAN NOT NULL DEFAULT TRUE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    periods_per_week INTEGER,
    assessment_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    report_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(school_id, academic_year_id, grade_level, subject_id)
);

CREATE INDEX idx_curriculum_offerings_academic_year_id ON curriculum_offerings(academic_year_id);
CREATE INDEX idx_curriculum_offerings_grade_level ON curriculum_offerings(grade_level);
