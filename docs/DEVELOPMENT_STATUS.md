# CarePoint School Management System — Development Status

> This document is the current implementation status of the repository.
>
> Update it after completing meaningful implementation work.
>
> Status claims must reflect verified repository evidence and test results.

## Last Updated

2026-09-20

---

# 1. Repository Status

Repository:

`school-management-system`

Current integration branch:

`develop`

Current state:

* repository initialized
* monorepo structure established
* frontend initialized
* backend initialized
* backend module structure established
* documentation structure established
* authentication foundation implemented
* core people domain implemented
* academic foundation implemented
* frontend foundation implemented
* frontend API integration foundation implemented
* refresh-token persistence and rotation foundation implemented
* integration tests verified
* complete backend test suite verified: 37/37 passing

Working tree should remain clean when a task is completed and committed.

---

# 2. Completed

## Repository Foundation

* [x] Git repository initialized
* [x] `main` branch established
* [x] `develop` integration branch established
* [x] Monorepo structure created
* [x] `apps/web` created
* [x] `apps/api` created
* [x] `docs` structure created
* [x] Backend module directories created
* [x] Frontend feature directories created

## Frontend Foundation

* [x] Next.js application initialized
* [x] TypeScript configured
* [x] Tailwind CSS configured
* [x] App Router structure initialized
* [x] Frontend components structure created
* [x] Frontend features structure created
* [x] Hooks structure created
* [x] Services structure created
* [x] Stores structure created
* [x] Schemas structure created
* [x] Types structure created
* [x] Providers structure created

## Backend Foundation

* [x] Spring Boot application initialized
* [x] Maven wrapper configured
* [x] Main application created
* [x] Backend module package structure created
* [x] Test application initialized
* [x] Resource configuration initialized
* [x] Flyway migration directory created

## Documentation Foundation

* [x] `docs/api/`
* [x] `docs/architecture/`
* [x] `docs/database/`
* [x] `docs/decisions/`
* [x] `docs/workflows/`

---

# 3. Infrastructure Foundation

Status:

`COMPLETED`

Tasks:

* [x] PostgreSQL development setup verified
* [x] Database environment variables configured
* [x] Flyway configured
* [x] Initial database migration created
* [x] JPA/Hibernate configuration verified
* [x] Docker development configuration created
* [x] Testcontainers PostgreSQL integration verified
* [x] Environment configuration verified

> Redis is explicitly deferred until a concrete caching or session requirement justifies introducing it.

---

# 4. Development Roadmap

The roadmap below represents the overall delivery plan. Individual task status must be based on verified implementation rather than planned work.

## Phase 1 — Foundation

1. Database foundation — **COMPLETED**
2. Authentication — **COMPLETED**
3. Authorization — **COMPLETED / foundational**
4. Base security configuration — **COMPLETED**

## Phase 2 — Core School Data

1. Users — **COMPLETED**
2. Students — **COMPLETED**
3. Parents — **COMPLETED**
4. Teachers — **COMPLETED**
5. Parent-student relationships — **COMPLETED**
6. Academic years — **COMPLETED**
7. Terms — **COMPLETED**
8. Classes (`school_classes`) — **FOUNDATION COMPLETED**
9. Subjects — **COMPLETED**
10. Teacher assignments — **COMPLETED**
11. Enrollments — **COMPLETED**

## Phase 3 — Academic Operations

1. Academic domain business services — **NEXT TASK**
2. Attendance — NOT STARTED
3. Assessments — NOT STARTED
4. Gradebook — NOT STARTED
5. Grading schemes — NOT STARTED
6. Results — NOT STARTED
7. Result review — NOT STARTED
8. Result publication — NOT STARTED

## Phase 4 — Reporting and Parent Portal

1. Report cards — NOT STARTED
2. PDF generation — NOT STARTED
3. Report storage — NOT STARTED
4. Parent portal — NOT STARTED
5. Student performance reports — NOT STARTED
6. Attendance reports — NOT STARTED

## Phase 5 — Administration

1. Admissions — **FOUNDATION COMPLETED**
2. Fees — NOT STARTED
3. Payments — NOT STARTED
4. Incidents — NOT STARTED
5. Promotions — NOT STARTED
6. Notifications — NOT STARTED

## Phase 6 — Production Readiness

1. Security hardening — **FOUNDATION IMPLEMENTED / FURTHER HARDENING REQUIRED**
2. Audit verification — NOT STARTED
3. Automated tests — **IN PROGRESS**
4. CI/CD — **FOUNDATION COMPLETED**
5. Monitoring — NOT STARTED
6. Deployment — NOT STARTED
7. Public website — **FOUNDATION IMPLEMENTED**
8. UI polish — **FOUNDATION COMPLETED**
9. End-to-end integration testing — NOT STARTED

---

# 5. Architectural Decisions

Current decisions:

* Modular monolith
* Next.js frontend
* Spring Boot backend
* PostgreSQL database
* JPA/Hibernate
* Flyway migrations
* REST API
* `/api/v1` API versioning
* JWT authentication
* Short-lived access tokens
* Opaque refresh tokens
* Database-backed refresh-token rotation and revocation
* HttpOnly refresh-token cookie
* RBAC + resource/relationship authorization
* Supabase PostgreSQL hosting
* Cloudinary for images/media
* Supabase Storage for generated documents
* Paystack for payments
* Firebase FCM for push notifications
* SMTP for email
* Sentry for monitoring
* Docker for containerization
* GitHub Actions for CI/CD
* Redis disabled/deferred until a concrete requirement exists

Security boundary:

```text
Next.js Frontend
        |
        | HTTPS REST API
        v
Spring Boot API
        |
        v
PostgreSQL
```

The frontend never directly connects to PostgreSQL.

Do not change these architectural decisions without following the architectural change process in `AGENTS.md`.

---

# 6. Current Priority

## Completed

* **TASK 001** — Monorepo & Base Infrastructure Setup
* **TASK 002** — Database Foundation & Migrations
* **TASK 003** — Authentication & Security Foundation
* **TASK 004.1** — Core Entities & Admissions Implementation
* **TASK 004.2** — Academic Domain Foundation
* **TASK 006** — Frontend UI Foundation
* **TASK 007** — Frontend/API Integration Foundation
* **V5 Authentication Session Hardening** — Refresh-token persistence and cookie-based session foundation

Current flow:

```text
Database Foundation
        ↓
Authentication & Security Foundation
        ↓
Core School Entities / People Domain
        ↓
Academic Domain Foundation
        ↓
Frontend Foundation
        ↓
Frontend/API Integration Foundation
        ↓
Authentication Session Hardening
        ↓
Academic Domain Business Services
        ↓
```

## In Progress

* None

## Next Up

* **TASK 005 — Academic Domain Business Services**

This remains the next feature-development task because the academic foundation exists, but its application/service/API layer has not yet been implemented.

---

# 7. Development Rules

Each feature should follow:

```text
Requirements
    ↓
Design
    ↓
Database/API contract
    ↓
Backend implementation
    ↓
Authorization
    ↓
Business rules
    ↓
Tests
    ↓
Frontend implementation
    ↓
Frontend validation
    ↓
UI states
    ↓
Integration testing
    ↓
Documentation
```

---

# 8. Task Tracking

For each completed task, record:

* task name
* date
* branch
* files changed
* database changes
* API changes
* tests
* known issues
* next task

Status claims must distinguish between:

* implemented
* verified
* partially implemented
* planned
* deferred

Do not mark a feature complete merely because files or database tables exist.

---

# 9. Completed Task Log

## Repository Foundation

Status: Completed

Details:

* monorepo initialized
* frontend initialized
* backend initialized
* core project directories established

---

## Database Foundation — TASK 002

Status: Completed

Details:

* PostgreSQL development infrastructure configured
* Spring Boot database configuration established
* HikariCP configured
* Flyway migrations configured
* JPA/Hibernate configured with `ddl-auto=validate`
* Testcontainers PostgreSQL integration established
* database initialization verified

---

## Authentication & Security Foundation — TASK 003

Status: Completed

Details:

* Configured Spring Security for stateless JWT authentication.
* Implemented `User` and `Role`.
* Created the authentication schema and `users` table.
* Added deterministic email/username login resolution.
* Added BCrypt password verification.
* Configured global 401/403 handling.
* Prevented password hashes from being exposed through DTOs.
* Removed wildcard production CORS defaults.
* Established backend RBAC foundations.

---

## Core Entities & Admissions — TASK 004.1

Status: Completed

Details:

* Core people domain implemented.
* Student-related entities and repositories implemented.
* Admission application domain implemented.
* Public admissions submission flow implemented.
* Admissions API authorization behavior established.
* V3 database migration implemented.
* Admission integration tests implemented and verified.

---

## Academic Domain Foundation — TASK 004.2

Status: Completed

Details:

* Created `V4__create_academic_foundation.sql`.
* Created academic foundation tables:

  * `academic_years`
  * `terms`
  * `school_classes`
  * `subjects`
  * `enrollments`
  * `teacher_assignments`
* Implemented corresponding JPA entities.
* Implemented Spring Data JPA repositories.
* Implemented academic enums and status values.
* Enforced mandatory term relationships where required.
* Enforced teacher-assignment term relationships.
* Verified entity-to-database mappings with `ddl-auto=validate`.
* Verified Flyway V1 through V4 using Testcontainers PostgreSQL.
* Academic business services and API controllers remain unimplemented.

---

## Authentication Session Hardening — V5

Status: Implemented / Verified

Details:

* Added `refresh_tokens` database schema.
* Implemented opaque refresh-token generation separate from access JWT generation.
* Stores only SHA-256 refresh-token hashes in the database.
* Added refresh-token family tracking.
* Added expiration and revocation fields.
* Added refresh-token replacement tracking.
* Implemented HttpOnly `refresh_token` cookie handling.
* Access token remains in the JSON authentication response.
* Refresh token is not returned in the JSON authentication response.
* Implemented refresh-token persistence during authentication.
* Implemented refresh-token rotation foundation.
* Implemented logout/session revocation foundation.
* Frontend authentication state stores the access token in memory rather than browser persistent storage.
* Frontend API client supports refresh-on-401 with a shared refresh request and retry protection.

Authentication contract:

```text
POST /api/v1/auth/login
        ↓
JSON:
    accessToken
    user

Cookie:
    refresh_token (HttpOnly)
```

The raw refresh token must never be persisted as a database value or returned as a JSON response field.

---

## Frontend UI Foundation — TASK 006

Status: Completed

Details:

* Established CarePoint design tokens.
* Configured Inter typography.
* Added reusable UI primitives.
* Added responsive `PortalLayout`.
* Added collapsible sidebar.
* Added top header.
* Added breadcrumbs and reusable page shell.
* Added loading states.
* Added empty states.
* Added confirmation dialogs.
* Added toast notifications.
* Added responsive navigation behavior.
* Verified with:

  * `npm run lint`
  * `npx tsc --noEmit`
  * `npm run build`

Frontend checks passed after clearing the local `.next` build directory following a transient Windows/Next.js worker failure.

---

## Frontend/API Integration Foundation — TASK 007

Status: Completed

Details:

* Added centralized frontend API client.
* Added API error abstraction.
* Added TanStack Query provider.
* Added frontend authentication store.
* Added access-token memory state.
* Added refresh-on-401 handling.
* Added protection against concurrent refresh requests.
* Added retry-once behavior to prevent refresh loops.
* Added `/system-status` integration surface.
* Connected admissions frontend foundation to the API layer.
* Established credentialed requests for authentication cookie endpoints.
* Avoided storing refresh tokens in localStorage/sessionStorage.

---

# 10. Verification Status

## Security Integration Test

Latest verified result:

Tests run: 8
Failures: 0
Errors: 0
Skipped: 0
BUILD SUCCESS

The test suite verifies the authentication/security contract, including:

* email login
* username login
* invalid credentials rejection
* nonexistent-user generic authentication error
* protected route rejection without authentication
* valid JWT authorization
* invalid JWT rejection
* public actuator health endpoint
* access-token response contract
* refresh-token persistence
* password-field protection

---

## Enrollment Controller Integration Test

Latest verified result:

```text
Tests run: 3
Failures: 0
Errors: 0
Skipped: 0
BUILD SUCCESS
```

Verified behaviors:

* valid enrollment returns `201 Created`
* duplicate enrollment returns `409 Conflict`
* unauthorized teacher enrollment returns `403 Forbidden`

Test fixtures use BCrypt-encoded passwords and explicitly enabled users.

---

## Testcontainers / Database Verification

Verified:

* Docker/Testcontainers PostgreSQL starts successfully.
* PostgreSQL 16 container is usable for integration tests.
* Flyway V1 through V5 validate and apply successfully.
* Hibernate/JPA initializes successfully.
* `refresh_tokens` persistence is exercised by authentication integration tests.
* Academic entities and enrollment persistence are exercised by integration tests.

A previous Testcontainers startup failure was transient and has subsequently been reproduced successfully with passing integration tests.

---

# 11. Current Known Issues

No currently known blocking implementation issue.

Latest complete backend verification:

* Tests run: 37
* Failures: 0
* Errors: 0
* Skipped: 0
* BUILD SUCCESS

The complete backend test suite is currently green.

Non-blocking development warnings currently observed include:

* explicit PostgreSQLDialect configuration is deprecated/unnecessary in the current Hibernate version
* JwtAuthenticationFilter uses a deprecated API

These warnings do not currently cause test failures and are not blocking TASK 005.

---

# 12. Important Scope Constraints

MVP does NOT include:

* student login
* student dashboard
* payroll
* library
* transport
* hostel
* timetable automation
* advanced analytics
* AI features
* biometric attendance
* mobile application

These remain post-MVP unless explicitly approved.

---

# 13. Next Task

The immediate next implementation task is:

**TASK 005 — Academic Domain Business Services**

Scope:

* Academic application/service layer
* Request/response DTOs
* Academic controllers
* Validation
* Authorization/resource checks
* Academic business rules
* Appropriate integration tests

The academic foundation already exists and must not be recreated.

Before implementation:

1. Inspect the existing academic entities and repositories.
2. Inspect the approved architecture documentation.
3. Inspect existing authorization patterns.
4. Define the API contract.
5. Implement only the approved Academic Business Services scope.
6. Run targeted tests.
7. Run the complete backend suite.
8. Update this document with verified results.

Do not claim Academic Domain Business Services are implemented until the corresponding application/service/API code and tests have been verified.
