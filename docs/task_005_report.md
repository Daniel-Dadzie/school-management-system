# TASK 005 - Report

## Objective
Implement the Academic Domain Business/Application Services layer on top of the already completed V4 Academic Domain foundation. Ensure robust authorization controls matching the strict rules defined in the plan, focusing on scoped read access for TEACHERs.

## Work Accomplished

### 1. DTO Implementation
Created Request and Response DTOs for the V4 Academic Domain entities:
- `AcademicYearRequest`, `AcademicYearResponse`
- `TermRequest`, `TermResponse`
- `SchoolClassRequest`, `SchoolClassResponse`
- `SubjectRequest`, `SubjectResponse`
- `EnrollmentRequest`, `EnrollmentResponse`, `EnrollmentStatusUpdateRequest`
- `TeacherAssignmentRequest`, `TeacherAssignmentResponse`, `AssignmentStatusUpdateRequest`

### 2. Service Implementation
Created application services enforcing business validation and database integration:
- `AcademicYearService`: Enforces start before end dates and checks for unique constraints automatically.
- `TermService`: Provides year-associated terms.
- `SchoolClassService`: Handles scoped authorization for teachers retrieving active classes. 
- `SubjectService`: Handles scoped authorization for teachers retrieving active subjects.
- `EnrollmentService`: Enforces non-overlapping active/suspended enrollments.
- `TeacherAssignmentService`: Ensures teachers aren't assigned to identical class, subject, and term combinations.

### 3. Repository Scoping Enhancements
Updated Spring Data JPA repositories with explicit scoped queries to ensure data fetching logic enforces authorization boundaries:
- Added `@Query` explicitly resolving `com.schoolmanagement.academic.domain.AssignmentStatus.ACTIVE` for `findActiveClassesByTeacherId` and `findActiveSubjectsByTeacherId` in `TeacherAssignmentRepository`.
- Added queries to securely assert duplicate constraint validation before mutating.

### 4. Controller Implementation
Mapped specific endpoint routes explicitly validating payloads and injecting principal users for security scoping:
- `AcademicYearController`
- `SchoolClassController`
- `SubjectController`
- `EnrollmentController`
- `TeacherAssignmentController`

All controllers utilize Spring Method Security (`@PreAuthorize`) mapping specific `Role` access per endpoint as outlined in the accepted architecture review.

### 5. Custom Domain Exceptions & Error Handling
To eliminate tight coupling of domain services with HTTP status codes:
- Registered domain exceptions: `ResourceNotFoundException`, `ResourceConflictException`, `BusinessValidationException`, `UnauthorizedResourceAccessException` in a generic `common.exception` package.
- Mapped these to consistent API responses via the `GlobalExceptionHandler` with 404, 409, 400, and 403 status codes.

### 6. Integration Testing
Developed complete Testcontainers-based Integration Tests spanning across boundaries simulating `ADMIN`, `TEACHER`, and `UNAUTHENTICATED` user states:
- `AcademicYearControllerIntegrationTest`
- `SchoolClassControllerIntegrationTest`
- `EnrollmentControllerIntegrationTest`
- `TeacherAssignmentControllerIntegrationTest`

The tests actively prove 401/403/400 validation boundaries and scoping requirements.

## Current State & Next Steps
- V3 (People Domain) and V4 (Academic Domain & Services) layers are successfully implemented.
- **Git State:** Local tree is populated with untracked implementation files representing the domain service logic. A final review can be executed by the user before committing.
