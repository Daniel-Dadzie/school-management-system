# TASK 010.2 â€” Attendance API Contract & Implementation Design

## 1. Status
**Status:** IMPLEMENTATION-READY (Contract Frozen)

## 2. Repository Evidence Reviewed
*   **Migrations:** V4 defines `academic_years`, `terms`, `school_classes`, `subjects`, `enrollments`, `teacher_assignments`. Migration naming is sequentially numbered (e.g., `V6__...`). V4 schema uses `uuid_generate_v4()` for IDs, enums backed by `VARCHAR` + `CHECK` constraints, and named `UNIQUE(col)` constraint declarations. Timestamps use `TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP`.
*   **Enrollment Constraints:** `UNIQUE(student_id, academic_year_id)` guarantees a student can only be enrolled in exactly ONE class per academic year.
*   **Exception Handling:** `BusinessValidationException` (400), `ResourceNotFoundException` (404), `ResourceConflictException` (409), and `UnauthorizedResourceAccessException` (403).
*   **Security:** `@PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN', 'TEACHER')")` is used. Principal resolution is via `@AuthenticationPrincipal User principal`. Teacher resolution is via `teacherRepository.findByUser_Id(principal.getId())`.
*   **DTO Conventions:** Java Records (`record`), validation annotations (`@NotNull`, `@NotBlank`), `LocalDate`, `LocalDateTime`, `UUID` mapping.
*   **API Conventions:** API versioning at `/api/v1/...`, returns `ResponseEntity<...>`, HTTP 201 for POST operations.

## 3. Existing Architecture Alignment
*   The API integrates seamlessly with the existing `Enrollment` and `TeacherAssignment` domains.
*   Attendance applies purely at the `subject` level on a specific `attendanceDate` within a `term`, mapped directly to `ACTIVE` enrollments. No session or period entities are invented.
*   Attendance MVP does not introduce a curriculum/class-subject mapping entity.

## 4. API Endpoint Contract
### Bulk Submission
`POST /api/v1/attendance/bulk`
*   **Purpose:** Atomically submit attendance for a specific class/subject/term on a specific date.
*   **Status:** 201 Created on success.

### Retrieve Attendance
`GET /api/v1/attendance`
*   **Purpose:** Query attendance records dynamically based on exact supported filter combinations.
*   **Status:** 200 OK.

### Edit Attendance
`PATCH /api/v1/attendance/{id}`
*   **Purpose:** For MVP, PATCH is the selected attendance-edit operation. Only `status` is mutable. Student, class, subject, term, and attendanceDate are immutable record-identity/context fields.
*   **Constraints:**
    *   PUT is not implemented for Attendance MVP.
    *   Changing `attendanceDate` is not supported through PATCH.
    *   Changing student/class/subject/term is not supported through PATCH.
*   **Status:** 200 OK.

## 5. Request DTO Contract
### Bulk Request DTO
```java
public record AttendanceBulkRequest(
    @NotNull(message = "Term ID is required") UUID termId,
    @NotNull(message = "Class ID is required") UUID classId,
    @NotNull(message = "Subject ID is required") UUID subjectId,
    @NotNull(message = "Attendance date is required") LocalDate attendanceDate,
    @NotEmpty(message = "Records cannot be empty")
    @Valid List<AttendanceRecordSubmitRequest> records
) {}

public record AttendanceRecordSubmitRequest(
    @NotNull(message = "Student ID is required") UUID studentId,
    @NotNull(message = "Status is required") AttendanceStatus status
) {}
```
**Constraints:**
*   **Maximum bulk size:** There is no established repository/request limit currently configured. Bulk-size limiting is an implementation/security consideration to be finalized from repository/application configuration before implementation.
*   Duplicate `studentId` within the `records` list throws a `BusinessValidationException` immediately, rejecting the entire request.

### Patch Request DTO
```java
public record AttendancePatchRequest(
    @NotNull(message = "Status is required") AttendanceStatus status
) {}
```
*Note: `AttendancePatchRequest` contains only `status`. Student, class, subject, term, and attendanceDate are not mutable through the Attendance PATCH API and are not part of the request contract.*

## 6. Response DTO Contract
```java
public record AttendanceResponse(
    UUID id,
    UUID studentId,
    UUID classId,
    UUID subjectId,
    UUID termId,
    LocalDate attendanceDate,
    AttendanceStatus status,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {}
```
For `POST /api/v1/attendance/bulk`, the API returns `List<AttendanceResponse>`.

