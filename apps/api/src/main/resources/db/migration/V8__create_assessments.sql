CREATE TABLE assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    teacher_assignment_id UUID NOT NULL REFERENCES teacher_assignments(id),
    assessment_date DATE NOT NULL,
    maximum_score NUMERIC(10,2) NOT NULL,
    weight NUMERIC(5,2) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_assessments_max_score CHECK (maximum_score > 0),
    CONSTRAINT check_assessments_weight_positive CHECK (weight > 0),
    CONSTRAINT check_assessments_weight_max CHECK (weight <= 100),
    CONSTRAINT check_assessments_type CHECK (type IN ('CLASS_TEST', 'ASSIGNMENT', 'QUIZ', 'PROJECT', 'MID_TERM', 'EXAM', 'OTHER')),
    CONSTRAINT check_assessments_status CHECK (status IN ('ACTIVE', 'INACTIVE'))
);

CREATE TABLE assessment_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assessment_id UUID NOT NULL REFERENCES assessments(id),
    enrollment_id UUID NOT NULL REFERENCES enrollments(id),
    score NUMERIC(10,2) NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_assessment_results_score CHECK (score >= 0),
    UNIQUE(assessment_id, enrollment_id)
);

CREATE INDEX idx_assessments_teacher_assignment_id ON assessments(teacher_assignment_id);
CREATE INDEX idx_assessments_status ON assessments(status);

CREATE INDEX idx_assessment_results_assessment_id ON assessment_results(assessment_id);
CREATE INDEX idx_assessment_results_enrollment_id ON assessment_results(enrollment_id);

