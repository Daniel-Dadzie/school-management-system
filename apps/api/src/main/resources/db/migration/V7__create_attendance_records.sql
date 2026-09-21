CREATE TABLE attendance_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    student_id UUID NOT NULL
        REFERENCES students(id),

    school_class_id UUID NOT NULL
        REFERENCES school_classes(id),

    subject_id UUID NOT NULL
        REFERENCES subjects(id),

    term_id UUID NOT NULL
        REFERENCES terms(id),

    attendance_date DATE NOT NULL,

    status VARCHAR(50) NOT NULL,

    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL
        DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL
        DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uq_attendance_identity
        UNIQUE (
            student_id,
            school_class_id,
            subject_id,
            term_id,
            attendance_date
        ),

    CONSTRAINT ck_attendance_status
        CHECK (
            status IN (
                'PRESENT',
                'ABSENT',
                'LATE',
                'EXCUSED'
            )
        )
);

CREATE INDEX idx_attendance_term_class_subject_date
    ON attendance_records (
        term_id,
        school_class_id,
        subject_id,
        attendance_date
    );

CREATE INDEX idx_attendance_term_student_subject
    ON attendance_records (
        term_id,
        student_id,
        subject_id
    );
