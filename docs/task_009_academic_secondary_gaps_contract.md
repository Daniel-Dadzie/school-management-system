# TASK 009 — Academic Domain Secondary Gaps Contract

**Status:** CONTRACT FROZEN  
**Scope:** Academic Domain Secondary Gaps  
**Repository:** `school-management-system`  
**Branch:** `develop`  
**Authoritative document:** `docs/task_009_academic_secondary_gaps_contract.md`

---

## 1. Purpose

Task 009 closes the following verified gaps in the Academic Domain:

1. Single `ACTIVE` academic-year enforcement.
2. Controlled academic-year status transitions.
3. Term-overlap validation.
4. Positive school-class capacity validation.
5. Enrollment class-capacity enforcement.
6. Concurrency-safe enforcement of the above database/business invariants.

Task 009 must preserve the existing architecture, API conventions, authorization model, exception taxonomy, and previously completed Tasks.

---

## 2. Existing Architecture to Preserve

The existing Academic Domain contains:

### Academic Year

- `AcademicYear`
- `AcademicYearStatus`
- `AcademicYearRepository`
- `AcademicYearService`
- `AcademicYearController`
- `AcademicYearRequest`
- `AcademicYearResponse`

### Terms

- `Term`
- `TermRepository`
- `TermService`
- Term endpoints nested under `AcademicYearController`

### Classes

- `SchoolClass`
- `SchoolClassRepository`
- `SchoolClassService`
- `SchoolClassController`
- `SchoolClassRequest`
- `SchoolClassResponse`

### Enrollment

- `Enrollment`
- `EnrollmentStatus`
- `EnrollmentRepository`
- `EnrollmentService`
- `EnrollmentController`

Task 009 must extend these components rather than introduce parallel or duplicate domain implementations.

---

## 3. Exception Contract

The existing `GlobalExceptionHandler` is authoritative for Task 009 error semantics.

Do not introduce new exception classes unless implementation evidence proves they are strictly necessary.

### 3.1 Business Validation

Use:

`BusinessValidationException`

Mapped to:

`400 Bad Request`

Response:

```json
{
  "error": "Bad Request",
  "message": "..."
}
````

Use this for intrinsically invalid operations, including:

* Invalid academic-year status transition.
* Academic-year start date after end date.
* Term start date after end date.
* Class capacity less than 1.

### 3.2 Resource Conflict

Use:

`ResourceConflictException`

Mapped to:

`409 Conflict`

Response:

```json
{
  "error": "Conflict",
  "message": "..."
}
```

Use this for valid requests that conflict with current persisted state, including:

* Another academic year is already ACTIVE.
* Overlapping term.
* Class is already full.
* Existing duplicate enrollment rule.

### 3.3 Resource Not Found

Use:

`ResourceNotFoundException`

Mapped to:

`404 Not Found`

Continue existing behavior for missing referenced resources.

---

## 4. Academic-Year Status Workflow

Existing statuses remain:

```text
PLANNED
ACTIVE
COMPLETED
```

Do not add additional statuses.

### 4.1 Allowed transitions

Only these transitions are valid:

```text
PLANNED ? ACTIVE
ACTIVE  ? COMPLETED
```

### 4.2 Invalid transitions

Reject:

```text
PLANNED ? PLANNED
ACTIVE ? ACTIVE
COMPLETED ? COMPLETED
ACTIVE ? PLANNED
COMPLETED ? ACTIVE
COMPLETED ? PLANNED
```

Any other transition not explicitly listed as valid is invalid.

Invalid transitions must result in:

`BusinessValidationException` ? HTTP 400.

The persisted status must remain unchanged after an invalid request.

---

## 5. Academic-Year Status API

Add:

```http
PATCH /api/v1/academic-years/{id}/status
```

Request:

```json
{
  "status": "ACTIVE"
}
```

Use a dedicated request DTO.

The response should use the existing `AcademicYearResponse` representation.

### Authorization

Only:

* `ADMIN`
* `SUPER_ADMIN`

may change academic-year status.

Teacher requests must return:

`403 Forbidden`

Unauthenticated requests must return:

`401 Unauthorized`

Creating an academic year must continue to produce:

`PLANNED`

Creation must not automatically activate the academic year.

---

## 6. Single ACTIVE Academic Year Invariant

The system must permit at most one academic year with:

```text
status = ACTIVE
```

This must be enforced at database level.

### 6.1 Migration

Create a new Flyway migration.

Do not modify:

`V4__create_academic_foundation.sql`

The migration must add a PostgreSQL partial unique index or equivalent database mechanism enforcing uniqueness only for ACTIVE academic years.

Conceptually:

```sql
CREATE UNIQUE INDEX ...
ON academic_years (status)
WHERE status = 'ACTIVE';
```

### 6.2 Application-level check

Before activation, perform an application-level check for an existing ACTIVE academic year.

If one exists, return:

`ResourceConflictException` ? HTTP 409.

The database constraint remains the authoritative concurrency safeguard.

### 6.3 Concurrent activation

Two concurrent activation requests must never result in two ACTIVE academic years.

If a concurrent request loses the database uniqueness race, handle the persistence conflict consistently as HTTP 409 rather than exposing an internal server error.

Do not rely exclusively on the application-level check.

---

## 7. Academic-Year Date Validation

Preserve:

```text
startDate <= endDate
```

If:

```text
startDate > endDate
```

return:

`BusinessValidationException` ? HTTP 400.

Do not change existing academic-year date semantics.

---

## 8. Term Date Validation

Preserve:

```text
term.startDate <= term.endDate
```

If:

```text
startDate > endDate
```

return:

`BusinessValidationException` ? HTTP 400.

---

## 9. Term Overlap Rule

A term must not overlap another term belonging to the same academic year.

The overlap condition is inclusive:

```text
existing.startDate <= new.endDate
AND
existing.endDate >= new.startDate
```

If true, the terms overlap.

### Valid

```text
Term 1: January 1 – March 31
Term 2: April 1 – June 30
```

### Invalid

```text
Term 1: January 1 – March 31
Term 2: March 31 – June 30
```

Boundary-sharing dates count as overlap.

An overlapping term must result in:

`ResourceConflictException` ? HTTP 409.

The new term must not be persisted.

### Scope boundary

Do not add a new requirement that terms must fall within the academic-year start/end dates.

Only:

* term date ordering;
* term overlap;

are in scope.

---

## 10. School-Class Capacity

School-class capacity represents the maximum number of currently occupying enrollments permitted in the class.

The existing default remains:

`30`

### 10.1 Positive capacity

Capacity must be at least:

`1`

Therefore:

```text
capacity = 0
capacity < 0
```

must return:

`400 Bad Request`

using the existing validation conventions.

Prefer Bean Validation on `SchoolClassRequest`.

Do not change the existing default capacity.

---

## 11. Enrollment Capacity Rule

When enrolling a student into a class, enforce class capacity.

These statuses consume capacity:

```text
ACTIVE
SUSPENDED
```

These statuses do not consume current capacity:

```text
TRANSFERRED
WITHDRAWN
```

Conceptually:

```text
occupied =
    count(enrollments for class
          where status IN (ACTIVE, SUSPENDED))
```

Enrollment is allowed only when:

```text
occupied < class.capacity
```

If:

```text
occupied >= class.capacity
```

reject with:

`ResourceConflictException` ? HTTP 409.

No enrollment may be created when the class is full.

---

## 12. Existing Duplicate Enrollment Rule

Preserve the existing rule preventing more than one active or suspended enrollment for the same student and academic year.

The existing duplicate enrollment behavior remains:

`409 Conflict`

Do not weaken or remove this rule.

---

## 13. Concurrency-Safe Class Capacity Enforcement

A simple:

```text
COUNT ? compare ? INSERT
```

implementation is insufficient by itself.

The implementation must prevent concurrent enrollment requests from exceeding class capacity.

A preferred implementation in the current Spring/JPA architecture is pessimistic write locking on the relevant `SchoolClass` row.

Conceptually:

```text
BEGIN TRANSACTION
       ?
Lock school class row
       ?
Check duplicate enrollment
       ?
Count ACTIVE + SUSPENDED enrollments
       ?
Compare against capacity
       ?
If full ? 409
       ?
Create enrollment
       ?
