# TASK 004 Architecture Review — Teacher & Parent Domain Foundation

> **Status: READY FOR FINAL HUMAN APPROVAL — IMPLEMENTATION NOT STARTED**

---

## 1. Executive Summary

This document is the architectural review and design proposal for the Teacher & Parent Domain Foundation (TASK 004).

It verifies the current repository state, confirms the successful implementation of TASK 002 (Database Foundation) and TASK 003 (Authentication & Security Foundation), and proposes a comprehensive, corrected domain model for Teachers, Parents, Students, Academic structures, and Enrollments.

All open architectural questions have been resolved. No implementation has started.

**TASK 004 architecture is ready for implementation after Daniel's final approval.**

---

## 2. Repository State Verification

| Item | Result |
|---|---|
| Branch | `develop` |
| Working Tree | Clean |
| Latest Commit | `b9115a9 docs: add report.md` |
| Application Lock Commit | `263f845 feat(auth): implement JWT authentication foundation` |
| Flyway Migrations | `V1__init.sql`, `V2__create_auth_schema.sql` |
| Domain Entities | `User.java`, `Role.java` (both under `com.schoolmanagement.auth.domain`) |
| School Domain Entities | **None** — no Teacher, Parent, Student, Class, Subject, Enrollment, or Assignment entities exist |

### Confirmed: No `model` package exists

A comprehensive search (`git ls-files`, `Get-ChildItem -Recurse`, `git log --name-status`) confirmed:

- `src/main/java/com/schoolmanagement/auth/model/User.java` — **does not exist**
- `src/main/java/com/schoolmanagement/auth/model/Role.java` — **does not exist**

The only representations are:

- `apps/api/src/main/java/com/schoolmanagement/auth/domain/User.java`
- `apps/api/src/main/java/com/schoolmanagement/auth/domain/Role.java`

There is a single canonical User/Role model. No duplication or transitional code exists.

---

## 3. TASK 002 Database Foundation Verification

| Component | Status |
|---|---|
| PostgreSQL (local) | Docker Compose; verified running |
| Flyway | Schema authority; `validate` mode enforced |
| Hibernate `ddl-auto` | `validate` — Hibernate cannot silently alter schema |
| V1 Migration | Enables `uuid-ossp`, `pgcrypto` extensions |
| V2 Migration | Creates `users` table with all required columns and indexes |
| Testcontainers | Functional; all 15 integration tests pass |
| Redis | Deferred (no current requirement) |
| Production DB | Supabase PostgreSQL configured via `application-prod.yml` |

---

## 4. TASK 003 Authentication Verification

| Component | Status |
|---|---|
| User model | UUID PK, email (UNIQUE), username (UNIQUE), password_hash, role, enabled, created_at, updated_at |
| Role enum | `SUPER_ADMIN`, `ADMIN`, `TEACHER`, `PARENT` |
| Login endpoint | `POST /api/v1/auth/login` — identifier (email or username) + password |
| JWT | Stateless JWT; HS256; no fallback secret in production |
| BCrypt | Used for password hashing |
| Auth filter | `JwtAuthenticationFilter` correctly validates tokens |
| Security config | Stateless session; 401/403 handlers configured |
| CORS | Not wildcard in production |
| DTO boundary | `AuthResponse` / `LoginRequest` — entities never exposed directly |
| Tests | 15 tests: 0 failures, 0 errors, 0 skipped — BUILD SUCCESS |
| Outstanding issues | **None** |

---

## 5. Current Domain State

The repository currently contains:

- The `users` table and `User`/`Role` domain entities (authentication layer).
- No school domain tables, entities, repositories, services, or controllers.

All school-domain work begins in TASK 004.

---

## 6. Proposed Domain Model

### Core architectural principles

- **Authentication separation:** `User` handles authentication only. `Teacher` and `Parent` are distinct domain entities with a one-to-one relationship to `User`.
- **Students do not authenticate:** `Student` has no `user_id` relationship in the MVP.
- **Reusable academic metadata:** `Class` and `Subject` are reusable logical entities across academic years.
- **Time-bound records:** `Enrollment` connects Student + Class + AcademicYear. `TeacherAssignment` connects Teacher + Class + Subject + AcademicYear + Term.
- **Historical integrity:** Records are never deleted. Soft status changes preserve historical context.

---

## 7. Entity-by-Entity Design

### 7.1 User (existing — do not modify)

Already implemented in TASK 003.

- Package: `com.schoolmanagement.auth.domain.User`
- Fields: `id`, `email`, `username`, `passwordHash`, `role`, `enabled`, `createdAt`, `updatedAt`
- Roles: `SUPER_ADMIN`, `ADMIN`, `TEACHER`, `PARENT`

Teacher and Parent entities **must reference this class** via a one-to-one relationship. No second User model must be created.

---

### 7.2 Teacher

**Purpose:** Represents a staff member with teaching responsibilities in the school.

| Field | Type | Constraint |
|---|---|---|
| `id` | UUID | PK |
| `user_id` | UUID | FK → users(id), UNIQUE, NOT NULL |
| `staff_number` | VARCHAR(50) | UNIQUE, NOT NULL |
| `first_name` | VARCHAR(100) | NOT NULL |
| `last_name` | VARCHAR(100) | NOT NULL |
| `phone` | VARCHAR(20) | nullable |
| `status` | VARCHAR(20) | NOT NULL, DEFAULT 'ACTIVE' |
| `created_at` | TIMESTAMP | NOT NULL, auto-set |
| `updated_at` | TIMESTAMP | NOT NULL, auto-set |

