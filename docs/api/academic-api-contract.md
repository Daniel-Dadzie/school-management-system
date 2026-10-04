# Academic API Contract

This document describes the academic API role boundaries. School records are accessed within the authenticated user's school.

## 1. Security Boundaries

### Roles
* `IT_ADMIN` (school technical administration; no academic authority)
* `ADMIN`
* `TEACHER`
* `PARENT`
*(Note: There is no `PRINCIPAL` role in the system.)*

### Verified Authorization Rules
* Academic mutations require school `ADMIN`.
* Academic-year and term reads permit school `ADMIN` and `TEACHER`.
* Class and subject reads permit `TEACHER`s, but queries are dynamically scoped to their active assignments.
* Enrollment reads are restricted to school `ADMIN`.
* Teacher-assignment reads are restricted to school `ADMIN`.
* `/api/v1/teacher-assignments/me` is restricted to the authenticated `TEACHER` and resolves assignments using the authenticated principal.

---

## 2. API Endpoint Contract

### Academic Years

#### `GET /api/v1/academic-years`
* **Purpose:** Retrieve all academic years.
* **Authorization:** `hasAnyRole('ADMIN', 'TEACHER')`
* **Request DTO:** None
* **Response DTO:** `List<AcademicYearResponse>`
* **Success Status:** `200 OK`
* **Behavior/Validation:** Read access is restricted to authenticated school users with ADMIN or TEACHER roles.

#### `POST /api/v1/academic-years`
* **Purpose:** Create a new academic year.
* **Authorization:** `hasRole('ADMIN')`
* **Request DTO:** `AcademicYearRequest`
* **Response DTO:** `AcademicYearResponse`
* **Success Status:** `201 Created`
* **Behavior/Validation:** Start date must precede end date. Existing uniqueness/conflict constraints are enforced. A global rule preventing multiple ACTIVE academic years is not yet implemented.

---

### Terms

#### `GET /api/v1/academic-years/{id}/terms`
* **Purpose:** Retrieve all terms for a specific academic year.
* **Authorization:** `hasAnyRole('ADMIN', 'TEACHER')`
* **Request DTO:** None
* **Response DTO:** `List<TermResponse>`
* **Success Status:** `200 OK`
* **Behavior/Validation:** Read access is restricted to authenticated school users with ADMIN or TEACHER roles.

#### `POST /api/v1/academic-years/{id}/terms`
* **Purpose:** Create a new term within an academic year.
* **Authorization:** `hasRole('ADMIN')`
* **Request DTO:** `TermRequest`
* **Response DTO:** `TermResponse`
* **Success Status:** `201 Created`
* **Behavior/Validation:** Start date must precede end date and the term must belong to a valid academic year. Cross-term date-overlap prevention is not yet implemented.

---

### Classes

#### `GET /api/v1/classes`
* **Purpose:** Retrieve school classes.
* **Authorization:** `hasAnyRole('ADMIN', 'TEACHER')`
* **Request DTO:** None
* **Response DTO:** `List<SchoolClassResponse>`
* **Success Status:** `200 OK`
* **Behavior/Validation (Teacher Scoping):** When accessed by a `TEACHER`, the service layer dynamically restricts the response to only classes where the teacher has an active assignment, via `teacherAssignmentRepository.findActiveClassesByTeacherId()`.

#### `POST /api/v1/classes`
* **Purpose:** Create a new school class.
* **Authorization:** `hasRole('ADMIN')`
* **Request DTO:** `SchoolClassRequest`
* **Response DTO:** `SchoolClassResponse`
* **Success Status:** `201 Created`
* **Behavior/Validation:** Class name and level must be unique. Enrollment capacity enforcement is not yet implemented.

---

### Subjects

#### `GET /api/v1/subjects`
* **Purpose:** Retrieve subjects.
* **Authorization:** `hasAnyRole('ADMIN', 'TEACHER')`
* **Request DTO:** None
* **Response DTO:** `List<SubjectResponse>`
* **Success Status:** `200 OK`
* **Behavior/Validation (Teacher Scoping):** When accessed by a `TEACHER`, the service layer dynamically restricts the response to only subjects the teacher actively teaches, via `teacherAssignmentRepository.findActiveSubjectsByTeacherId()`.

#### `POST /api/v1/subjects`
* **Purpose:** Create a new subject.
* **Authorization:** `hasRole('ADMIN')`
* **Request DTO:** `SubjectRequest`
* **Response DTO:** `SubjectResponse`
* **Success Status:** `201 Created`
* **Behavior/Validation:** Subject code must be unique.

---

### Enrollments

#### `GET /api/v1/enrollments`
* **Purpose:** Retrieve all enrollments.
* **Authorization:** `hasRole('ADMIN')`
* **Request DTO:** None
* **Response DTO:** `List<EnrollmentResponse>`
* **Success Status:** `200 OK`
* **Behavior/Validation:** Globally restricted to administrative roles.

#### `POST /api/v1/enrollments`
* **Purpose:** Enroll a student into a class for an academic year.
* **Authorization:** `hasRole('ADMIN')`
* **Request DTO:** `EnrollmentRequest`
* **Response DTO:** `EnrollmentResponse`
* **Success Status:** `201 Created`
* **Behavior/Validation:** Enforces 1 active/suspended enrollment per student per academic year.

#### `PATCH /api/v1/enrollments/{id}/status`
* **Purpose:** Update the status of an enrollment.
* **Authorization:** `hasRole('ADMIN')`
* **Request DTO:** `EnrollmentStatusUpdateRequest`
* **Response DTO:** `EnrollmentResponse`
* **Success Status:** `200 OK`
* **Behavior/Validation:** Used to drop, suspend, or graduate students from an active enrollment.

---

### Teacher Assignments

#### `GET /api/v1/teacher-assignments`
* **Purpose:** Retrieve all teacher assignments globally.
* **Authorization:** `hasRole('ADMIN')`
* **Request DTO:** None
* **Response DTO:** `List<TeacherAssignmentResponse>`
* **Success Status:** `200 OK`
* **Behavior/Validation:** Globally restricted.

#### `GET /api/v1/teacher-assignments/me`
* **Purpose:** Retrieve the assignments belonging to the authenticated teacher.
* **Authorization:** `hasRole('TEACHER')`
* **Request DTO:** None
* **Response DTO:** `List<TeacherAssignmentResponse>`
* **Success Status:** `200 OK`
* **Behavior/Validation (Teacher Scoping):** Service restricts results explicitly using the authenticated `principal`.

#### `POST /api/v1/teacher-assignments`
* **Purpose:** Assign a teacher to a subject and class for a specific term.
* **Authorization:** `hasRole('ADMIN')`
* **Request DTO:** `TeacherAssignmentRequest`
* **Response DTO:** `TeacherAssignmentResponse`
* **Success Status:** `201 Created`
* **Behavior/Validation:** Verifies assignment validity and explicitly prevents overlapping or conflicting assignments.

#### `PATCH /api/v1/teacher-assignments/{id}/status`
* **Purpose:** Update the status of a teacher assignment.
* **Authorization:** `hasRole('ADMIN')`
* **Request DTO:** `AssignmentStatusUpdateRequest`
* **Response DTO:** `TeacherAssignmentResponse`
* **Success Status:** `200 OK`
* **Behavior/Validation:** Marks assignments as active, completed, or cancelled.
