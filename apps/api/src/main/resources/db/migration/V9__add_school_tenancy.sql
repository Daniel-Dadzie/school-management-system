CREATE TABLE schools (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(80) NOT NULL UNIQUE,
    name VARCHAR(200) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(30),
    address VARCHAR(500),
    logo_url VARCHAR(1000),
    timezone VARCHAR(64) NOT NULL DEFAULT 'Africa/Accra',
    currency VARCHAR(3) NOT NULL DEFAULT 'GHS',
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO schools (id, slug, name)
VALUES ('00000000-0000-0000-0000-000000000001', 'carepoint', 'CarePoint Community School');

ALTER TABLE users ADD COLUMN school_id UUID;
ALTER TABLE teachers ADD COLUMN school_id UUID;
ALTER TABLE parents ADD COLUMN school_id UUID;
ALTER TABLE students ADD COLUMN school_id UUID;
ALTER TABLE parent_student ADD COLUMN school_id UUID;
ALTER TABLE admission_applications ADD COLUMN school_id UUID;
ALTER TABLE academic_years ADD COLUMN school_id UUID;
ALTER TABLE terms ADD COLUMN school_id UUID;
ALTER TABLE school_classes ADD COLUMN school_id UUID;
ALTER TABLE subjects ADD COLUMN school_id UUID;
ALTER TABLE enrollments ADD COLUMN school_id UUID;
ALTER TABLE teacher_assignments ADD COLUMN school_id UUID;
ALTER TABLE attendance_records ADD COLUMN school_id UUID;
ALTER TABLE assessments ADD COLUMN school_id UUID;
ALTER TABLE assessment_results ADD COLUMN school_id UUID;

UPDATE users SET school_id = '00000000-0000-0000-0000-000000000001';
UPDATE users SET role = 'IT_ADMIN' WHERE role = 'SUPER_ADMIN';
UPDATE teachers SET school_id = '00000000-0000-0000-0000-000000000001';
UPDATE parents SET school_id = '00000000-0000-0000-0000-000000000001';
UPDATE students SET school_id = '00000000-0000-0000-0000-000000000001';
UPDATE parent_student SET school_id = '00000000-0000-0000-0000-000000000001';
UPDATE admission_applications SET school_id = '00000000-0000-0000-0000-000000000001';
UPDATE academic_years SET school_id = '00000000-0000-0000-0000-000000000001';
UPDATE terms SET school_id = '00000000-0000-0000-0000-000000000001';
UPDATE school_classes SET school_id = '00000000-0000-0000-0000-000000000001';
UPDATE subjects SET school_id = '00000000-0000-0000-0000-000000000001';
UPDATE enrollments SET school_id = '00000000-0000-0000-0000-000000000001';
UPDATE teacher_assignments SET school_id = '00000000-0000-0000-0000-000000000001';
UPDATE attendance_records SET school_id = '00000000-0000-0000-0000-000000000001';
UPDATE assessments SET school_id = '00000000-0000-0000-0000-000000000001';
UPDATE assessment_results SET school_id = '00000000-0000-0000-0000-000000000001';

ALTER TABLE users ADD CONSTRAINT fk_users_school FOREIGN KEY (school_id) REFERENCES schools(id);
ALTER TABLE users ADD CONSTRAINT chk_users_platform_role_scope
    CHECK ((role = 'SUPER_ADMIN' AND school_id IS NULL) OR (role <> 'SUPER_ADMIN' AND school_id IS NOT NULL));
ALTER TABLE teachers ALTER COLUMN school_id SET NOT NULL;
ALTER TABLE parents ALTER COLUMN school_id SET NOT NULL;
ALTER TABLE students ALTER COLUMN school_id SET NOT NULL;
ALTER TABLE parent_student ALTER COLUMN school_id SET NOT NULL;
ALTER TABLE admission_applications ALTER COLUMN school_id SET NOT NULL;
ALTER TABLE academic_years ALTER COLUMN school_id SET NOT NULL;
ALTER TABLE terms ALTER COLUMN school_id SET NOT NULL;
ALTER TABLE school_classes ALTER COLUMN school_id SET NOT NULL;
ALTER TABLE subjects ALTER COLUMN school_id SET NOT NULL;
ALTER TABLE enrollments ALTER COLUMN school_id SET NOT NULL;
ALTER TABLE teacher_assignments ALTER COLUMN school_id SET NOT NULL;
ALTER TABLE attendance_records ALTER COLUMN school_id SET NOT NULL;
ALTER TABLE assessments ALTER COLUMN school_id SET NOT NULL;
ALTER TABLE assessment_results ALTER COLUMN school_id SET NOT NULL;

DO $$
DECLARE table_name TEXT;
BEGIN
    FOREACH table_name IN ARRAY ARRAY[
        'teachers', 'parents', 'students', 'parent_student', 'admission_applications',
        'academic_years', 'terms', 'school_classes', 'subjects', 'enrollments',
        'teacher_assignments', 'attendance_records', 'assessments', 'assessment_results'
    ] LOOP
        EXECUTE format('ALTER TABLE %I ADD CONSTRAINT %I FOREIGN KEY (school_id) REFERENCES schools(id)', table_name, 'fk_' || table_name || '_school');
        EXECUTE format('CREATE INDEX %I ON %I (school_id)', 'idx_' || table_name || '_school_id', table_name);
    END LOOP;
END $$;

CREATE UNIQUE INDEX uq_academic_years_school_name ON academic_years (school_id, name);
DROP INDEX idx_academic_years_active_status;
CREATE UNIQUE INDEX uq_academic_years_school_active ON academic_years (school_id) WHERE status = 'ACTIVE';
ALTER TABLE academic_years DROP CONSTRAINT academic_years_name_key;

CREATE UNIQUE INDEX uq_school_classes_school_name ON school_classes (school_id, name);
ALTER TABLE school_classes DROP CONSTRAINT school_classes_name_key;
CREATE UNIQUE INDEX uq_subjects_school_code ON subjects (school_id, code);
CREATE UNIQUE INDEX uq_students_school_admission_number ON students (school_id, admission_number);
ALTER TABLE students DROP CONSTRAINT students_admission_number_key;
CREATE UNIQUE INDEX uq_teachers_school_staff_number ON teachers (school_id, staff_number);
ALTER TABLE teachers DROP CONSTRAINT teachers_staff_number_key;

CREATE UNIQUE INDEX uq_users_school_row_id ON users (school_id, id);
CREATE INDEX idx_users_school_id ON users (school_id);
CREATE UNIQUE INDEX uq_school_row_id_academic_years ON academic_years (school_id, id);
CREATE UNIQUE INDEX uq_school_row_id_terms ON terms (school_id, id);
CREATE UNIQUE INDEX uq_school_row_id_classes ON school_classes (school_id, id);
CREATE UNIQUE INDEX uq_school_row_id_subjects ON subjects (school_id, id);
CREATE UNIQUE INDEX uq_school_row_id_students ON students (school_id, id);
CREATE UNIQUE INDEX uq_school_row_id_parents ON parents (school_id, id);
CREATE UNIQUE INDEX uq_school_row_id_teachers ON teachers (school_id, id);
CREATE UNIQUE INDEX uq_school_row_id_parent_student ON parent_student (school_id, parent_id, student_id);
CREATE UNIQUE INDEX uq_school_row_id_enrollments ON enrollments (school_id, id);
CREATE UNIQUE INDEX uq_school_row_id_assignments ON teacher_assignments (school_id, id);
CREATE UNIQUE INDEX uq_school_row_id_assessments ON assessments (school_id, id);

ALTER TABLE teachers ADD CONSTRAINT fk_teachers_school_user FOREIGN KEY (school_id, user_id) REFERENCES users (school_id, id);
ALTER TABLE parents ADD CONSTRAINT fk_parents_school_user FOREIGN KEY (school_id, user_id) REFERENCES users (school_id, id);
ALTER TABLE parent_student ADD CONSTRAINT fk_parent_student_school_parent FOREIGN KEY (school_id, parent_id) REFERENCES parents (school_id, id);
ALTER TABLE parent_student ADD CONSTRAINT fk_parent_student_school_student FOREIGN KEY (school_id, student_id) REFERENCES students (school_id, id);
ALTER TABLE terms ADD CONSTRAINT fk_terms_school_year FOREIGN KEY (school_id, academic_year_id) REFERENCES academic_years (school_id, id);
ALTER TABLE enrollments ADD CONSTRAINT fk_enrollments_school_student FOREIGN KEY (school_id, student_id) REFERENCES students (school_id, id);
ALTER TABLE enrollments ADD CONSTRAINT fk_enrollments_school_year FOREIGN KEY (school_id, academic_year_id) REFERENCES academic_years (school_id, id);
ALTER TABLE enrollments ADD CONSTRAINT fk_enrollments_school_class FOREIGN KEY (school_id, school_class_id) REFERENCES school_classes (school_id, id);
ALTER TABLE teacher_assignments ADD CONSTRAINT fk_assignments_school_teacher FOREIGN KEY (school_id, teacher_id) REFERENCES teachers (school_id, id);
ALTER TABLE teacher_assignments ADD CONSTRAINT fk_assignments_school_subject FOREIGN KEY (school_id, subject_id) REFERENCES subjects (school_id, id);
ALTER TABLE teacher_assignments ADD CONSTRAINT fk_assignments_school_class FOREIGN KEY (school_id, school_class_id) REFERENCES school_classes (school_id, id);
ALTER TABLE teacher_assignments ADD CONSTRAINT fk_assignments_school_year FOREIGN KEY (school_id, academic_year_id) REFERENCES academic_years (school_id, id);
ALTER TABLE teacher_assignments ADD CONSTRAINT fk_assignments_school_term FOREIGN KEY (school_id, term_id) REFERENCES terms (school_id, id);
ALTER TABLE attendance_records ADD CONSTRAINT fk_attendance_school_student FOREIGN KEY (school_id, student_id) REFERENCES students (school_id, id);
ALTER TABLE attendance_records ADD CONSTRAINT fk_attendance_school_class FOREIGN KEY (school_id, school_class_id) REFERENCES school_classes (school_id, id);
ALTER TABLE attendance_records ADD CONSTRAINT fk_attendance_school_subject FOREIGN KEY (school_id, subject_id) REFERENCES subjects (school_id, id);
ALTER TABLE attendance_records ADD CONSTRAINT fk_attendance_school_term FOREIGN KEY (school_id, term_id) REFERENCES terms (school_id, id);
ALTER TABLE assessments ADD CONSTRAINT fk_assessments_school_assignment FOREIGN KEY (school_id, teacher_assignment_id) REFERENCES teacher_assignments (school_id, id);
ALTER TABLE assessment_results ADD CONSTRAINT fk_results_school_assessment FOREIGN KEY (school_id, assessment_id) REFERENCES assessments (school_id, id);
ALTER TABLE assessment_results ADD CONSTRAINT fk_results_school_enrollment FOREIGN KEY (school_id, enrollment_id) REFERENCES enrollments (school_id, id);

CREATE OR REPLACE FUNCTION enforce_parent_student_school() RETURNS trigger AS $$
DECLARE parent_school UUID;
DECLARE student_school UUID;
BEGIN
    SELECT school_id INTO parent_school FROM parents WHERE id = NEW.parent_id;
    SELECT school_id INTO student_school FROM students WHERE id = NEW.student_id;
    IF parent_school IS NULL OR student_school IS NULL OR parent_school <> student_school THEN
        RAISE EXCEPTION 'Parent and student must belong to the same school';
    END IF;
    NEW.school_id := parent_school;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_parent_student_school
BEFORE INSERT OR UPDATE OF parent_id, student_id ON parent_student
FOR EACH ROW EXECUTE FUNCTION enforce_parent_student_school();
