# TASK 010.1 — Attendance Business Rules & Architecture Decisions

## 1. Repository Evidence Reviewed

*   **Academic Domain Structure:** Reviewed `V4__create_academic_foundation.sql`. The core hierarchy is `AcademicYear` -> `Term`, and `SchoolClass` + `Subject`.
*   **Teacher Assignments:** The `teacher_assignments` table explicitly requires `subject_id`, `school_class_id`, `academic_year_id`, and `term_id`. There is no "Form Tutor" or generic class-assignment entity; all teacher authorizations are strictly bound to a Subject.
*   **Enrollment Constraints:** `enrollments` links `student_id`, `academic_year_id`, and `school_class_id` with statuses: `ACTIVE`, `SUSPENDED`, `TRANSFERRED`, `WITHDRAWN`.
*   **Term Constraints:** Task 009 establishes that active terms are strictly enforced, while different academic years may legally contain terms covering the same calendar dates.
*   **Exception Patterns:** `BusinessValidationException` (400), `UnauthorizedResourceAccessException` (403), `ResourceNotFoundException` (404), and `ResourceConflictException` (409) are consistently used.
*   **Existing Migrations:** Migrations exist up to `V6__enforce_academic_domain_invariants.sql`. There is no existing attendance schema or session/period entity.

## 2. Scope

*   **Decision:** The Attendance domain is responsible strictly for capturing, editing, and querying the physical/virtual presence of eligible enrolled students during assigned academic subjects.
*   **Reason:** Enforces bounded context, avoiding bleeding into the Reports, Admissions, or Notification domains.
*   **Consequence:** The attendance record serves as the primitive source of truth for future parent portals and report cards.

## 3. Attendance Granularity

*   **Decision:** MVP attendance represents "daily subject attendance". It enforces ONE attendance event per student + class + subject + term + calendar date.
*   **Reason:** The repository has no attendance-session or period entity, and we must not invent one.
*   **Consequence:** It is NOT period attendance, lesson-session attendance, timetable-period attendance, or multiple attendance events per subject per day. A subject has at most ONE authoritative attendance event per student per calendar day within a given term.

## 4. Attendance Statuses

*   **Decision:** The authoritative statuses are:
    *   `PRESENT`: Student attended the subject.
    *   `ABSENT`: Student did not attend.
    *   `LATE`: Student attended but arrived late.
    *   `EXCUSED`: Absence was formally excused.
*   **Reason:** These cover the operational requirements for subject-level tracking.
*   **Consequence:** These will be mapped to an enum in Java and enforced via a `CHECK` constraint in PostgreSQL.

## 5. Attendance Record Identity

*   **Decision:** A unique attendance record is explicitly identified by: `UNIQUE(student_id, school_class_id, subject_id, term_id, attendance_date)`.
*   **Reason:** Attendance belongs to a specific academic term. Two different academic years may legally contain terms covering the same calendar dates. Therefore, calendar date + student + class + subject alone is not sufficient to uniquely identify an attendance record. `term_id` provides the academic-period boundary and prevents legitimate attendance records from different terms/academic years from conflicting.
*   **Consequence:** The business rule remains explicitly: One attendance event per student + class + subject + term + calendar date.

## 6. Enrollment Eligibility Rules

*   **Decision:** Only `ACTIVE` students are eligible for attendance. `SUSPENDED`, `TRANSFERRED`, and `WITHDRAWN` students are ineligible.
*   **Reason:** Do not confuse this with Task 009 capacity semantics. While `SUSPENDED` enrollments consume class capacity, they are not actively participating and do not receive attendance records.
*   **Consequence:** Bulk attendance retrieval and submission logic must strictly filter for `ACTIVE` enrollments. Submitting attendance for ineligible enrollments throws a `BusinessValidationException`.

## 7. Date and Term Rules

*   **Decision:** `termId` is explicitly supplied in attendance requests. The server does NOT derive the term solely from `attendanceDate`. The `attendance_date` must satisfy all of the following:
    *   Must belong to the supplied term.
    *   Must be within the term's inclusive start/end dates.
    *   Must not be a future calendar date (using the authoritative application timezone).
    *   The associated term must be `ACTIVE`.
*   **Reason:** A date alone must never be used as the authoritative term identifier. Completed/inactive terms are immutable for attendance editing.
*   **Consequence:** The server validates that the supplied term exists, is `ACTIVE`, belongs to the relevant academic context, and that the date strictly respects the boundaries.

