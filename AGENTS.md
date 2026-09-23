# CarePoint School Management System — Agent Instructions

## 1. Purpose

This repository contains the CarePoint Community-Based School Management System.

The system consists of:

1. A public school website
2. A secure School Management Portal
3. A Parent Portal within the secure portal

The system is being developed as a production-oriented MVP with a September 30, 2026 delivery target.

The repository is a monorepo containing:

* Next.js frontend
* Spring Boot backend
* PostgreSQL database
* supporting infrastructure and documentation

---

## 2. Mandatory Instructions

Before making any code changes:

1. Read this `AGENTS.md`.
2. Read `docs/PROJECT_CONTEXT.md` if it exists.
3. Read `docs/DEVELOPMENT_STATUS.md` if it exists.
4. Read relevant documentation under:

   * `docs/architecture/`
   * `docs/api/`
   * `docs/database/`
   * `docs/decisions/`
   * `docs/workflows/`
5. Inspect the existing implementation related to the task.
6. Determine what already exists before creating new files or functionality.

Do not assume the repository is empty.

Do not recreate functionality that already exists.

Do not make broad changes outside the requested task.

---

## 3. Architecture

The system uses a modular monolith architecture.

### Frontend

* Next.js
* App Router
* TypeScript
* Tailwind CSS
* TanStack Query
* Zustand
* React Hook Form
* Zod

### Backend

* Java
* Spring Boot
* Spring Security
* REST API
* API version prefix: `/api/v1`

### Database

* PostgreSQL
* JPA/Hibernate
* Flyway migrations
* Supabase for production PostgreSQL hosting

### Supporting Services

* Redis where required
* Cloudinary for images/media
* Supabase Storage for generated documents/report PDFs
* Firebase FCM for push notifications
* SMTP for email
* Paystack for payments
* Sentry for monitoring

---

## 4. Architectural Boundaries

The frontend must never directly access PostgreSQL.

The required flow is:

Next.js
→ Spring Boot REST API
→ PostgreSQL

Business rules belong in the backend.

The frontend may perform UI validation, but backend validation is authoritative.

The frontend must never be the authority for:

* grading
* payment verification
* authorization
* promotion decisions
* security-sensitive business rules

---

## 5. Do Not Change Architecture Without Approval

Do not silently change any of the following:

* PostgreSQL
* Spring Boot
* Next.js
* modular monolith architecture
* REST API architecture
* `/api/v1` API versioning
* JWT authentication architecture
* RBAC/resource authorization model
* JPA/Hibernate
* Flyway
* Cloudinary/Supabase Storage responsibilities
* Paystack payment architecture
* grading architecture
* academic hierarchy
* repository structure

If the existing architecture appears insufficient, STOP before making the architectural change.

Explain:

1. Why the current architecture is insufficient
2. Proposed change
3. Files/modules affected
4. Risks
5. Alternatives

Wait for explicit approval before implementing the architectural change.

---

## 6. Security Rules

Security is a backend responsibility.

Use:

* Spring Security
* secure password hashing
* JWT authentication
* RBAC
* resource/relationship authorization
* server-side validation
* safe error responses
* secure HTTP headers
* appropriate CORS configuration
* rate limiting where required
* audit logging for sensitive operations
* transactions for critical business operations

Never expose:

* password hashes
* JWT secrets
* database passwords
* Supabase service-role keys
* Cloudinary secrets
* Firebase private keys
* Paystack secret keys
* SMTP passwords
* Sentry authentication tokens

Never commit secrets to Git.

Use environment variables/configuration for secrets.

---

## 7. Authorization Rules

RBAC alone is not sufficient.

Use RBAC plus resource/relationship authorization.

### Teachers

Teachers may only access academic resources they are assigned to.

Teacher access must consider:

* teacher
* class
* subject
* academic year
* term
* assignment status

Do not allow a teacher to access another teacher's unassigned class or subject.

### Parents

Parents may only access students/wards linked to them.

Do not expose unrelated student records.

### Principal/Admin

Principal/Admin has school-wide academic and administrative authority.

### Super Admin

Super Admin is responsible primarily for:

* system administration
* users
* roles
* security
* configuration
* technical settings
* audit
* system operations

Super Admin must not make academic promotion decisions merely because of having a higher technical role.