**Status values:** `ACTIVE`, `INACTIVE`

**Key decisions:**
- The `User` record handles login; the `Teacher` record handles domain/profile data.
- Teacher records are retained even after a user account is deactivated. Historical assignments depend on teacher records surviving.
- `staff_number` is globally unique.

---

### 7.3 Parent

**Purpose:** Represents a parent or guardian who can log in and access linked wards.

| Field | Type | Constraint |
|---|---|---|
| `id` | UUID | PK |
| `user_id` | UUID | FK → users(id), UNIQUE, NOT NULL |
| `first_name` | VARCHAR(100) | NOT NULL |
| `last_name` | VARCHAR(100) | NOT NULL |
| `phone` | VARCHAR(20) | nullable |
| `address` | TEXT | nullable |
| `created_at` | TIMESTAMP | NOT NULL, auto-set |
| `updated_at` | TIMESTAMP | NOT NULL, auto-set |

**Key decisions:**
- Parent profile information is separate from authentication.
- Parent → Student access is controlled through `ParentStudent`, not through User directly.

---

### 7.4 Student

**Purpose:** Core academic entity representing a student enrolled in the school. Students do **not** authenticate in the MVP.

| Field | Type | Constraint |
|---|---|---|
| `id` | UUID | PK |
| `admission_number` | VARCHAR(50) | UNIQUE, NOT NULL |
| `first_name` | VARCHAR(100) | NOT NULL |
| `last_name` | VARCHAR(100) | NOT NULL |
| `date_of_birth` | DATE | NOT NULL |
| `gender` | VARCHAR(10) | nullable |
| `status` | VARCHAR(20) | NOT NULL, DEFAULT 'ENROLLED' |
| `created_at` | TIMESTAMP | NOT NULL, auto-set |
| `updated_at` | TIMESTAMP | NOT NULL, auto-set |

**Student status values:** `ENROLLED`, `TRANSFERRED`, `GRADUATED`, `SUSPENDED`

Student status describes the student's overall lifecycle (independent of any specific academic year).

**Key decisions:**
- `Student` has **no** `user_id` field in the MVP.
- Historical enrollment and result records must remain intact regardless of student status changes.
- `admission_number` is globally unique.

---

### 7.5 ParentStudent

**Purpose:** Resolves the many-to-many relationship between Parent and Student. Carries relationship metadata.

| Field | Type | Constraint |
|---|---|---|
| `parent_id` | UUID | PK component, FK → parents(id) |
| `student_id` | UUID | PK component, FK → students(id) |
| `relationship_type` | VARCHAR(50) | NOT NULL |
| `is_primary` | BOOLEAN | NOT NULL, DEFAULT FALSE |
| `is_emergency_contact` | BOOLEAN | NOT NULL, DEFAULT FALSE |

**Primary Key:** Composite (`parent_id`, `student_id`)

**Relationship type values (Java enum `RelationshipType`):** `MOTHER`, `FATHER`, `GUARDIAN`, `OTHER`

**Field semantics:**
- `is_primary` — identifies the primary parent/guardian contact for the student. A student may have multiple linked parents but one is designated primary.
- `is_emergency_contact` — identifies whether this specific relationship is authorized as an emergency contact.

**ParentStudent relationship_type design decision:**

| Approach | Decision |
|---|---|
| PostgreSQL ENUM | **Rejected** — adding a new type requires an `ALTER TYPE` DDL statement |
| `VARCHAR` + Java enum | **Adopted** — Java enforces type safety via `RelationshipType` enum; PostgreSQL retains schema flexibility |

Accepted values are controlled at the application layer. Adding a new relationship type only requires a Java enum change and no schema migration.

---

### 7.6 AcademicYear

**Purpose:** Defines the overarching school year (e.g., 2026/2027).

| Field | Type | Constraint |
|---|---|---|
| `id` | UUID | PK |
| `code` | VARCHAR(20) | UNIQUE, NOT NULL (e.g., "2026/2027") |
| `start_date` | DATE | NOT NULL |
| `end_date` | DATE | NOT NULL |
| `status` | VARCHAR(20) | NOT NULL, DEFAULT 'PLANNED' |
| `created_at` | TIMESTAMP | NOT NULL, auto-set |

**Status values:** `PLANNED`, `ACTIVE`, `COMPLETED`

Only one academic year should be `ACTIVE` at a time (enforced at application level).

---

### 7.7 Term

**Purpose:** Subdivides an academic year into teaching periods (e.g., Term 1, Term 2, Term 3).

| Field | Type | Constraint |
|---|---|---|
| `id` | UUID | PK |
| `academic_year_id` | UUID | NOT NULL, FK → academic_years(id) |
| `name` | VARCHAR(50) | NOT NULL (e.g., "Term 1") |
| `start_date` | DATE | NOT NULL |
| `end_date` | DATE | NOT NULL |
| `status` | VARCHAR(20) | NOT NULL, DEFAULT 'PLANNED' |
| `created_at` | TIMESTAMP | NOT NULL, auto-set |

**Status values:** `PLANNED`, `ACTIVE`, `COMPLETED`

**UNIQUE constraint:** (`academic_year_id`, `name`) — prevents duplicate term names within the same academic year.