## 8. Teacher Authorization

*   **Decision:** Teacher access is strictly based on an `ACTIVE` `TeacherAssignment`. The assignment must exactly match the relevant `teacher`, `class`, `subject`, and `term`.
*   **Reason:** Enforces strict relationship-based authorization bound to the specific term of the attendance record.
*   **Consequence:** Any attempt by a teacher to mark, edit, or view attendance outside of their assigned scope results in an `UnauthorizedResourceAccessException` (HTTP 403).

## 9. Administrative Authorization

*   **Decision:** `ADMIN` and `SUPER_ADMIN` roles retain global attendance-management access.
*   **Reason:** Required for school-wide oversight and administrative corrections.
*   **Consequence:** Do NOT introduce `PRINCIPAL`, `FORM_TUTOR`, or any new role. Admins bypass the specific relationship checks required for teachers.

## 10. Create/Edit Rules

*   **Decision:** Records can be freely updated by authorized teachers or admins as long as the term explicitly associated with the attendance record remains `ACTIVE`.
*   **Reason:** Teachers need to correct mistakes. The transition of the term to `COMPLETED` or `INACTIVE` acts as the natural lock for historical data.
*   **Consequence:** Simple HTTP `PATCH` or `PUT` operations will be supported. Once a term is not `ACTIVE`, edits are forbidden.

## 11. Duplicate and Concurrency Rules

*   **Decision:** The attendance database unique constraint is authoritative for duplicate prevention. A race condition may cause a unique-constraint violation. The service must identify the specific attendance uniqueness constraint before mapping the exception to `ResourceConflictException` (HTTP 409).
*   **Reason:** Unrelated database integrity violations must not be incorrectly converted into duplicate-attendance conflicts.
*   **Consequence:** This follows the narrowed exception-handling approach already established in Task 009. Blindly mapping every `DataIntegrityViolationException` to HTTP 409 is forbidden.

## 12. Bulk Attendance Rules

*   **Decision:** Bulk attendance is fully atomic. ALL VALID → persist all. ANY INVALID → persist none.
*   **Reason:** Partial success creates a fragmented system state.
*   **Consequence:** Existing attendance causing a duplicate remains a whole-request conflict. Duplicate student IDs inside the same payload remain a business validation error rejecting the entire request.

## 13. Query/Filtering Rules

*   **Decision:** The GET query contract strictly enforces combinations. `termId` is always **Required**. Supported scoped views are:
    *   **Class + Subject + Date** (`termId + classId + subjectId + date`): Daily attendance for one class and subject.
    *   **Class + Subject** (`termId + classId + subjectId`): Attendance history for one class/subject during the term.
    *   **Student history (Admin)** (`termId + studentId`): Allowed for `ADMIN`/`SUPER_ADMIN`.
    *   **Student history (Teacher)** (`termId + studentId + subjectId`): Required for `TEACHER`.
*   **Reason:** A teacher may only retrieve records for an academic scope they are authorized to access. A teacher must NOT be able to retrieve all subjects' attendance for a student merely by supplying `studentId + termId`.
*   **Consequence:** Unsupported or insufficient filter combinations (or attempts by a teacher to query without establishing authorized class/subject scope) should be rejected (e.g., `403 Forbidden`) according to the API contract rather than silently broadening the query.

## 14. Error Contract

*   **Decision:** Use the repository's established exception conventions. Map specific cases as follows:
    *   **400 `BusinessValidationException`**: Future attendance date, date outside term boundaries, inactive/completed/planned term, invalid enrollment status, duplicate student IDs in bulk request, invalid class/subject/term relationship.
    *   **401 Unauthorized**: Authentication failure.
    *   **403 `UnauthorizedResourceAccessException`**: Teacher assignment mismatch, teacher attempting to access unassigned class/subject, insufficient query filters for role.
    *   **404 `ResourceNotFoundException`**: Student, Class, Subject, Term, or Record ID does not exist.
    *   **409 `ResourceConflictException`**: Duplicate attendance record for the same student/date/class/subject/term already exists in DB (explicitly mapped from the specific unique constraint).
*   **Reason:** Strict contract mapping prevents generic error swallowing.
*   **Consequence:** Do not automatically classify every business-rule failure as 400 if the existing project semantics indicate otherwise.