### Students

Students are a core backend entity but do not have login access in the MVP.

Do not introduce student authentication unless explicitly requested.

---

## 8. Academic Rules

Academic hierarchy:

AcademicYear
→ Term
→ Class
→ Student

and:

AcademicYear
→ Term
→ Subject
→ TeacherAssignment

Do not redesign this hierarchy without approval.

---

## 9. Grading Rules

The grading system must be configuration-driven.

Do not hard-code grading schemes into application logic.

Grading schemes are associated with an academic year.

A grading scheme contains:

* grading bands
* assessment weights

Assessment weights must total exactly 100%.

Historical grading schemes must remain traceable.

Final results must reference the grading scheme used to calculate them.

Authoritative grading calculations belong in the backend.

Use `BigDecimal` for score/weight calculations where appropriate.

The grading calculation should behave deterministically:

Same inputs + same grading scheme = same result.

---

## 10. Assessment Rules

Teachers enter raw assessment scores.

The backend calculates weighted/final results.

Blank/null scores must not automatically be interpreted as zero.

Result lifecycle should support appropriate states such as:

* DRAFT
* SUBMITTED
* REVIEWED
* APPROVED
* PUBLISHED
* LOCKED

Published results must not be silently overwritten.

Corrections to published results must be traceable/audited.

---

## 11. Payment Rules

Paystack is the payment provider.

The frontend must never be treated as the payment authority.

Payment confirmation must use server-side verification and/or webhook processing.

Webhook processing must be idempotent.

Provider transaction references must be uniquely tracked.

Use `BigDecimal` for monetary values.

Critical payment updates must occur inside appropriate database transactions.

---

## 12. Promotion Rules

Promotion is an academic decision.

The general workflow is:

Approved results
→ evidence
→ review
→ Principal decision
→ promotion record
→ new class/enrollment

The system may calculate/support promotion evidence.

The system must not silently promote students without the required authority.

Promotion decisions must be auditable.

---

## 13. Storage Rules

Do not store uploaded binary files directly in PostgreSQL unless explicitly approved.

Use:

### Cloudinary

For:

* profile images
* school logo
* gallery images
* public media
* appropriate incident images

### Supabase Storage

For:

* generated report-card PDFs
* generated documents
* appropriate document files

Store references/metadata in PostgreSQL.

Always validate:

* file type
* file size
* authorization
* filename safety
* upload destination
* expected content where appropriate

---

## 14. Database Rules

Use:

* PostgreSQL
* JPA/Hibernate
* Flyway

Database integrity should be enforced at the database level where appropriate.

Use:

* NOT NULL
* UNIQUE
* FOREIGN KEY
* CHECK constraints
* appropriate indexes

Never modify the production database manually when a migration should be used.

Schema changes must be represented through Flyway migrations.

Do not delete or rewrite historical migrations that have already been applied.

---

## 15. Code Quality

Prefer:

* simple solutions
* clear naming
* small modules
* maintainable code
* explicit business rules
* reusable components where appropriate
* testable services
* clear API contracts

Avoid:

* unnecessary abstractions
* premature optimization
* speculative features
* excessive generic utilities
* duplicate implementations
* broad refactoring during feature work

Do not add dependencies unless they solve a real requirement.

---

## 16. Scope Control

Implement only the requested task.

Do not automatically implement:

* unrelated features
* future roadmap items
* post-MVP functionality
* large refactors
* alternative architecture
* additional integrations
* Frontend implementation order must follow backend readiness as tracked in
`docs/DEVELOPMENT_STATUS.md`. Do not build portal screens against a backend
domain listed as NOT STARTED; build the public site and the already
implemented portal domains (authentication, admissions review) first, and
flag remaining screens as blocked rather than building against an invented
contract.

If you discover related work that should be done later, document it rather than silently implementing it.

---

## 17. Existing Functionality

Before creating a new component, service, endpoint, entity, hook, utility, or page:

Search the repository for existing implementations.

Reuse existing functionality where appropriate.

Do not create duplicate:

* API clients
* authentication systems
* validation utilities
* database entities
* UI components
* services
* authorization logic

---

## 18. Testing

Every meaningful implementation should include appropriate tests.

Backend:

* unit tests
* service/business-rule tests
* controller/API tests where appropriate
* authorization tests
* integration tests where appropriate

Frontend:

* lint
* type checking
* appropriate component/feature tests
* production build verification

Security-sensitive functionality requires authorization tests.

Business-critical functionality requires business-rule tests.

---

## 19. API Rules

Use:

`/api/v1/...`

Maintain consistent:

* HTTP methods
* status codes
* request DTOs
* response DTOs
* validation
* error responses
* pagination conventions
* authentication requirements

Do not expose JPA entities directly as public API contracts when a DTO is more appropriate.

---
### 20.0 Frontend rule loading

The frontend is split into two independently owned surfaces inside `apps/web`:

* `app/(public)/**` — the public school website and public admissions flow.
  Governed by `docs/frontend-design-system-public.md` and
  `docs/frontend-agent-rules-public.md`.
* `app/(auth)/**` and `app/(portal)/**` — the authenticated school
  management portal (Super Admin, Principal/Admin, Teacher,
  Parent/Guardian). Governed by `docs/frontend-design-system.md` and
  `docs/frontend-agent-rules.md`.

Load the short rules file for the surface you are working on for every
frontend task. Load the matching full design document whenever a task
creates or changes UI on that surface. Tokens, typography, spacing, icons,
and accessibility rules are defined once in `docs/frontend-design-system.md`;
the public document only overrides what differs for the public site. If the
two disagree on a shared rule, `docs/frontend-design-system.md` governs.

## 20. Frontend Engineering Rules

The frontend is implemented in `apps/web`.

All frontend implementation must follow:

`docs/frontend-design-system.md`

The frontend design system is the source of truth for frontend visual design, UX behavior, layout, responsive behavior, accessibility, and component conventions.

### Frontend Architecture

Use the existing frontend stack:

* Next.js
* App Router
* TypeScript
* Tailwind CSS
* TanStack Query
* Zustand
* React Hook Form
* Zod
* shadcn/ui
* Lucide icons

Do not introduce another frontend framework or UI/component library without explicit approval.

### Frontend Design Rules

* Follow the colors, typography, spacing, layout, component, and interaction rules defined in `docs/frontend-design-system.md`.
* Do not introduce arbitrary colors, typography, spacing, shadows, radii, or visual patterns when an established design token or component already exists.
* Prefer reusable shared components over duplicated UI implementations.
* Maintain a consistent visual hierarchy throughout the application.
* Design interfaces around school-management workflows rather than database structures.
* Prioritize clarity, efficiency, accessibility, and information density over decorative UI.
* Avoid unnecessary gradients, excessive shadows, glassmorphism, oversized cards, excessive animation, and decorative effects that reduce usability.

### Runtime School Branding

The frontend must support school branding through theme tokens/CSS variables rather than hard-coded brand colors.

The default CarePoint colors defined in `docs/frontend-design-system.md` are defaults, not values that must be hard-coded throughout the application.

Authorized administrators may configure supported branding values through the Settings interface.

Branding configuration must come from the backend as authoritative application configuration.

The frontend may cache branding configuration for performance, but cached client state must not become the authoritative source.

Branding configuration must not alter:

* authorization

* business rules

* semantic status meanings

* accessibility requirements

* responsive behavior

* component behavior

* API architecture

* database architecture

School branding is presentation configuration, not security configuration.

Semantic status colors such as success, warning, error/destructive, and informational must remain system-defined and independent of school branding.

Do not introduce arbitrary hard-coded school-brand colors into individual components when an appropriate theme token already exists.

### Layout and Responsiveness

* Frontend pages must work on mobile, tablet, and desktop.
* Use the responsive breakpoints and layout conventions defined in `docs/frontend-design-system.md`.
* Do not treat mobile as a smaller desktop layout.
* Avoid unintended horizontal page overflow.
* Navigation must adapt appropriately to smaller screens.
* Tables must have an intentional mobile presentation.

### Interface States

Follow section 12 of `docs/frontend-design-system.md` (rule U1): every
data view implements all six states (loading, empty, filtered empty,
error, forbidden, populated).

### Forms

Follow section 13 of `docs/frontend-design-system.md` (rules D7, U2,
U3, U7, U8).

### Tables and Operational Actions