---

### 7.8 Class

**Purpose:** Represents a reusable logical class section (e.g., "JSS 1A", "JSS 2B"). Classes are not year-specific.

| Field | Type | Constraint |
|---|---|---|
| `id` | UUID | PK |
| `name` | VARCHAR(50) | UNIQUE, NOT NULL |
| `level` | VARCHAR(50) | NOT NULL |
| `created_at` | TIMESTAMP | NOT NULL, auto-set |

**Class/Year relationship — explicit domain decision:**

The MVP treats `Class` as a **reusable logical section identity** that persists across academic years.

```
JSS 1A  (Class — reusable, exists permanently)
    └── 2025/2026 → [Student A, Student B, ...]  (via Enrollment)
    └── 2026/2027 → [Student C, Student D, ...]  (via Enrollment)
```

`Enrollment` carries the time-bound relationship between Student, Class, and AcademicYear.

**Implication:** `Class.name` is globally unique because each class represents a distinct logical section of the school. Creating year-specific classes (e.g., "JSS 1A 2026/2027") is explicitly rejected for the MVP.

> **Domain assumption requiring school confirmation:** The assumption is that CarePoint's class sections (e.g., "JSS 1A") remain fixed organizational units year over year. If the school reorganizes class sections between years, this design should be revisited. This is documented as a domain assumption, not a universal truth.

---

### 7.9 Subject

**Purpose:** Represents a reusable area of academic study (e.g., "Mathematics", "English Language").

| Field | Type | Constraint |
|---|---|---|
| `id` | UUID | PK |
| `code` | VARCHAR(20) | UNIQUE, NOT NULL |
| `name` | VARCHAR(100) | NOT NULL |
| `active` | BOOLEAN | NOT NULL, DEFAULT TRUE |
| `created_at` | TIMESTAMP | NOT NULL, auto-set |

Subjects are reusable across academic years. They are referenced by `TeacherAssignment` and future `Assessment` entities.

---

### 7.10 Enrollment

**Purpose:** Maps a student to a class for a specific academic year. Represents the student's official academic placement for that year.

| Field | Type | Constraint |
|---|---|---|
| `id` | UUID | PK |
| `student_id` | UUID | NOT NULL, FK → students(id) |
| `class_id` | UUID | NOT NULL, FK → classes(id) |
| `academic_year_id` | UUID | NOT NULL, FK → academic_years(id) |
| `status` | VARCHAR(20) | NOT NULL, DEFAULT 'ACTIVE' |
| `created_at` | TIMESTAMP | NOT NULL, auto-set |

**UNIQUE constraint:** `(student_id, academic_year_id)` — one student has exactly one official enrollment per academic year.

**Enrollment status values (`EnrollmentStatus` Java enum):**

| Status | Meaning |
|---|---|
| `ACTIVE` | Student is currently enrolled in that class for that academic year |
| `COMPLETED` | Student successfully completed that enrollment period |
| `TRANSFERRED` | Student left or transferred during that enrollment period |
| `WITHDRAWN` | Student was withdrawn from that enrollment |

**Student status vs Enrollment status — critical distinction:**

- `Student.status` (e.g., `ENROLLED`) describes the student's **overall lifecycle** in the school system.
- `Enrollment.status` describes the student's **participation in one specific academic year**.

Example:
```
Student.status = ENROLLED
  └── 2024/2025 Enrollment → COMPLETED
  └── 2025/2026 Enrollment → COMPLETED
  └── 2026/2027 Enrollment → ACTIVE
```

Enrollment status must not be used as a replacement for student status.

**Promotion:** When a student is promoted, the current enrollment is marked `COMPLETED` and a new enrollment record is created for the new academic year and class. Historical enrollment records remain immutable.

---

### 7.11 TeacherAssignment

**Purpose:** Records which teacher is assigned to teach which subject to which class for a specific academic year and term. This is the cornerstone of future teacher authorization.

| Field | Type | Constraint |
|---|---|---|
| `id` | UUID | PK |
| `teacher_id` | UUID | NOT NULL, FK → teachers(id) |
| `subject_id` | UUID | NOT NULL, FK → subjects(id) |
| `class_id` | UUID | NOT NULL, FK → classes(id) |
| `academic_year_id` | UUID | NOT NULL, FK → academic_years(id) |
| `term_id` | UUID | **NOT NULL**, FK → terms(id) |
| `status` | VARCHAR(20) | NOT NULL, DEFAULT 'ACTIVE' |
| `created_at` | TIMESTAMP | NOT NULL, auto-set |
| `updated_at` | TIMESTAMP | NOT NULL, auto-set |

**UNIQUE constraint:** `(teacher_id, subject_id, class_id, academic_year_id, term_id)` — prevents duplicate assignments for the same teacher, subject, class, academic year, and term.

**Assignment status values (`AssignmentStatus` Java enum):** `ACTIVE`, `INACTIVE`

**`term_id` is NOT NULL — rationale:**

Teacher authorization must be able to determine exactly which academic period a teacher is authorized to act in. A nullable term would create ambiguity in authorization checks.

```
Teacher → TeacherAssignment (term_id NOT NULL) → authorized for this term only
```

If a teacher teaches the same subject/class across multiple terms, the system creates separate term-specific assignments:

```
Term 1: Teacher A → Mathematics → JSS 1A → 2026/2027
Term 2: Teacher A → Mathematics → JSS 1A → 2026/2027
Term 3: Teacher A → Mathematics → JSS 1A → 2026/2027
```

This design supports future scenarios where assignments change mid-year or between terms.

**No `dropped_at` field in MVP:**

The exact date an assignment ended within a term is **not required for the MVP**. The `status` field (ACTIVE/INACTIVE) combined with `updated_at` provides sufficient audit context. If a business requirement for precise assignment-end timestamps emerges post-MVP, a new migration can add `dropped_at`.

**Historical retention:**

Inactive assignments must **never be deleted**. Historical authorization context, grade auditing, and result tracing may depend on knowing which teacher was assigned to a class/subject at a specific time.

---

## 8. Relationship Model

```
User ────────────── Teacher
  │                    │
  │                    └── TeacherAssignment
  │                            ├── Class
  │                            ├── Subject
  │                            ├── AcademicYear
  │                            └── Term (NOT NULL)
  │
  └── Parent
          │
          └── ParentStudent ── Student
                                  │
                                  └── Enrollment
                                          ├── Class
                                          └── AcademicYear
```

**Student has NO relationship to User in the MVP.**

---

## 9. Database Schema Proposal (V3)

The next migration will be `V3__create_school_domain_schema.sql`. No changes to `V1` or `V2` are permitted.

> This is a design proposal. No SQL file has been created.

```sql
-- ============================================================
-- TEACHERS
-- ============================================================
CREATE TABLE teachers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id),
    staff_number VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_teachers_user_id ON teachers(user_id);
CREATE INDEX idx_teachers_staff_number ON teachers(staff_number);

-- ============================================================
-- PARENTS
-- ============================================================
CREATE TABLE parents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_parents_user_id ON parents(user_id);

-- ============================================================
-- STUDENTS
-- ============================================================
CREATE TABLE students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admission_number VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    date_of_birth DATE NOT NULL,
    gender VARCHAR(10),
    status VARCHAR(20) NOT NULL DEFAULT 'ENROLLED',
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_students_admission_number ON students(admission_number);
CREATE INDEX idx_students_status ON students(status);

-- ============================================================
-- PARENT_STUDENT
-- ============================================================
CREATE TABLE parent_student (
    parent_id UUID NOT NULL REFERENCES parents(id),
    student_id UUID NOT NULL REFERENCES students(id),
    relationship_type VARCHAR(50) NOT NULL,
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    is_emergency_contact BOOLEAN NOT NULL DEFAULT FALSE,
    PRIMARY KEY (parent_id, student_id)
);

CREATE INDEX idx_parent_student_student_id ON parent_student(student_id);

-- ============================================================
-- ACADEMIC YEARS
-- ============================================================
CREATE TABLE academic_years (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(20) UNIQUE NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PLANNED',
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- TERMS
-- ============================================================
CREATE TABLE terms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    academic_year_id UUID NOT NULL REFERENCES academic_years(id),
    name VARCHAR(50) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PLANNED',
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (academic_year_id, name)
);

CREATE INDEX idx_terms_academic_year_id ON terms(academic_year_id);

-- ============================================================
-- CLASSES
-- ============================================================
CREATE TABLE classes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) UNIQUE NOT NULL,
    level VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- SUBJECTS
-- ============================================================
CREATE TABLE subjects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- ENROLLMENTS
-- ============================================================
CREATE TABLE enrollments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students(id),
    class_id UUID NOT NULL REFERENCES classes(id),
    academic_year_id UUID NOT NULL REFERENCES academic_years(id),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (student_id, academic_year_id)
);

CREATE INDEX idx_enrollments_student_id ON enrollments(student_id);
CREATE INDEX idx_enrollments_class_id ON enrollments(class_id);
CREATE INDEX idx_enrollments_academic_year_id ON enrollments(academic_year_id);

-- ============================================================
-- TEACHER ASSIGNMENTS
-- ============================================================
CREATE TABLE teacher_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    teacher_id UUID NOT NULL REFERENCES teachers(id),
    subject_id UUID NOT NULL REFERENCES subjects(id),
    class_id UUID NOT NULL REFERENCES classes(id),
    academic_year_id UUID NOT NULL REFERENCES academic_years(id),
    term_id UUID NOT NULL REFERENCES terms(id),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (teacher_id, subject_id, class_id, academic_year_id, term_id)
);

CREATE INDEX idx_teacher_assignments_teacher_id ON teacher_assignments(teacher_id);
CREATE INDEX idx_teacher_assignments_class_id ON teacher_assignments(class_id);
CREATE INDEX idx_teacher_assignments_academic_year_id ON teacher_assignments(academic_year_id);
CREATE INDEX idx_teacher_assignments_term_id ON teacher_assignments(term_id);
```

---

## 10. JPA Mapping Proposal

### General principles

- **UUID:** Use `@GeneratedValue(strategy = GenerationType.AUTO)` with `UUID` type, consistent with the existing `User` entity.
- **Enums:** Persisted as `@Enumerated(EnumType.STRING)`. PostgreSQL stores VARCHAR. No PostgreSQL-specific ENUM types.
- **Timestamps:** Use `LocalDateTime` with `@PrePersist` / `@PreUpdate` lifecycle hooks, consistent with the existing `User` entity.
- **Lazy loading:** All `@ManyToOne` and `@OneToOne` associations must declare `fetch = FetchType.LAZY` explicitly.
- **No bidirectional collections on aggregate roots:** Avoid `@OneToMany` collections on `Class`, `AcademicYear`, or `Term` that would eagerly load thousands of records.
- **No `CascadeType.ALL`:** Cascade operations must be deliberate. Use `CascadeType.PERSIST` or `CascadeType.MERGE` where appropriate; never cascade `REMOVE` on historically significant associations.