## 7. GET Filter Matrix
**Required Parameter:** `termId`
**Optional Parameters:** `classId`, `subjectId`, `date`, `studentId`

| Caller | Query | Result |
| :--- | :--- | :--- |
| ADMIN/SUPER_ADMIN | `termId + classId + subjectId + date` | 200 OK |
| ADMIN/SUPER_ADMIN | `termId + classId + subjectId` | 200 OK |
| ADMIN/SUPER_ADMIN | `termId + studentId` | 200 OK |
| TEACHER | `termId + studentId + subjectId` | 200 OK if assignment authorization passes |
| TEACHER | `termId + studentId` | 403 `UnauthorizedResourceAccessException` |
| TEACHER | `termId + classId + subjectId + date` | 200 OK if assignment authorization passes |
| TEACHER | `termId + classId + subjectId` | 200 OK if assignment authorization passes |
| Any caller | `termId` only | 400 `BusinessValidationException` (Insufficient filters) |
| Any caller | unsupported parameter combination | 400 `BusinessValidationException` |

*Note: For a TEACHER executing `termId + studentId + subjectId`, the backend deterministically resolves the student's `classId` from the single `ACTIVE` enrollment linked to the term's academic year, and uses that class to verify the teacher's assignment.*

## 8. Authorization Matrix

| Operation             | ADMIN         | SUPER_ADMIN   | TEACHER                                                                                          |
| --------------------- | ------------- | ------------- | ------------------------------------------------------------------------------------------------ |
| Bulk create           | Global access | Global access | Exact active TeacherAssignment                                                                   |
| PATCH                 | Global access | Global access | Exact active TeacherAssignment for loaded record                                                 |
| Daily GET             | Global access | Global access | Exact active TeacherAssignment                                                                   |
| Class/subject history | Global access | Global access | Exact active TeacherAssignment                                                                   |
| Student history       | Global access | Global access | `termId + studentId + subjectId` plus resolved enrollment class + exact active TeacherAssignment |

*   **ADMIN / SUPER_ADMIN:** Global Attendance access. They do NOT require TeacherAssignment authorization.
*   **TEACHER:** Authorization requires an ACTIVE `TeacherAssignment` matching `teacherId` + `classId` + `subjectId` + `termId`.

## 9. Validation Order (Bulk POST)
The entire validation sequence must occur before any persistence:
1.  **Authentication & Basic Constraints:** JWT validity, basic JSON/DTO annotation validation.
2.  **Payload Integrity:** Reject if `records` list contains duplicate `studentId`s (400).
3.  **Term Existence:** Verify `termId` exists (404).
4.  **Term Status:** Verify the term is `ACTIVE` (400).
5.  **Term Date Range:** Verify `attendanceDate` is within `[startDate, endDate]` inclusively (400).
6.  **Future-date Validation:** Verify `attendanceDate` is not in the future using the authoritative application timezone logic (400).
7.  **Class & Subject Existence:** Verify `classId` and `subjectId` exist (404).
8.  **Class/Subject/Term Validation:**
    *   *Teacher request:* Validated simultaneously with authorization through the teacher's ACTIVE `TeacherAssignment`. This establishes teacher authorization, class, subject, and term relationship.
    *   *Admin request:* The system validates the existence and academic consistency of the term, class, and subject, but does not require a `TeacherAssignment`.
9.  **Teacher Authorization:** If Teacher, verify `ACTIVE` `TeacherAssignment` for `classId` + `subjectId` + `termId` (403).
10. **Student Eligibility:** Query `Enrollment`. Verify all submitted `studentId`s have an `ACTIVE` enrollment for the specific `classId` and the term's academic year (SUSPENDED, TRANSFERRED, and WITHDRAWN are explicitly ineligible) (400).
11. **Persistence:** Proceed to save. The transactional boundary safely rolls back if a unique constraint exception occurs.