COMMIT
```

The entire sequence must execute inside the same transaction.

The lock must remain held from class lookup through the capacity check and enrollment INSERT.

An equivalent transaction-safe implementation is acceptable only if it provides the same invariant.

Required invariant:

```text
ACTIVE enrollments
+
SUSPENDED enrollments
<=
class.capacity
```

must remain true after successful enrollment transactions.

---

## 14. Database Migration Rules

Task 009 must use a new Flyway migration.

Do not edit historical migration:

`V4__create_academic_foundation.sql`

The migration must be:

* deterministic;
* PostgreSQL-compatible;
* consistent with existing naming conventions.

Before applying the new invariant, verify existing data does not already violate it.

Do not silently delete, merge, or modify existing records to make the migration succeed.

---

## 15. API Contract Preservation

Do not redesign unrelated APIs.

Do not change:

* authentication behavior;
* People domain behavior;
* Admissions workflow;
* Task 008 admissions state machine;
* existing Academic Domain endpoints unless required for Task 009.

Do not introduce:

* PRINCIPAL role;
* automatic academic-year activation;
* automatic admissions-to-enrollment creation;
* automatic admission reassessment;
* parent account activation;
* notification infrastructure.

These are outside Task 009.

---

## 16. Required Tests

### 16.1 Academic-Year Tests

Test:

1. Create academic year ? PLANNED.
2. PLANNED ? ACTIVE succeeds.
3. ACTIVE ? COMPLETED succeeds.
4. Same-status transition ? 400.
5. ACTIVE ? PLANNED ? 400.
6. COMPLETED ? ACTIVE ? 400.
7. COMPLETED ? PLANNED ? 400.
8. Teacher status update ? 403.
9. Unauthenticated status update ? 401.
10. Second ACTIVE academic year ? 409.
11. Concurrent activation cannot produce two ACTIVE academic years.

### 16.2 Term Tests

Test:

1. Valid non-overlapping terms succeed.
2. Overlapping terms ? 409.
3. Boundary-sharing terms ? 409.
4. Invalid term date range ? 400.
5. Terms in different academic years do not conflict.
6. Failed overlapping-term creation does not persist the new term.

### 16.3 Class-Capacity Tests

Test:

1. Positive capacity succeeds.
2. Capacity 0 ? 400.
3. Negative capacity ? 400.
4. Default capacity remains 30.
5. Enrollment below capacity succeeds.
6. Enrollment at full capacity ? 409.
7. ACTIVE consumes capacity.
8. SUSPENDED consumes capacity.
9. TRANSFERRED does not consume current capacity.
10. WITHDRAWN does not consume current capacity.
11. Existing duplicate student/year protection remains intact.
12. Concurrent enrollment requests cannot exceed capacity.

---

## 17. Regression Requirements

Existing tests must continue to pass, including:

```text
AcademicYearControllerIntegrationTest
EnrollmentControllerIntegrationTest
SchoolClassControllerIntegrationTest
TeacherAssignmentControllerIntegrationTest
```

plus all new Task 009 tests.

The complete backend test suite must pass.

---

## 18. Documentation

After implementation and successful verification, update:

`docs/DEVELOPMENT_STATUS.md`

Task 009 may be marked:

`VERIFIED COMPLETE`

only after:

* implementation is complete;
* migration succeeds;
* tests pass;
* API behavior is verified;
* final diff is reviewed.

Do not rewrite historical Task 008 decision documents.

---

## 19. Definition of Done

Task 009 is complete only when:

* [ ] Academic-year status update API implemented.
* [ ] Only valid status transitions accepted.
* [ ] Authorization enforced.
* [ ] New academic years remain PLANNED.
* [ ] Database enforces one ACTIVE academic year.
* [ ] Concurrent activation cannot create two ACTIVE years.
* [ ] Term date ordering enforced.
* [ ] Term overlap rejected.
* [ ] Boundary-sharing term dates rejected.
* [ ] Class capacity must be positive.
* [ ] Enrollment respects class capacity.
* [ ] ACTIVE and SUSPENDED consume capacity.
* [ ] TRANSFERRED and WITHDRAWN do not consume capacity.
* [ ] Capacity enforcement is concurrency-safe.
* [ ] Duplicate enrollment protection remains intact.
* [ ] New Flyway migration applied successfully.
* [ ] V4 remains unchanged.
* [ ] Existing exception taxonomy reused.
* [ ] Existing error response shapes preserved.
* [ ] Required integration tests pass.
* [ ] Full backend test suite passes.
* [ ] Documentation updated after verification.
* [ ] No unrelated functionality introduced.
* [ ] No historical migration or Task 008 decision document rewritten.

---

## 20. Authoritative Rule

This document is the source of truth for Task 009.

If an implementation ambiguity is discovered that is not resolved by this contract, stop and report the ambiguity rather than silently inventing a new business rule.

Implementation must remain within Task 009 scope.

**Task 009 status: CONTRACT FROZEN — READY FOR IMPLEMENTATION**