### Key entity relationships

#### Teacher
```java
@OneToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "user_id", unique = true, nullable = false)
private User user;
```

#### Parent
```java
@OneToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "user_id", unique = true, nullable = false)
private User user;
```

#### ParentStudent (composite key entity)
```java
@Embeddable
public class ParentStudentId implements Serializable {
    private UUID parentId;
    private UUID studentId;
}

@Entity
public class ParentStudent {
    @EmbeddedId
    private ParentStudentId id;

    @Enumerated(EnumType.STRING)
    @Column(name = "relationship_type", nullable = false)
    private RelationshipType relationshipType;

    @Column(name = "is_primary", nullable = false)
    private boolean isPrimary;

    @Column(name = "is_emergency_contact", nullable = false)
    private boolean isEmergencyContact;
    // ...
}
```

#### Enrollment
```java
@Enumerated(EnumType.STRING)
@Column(nullable = false)
private EnrollmentStatus status;

@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "student_id", nullable = false)
private Student student;

@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "class_id", nullable = false)
private SchoolClass schoolClass;

@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "academic_year_id", nullable = false)
private AcademicYear academicYear;
```

#### TeacherAssignment
```java
@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "teacher_id", nullable = false)
private Teacher teacher;

@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "subject_id", nullable = false)
private Subject subject;

@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "class_id", nullable = false)
private SchoolClass schoolClass;

@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "academic_year_id", nullable = false)
private AcademicYear academicYear;

@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "term_id", nullable = false)   // NOT NULL — mandatory
private Term term;

@Enumerated(EnumType.STRING)
@Column(nullable = false)
private AssignmentStatus status;
```

> **Note:** `class` is a reserved keyword in Java. The entity should be named `SchoolClass` while mapping to the `classes` table via `@Table(name = "classes")`.

---

## 11. Authorization Implications

These implications document how TASK 004's domain model enables future authorization. No authorization code is being implemented in TASK 004.

### Teacher authorization (future implementation)

```
authenticated User
      ↓ (user_id)
Teacher
      ↓
TeacherAssignment (status = ACTIVE)
      ├── class_id
      ├── subject_id
      ├── academic_year_id
      └── term_id (NOT NULL — enables precise period check)
```

A teacher can only perform academic operations (attendance, assessments, grades) for assignments where:
- Assignment exists for their `teacher_id`
- Assignment references the specific `class_id`, `subject_id`, `academic_year_id`, and `term_id`
- Assignment `status = ACTIVE`

Making `term_id` NOT NULL is critical: it prevents authorization ambiguity where a teacher might claim access for "the whole year" when only assigned for specific terms.

### Parent authorization (future implementation)

```
authenticated User
      ↓ (user_id)
Parent
      ↓
ParentStudent
      ↓ (student_id)
Student
```

A parent can only access data for students explicitly linked through `ParentStudent`. Unlinked students are never visible.

### Admin authorization

`ADMIN` role holders have school-wide academic authority. They bypass teacher assignment checks but are still subject to audit logging.

### Promotion authority

Promotion is a Principal/Admin decision. It creates a new `Enrollment` for the next academic year. Teachers cannot trigger promotions through their assignment context.

### Historical authorization audit

Because `TeacherAssignment` records are never deleted (only deactivated), a historical query can always determine who was authorized to act on a class/subject at any given time. This is essential for auditing grade entries and attendance records after the fact.

---

## 12. API Boundary Proposal

> No controllers are being built in the architecture phase.

All endpoints use the `/api/v1/` prefix.

| Resource | Method | Path | Authorization | Purpose |
|---|---|---|---|---|
| Teachers | GET | `/api/v1/teachers` | ADMIN, SUPER_ADMIN | List all teachers |
| Teachers | POST | `/api/v1/teachers` | ADMIN | Create teacher profile |
| Teachers | GET | `/api/v1/teachers/{id}` | ADMIN, or self (TEACHER) | Get teacher profile |
| Teachers | PUT | `/api/v1/teachers/{id}` | ADMIN | Update teacher profile |
| Teachers | GET | `/api/v1/teachers/me` | TEACHER | Get own profile |
| Teacher Assignments | GET | `/api/v1/teacher-assignments` | ADMIN | List assignments |
| Teacher Assignments | POST | `/api/v1/teacher-assignments` | ADMIN | Create assignment |
| Teacher Assignments | PATCH | `/api/v1/teacher-assignments/{id}/status` | ADMIN | Activate/deactivate |
| Parents | GET | `/api/v1/parents` | ADMIN | List all parents |
| Parents | POST | `/api/v1/parents` | ADMIN | Create parent profile |
| Parents | GET | `/api/v1/parents/{id}` | ADMIN, or self (PARENT) | Get parent profile |
| Parents | GET | `/api/v1/parents/me` | PARENT | Get own profile |
| Parents | GET | `/api/v1/parents/me/students` | PARENT | Get linked wards |
| Students | GET | `/api/v1/students` | ADMIN, TEACHER | List students |
| Students | POST | `/api/v1/students` | ADMIN | Create student |
| Students | GET | `/api/v1/students/{id}` | ADMIN, TEACHER (if assigned), PARENT (if linked) | Get student |
| Students | GET | `/api/v1/students/{id}/enrollments` | ADMIN | Get enrollment history |
| Academic Years | GET | `/api/v1/academic-years` | authenticated | List academic years |
| Academic Years | POST | `/api/v1/academic-years` | ADMIN | Create academic year |
| Terms | GET | `/api/v1/academic-years/{id}/terms` | authenticated | List terms |
| Terms | POST | `/api/v1/academic-years/{id}/terms` | ADMIN | Create term |
| Classes | GET | `/api/v1/classes` | authenticated | List classes |
| Classes | POST | `/api/v1/classes` | ADMIN | Create class |
| Subjects | GET | `/api/v1/subjects` | authenticated | List subjects |
| Subjects | POST | `/api/v1/subjects` | ADMIN | Create subject |
| Enrollments | GET | `/api/v1/enrollments` | ADMIN | List enrollments |
| Enrollments | POST | `/api/v1/enrollments` | ADMIN | Enroll student |
| Enrollments | PATCH | `/api/v1/enrollments/{id}/status` | ADMIN | Update status |

