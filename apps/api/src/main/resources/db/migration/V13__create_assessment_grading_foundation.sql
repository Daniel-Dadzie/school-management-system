-- 1. Assessment Categories
CREATE TABLE assessment_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID NOT NULL,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_assessment_categories_school FOREIGN KEY (school_id) REFERENCES schools(id),
    CONSTRAINT uq_assessment_categories_school_code UNIQUE (school_id, code)
);
CREATE INDEX idx_assessment_categories_school_id ON assessment_categories(school_id);
CREATE UNIQUE INDEX uq_school_row_id_assessment_categories ON assessment_categories (school_id, id);

-- 2. Grading Schemes
CREATE TABLE grading_schemes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    source_type VARCHAR(50) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_grading_schemes_school FOREIGN KEY (school_id) REFERENCES schools(id),
    CONSTRAINT check_grading_schemes_source_type CHECK (source_type IN ('GHANA_NACCA_REFERENCE', 'SCHOOL_CUSTOM'))
);
CREATE INDEX idx_grading_schemes_school_id ON grading_schemes(school_id);
CREATE UNIQUE INDEX uq_school_row_id_grading_schemes ON grading_schemes (school_id, id);

-- 3. Grade Bands
CREATE TABLE grade_bands (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID NOT NULL,
    scheme_id UUID NOT NULL,
    grade VARCHAR(10) NOT NULL,
    minimum_score NUMERIC(5,2) NOT NULL,
    maximum_score NUMERIC(5,2) NOT NULL,
    remark VARCHAR(100),
    sequence INTEGER NOT NULL,
    is_pass BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_grade_bands_school FOREIGN KEY (school_id) REFERENCES schools(id),
    CONSTRAINT fk_grade_bands_school_scheme FOREIGN KEY (school_id, scheme_id) REFERENCES grading_schemes (school_id, id),
    CONSTRAINT uq_grade_bands_school_scheme_grade UNIQUE (school_id, scheme_id, grade),
    CONSTRAINT check_grade_bands_scores CHECK (minimum_score <= maximum_score)
);
CREATE INDEX idx_grade_bands_school_id ON grade_bands(school_id);

-- 4. Assessment Policies
CREATE TABLE assessment_policies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID NOT NULL UNIQUE,
    grading_scheme_id UUID,
    pass_mark NUMERIC(5,2),
    rounding_rule VARCHAR(50) NOT NULL DEFAULT 'NEAREST_WHOLE',
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_assessment_policies_school FOREIGN KEY (school_id) REFERENCES schools(id),
    CONSTRAINT fk_assessment_policies_school_scheme FOREIGN KEY (school_id, grading_scheme_id) REFERENCES grading_schemes (school_id, id),
    CONSTRAINT check_assessment_policies_rounding CHECK (rounding_rule IN ('NONE', 'NEAREST_WHOLE', 'ONE_DECIMAL'))
);
CREATE INDEX idx_assessment_policies_school_id ON assessment_policies(school_id);

-- 5. Result Corrections (Audit)
CREATE UNIQUE INDEX uq_school_row_id_assessment_results ON assessment_results (school_id, id);

CREATE TABLE result_corrections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID NOT NULL,
    result_id UUID NOT NULL,
    old_score NUMERIC(10,2),
    new_score NUMERIC(10,2),
    old_status VARCHAR(50),
    new_status VARCHAR(50),
    reason TEXT NOT NULL,
    changed_by UUID NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_result_corrections_school FOREIGN KEY (school_id) REFERENCES schools(id),
    CONSTRAINT fk_result_corrections_school_result FOREIGN KEY (school_id, result_id) REFERENCES assessment_results (school_id, id),
    CONSTRAINT fk_result_corrections_school_user FOREIGN KEY (school_id, changed_by) REFERENCES users (school_id, id)
);
CREATE INDEX idx_result_corrections_school_id ON result_corrections(school_id);

-- 6. Modify assessments
ALTER TABLE assessments ADD COLUMN category_id UUID;
ALTER TABLE assessments ADD CONSTRAINT fk_assessments_school_category FOREIGN KEY (school_id, category_id) REFERENCES assessment_categories (school_id, id);

ALTER TABLE assessments ADD COLUMN purpose VARCHAR(50);
ALTER TABLE assessments ADD CONSTRAINT check_assessments_purpose CHECK (purpose IN ('DIAGNOSTIC', 'FORMATIVE', 'SUMMATIVE', 'INTERNAL_ASSESSMENT'));

ALTER TABLE assessments ADD COLUMN lifecycle_status VARCHAR(50) NOT NULL DEFAULT 'DRAFT';
ALTER TABLE assessments ADD CONSTRAINT check_assessments_lifecycle CHECK (lifecycle_status IN ('DRAFT', 'SUBMITTED', 'REVIEWED', 'PUBLISHED', 'RETURNED'));

ALTER TABLE assessments ADD COLUMN counts_toward_final_result BOOLEAN NOT NULL DEFAULT TRUE;

-- Seed default category for existing assessments to not break them if we make them NOT NULL later
INSERT INTO assessment_categories (school_id, code, name, description)
SELECT DISTINCT school_id, 'DEFAULT', 'Default Category', 'System generated default category'
FROM assessments
ON CONFLICT DO NOTHING;

UPDATE assessments a
SET category_id = (SELECT id FROM assessment_categories c WHERE c.school_id = a.school_id AND c.code = 'DEFAULT'),
    purpose = 'SUMMATIVE'
WHERE a.category_id IS NULL;

-- 7. Modify assessment_results
ALTER TABLE assessment_results ALTER COLUMN score DROP NOT NULL;
ALTER TABLE assessment_results ADD COLUMN score_status VARCHAR(50) NOT NULL DEFAULT 'RECORDED';
ALTER TABLE assessment_results ADD CONSTRAINT check_assessment_results_status CHECK (score_status IN ('RECORDED', 'ABSENT', 'EXCUSED', 'MISSING'));
ALTER TABLE assessment_results ADD COLUMN is_pass BOOLEAN;

-- Ensure score is present if RECORDED
ALTER TABLE assessment_results ADD CONSTRAINT check_assessment_results_score_presence 
    CHECK ((score_status = 'RECORDED' AND score IS NOT NULL) OR (score_status <> 'RECORDED'));
