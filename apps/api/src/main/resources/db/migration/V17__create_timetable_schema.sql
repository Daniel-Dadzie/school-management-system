-- ============================================================
-- V17__create_timetable_schema.sql
-- Karatu SIS - Timetable Domain Schema
-- ============================================================

-- Configurable period/slot definitions per school
-- (e.g., "Period 1: 08:00-08:40", "Morning Break: 10:00-10:30")
CREATE TABLE timetable_periods (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id           UUID NOT NULL REFERENCES schools(id),
    name                VARCHAR(100) NOT NULL,
    start_time          TIME NOT NULL,
    end_time            TIME NOT NULL,
    type                VARCHAR(50) NOT NULL DEFAULT 'LESSON',
    sort_order          INTEGER NOT NULL DEFAULT 0,
    created_at          TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_timetable_period_type
        CHECK (type IN ('LESSON', 'BREAK', 'ASSEMBLY', 'SPORT', 'OTHER')),
    CONSTRAINT chk_timetable_period_times
        CHECK (end_time > start_time)
);

CREATE INDEX idx_timetable_periods_school_id ON timetable_periods(school_id, sort_order);

-- Weekly recurring timetable slots
-- One row = one class has one subject taught by one teacher in a specific period on a specific day
CREATE TABLE timetable_entries (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id           UUID NOT NULL REFERENCES schools(id),
    academic_year_id    UUID NOT NULL REFERENCES academic_years(id),
    term_id             UUID NOT NULL REFERENCES terms(id),
    school_class_id     UUID NOT NULL REFERENCES school_classes(id),
    period_id           UUID NOT NULL REFERENCES timetable_periods(id),
    day_of_week         INTEGER NOT NULL,   -- 1=Monday .. 5=Friday (configurable)
    subject_id          UUID REFERENCES subjects(id),
    teacher_id          UUID REFERENCES teachers(id),
    activity_name       VARCHAR(150),       -- used for BREAK / ASSEMBLY when no subject
    created_at          TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_timetable_entry_day
        CHECK (day_of_week BETWEEN 1 AND 7),
    -- A class cannot have two different entries in the same period/day within a term
    CONSTRAINT uq_timetable_class_slot
        UNIQUE (school_id, term_id, school_class_id, period_id, day_of_week)
);

CREATE INDEX idx_timetable_entries_school   ON timetable_entries(school_id);
CREATE INDEX idx_timetable_entries_lookup   ON timetable_entries(school_id, term_id, school_class_id);
CREATE INDEX idx_timetable_entries_teacher  ON timetable_entries(school_id, term_id, teacher_id);