## 10. Error/HTTP Status Matrix
*   **400 `BusinessValidationException`:** Referenced student/class/term exists but violates rules (e.g., student SUSPENDED, no ACTIVE enrollment, inactive term for POST/PATCH operations (GET queries support historical/completed terms), future date, date outside bounds, missing/insufficient GET filters, duplicate student IDs in bulk).
*   **401 Unauthorized:** Invalid JWT.
*   **403 `UnauthorizedResourceAccessException`:** Teacher lacks `ACTIVE` assignment for the specified term/class/subject, or missing authorized scope.
*   **404 `ResourceNotFoundException`:** Record, student, class, subject, or term genuinely does not exist.
*   **409 `ResourceConflictException`:** Caught specifically from `DataIntegrityViolationException` when the root database cause message contains `uq_attendance_identity`. Other integrity exceptions must propagate normally.

## 11. Database Schema Design
**Table:** `attendance_records`
```sql
CREATE TABLE attendance_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students(id),
    school_class_id UUID NOT NULL REFERENCES school_classes(id),
    subject_id UUID NOT NULL REFERENCES subjects(id),
    term_id UUID NOT NULL REFERENCES terms(id),
    attendance_date DATE NOT NULL,
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_attendance_identity UNIQUE (student_id, school_class_id, subject_id, term_id, attendance_date),
    CONSTRAINT ck_attendance_status CHECK (status IN ('PRESENT', 'ABSENT', 'LATE', 'EXCUSED'))
);
```

## 12. Constraint/Index Design
*   **Primary Key:** `id` UUID
*   **Foreign Keys:** Standard references without cascading deletes.
*   **Unique Constraint:** `uq_attendance_identity` ensuring one record per student/class/subject/term/date.
*   **Indexes:**
    *   `idx_attendance_term_class_subject_date` on `(term_id, school_class_id, subject_id, attendance_date)` - Serves the daily and term class history queries perfectly.
    *   `idx_attendance_term_student_subject` on `(term_id, student_id, subject_id)` - Serves both Teacher student-subject queries and Admin student queries efficiently. Avoids redundant indexing.

## 13. Repository Design
```java
public interface AttendanceRepository extends JpaRepository<AttendanceRecord, UUID> {
    List<AttendanceRecord> findByTermIdAndSchoolClassIdAndSubjectIdAndAttendanceDate(UUID termId, UUID classId, UUID subjectId, LocalDate date);

    List<AttendanceRecord> findByTermIdAndSchoolClassIdAndSubjectId(UUID termId, UUID classId, UUID subjectId);

    List<AttendanceRecord> findByTermIdAndStudentId(UUID termId, UUID studentId);

    List<AttendanceRecord> findByTermIdAndStudentIdAndSubjectId(UUID termId, UUID studentId, UUID subjectId);
}
```

## 14. Service/Transaction Design
*   **`@Transactional` Bulk:** The entire bulk pre-check, validation, and `saveAll` execution sits inside a single `@Transactional` service boundary. Any validation failure causes the entire transaction to immediately reject. No partial persistence is permitted.
*   **Constraint Safeguard:** The unique database constraint guarantees safe behavior during concurrent identical inserts.

## 15. Concurrency Design
*   **Concurrent Identical Overlap:** If Bulk A (`student 1, 2, 3`) and Bulk B (`student 3, 4, 5`) are executed concurrently targeting the same term/class/subject/date:
    *   One transaction may succeed (e.g. Bulk A).
    *   The conflicting transaction (Bulk B) attempts to insert `student 3` and throws `DataIntegrityViolationException`.
    *   The entire conflicting transaction (Bulk B) rolls back. Students 4 and 5 from the losing transaction are NOT persisted.
    *   The caller of Bulk B receives a `409 ResourceConflictException`.

## 16. Security Review
*   **ADMIN/SUPER_ADMIN Authorization:** Authorization comes from role-based global access. It explicitly does not depend on TeacherAssignment existence.
*   **TEACHER Authorization:** Authorization comes from exact relationship-based TeacherAssignment linking `teacher_id` + `class_id` + `subject_id` + `term_id`.
*   **PATCH Authorization:** PATCH authorization for teachers is based on the loaded attendance record's explicit class + subject + term against their TeacherAssignments.
*   **Teacher Scope Escalation:** Prevented. Any GET request omitting required authorized dimensions returns 403 `UnauthorizedResourceAccessException`. GET cannot broaden teacher scope.
*   **Teacher Student History Isolation:** Teachers cannot use `termId + studentId` to retrieve a student's full attendance history. Student history for teachers resolves the student's single enrollment for the relevant academic year and verifies the teacher assignment for that class/subject/term explicitly.
*   **PATCH Bypass:** Prevented. PATCH only modifies the `status` enum. It does not allow identity field reassignment.

