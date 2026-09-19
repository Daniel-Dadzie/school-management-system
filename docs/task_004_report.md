# TASK 004 — Core Entities & Admissions Implementation Completion Report

## Implemented
- Created the V3 Flyway migration `V3__create_core_people.sql` to establish the core entities:
  - `teachers`, `parents`, `students`, `parent_student`
  - `admission_applications`
- Implemented corresponding JPA Entities:
  - `Teacher` (1:1 with Auth `User`)
  - `Parent` (1:1 with Auth `User`)
  - `Student`
  - `ParentStudent` (Many-to-Many association with composite key `ParentStudentId`)
  - `AdmissionApplication`
- Created Enums reflecting domain statuses (`TeacherStatus`, `StudentStatus`, `AdmissionStatus`, `RelationshipType`).
- **StudentStatus exact values**: `ACTIVE`, `SUSPENDED`, `TRANSFERRED`, `WITHDRAWN`. (No `ENROLLED` or `GRADUATED` or `COMPLETED` permitted as enrollment statuses).
- Implemented Repositories for all new entities.
- Implemented `AdmissionService` and `AdmissionController` to handle public admission application submissions (`POST /api/v1/admissions`).
- Configured Spring Security to permit ONLY `POST` requests to `/api/v1/admissions`, keeping all other methods protected.
- Created robust Request/Response DTOs (`AdmissionApplicationRequest`, `AdmissionApplicationResponse`) using strict Spring Boot Bean Validation annotations.
- Implemented Frontend `AdmissionsPage` at `apps/web/app/(public)/admissions/page.tsx` using `React Hook Form` and `Zod` validation matching backend criteria.

## Files Changed

### Backend (apps/api)
- **[MODIFY]** `src/main/java/com/schoolmanagement/auth/config/SecurityConfig.java` (Permit POST admissions endpoint)
- **[NEW]** `src/main/resources/db/migration/V3__create_core_people.sql` (V3 schema migration)
- **[NEW]** `src/main/java/com/schoolmanagement/people/domain/Teacher.java`
- **[NEW]** `src/main/java/com/schoolmanagement/people/domain/Parent.java`
- **[NEW]** `src/main/java/com/schoolmanagement/people/domain/Student.java`
- **[NEW]** `src/main/java/com/schoolmanagement/people/domain/ParentStudent.java`
- **[NEW]** `src/main/java/com/schoolmanagement/people/domain/ParentStudentId.java`
- **[NEW]** `src/main/java/com/schoolmanagement/people/domain/AdmissionApplication.java`
- **[NEW]** `src/main/java/com/schoolmanagement/people/domain/TeacherStatus.java`
- **[NEW]** `src/main/java/com/schoolmanagement/people/domain/StudentStatus.java`
- **[NEW]** `src/main/java/com/schoolmanagement/people/domain/RelationshipType.java`
- **[NEW]** `src/main/java/com/schoolmanagement/people/domain/AdmissionStatus.java`
- **[NEW]** `src/main/java/com/schoolmanagement/people/repository/TeacherRepository.java`
- **[NEW]** `src/main/java/com/schoolmanagement/people/repository/ParentRepository.java`
- **[NEW]** `src/main/java/com/schoolmanagement/people/repository/StudentRepository.java`
- **[NEW]** `src/main/java/com/schoolmanagement/people/repository/ParentStudentRepository.java`
- **[NEW]** `src/main/java/com/schoolmanagement/people/repository/AdmissionApplicationRepository.java`
- **[NEW]** `src/main/java/com/schoolmanagement/people/dto/AdmissionApplicationRequest.java`
- **[NEW]** `src/main/java/com/schoolmanagement/people/dto/AdmissionApplicationResponse.java`
- **[NEW]** `src/main/java/com/schoolmanagement/people/service/AdmissionService.java`
- **[NEW]** `src/main/java/com/schoolmanagement/people/controller/AdmissionController.java`
- **[NEW]** `src/test/java/com/schoolmanagement/people/controller/AdmissionApplicationIntegrationTest.java`
- **[NEW]** `src/test/java/com/schoolmanagement/people/repository/StudentRepositoryIntegrationTest.java`

### Frontend (apps/web)
- **[NEW]** `app/(public)/admissions/page.tsx` (Admissions Form UI)

## Database Changes
- Applied `V3__create_core_people.sql` creating:
  - `teachers` (FK to `users`)
  - `parents` (FK to `users`)
  - `students`
  - `parent_student` (Composite PK `parent_id`, `student_id`)
  - `admission_applications`
- **V4 Academic Domain**: Implemented separately in TASK 004.2, including `academic_years`, `terms`, `school_classes`, `subjects`, `enrollments`, and `teacher_assignments`.
- **Flyway result**: Executed and applied successfully during tests in Testcontainers, effectively proving structural validation. Verified against fresh PostgreSQL environments via integration testing logic.

## API Changes
- **NEW**: `POST /api/v1/admissions`
  - Request: `AdmissionApplicationRequest`
  - Response: `AdmissionApplicationResponse` (Status: 201 Created)
  - Publicly accessible.

## Tests
- Added `AdmissionApplicationIntegrationTest` ensuring public endpoint access (only `POST`) and rigorous DTO validations via `@Valid`. Tests verify that missing names, invalid emails, future birthdates, and incorrect enums yield `400 Bad Request`.
- Added `StudentRepositoryIntegrationTest` to ensure that saving students only allows correct enums: `ACTIVE, SUSPENDED, TRANSFERRED, WITHDRAWN`.
- **Backend test result**: `mvnw clean test` passes (24/24 tests succeeding) including all integration tests against Testcontainers.

## Validation
- **Frontend build result**: `npm run build` completed successfully.

## Security
- Maintained boundary between `User` authentication logic and domain entity logic (`Teacher`/`Parent`).
- Ensured admission endpoint is publicly accessible ONLY for `POST` but safely strictly validated through `AdmissionApplicationRequest` constraints. `GET` and other methods remain appropriately protected.

## Documentation
- The `task_004_architecture_review.md` rules and decisions are now reflected precisely in code and database constraints.

## Known Issues
- None. Implementation is stable, tests pass, migration succeeds against a fresh database.

## Suggested Next Task
- Proceed to implement the Business Services layer for the Academic Domain (Controllers and specific Application Services).