**All responses must use DTOs. No JPA entities may be serialized directly.**

---

## 13. Architectural Alternatives

### 13.1 User/Teacher/Parent relationship

**Option A: Merge profile fields into `users` table**

Advantages: Simple; single table query to get all user data.

Disadvantages: `users` table grows with domain-specific fields; Student (who has no auth) cannot cleanly fit; future profile complexity pollutes the auth table; schema becomes entangled between security domain and business domain.

**Option B: Separate one-to-one profile tables (adopted)**

Advantages: `users` remains narrow and security-focused; `Teacher` and `Parent` can have domain-specific lifecycle independent of authentication; `Student` remains cleanly independent; schema evolves naturally per domain.

Disadvantages: Requires a join to get the full user+profile record.

**Recommendation: Option B.** The one-to-one separation cleanly enforces the security boundary (authentication) from the domain boundary (staff/parent profiles). It also ensures `Student` can exist without ever touching the `users` table.

---

### 13.2 Class/Year relationship

**Option A: Year-specific classes** (e.g., "JSS 1A 2026/2027")

Advantages: Each enrollment period is fully self-contained.

Disadvantages: Massive schema bloat; makes longitudinal queries across years complex; class identity is lost across years.

**Option B: Reusable classes + Enrollment (adopted)**

Advantages: Clean separation between logical class identity and time-bound enrollment; enables year-over-year class analysis; teacher assignment history follows naturally.

Disadvantages: Requires the assumption that class sections don't change year over year (documented as a domain assumption requiring school confirmation).

**Recommendation: Option B.**

---

### 13.3 TeacherAssignment term nullability

**Option A: `term_id` nullable** (allows "whole-year" assignments)

Advantages: Simpler for cases where a teacher is assigned for an entire year.

Disadvantages: Creates authorization ambiguity — if `term_id = NULL` means "all terms," the authorization logic must handle this special case; unclear what happens when some terms have specific assignments and others use the null-term assignment; harder to audit exactly when a teacher was active.

**Option B: `term_id` NOT NULL (adopted)**

Advantages: Authorization is unambiguous — every assignment is tied to a specific, identifiable period; three-term year = three assignment records (fully auditable); no special-case logic needed.

Disadvantages: Admin must create three records per teacher/subject/class for a full-year assignment.

**Recommendation: Option B.** The administrative overhead of three records is acceptable and eliminates authorization complexity.

---

### 13.4 Enrollment uniqueness scope

**Option A: UNIQUE(student_id, academic_year_id, class_id)**

Allows multiple enrollments per student per year (useful for class transfers within a year).

**Option B: UNIQUE(student_id, academic_year_id) (adopted)**

One official enrollment per student per year. Class transfers within the same year update the `class_id` on the existing enrollment record rather than creating a new one.

**Recommendation: Option B for MVP.** Class transfer history within a single academic year is a post-MVP concern. The simpler model prevents unintended duplicate enrollments.

---

## 14. Risks and Mitigations

### Risk 1: Cascading deletes on users destroying teacher/parent records
- **Why it matters:** Historical assignments, grades, and parent-student links depend on teacher and parent records persisting.
- **Mitigation:** Do not configure `ON DELETE CASCADE` from `teachers`/`parents` to `users`. Do not use `CascadeType.REMOVE` on the User→Teacher/Parent relationship in JPA.

### Risk 2: Student enrolled twice in the same academic year
- **Why it matters:** Duplicate enrollments corrupt academic history and gradebook calculations.
- **Mitigation:** `UNIQUE(student_id, academic_year_id)` database constraint on `enrollments`.

### Risk 3: Duplicate teacher assignment for same period
- **Why it matters:** Two active assignments for the same teacher/subject/class/term creates authorization ambiguity.
- **Mitigation:** `UNIQUE(teacher_id, subject_id, class_id, academic_year_id, term_id)` database constraint.

### Risk 4: Deleting inactive teacher assignments
- **Why it matters:** Historical grade audit trails depend on knowing which teacher was assigned when.
- **Mitigation:** Never delete assignment records. Set `status = INACTIVE` only.

