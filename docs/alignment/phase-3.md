# Karatu Phase 3 Alignment Report: Tenant Isolation and Identity Model

## 1. Inventory and Audit

### School-Owned Entities (Must carry `school_id`)
* **Academic**: `AcademicYear`, `Assessment`, `AssessmentResult`, `AttendanceRecord`, `Enrollment`, `SchoolClass`, `Subject`, `TeacherAssignment`, `Term`
* **People**: `AdmissionApplication`, `Parent`, `Student`, `Teacher`
* **Others**: `User` (hybrid: `school_id` is null for `SUPER_ADMIN`, not null for others), `UserManagementAuditLog` (has `school_id`)

### Ambiguous or Missing `school_id`
* `ParentStudent` entity (join table) is missing a `schoolId` mapping in Java, though it was added to the database via `V9__add_school_tenancy.sql`.
* `RefreshToken` is platform-level, but associated with `User`.

### Platform-Level Entities (No `school_id`)
* `School` (the tenant record itself)
* `RefreshToken` (belongs to users)

## 2. Implicit Tenant Scoping and Leaks

The database migrations (`V9`) successfully added `school_id` columns, composite foreign keys, and indexes to all school-owned tables. The Java domain models (`SchoolOwnedEntity`) intercept access via `@PostLoad` and verify ownership. However, lookup and retrieval in services currently bypass the database-level isolation by using generic JPA methods.

### High-Risk Repository and Service Usages
| Location | Risk | Fix |
|---|---|---|
| `AcademicYearService.java` | Implicit `findById` | Replace with `findByIdAndSchoolId` |
| `AttendanceService.java` | Implicit `findById` (for Term, Class, Subject, Student, Record) | Replace with explicit scoped lookups |
| `EnrollmentService.java` | Implicit `findById` (for Student, Year, Enrollment) | Replace with explicit scoped lookups |
| `TeacherAssignmentService.java` | Implicit `findById` | Replace with explicit scoped lookups |
| `TermService.java` | Implicit `findById` | Replace with explicit scoped lookups |
| `AdmissionService.java` | Implicit `findById` | Replace with explicit scoped lookups |
| `AssessmentRepository.java` | Unscoped `@Query` (`findByIdWithDetails`) | Add `AND a.schoolId = :schoolId` |
| `AssessmentRepository.java` | Unscoped `findByTeacherAssignmentId...` | Rename to `findByTeacherAssignmentIdAndSchoolId` |
| `SchoolClassRepository.java` | Unscoped `@Query` | Add `AND s.schoolId = :schoolId` |
| `TeacherAssignmentRepository.java` | Unscoped `@Query`s | Add `AND ta.schoolId = :schoolId` |

**Risk**: A malicious user from School A could query endpoints guessing UUIDs from School B. While `@PostLoad` intercepts the entity and throws `UnauthorizedResourceAccessException` (causing a 403 or 500 error), this still leaks existence.
**Fix**: All methods must be changed to `findByIdAndSchoolId(...)` returning an `Optional`, allowing the service to throw a clean 404.

## 3. Tenant Context Lifecycle Review
- `JwtAuthenticationFilter`: Correctly extracts the school ID from the authenticated user, verifies the school is active, sets `TenantContext.setSchoolId(user.getSchoolId())`, and crucially uses a `finally` block to call `TenantContext.clear()`.
- `AdmissionService.submitApplication`: Correctly uses `try-finally` to safely swap `TenantContext` to the public school based on the `schoolSlug` and restores the previous context.
- Async, Thread Pools, Scheduled Jobs: None exist that interact with school-owned data.
- **Verdict**: The lifecycle management is robust and thread-safe.

## 4. Identity Model Decision

### Model Selected: Global Identity with Per-School Membership
To support the requirement that users (such as parents) can log in via Phone/SMS (E.164 normalized) or Email across potentially multiple schools, the system must support a unified platform identity mechanism, while maintaining strict school boundaries.

**Decision**: 
The `users` table will remain the source of authentication credentials. Since `User` currently belongs to a specific `school_id`, the email and username uniqueness constraint must be per-school (already enforced via `uq_users_school_row_id`, though global uniqueness is currently checked in `SchoolService`).

Since we need phone authentication and a single user might have children in multiple Karatu schools, a pure global user identity mapping to school profiles (memberships) is technically superior. However, modifying `User` to be fully global (removing `school_id` from `users` and creating a `school_users` table) is a significant architectural change that would rewrite V9.

**Adoption**:
We will keep `User` scoped to `school_id` for MVP, meaning a parent in two Karatu schools will have two distinct user records. We will add `phone_number` to `User` (normalized E.164) as a secondary login identifier.