Operational tables should prioritize scanability and usability.

Where appropriate, provide:

* Search
* Filtering
* Sorting
* Pagination
* Loading state
* Empty state
* Error state
* Row actions

Destructive or irreversible actions must require deliberate confirmation.

Where appropriate, common operational actions should be available directly from the relevant table row rather than forcing unnecessary navigation.

### State Management

Use:

* TanStack Query for server/API state.
* Zustand for appropriate client/UI state.
* React Hook Form for complex form state.
* Zod for appropriate client-side schema validation.

Do not use frontend state as a replacement for backend persistence or backend business rules.

Do not duplicate authoritative business logic in the frontend.

### API Integration

The frontend communicates with the Spring Boot API.

The frontend must:

* Use the established `/api/v1` API contracts.
* Handle loading, success, validation, authorization, conflict, and server-error states.
* Invalidate or refresh relevant server state after successful mutations.
* Avoid assuming that a mutation succeeded before receiving authoritative backend confirmation.

The frontend must never:

* Connect directly to PostgreSQL.
* Connect directly to Supabase PostgreSQL.
* Access privileged backend infrastructure.
* Expose backend secrets.
* Perform authoritative grading calculations.
* Verify payments authoritatively.
* Make authoritative promotion decisions.
* Enforce authorization as a replacement for backend authorization.

### Authorization-Aware UX

The frontend should provide an appropriate interface based on the authenticated user's role and permissions.

For example:

* Hide or disable unavailable actions where appropriate.
* Do not present irrelevant administrative controls to teachers or parents.
* Do not expose unrelated student records.
* Handle `401 Unauthorized` and `403 Forbidden` responses safely.

Frontend visibility controls are for user experience only.

The backend remains the authoritative security boundary.

### Accessibility

Frontend implementation must follow the accessibility requirements in:

`docs/frontend-design-system.md`

At minimum:

* Use semantic HTML.
* Provide accessible labels.
* Support keyboard navigation.
* Maintain visible focus states.
* Use accessible dialogs.
* Maintain sufficient contrast.
* Do not communicate important information using color alone.
* Provide accessible names for icon-only controls.

### Frontend Completion Requirements

Frontend work is not complete until the implementation has been checked for:

* Desktop responsiveness
* Tablet responsiveness
* Mobile responsiveness
* Loading state
* Empty state
* Error state
* Successful/populated state
* Form validation
* Mutation/loading behavior
* Destructive-action confirmation
* Authorization-aware UI
* Accessibility
* API integration
* Reusable component usage
* No unintended horizontal overflow
* No unexplained browser console errors
* Successful frontend lint/type/build checks where configured

For detailed frontend standards, always consult:

`docs/frontend-design-system.md`



## 21. Audit Logging

Audit sensitive and business-critical mutations.

Examples:

* role changes
* student record changes
* grade changes
* result publication
* promotion approval
* payment state changes
* incident updates
* admission decisions
* administrative changes

Audit records should identify the relevant actor, action, target/resource, timestamp, and useful contextual information without storing secrets.

---

## 22. Git Discipline

Work should normally happen on a feature branch.

Preferred flow:

feature/*
→ Pull Request
→ CI
→ review
→ develop
→ testing
→ main
→ production

Do not directly rewrite or force-push shared branches unless explicitly instructed.

Before completing a task:

* inspect `git status`
* inspect `git diff`
* run relevant tests
* report files changed
* report tests executed
* report known limitations

---

## 23. Change Integrity and Git Forensics

Antigravity must treat the existing repository state as authoritative unless the current task explicitly requires a change.

A successful test suite does not prove that the working tree contains only correct changes.

### Before Editing

Before modifying any existing file:

1. Inspect the current working tree:

```powershell
git status --short
git diff --stat
git diff
```

2. Inspect the `HEAD` version of every relevant existing file:

```powershell
git show HEAD:<path>
```

3. Identify exactly what the task requires changing.

4. Create a mental or written baseline of the relevant file before editing.

5. Search for existing implementations before creating or replacing code.

### Existing-File Modification Rule

When modifying an existing file:

* Preserve all unrelated existing code.
* Preserve existing formatting unless formatting is part of the task.
* Preserve existing security rules.
* Preserve existing API behavior.
* Preserve existing tests and assertions unless the task explicitly requires their modification.
* Do not rewrite an entire file when a targeted edit is sufficient.

Every changed line must have a reason related to the current task.

### Required Change Classification

After implementation, inspect every changed file and classify each modification as:

* **KEEP** — required and correct
* **CORRECT** — required but implemented incorrectly and must be fixed
* **REVERT** — unrelated or accidental
* **INVESTIGATE** — cannot be verified from available evidence

Do not consider a task complete while unexplained modifications remain.

### Security Diff Review

Any change involving:

* Spring Security
* authentication
* authorization
* JWT
* CORS
* CSRF
* public/protected endpoints
* roles
* permissions
* resource ownership
* actuator endpoints

requires an explicit comparison against `HEAD`.

Verify that no existing security rule was accidentally removed, weakened, reordered, or broadened.

For authorization configuration, inspect the complete authorization chain rather than only the changed line.

### Test Diff Review

When modifying tests:

1. Compare the test against `HEAD`.
2. Identify every changed line.
3. Confirm each change is required.
4. Preserve existing test behavior and assertions.
5. Do not perform unrelated formatting or cleanup.
6. Verify that the test still represents the intended security/business behavior.

A test passing after modification does not justify unrelated test changes.

### Dependency Change Review

When adding, removing, or replacing a dependency:

1. Inspect the existing dependency declaration.
2. Inspect the framework version.
3. Inspect the dependency tree when necessary.
4. Determine whether the framework already supplies the required functionality.
5. Check for transitive dependencies.
6. Verify that no required runtime or test functionality is lost.

Do not apply dependency guidance from another framework major version without verification.

### Database Change Review

Before changing migrations or entities:

* Compare existing migrations.
* Verify table names.
* Verify column names.
* Verify foreign keys.
* Verify constraints.
* Verify indexes.
* Verify migration ordering.
* Verify entity-to-table mappings.

Never silently replace an established schema name with an alternative name.

### Documentation Integrity

Documentation must be verified against the actual repository state.

Do not document:

* tests that were not executed
* features that were not implemented
* migrations that were not applied
* files that were not changed
* a clean working tree when uncommitted changes exist
* a future task as completed work

If documentation and implementation disagree, verify the implementation first and then update the documentation accordingly.

### Mandatory Post-Edit Verification

After implementation, before reporting completion, run:

```powershell
git status --short
git diff --check
git diff --stat
git diff
```

Review the complete diff.

The final diff must contain only changes required by the task.

### No Broad Cleanup

Do not perform broad cleanup during a task.

Do not automatically:

* reformat unrelated files
* normalize line endings
* reorder unrelated imports
* rename unrelated identifiers
* update unrelated documentation
* upgrade dependencies
* refactor neighboring modules
* fix unrelated lint warnings

Record unrelated improvements as follow-up recommendations instead.

### Temporary Files

Do not leave temporary files, generated review files, debug files, logs, or scratch artifacts in the repository.

Before completion:

```powershell
git status --short
```

must contain only intentional task changes.

### Commit Gate

Antigravity must not commit or push unless explicitly instructed.

Before any requested commit, verify:

```powershell
git status --short
git diff --check
git diff
```

If any changed line cannot be explained as part of the task, stop and resolve it before committing.

### Core Rule

Passing tests answers:

> "Does the tested behavior currently pass?"

Git diff review answers:

> "Did the agent change only what it was supposed to change?"

Both questions must be answered before a task is considered complete.


## 24. Definition of Done

A task is not complete merely because the code compiles.

Where applicable, completion means:

1. Implementation complete
2. Backend validation implemented
3. Authorization implemented
4. Business rules implemented
5. Frontend validation implemented
6. Loading states handled
7. Error states handled
8. Empty states handled
9. Responsive UI handled
10. Tests added/updated
11. Documentation updated
12. Security implications reviewed
13. Git diff reviewed
14. Relevant CI checks pass

For frontend tasks, the checklist in section 25.3 of docs/frontend-design-system.md also applies.

---

## 25. Agent Behavior

If requirements are ambiguous but can be resolved from existing project documentation, use the documentation.

If ambiguity materially affects architecture, security, data integrity, or business rules:

STOP and explain the ambiguity before implementing.

Do not guess critical requirements.

If implementation conflicts with an existing architectural decision:

STOP and report the conflict.

Do not silently override project decisions.

---

## 26. Task Completion Report

At the end of every task, report:

### Implemented

* ...

### Files Changed

* ...

### Tests

* ...

### Validation

* ...

### Security

* ...

### Documentation

* ...

### Known Issues

* ...

### Recommended Next Task

* ...

Do not start the next unrelated task automatically.


# Antigravity Operating Rules

## Working Model

The repository is developed using a controlled AI-assisted development workflow.

The roles are:

* Project owner/developer: Daniel Yaw Dadzie
* Architecture/planning/review: ChatGPT
* Implementation/coding agent: Antigravity

Antigravity is an implementation agent, not the authority for changing project architecture.

---

## Before Every Task

Before modifying anything:

1. Read the root `AGENTS.md`.
2. Read `docs/PROJECT_CONTEXT.md`.
3. Read `docs/DEVELOPMENT_STATUS.md`.
4. Read the relevant documentation under `docs/`.
5. Inspect the existing implementation.
6. Inspect related tests.
7. Check the current Git branch and working tree.

Commands may include:

```powershell
git status
git branch --show-current
git diff
```

Do not assume that previous work is missing.

---

## Task Boundaries

Antigravity must implement only the task explicitly provided in the current task brief.

Do not automatically continue into the next feature.

Do not interpret a task such as "implement authentication" as permission to also implement:

* parent portal
* student login
* payments
* admissions
* notifications
* unrelated UI
* unrelated database modules

Complete the requested task first.

---

## Repository Inspection

Before creating a new file, search for an existing implementation that may already satisfy the requirement.

Before creating:

* entity
* service
* controller
* repository
* DTO
* component
* hook
* store
* utility
* API client
* validation schema

check whether an appropriate implementation already exists.

Prefer extending an existing implementation over creating a duplicate.

---

## No Silent Architecture Changes

If the task reveals a conflict with the approved architecture:

STOP.

Do not silently redesign the system.

Report:

1. The conflict
2. Why it matters
3. The proposed solution
4. Files/modules affected
5. Risks
6. Alternatives

Wait for explicit approval before implementing an architectural change.

---

## No Scope Creep

Do not:

* refactor unrelated modules
* rename large groups of files unnecessarily
* introduce new frameworks
* introduce new infrastructure
* replace existing libraries without approval
* implement post-MVP features
* create speculative abstractions
* modify unrelated code merely because it could be improved

If an improvement is discovered outside the task, report it under "Follow-up Recommendations".

---

## Production-Code Standard

Code should be:

* readable
* maintainable
* secure
* testable
* appropriately modular
* production-oriented

Do not optimize prematurely.

Do not overengineer.

Prefer the simplest design that satisfies the requirements and architectural constraints.

---

## Stop Conditions

Stop and ask for clarification/approval if:

* a requirement conflicts with an architectural decision
* database migration strategy is unclear
* authorization requirements are unclear
* a security-sensitive behavior is ambiguous
* existing code contradicts project documentation
* the requested implementation would require a major dependency or framework change
* the task would materially expand MVP scope

Do not guess about security-critical or data-integrity-critical behavior.

---

## Completion Protocol

When the task is complete:

1. Run relevant tests.
2. Run relevant lint/type/build checks.
3. Inspect `git diff`.
4. Check `git status`.
5. Update `docs/DEVELOPMENT_STATUS.md` only
when the completed task changes the project's implementation status and the update is directly relevant.
6. Do not begin another unrelated task.

Report:

### Implemented

What was implemented.

### Files Changed

List files created/modified/deleted.

### Database Changes

List migrations/schema changes.

### API Changes

List endpoints/contracts changed.

### Tests

List tests executed and results.

### Security

Explain relevant authorization/validation/security handling.

### Documentation

List documentation updated.

### Known Issues

List anything unresolved.

### Follow-up Recommendations

List work that should be done later.

### Suggested Next Task

Suggest exactly one logical next task.

---

## Important

Do not repeatedly restart the project from scratch.

Do not recreate the application because a requested feature is not immediately visible.

Inspect first.

Modify second.

Test third.

Report fourth.