## 17. Integration-Test Matrix
### ADMIN / SUPER_ADMIN
*   Admin can create valid attendance without requiring a TeacherAssignment â†’ 201.
*   Super Admin can create valid attendance without requiring a TeacherAssignment â†’ 201.
*   Admin can PATCH valid attendance without requiring a TeacherAssignment â†’ 200.
*   Admin can query valid attendance without requiring a TeacherAssignment â†’ 200.

### TEACHER
*   Teacher with exact active assignment â†’ allowed (201/200).
*   Teacher without exact active assignment â†’ 403.
*   Teacher with correct subject but wrong class â†’ 403.
*   Teacher with correct class but wrong subject â†’ 403.
*   Teacher with correct class + subject but wrong term â†’ 403.

### Bulk Atomicity
*   All valid â†’ all persisted (201).
*   One ineligible student (e.g., SUSPENDED) â†’ zero persisted (400).
*   One missing student â†’ zero persisted (404).
*   Duplicate student ID in payload â†’ zero persisted (400).
*   Existing duplicate â†’ zero new records from that request (409).
*   Out-of-term-date rejection â†’ zero persisted (400).
*   Future-date rejection â†’ zero persisted (400).
*   Planned/completed term POST/PATCH â†’ 400.
*   Concurrent overlapping bulk â†’ complete transaction conflict/rollback for the loser.

### PATCH
*   PATCH status â†’ allowed when authorized and term ACTIVE (200).
*   Identity fields are not part of PATCH contract.
*   Planned term fails (400).
*   Completed term fails (400).
*   Missing record returns 404.

### GET
*   Daily class/subject query (200).
*   Term class/subject history (200).
*   Admin student history (200).
*   Teacher student/subject history (200).
*   Teacher scoped GET returns only authorized records.
*   Teacher insufficient filters rejected (403).
*   Teacher unauthorized GET â†’ 403.
*   Historical GET on completed term â†’ 200.
*   Missing term/student/class/subject (404).

## 18. Proposed Implementation File List
*   `apps/api/src/main/resources/db/migration/V7__create_attendance_records.sql`
*   `apps/api/src/main/java/com/schoolmanagement/academic/domain/AttendanceStatus.java`
*   `apps/api/src/main/java/com/schoolmanagement/academic/domain/AttendanceRecord.java`
*   `apps/api/src/main/java/com/schoolmanagement/academic/dto/AttendanceBulkRequest.java`
*   `apps/api/src/main/java/com/schoolmanagement/academic/dto/AttendanceRecordSubmitRequest.java`
*   `apps/api/src/main/java/com/schoolmanagement/academic/dto/AttendancePatchRequest.java`
*   `apps/api/src/main/java/com/schoolmanagement/academic/dto/AttendanceResponse.java`
*   `apps/api/src/main/java/com/schoolmanagement/academic/repository/AttendanceRepository.java`
*   `apps/api/src/main/java/com/schoolmanagement/academic/service/AttendanceService.java`
*   `apps/api/src/main/java/com/schoolmanagement/academic/controller/AttendanceController.java`
*   `apps/api/src/test/java/com/schoolmanagement/academic/controller/AttendanceControllerIntegrationTest.java`

## 19. Explicit Non-Goals
*   No period or timetable lesson implementation.
*   No actor audit logging (`created_by`, `updated_by`).
*   No parent notifications or SMS triggers.
*   No multi-stage workflow approvals.
*   No curriculum/class-subject linking tables introduced.

## 20. Open Questions / Contract Implementation Prerequisites
**1. Authoritative Application Timezone**
*   *Implementation Prerequisite:* The contract explicitly prohibits using `LocalDate.now()` when that relies implicitly on the JVM/system default timezone. Attendance must not silently treat the JVM default timezone as the application's authoritative timezone. Before implementation, the application must establish an explicit authoritative timezone configuration or an equivalent project-wide clock/timezone abstraction. The Attendance service will obtain the current date through that authoritative mechanism rather than directly relying on the JVM default timezone.

**2. Class/Subject Curriculum Verification**
*   *Limitation Documented:* Attendance MVP does not introduce a curriculum/class-subject mapping entity. If the existing schema cannot independently establish that a subject belongs to a class for a term, it is an accepted domain-model limitation. ADMIN/SUPER_ADMIN global authorization therefore does not depend on TeacherAssignment existence.
