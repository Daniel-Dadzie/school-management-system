-- V14__create_reporting_foundation.sql

-- ============================================================
-- REPORT TEMPLATES
-- ============================================================
CREATE TABLE report_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    config JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(school_id, name)
);

CREATE INDEX idx_report_templates_school_active ON report_templates(school_id, is_active);

-- ============================================================
-- REPORT SNAPSHOTS
-- ============================================================
CREATE TABLE report_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id),
    enrollment_id UUID NOT NULL REFERENCES enrollments(id),
    academic_year_id UUID NOT NULL REFERENCES academic_years(id),
    term_id UUID NOT NULL REFERENCES terms(id),
    template_id UUID NOT NULL REFERENCES report_templates(id),
    
    status VARCHAR(50) NOT NULL DEFAULT 'DRAFT', -- DRAFT, GENERATED, PUBLISHED, WITHDRAWN
    pdf_url VARCHAR(1024),
    
    overall_score DECIMAL(10,2),
    overall_grade VARCHAR(10),
    overall_rank INTEGER,
    
    headteacher_comment TEXT,
    teacher_comment TEXT,
    
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    
    -- Ensure a student only has one active report per term using a particular template
    UNIQUE(school_id, student_id, term_id, template_id)
);

CREATE INDEX idx_report_snapshots_school_term ON report_snapshots(school_id, term_id);
CREATE INDEX idx_report_snapshots_student ON report_snapshots(student_id);

-- ============================================================
-- REPORT SNAPSHOT RESULTS
-- ============================================================
CREATE TABLE report_snapshot_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_snapshot_id UUID NOT NULL REFERENCES report_snapshots(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES subjects(id),
    subject_name VARCHAR(255) NOT NULL,
    
    class_score DECIMAL(10,2),
    exam_score DECIMAL(10,2),
    total_score DECIMAL(10,2),
    grade VARCHAR(10),
    remark VARCHAR(255),
    rank INTEGER,
    
    UNIQUE(report_snapshot_id, subject_id)
);

CREATE INDEX idx_rs_results_snapshot ON report_snapshot_results(report_snapshot_id);