## 15. Database Constraints

*   **Decision:** Foreign keys are explicitly required:
    *   `attendance_records.student_id` → `students`
    *   `attendance_records.school_class_id` → `school_classes`
    *   `attendance_records.subject_id` → `subjects`
    *   `attendance_records.term_id` → `terms`
*   **Reason:** Maintains relational integrity.
*   **Consequence:** There is no single relationship table linking class, subject, and term together for an enrollment. The relationship validity MUST be safely enforced in the service layer using existing entities.

## 16. Reporting Requirements

*   **Decision:** The stored data must support at least:
    *   Student attendance history
    *   Class attendance for a subject/date
    *   Subject attendance by term
    *   Student attendance summary by term
    *   Future report-card/reporting aggregation
*   **Reason:** Baseline reporting prerequisites.
*   **Consequence:** Designing the Reports domain itself is deferred.

## 17. Auditability

*   **Decision:** The attendance schema will only include `created_at` and `updated_at`. Actor identity (`created_by`, `updated_by`) is intentionally deferred from the MVP.
*   **Reason:** `created_at` and `updated_at` provide timestamp history only. They do NOT identify which user created or modified a record. Do not assume that a global audit-log table already exists.
*   **Consequence:** Actor-level accountability is omitted from the MVP. Future centralized audit infrastructure may add actor-level accountability. Timestamps alone do not provide full auditability.

## 18. Frozen Decisions

*   **Decision:** Granularity is exactly ONE attendance event per student + class + subject + term + calendar date.
    *   **Reason:** Matches "daily subject attendance" without inventing session/period entities.
    *   **Consequence:** Multiple attendance events per subject per day are unsupported.
*   **Decision:** Record identity explicitly requires `term_id`: `UNIQUE(student_id, school_class_id, subject_id, term_id, attendance_date)`.
    *   **Reason:** Calendar date alone across academic years is insufficient for strict identity separation.
    *   **Consequence:** Database prevents cross-term ambiguity natively.
*   **Decision:** Statuses are `PRESENT`, `ABSENT`, `LATE`, `EXCUSED`.
    *   **Reason:** Concise, operational coverage.
    *   **Consequence:** Mapped via DB `CHECK` and Java Enum.
*   **Decision:** Only `ACTIVE` enrollments are eligible.
    *   **Reason:** Separates enrollment capacity from attendance eligibility.
    *   **Consequence:** Ineligible students (`SUSPENDED`, `WITHDRAWN`, `TRANSFERRED`) are strictly blocked.
*   **Decision:** `termId` must be explicit in requests, and attendance dates must be valid within that `ACTIVE` term, but not in the future.
    *   **Reason:** Server must not derive authoritative term solely from date.
    *   **Consequence:** Dates evaluated against application timezone and explicit term bounds.
*   **Decision:** Teacher authorization strictly matches `teacher` + `class` + `subject` + `term` assignments.
    *   **Reason:** Restricts view/edit access to authorized boundaries only.
    *   **Consequence:** Ambiguous GET filters are rejected with 403.
*   **Decision:** Admins have global access.
    *   **Reason:** Ensures school-wide operations remain unblocked.
    *   **Consequence:** Bypasses `TeacherAssignment` validations.
*   **Decision:** Creation and editing are allowed while the `term` is `ACTIVE`.
    *   **Reason:** Balances natural historical locking with the operational need to correct mistakes.
    *   **Consequence:** No complex approval workflows.
*   **Decision:** Exception mapping for uniqueness is narrowed to the specific database constraint.
    *   **Reason:** Prevents falsely mapping unrelated DB issues to HTTP 409.
    *   **Consequence:** Accurate duplicate handling.
*   **Decision:** Bulk operations are fully atomic.
    *   **Reason:** Prevents fragmented state.
    *   **Consequence:** Entire request rejected if any record or relationship is invalid.
*   **Decision:** Actor auditability is omitted from MVP.
    *   **Reason:** Avoids building unmapped audit subsystems.
    *   **Consequence:** Relies only on timestamp history for now.
*   **Decision:** Explicit Non-Goals: No parent notifications, no multi-stage approvals, no session tracking.
    *   **Reason:** Controls scope.
    *   **Consequence:** Strictly limits MVP domain complexity.