### Risk 5: Excessive eager loading through ParentStudent
- **Why it matters:** A parent with many linked students could trigger massive N+1 queries.
- **Mitigation:** `FetchType.LAZY` on all associations; custom JPQL queries in repositories rather than relying on JPA relationship traversal.

### Risk 6: Changing a student's class by updating the enrollment record mid-year
- **Why it matters:** Historical enrollment class reference changes, breaking grade history.
- **Mitigation:** Enrollment status transitions (e.g., TRANSFERRED) should be handled through application logic that properly sequences status changes. Direct `class_id` mutation on existing enrollments should be restricted.

### Risk 7: Overloading Student.status with enrollment concerns
- **Why it matters:** Conflating overall student lifecycle with year-specific enrollment status creates data confusion.
- **Mitigation:** Maintain strict separation: `Student.status` = overall lifecycle, `Enrollment.status` = year-specific academic status.

### Risk 8: Missing indexes on foreign keys
- **Why it matters:** Unindexed foreign keys cause slow joins in PostgreSQL when querying enrollments, assignments, and parent-student links.
- **Mitigation:** All proposed foreign key columns have explicit index definitions in the schema proposal.

### Risk 9: `class` reserved keyword collision in Java
- **Why it matters:** Naming the entity `Class` will compile but is considered bad practice and may cause confusion.
- **Mitigation:** Name the Java entity `SchoolClass` and map it to the `classes` table via `@Table(name = "classes")`.

---

## 15. Migration Strategy

| Migration | File | Contents | Status |
|---|---|---|---|
| V1 | `V1__init.sql` | PostgreSQL extensions | Applied |
| V2 | `V2__create_auth_schema.sql` | `users` table + indexes | Applied |
| V3 | `V3__create_school_domain_schema.sql` | All school domain tables | **Proposed — not created** |

V3 must be implemented in a single transaction-safe migration. No changes to V1 or V2 are permitted.

---

## 16. TASK 004 Implementation Breakdown

### TASK 004.1 — Core Academic Foundation

**Objective:** Implement the reusable academic reference entities that all subsequent domain entities depend on.

**Scope:**
- `AcademicYear` entity, repository, service, basic admin API
- `Term` entity, repository, service, basic admin API
- `SchoolClass` entity, repository, service, basic admin API
- `Subject` entity, repository, service, basic admin API
- Flyway migration V3 (all tables in correct dependency order)

**Dependencies:** TASK 003 (authentication) ✅ complete

**Acceptance criteria:**
- V3 migration applies cleanly
- Hibernate validation passes with `ddl-auto=validate`
- All entities load in Spring context
- Basic CRUD endpoints for ADMIN role
- DTOs used; no entities exposed directly
- All existing TASK 003 tests remain green

**Files affected:**
- `V3__create_school_domain_schema.sql` (new)
- `AcademicYear`, `Term`, `SchoolClass`, `Subject` entities (new)
- Corresponding repositories, services, controllers, DTOs (new)

---

### TASK 004.2 — Staff & Teacher Assignment

**Objective:** Implement the Teacher domain and TeacherAssignment, enabling future teacher-specific authorization.

**Scope:**
- `Teacher` entity, repository, service, admin API
- `TeacherAssignment` entity, repository, service, admin API
- `AssignmentStatus` enum
- Teacher self-profile endpoint

**Dependencies:** TASK 004.1 ✅ — TeacherAssignment requires Class, Subject, AcademicYear, Term

**Acceptance criteria:**
- Teacher linked to existing `User` via one-to-one
- TeacherAssignment `term_id` is NOT NULL (enforced at DB and entity level)
- Unique assignment constraint enforced
- ACTIVE/INACTIVE status lifecycle
- No cascade delete from User → Teacher
- DTOs used for all responses
- Authorization test: a user with TEACHER role cannot access another teacher's profile

**Files affected:**
- `Teacher`, `TeacherAssignment`, `AssignmentStatus` (new)
- Corresponding repositories, services, controllers, DTOs (new)

---

### TASK 004.3 — Student & Parent Foundation

**Objective:** Implement the Student, Parent, and ParentStudent domains, including the Enrollment lifecycle.

**Scope:**
- `Parent` entity, repository, service, admin API
- `Student` entity, repository, service, admin API
- `ParentStudent` entity, repository, `RelationshipType` enum
- `Enrollment` entity, repository, service, admin API
- `EnrollmentStatus` enum
- Parent self-profile and ward-list endpoints

**Dependencies:** TASK 004.1 ✅ — Enrollment requires Class and AcademicYear

**Acceptance criteria:**
- Parent linked to existing `User` via one-to-one
- Student has no `user_id` field
- ParentStudent supports multiple parents per student
- Enrollment unique per student + academic year (DB constraint)
- All four `EnrollmentStatus` values exist and are valid
- Authorization test: a PARENT user cannot access another parent's wards
- DTOs used for all responses

**Files affected:**
- `Parent`, `Student`, `ParentStudent`, `Enrollment`, `RelationshipType`, `EnrollmentStatus` (new)
- Corresponding repositories, services, controllers, DTOs (new)

---

## 17. Acceptance Criteria

### Database
- V3 migration applies cleanly with no errors
- V1 and V2 are unchanged
- Hibernate `ddl-auto=validate` passes for all new entities
- All required foreign key constraints exist
- `UNIQUE(student_id, academic_year_id)` enforced on `enrollments`
- `UNIQUE(teacher_id, subject_id, class_id, academic_year_id, term_id)` enforced on `teacher_assignments`
- `term_id` is NOT NULL on `teacher_assignments`
- All foreign key columns have indexes

### Historical integrity
- Enrollment records are retained historically (no cascade delete)
- Inactive TeacherAssignments are retained (no delete; status only)
- No `ON DELETE CASCADE` on entities that carry academic history

### Domain
- `Teacher` and `Parent` each map one-to-one to `User`
- `Student` has no `User` relationship in MVP
- `ParentStudent` supports multiple parents per student and multiple students per parent
- `Enrollment` supports: `ACTIVE`, `COMPLETED`, `TRANSFERRED`, `WITHDRAWN`
- `TeacherAssignment` supports: `ACTIVE`, `INACTIVE`
- `TeacherAssignment.term_id` is mandatory

### Security
- No domain entity is exposed directly through REST
- All API responses use DTOs
- Existing 15 authentication tests remain green (0 failures)
- Teacher can only access their own profile
- Parent can only access their own wards

---

## 18. Resolved Architectural Decisions

All open questions from the initial review have been resolved. No unresolved questions remain.

| Decision | Resolution |
|---|---|
| `TeacherAssignment.term_id` | **NOT NULL** — mandatory for all MVP assignments |
| TeacherAssignment drop tracking | **No `dropped_at`** for MVP; use `status` + `updated_at` |
| TeacherAssignment status | `ACTIVE` / `INACTIVE` only |
| `ParentStudent.relationship_type` storage | `VARCHAR` in PostgreSQL; `RelationshipType` enum in Java |
| `RelationshipType` values | `MOTHER`, `FATHER`, `GUARDIAN`, `OTHER` |
| `Enrollment.status` | `ACTIVE`, `COMPLETED`, `TRANSFERRED`, `WITHDRAWN` |
| Enrollment uniqueness | `UNIQUE(student_id, academic_year_id)` |
| Class/year model | Reusable `Class` entity; time-bound via `Enrollment` |
| Student authentication | None in MVP |
| User model duplication | Confirmed: only one model (`domain.User`). No cleanup needed. |

---

## 19. Final Recommendation

The domain model is architecturally sound. It:

1. Cleanly separates authentication from domain profile data.
2. Preserves historical integrity through status-based lifecycle management rather than deletes.
3. Supports future teacher authorization at the most granular level (teacher + class + subject + academic year + term).
4. Supports parent authorization through an explicit ParentStudent relationship.
5. Correctly defers student authentication to post-MVP.
6. Uses the approved database conventions (UUID, Flyway, Hibernate validate, TIMESTAMP WITHOUT TIME ZONE).
7. Maintains DTO boundaries — no entities leaked through REST.

**TASK 004 architecture is ready for implementation after Daniel's final approval.**

---

## 20. Files Inspected

- `AGENTS.md`
- `docs/PROJECT_CONTEXT.md`
- `docs/DEVELOPMENT_STATUS.md`
- `CONTRIBUTING.md`
- `docs/decisions/002-database-foundation.md`
- `apps/api/src/main/resources/db/migration/V1__init.sql`
- `apps/api/src/main/resources/db/migration/V2__create_auth_schema.sql`
- `apps/api/src/main/java/com/schoolmanagement/auth/domain/User.java`
- `apps/api/src/main/java/com/schoolmanagement/auth/domain/Role.java`
- `apps/api/src/main/java/com/schoolmanagement/auth/repository/UserRepository.java`
- `apps/api/src/main/java/com/schoolmanagement/auth/service/AuthService.java`
- `apps/api/src/main/java/com/schoolmanagement/auth/security/SecurityConfig.java`
- All test files under `apps/api/src/test/`
- Full recursive `git ls-files` and `Get-ChildItem` scans for model/User.java (confirmed absent)

---

## 21. Verification Performed

- `git status` — clean working tree
- `git log -5 --oneline` — confirmed no unintended commits
- `git ls-files | Select-String "User.java"` — one result only (`auth/domain/User.java`)
- `Get-ChildItem -Recurse -Filter "User.java"` — no `model` package found anywhere
- `git log --all --name-status | Select-String "model/User.java"` — no results (never existed)
- `.\mvnw.cmd clean test` — 15 tests, 0 failures, 0 errors, BUILD SUCCESS

---

## Final Consistency Check — User/Role Model

### Verified facts
- Extensive searches (`git ls-files`, `Get-ChildItem -Recurse`, recursive grep, full git history scan) were performed on the repository.
- The path `src/main/java/com/schoolmanagement/auth/model/User.java` and `Role.java` **do not exist** on the current `develop` branch.
- The path `apps/api/src/main/java/com/schoolmanagement/auth/domain/User.java` and `Role.java` **do exist**.
- All layers (authentication, Spring Security, repositories, services, controllers, and tests) currently import and rely exclusively on the `domain` package representations.
- `git ls-tree -r HEAD | Select-String "model/User.java"` returned no results.
- `git log --all --name-status | Select-String "model/User.java"` returned no results — the model package never existed in the repository history.

### Architectural concern
None. The repository contains a single canonical User/Role representation with no duplication.

### Recommended action
No cleanup required. For TASK 004 implementation, the newly created `Teacher` and `Parent` entities must reference the existing single source of truth: `com.schoolmanagement.auth.domain.User`.
