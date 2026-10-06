# Karatu — Agent Instructions

## 1. Purpose

This repository contains **Karatu**, a multi-tenant, shared-hosted school management SaaS.

**CarePoint Community School is Karatu's first tenant, not the product identity.**

Karatu is intended to operate as a configurable school operating system covering academic operations, assessment and grading, reporting, finance, people, communication, and related school workflows.

The system consists of:

1. **Karatu product/marketing surface**
2. **Per-school authenticated tenant portals**
3. **Parent Portal**
4. **Spring Boot backend API**
5. **PostgreSQL persistence layer**
6. **Supporting integrations and infrastructure**

The current CarePoint public website is an existing tenant-facing surface and is **frozen unless a task explicitly authorizes changes to it**.

There is no fixed delivery date. Work is completed through controlled implementation tasks and explicit phase gates.

### Where Things Live

Repository documentation is organized as follows:

- `docs/PROJECT_CONTEXT.md` — project context
- `docs/DEVELOPMENT_STATUS.md` — current implementation status
- `docs/architecture/` — authoritative architecture and domain source-of-truth documents
- `docs/api/` — API contracts
- `docs/database/` — database documentation
- `docs/decisions/` — Architecture Decision Records
- `docs/alignment/` — implementation/alignment reports
- `docs/workflows/` — workflow documentation
- `docs/frontend-design-system.md` — authenticated application design system
- `docs/frontend-agent-rules.md` — authenticated frontend implementation rules
- `docs/frontend-design-system-public.md` — public-site design system
- `docs/frontend-agent-rules-public.md` — public-site implementation rules

### Authoritative Domain Documents

The following documents are authoritative for their respective product/domain decisions:

- `docs/architecture/ACADEMIC_OPERATIONS_SOURCE_OF_TRUTH.md`
- `docs/architecture/ASSESSMENT_SOURCE_OF_TRUTH.md`
- `docs/architecture/FINANCE_SOURCE_OF_TRUTH.md`
- `docs/architecture/MULTI_TENANCY_SOURCE_OF_TRUTH.md`
- `docs/architecture/REPORTING_SOURCE_OF_TRUTH.md`
- `docs/product/KARATU_PRODUCT_PRINCIPLES.md`

Do not duplicate detailed domain rules in new documentation when one of these documents already defines them.

### Authority Hierarchy

When making implementation decisions, use this hierarchy:

1. **Explicit current task requirements**
2. **Applicable architecture/domain source-of-truth document**
3. **Applicable ADR in `docs/decisions/`**
4. **API/database/workflow documentation**
5. **Existing implementation and tests**
6. **General implementation judgment**

If two authoritative documents conflict, **STOP** and report the conflict. Do not silently choose one.

`AGENTS.md` defines agent behavior, implementation constraints, and non-negotiable engineering rules. It does not replace the domain source-of-truth documents.

Do not invent directories or files merely because they are mentioned in documentation if they do not yet exist.

---

# 2. Mandatory Instructions

Before making code changes:

1. Read this `AGENTS.md`.
2. Read `docs/PROJECT_CONTEXT.md` if it exists.
3. Read `docs/DEVELOPMENT_STATUS.md` if it exists.
4. Read all relevant source-of-truth documents under `docs/architecture/` and `docs/product/`.
5. Read relevant ADRs under `docs/decisions/`.
6. Read relevant API, database, workflow, and frontend documentation.
7. Inspect the existing implementation related to the task.
8. Inspect related tests.
9. Inspect the current Git branch and working tree.
10. Determine what already exists before creating new files or functionality.

Do not assume the repository is empty.

Do not recreate functionality that already exists.

Do not make broad changes outside the requested task.

---

# 3. Product Identity

Karatu is the product.

CarePoint Community School is a tenant.

Do not introduce CarePoint-specific assumptions into shared SaaS architecture unless explicitly required by tenant configuration or an approved migration.

Examples of incorrect behavior:

- hard-coding CarePoint as the only school
- using CarePoint-specific grading rules as global defaults
- assuming all schools have the same branding
- assuming all schools use the same fee structure
- assuming all schools use the same assessment weighting
- assuming all schools expose the same report sections
- assuming all schools use the same academic structure

School-specific behavior must be represented through configuration, tenant data, policy, or supported feature capabilities.

---

# 4. Architecture

Karatu uses a **modular monolith** architecture.

## Frontend

- Next.js
- App Router
- TypeScript
- Tailwind CSS
- TanStack Query
- Zustand
- React Hook Form
- Zod
- shadcn/ui
- Lucide

## Backend

- Java
- Spring Boot
- Spring Security
- REST API
- API version prefix: `/api/v1`

## Database

- PostgreSQL
- JPA/Hibernate
- Flyway
- Supabase PostgreSQL for production hosting

## Supporting Services

Use only where required by the applicable domain:

- Redis
- Cloudinary
- Supabase Storage
- Firebase FCM
- SMTP/email provider
- Paystack
- Sentry

The frontend must never directly access PostgreSQL.

Required flow:

```text
Next.js
   ↓
Spring Boot REST API
   ↓
PostgreSQL
```

Business rules belong in the backend.

Frontend validation improves UX but does not replace backend validation.

---

# 5. Architectural Boundaries

The backend is authoritative for:

- authorization
- tenant isolation
- grading
- assessment calculations
- payment verification
- financial ledger state
- promotion decisions
- report generation
- security-sensitive business rules
- data integrity
- auditability

The frontend must not become a second source of truth for domain behavior.

Do not duplicate authoritative business logic in TypeScript merely because it is convenient for UI rendering.

The frontend may calculate presentation-only values when doing so cannot alter authoritative domain state.

---

# 6. Source-of-Truth Rules

Before implementing or changing a domain, read its applicable source-of-truth document.

### Academic Operations

Use:

`docs/architecture/ACADEMIC_OPERATIONS_SOURCE_OF_TRUTH.md`

This governs:

- academic years
- terms
- grades/classes
- sections
- subjects
- curriculum offerings
- student enrollments
- subject enrollments
- teacher assignments
- timetables
- attendance
- academic rollover
- promotion
- academic context

Do not redesign academic hierarchy from assumptions made in an individual task.

### Assessment and Grading

Use:

`docs/architecture/ASSESSMENT_SOURCE_OF_TRUTH.md`

This governs:

- assessment purposes
- assessment categories
- assessment policies
- assessment components
- assessment weighting
- grading schemes
- grade bands
- result calculation
- result lifecycle
- result corrections
- historical result integrity
- teacher/admin result workflows
- parent visibility

Do not hard-code school-specific grading or weighting rules.

### Finance

Use:

`docs/architecture/FINANCE_SOURCE_OF_TRUTH.md`

This governs:

- fee configuration
- billing schedules
- charges
- invoices
- payments
- payment claims
- payment proof
- payment verification
- allocations
- credits
- discounts
- waivers
- arrears
- receipts
- reversals
- refunds
- financial statements
- finance reporting
- Paystack integration boundaries
- bank reconciliation boundaries

Karatu finance is **Student Fees, Billing, Collections and Receivables**, not a full accounting ERP.

### Multi-Tenancy

Use:

`docs/architecture/MULTI_TENANCY_SOURCE_OF_TRUTH.md`

This governs:

- tenant identity
- school membership
- tenant context
- school ownership
- tenant-scoped persistence
- cross-tenant isolation
- platform-level data
- background jobs
- files
- caches
- exports
- support access
- tenant isolation testing

### Reporting

Use:

`docs/architecture/REPORTING_SOURCE_OF_TRUTH.md`

This governs:

- report data sources
- published-result requirements
- report templates
- report generation
- report snapshots
- report versioning
- PDF generation
- parent-facing reports
- bulk report generation
- report publication

A report must not become a second calculation system.

### Product Principles

Use:

`docs/product/KARATU_PRODUCT_PRINCIPLES.md`

This governs:

- product identity
- product philosophy
- configurability
- school operating-system principles
- workflow-first design
- authoritative data ownership
- historical integrity
- Ghana-first but not Ghana-locked product decisions
- AI strategy
- scope boundaries
- user experience principles

---

# 7. Multi-Tenancy — Permanent Rules

Karatu uses a **shared-hosted pooled multi-tenant architecture**.

Tenant isolation is a permanent security invariant.

Every new tenant-owned:

- table
- entity
- repository
- service
- endpoint
- DTO
- foreign key
- background job
- file
- cache entry
- export
- report
- notification
- audit event

must explicitly define its tenant boundary before implementation.

## Tenant Context

Tenant identity must be derived server-side from the authenticated user's authorized school membership/context.

Never trust a client-provided:

- `schoolId`
- tenant ID
- school identifier
- tenant header
- path parameter
- query parameter
- request body field

as proof of authorization.

A client-provided school identifier may be used for non-security purposes only where the backend validates it against authoritative tenant context.

## School-Owned Data

Every school-owned table should normally contain:

```text
school_id NOT NULL
```

and:

- a foreign key to `schools`
- an appropriate index beginning with `school_id`
- same-school composite foreign keys where relationships require them

Platform-level tables that intentionally do not have `school_id` must be explicitly justified and documented.

## Repository Access

School-owned repositories must use explicit tenant-scoped access.

Preferred patterns include:

```text
findByIdAndSchoolId(...)
findAllBySchoolId(...)
existsByIdAndSchoolId(...)
deleteByIdAndSchoolId(...)
```

Do not use unscoped:

```text
findById(...)
existsById(...)
deleteById(...)
```

for school-owned resources where the operation could bypass tenant isolation.

Native SQL and custom queries must also enforce tenant scope.

## IDOR Protection

Cross-tenant resource access must be rejected safely.

For resource lookups, `404 Not Found` is generally preferred over `403 Forbidden` when disclosure of another tenant's resource existence would itself be a security concern.

Every school-owned resource must have cross-tenant/IDOR tests.

## Infrastructure Isolation

Tenant boundaries must also be enforced for:

- caches
- file storage
- signed URLs
- background jobs
- exports
- generated reports
- notifications
- audit context
- scheduled tasks
- asynchronous workers
- logs where tenant identity is included
- search/indexing systems if introduced

Never assume database isolation alone is sufficient.

## RLS

PostgreSQL Row-Level Security may be used as defense-in-depth according to the applicable ADR.

If RLS is enabled:

- tenant context must be established correctly
- `SET LOCAL` must be used where transaction-local context is required
- actual production pooler behavior must be verified
- session-level assumptions must not be made under transaction pooling

Application-level tenant isolation remains mandatory even when RLS exists.

---

# 8. Platform and School Roles

Authorization uses:

**RBAC + capability authorization + resource/relationship authorization + tenant context + academic context where applicable.**

## SUPER_ADMIN

Platform-level role.

Responsibilities may include:

- provisioning schools
- creating the first school administrator
- managing plans/subscriptions
- platform health
- platform configuration
- controlled support access

A `SUPER_ADMIN` is not an ordinary school administrator.

Any access to tenant business data for support purposes must:

- be authorized
- be audited
- include a reason
- be limited to the required scope

Do not give `SUPER_ADMIN` silent unrestricted editing privileges over tenant business data.

## ADMIN

School-level administrator.

May manage:

- school users
- school configuration
- academic administration
- school operations
- authorized financial operations
- authorized reporting operations

Actual permissions remain subject to the capability model.

## IT_ADMIN

Optional school-level capability/role.

May manage supported technical configuration.

Must not automatically receive:

- financial authority
- unrestricted student-record authority
- user-management authority

unless explicitly granted through the capability model.

## TEACHER

Teacher capabilities depend on:

- assigned school
- assigned class/section
- assigned subject
- active academic context
- granted capability

Teachers must not receive global school-wide authority merely because they have the `TEACHER` role.

## PARENT

Parents/guardians may access only:

- their own account
- their authorized students
- data permitted by the applicable workflow and publication state

A parent must never be able to access another student's academic or financial records.

## Other Staff

Roles such as:

- BURSAR
- ACCOUNTANT
- SECRETARY
- REGISTRAR
- other operational roles

should use the capability model rather than forcing unnecessary role proliferation.

---

# 9. Academic Operations

Academic domain rules are governed by:

`docs/architecture/ACADEMIC_OPERATIONS_SOURCE_OF_TRUTH.md`

Do not hard-code assumptions such as:

- exactly three terms
- exactly one class per grade
- fixed streams
- fixed subject structures
- fixed timetable periods

unless they are explicitly defined as product invariants.

Ghana reference structures may be provided as defaults/reference configurations, but Karatu must remain configurable.

Academic context must be respected by academic operations.

Where applicable, authorization should consider:

```text
Role
+
Tenant
+
Academic Context
+
Relationship
+
Action
```

---

# 10. Assessment and Grading

Detailed assessment rules are governed by:

`docs/architecture/ASSESSMENT_SOURCE_OF_TRUTH.md`

The implementation must support configurable school assessment policies.

The default/reference product orientation is:

**Ghana / NaCCA-aligned, school-configurable.**

Do not interpret this as a universal mandatory national grading formula.

## Assessment

Assessments may have:

- purpose
- category
- date
- subject
- class/section
- teacher
- maximum score
- weight
- components
- status
- results

Purposes may include:

- `DIAGNOSTIC`
- `FORMATIVE`
- `SUMMATIVE`
- `INTERNAL_ASSESSMENT`

Assessment categories are configurable.

Not every assessment must contribute to the final result.

## Calculation

The backend is authoritative.

Conceptual calculation:

```text
Raw Score
→ Validation
→ Percentage
→ Assessment Weight
→ Weighted Contribution
→ Aggregate
→ Rounding Rule
→ Grading Scheme
→ Grade Band
→ Final Result
```

Use deterministic decimal-safe arithmetic.

Do not use floating-point arithmetic for authoritative financial or grading calculations where precision matters.

## Missing vs Zero

Blank/null must not automatically become zero.

The domain must distinguish appropriate states such as:

- not entered
- absent
- excused
- zero
- pending
- excluded

according to the applicable assessment policy.

## Result Lifecycle

The lifecycle is governed by the assessment source of truth.

Typical states include:

```text
DRAFT
→ SUBMITTED
→ REVIEWED
→ PUBLISHED
```

Where applicable, the system may also support:

```text
RETURNED
```

or additional controlled states defined by the domain documentation.

Published results must not be silently overwritten.

Corrections must preserve history and auditability.

## Grading Schemes

Do not hard-code grading tables.

A school may use:

- a Ghana/reference grading scheme
- a school-custom scheme
- different schemes for different academic contexts where supported

Historical results must remain traceable to the grading scheme/version used.

---

# 11. Finance

Detailed finance rules are governed by:

`docs/architecture/FINANCE_SOURCE_OF_TRUTH.md`

Karatu Finance is:

**Student Fees, Billing, Collections and Receivables.**

It is not a general ledger/accounting ERP.

## Billing

Default billing frequency:

**Monthly**

Schools may configure supported billing schedules such as:

- monthly
- termly
- annual
- other supported/custom schedules where justified

Do not confuse:

**Billing schedule**

with:

**Payment behavior.**

A monthly or termly charge may be paid through multiple partial payments.

An installment is a payment behavior, not a replacement for the billing schedule.

## Financial Ledger

The authoritative financial model must support concepts such as:

- charge
- invoice
- payment
- payment allocation
- credit
- adjustment
- discount
- waiver
- reversal
- refund

Financial history must be auditable.

Payments must not be silently deleted.

## Payment Methods

Supported payment workflows may include:

- cash
- bank/external payment
- online payment

Manual and bank payment claims require appropriate verification.

Payment proof uploads are evidence, not automatic proof of settlement.

## Online Payments

Paystack is an integration.

The finance domain remains authoritative.

Payment confirmation must be performed server-side using appropriate verification/webhook processing.

Webhook processing must be idempotent.

Karatu must not hold school funds.

Where schools use Paystack, settlement belongs to the school's configured payment arrangement.

## Bank Reconciliation

Bank import/API reconciliation is an integration layer over the financial ledger.

Do not redesign the core ledger around a specific bank integration.

Future bank reconciliation must support:

```text
Bank Transaction
→ Matching
→ Verification
→ Authoritative Ledger Payment
→ Allocation
```

with duplicate prevention and auditability.

## Statements

Every student must have an authoritative financial statement.

Class and school financial summaries must be derived from authoritative student financial records.

Do not create a separate unofficial financial truth for dashboards.

Use decimal-safe monetary calculations.

---

# 12. Reporting

Detailed reporting rules are governed by:

`docs/architecture/REPORTING_SOURCE_OF_TRUTH.md`

A report is a **presentation of authoritative published results**, not another calculation engine.

The authoritative chain is:

```text
Assessment Policy
→ Assessments
→ Assessment Results
→ Calculation Engine
→ Final Results
→ Review/Approval
→ Publication
→ Report Snapshot
→ PDF / Parent Portal
```

Official reports must be generated from the appropriate published/authoritative state.

Do not generate official reports directly from draft marks.

## Report Content

Depending on school configuration, reports may include:

- school identity
- student information
- academic year
- term
- class
- subject performance
- assessment/component breakdown
- grades
- remarks
- overall performance
- ranking/position
- attendance
- conduct/behaviour
- teacher comment
- headteacher/admin comment
- promotion/progression
- competencies/learning outcomes
- signatures

Report columns and sections must not be hard-coded when the school policy/template determines them.

## Report Templates

Schools may configure report templates.

For example:

School A may show:

- ranking
- attendance
- academic performance

while School B may show:

- competencies
- academic performance
- attendance

without ranking.

## Historical Reports

Historical reports must remain reproducible.

A generated report should preserve appropriate:

- student identity
- academic year
- term
- published result snapshot
- template version
- generation timestamp
- generated-by information
- publication state

Corrections must not silently rewrite previously generated official reports.

## Finance in Reports

Finance information may be displayed where the school's report configuration permits it.

Examples:

- fees up to date
- outstanding balance

Unpaid fees must **not automatically block academic report publication** unless the school has explicitly configured such a policy and the applicable product workflow supports it.

---

# 13. Promotion

Promotion is an academic decision governed by:

`docs/architecture/ACADEMIC_OPERATIONS_SOURCE_OF_TRUTH.md`

The general workflow is:

```text
Approved Results
→ Evidence
→ Review
→ Authorized Decision
→ Promotion Record
→ New Enrollment/Class
```

The system may calculate supporting evidence.

The system must not silently promote students.

Bulk promotion must provide appropriate:

- preview
- validation
- evidence
- confirmation
- audit trail

---

# 14. Payments and Financial Security

All monetary operations must use appropriate decimal-safe representations.

The frontend must never be the payment authority.

Payment verification must occur server-side.

Payment state changes must be:

- authenticated
- authorized
- transactional where appropriate
- idempotent where necessary
- auditable

Never expose payment secrets.

Never store payment credentials unnecessarily.

---

# 15. Storage Rules

Do not store uploaded binary files directly in PostgreSQL unless explicitly approved.

## Public Media

Cloudinary may store:

- school logos
- gallery images
- public media

## Sensitive Files

Student documents, applicant documents, and other sensitive files must use private/authenticated storage.

Use:

- signed, time-limited URLs
- Supabase Storage private buckets
- or another explicitly approved private storage mechanism

Sensitive files must:

- never be publicly addressable
- be tenant-scoped
- have appropriate authorization checks

---

# 16. Database Rules

Use:

- PostgreSQL
- JPA/Hibernate
- Flyway

Enforce appropriate database integrity using:

- `NOT NULL`
- `UNIQUE`
- `FOREIGN KEY`
- `CHECK`
- appropriate indexes
- appropriate composite constraints

All schema changes must be represented through Flyway migrations.

Never manually modify production schema when a migration is required.

Never delete or rewrite an already-applied historical migration.

Before modifying an existing migration or schema:

- inspect migration history
- inspect actual table names
- inspect constraints
- inspect indexes
- inspect entity mappings
- verify compatibility with existing data

---

# 17. API Rules

Use:

```text
/api/v1/...
```

Maintain consistent:

- HTTP methods
- status codes
- request DTOs
- response DTOs
- validation
- error responses
- pagination
- filtering
- sorting
- authentication
- authorization

Do not expose JPA entities directly when dedicated DTOs are appropriate.

API contracts must reflect authoritative backend behavior.

Do not invent frontend API contracts for backend functionality that does not exist.

---

# 18. Frontend Surface Ownership

The frontend contains distinct surfaces.

## Public Surface

`apps/web/app/(public)/**`

Governed by:

- `docs/frontend-design-system-public.md`
- `docs/frontend-agent-rules-public.md`

This includes the current CarePoint public website and public admissions flow where applicable.

Do not modify the CarePoint public site during ordinary authenticated-platform work.

## Authenticated Surface

`apps/web/app/(auth)/**`

`apps/web/app/(portal)/**`

Governed by:

- `docs/frontend-design-system.md`
- `docs/frontend-agent-rules.md`

This includes:

- Super Admin
- Admin
- Teacher
- Parent/Guardian
- other authorized tenant users

Load the relevant short frontend rules file for every frontend task.

Load the matching full design document whenever changing UI.

---

# 19. Frontend Engineering Rules

Use the existing frontend stack.

Do not introduce another frontend framework or UI library without approval.

## Design

Follow:

`docs/frontend-design-system.md`

Prefer:

- clarity
- information density
- accessibility
- operational efficiency
- consistent hierarchy
- reusable components

Avoid unnecessary:

- gradients
- excessive shadows
- glassmorphism
- decorative effects
- oversized cards
- excessive animation

## Responsive Design

All authenticated interfaces must work on:

- mobile
- tablet
- desktop

Tables require intentional responsive behavior.

Do not simply shrink desktop layouts.

## Data States

Every data-driven view must handle appropriate states including:

- loading
- empty
- filtered empty
- error
- forbidden
- populated

## Forms

Use:

- React Hook Form
- Zod
- backend validation

Forms must handle:

- validation errors
- submitting
- server errors
- successful mutation
- authorization failures
- conflicts where applicable

## State Management

Use:

- TanStack Query for server state
- Zustand for appropriate client/UI state
- React Hook Form for form state
- Zod for validation

Do not use client state as the authoritative persistence layer.

## API Integration

The frontend must:

- use `/api/v1`
- handle authoritative backend responses
- invalidate/refetch relevant server state
- handle loading and errors
- handle authorization failures
- handle validation failures
- avoid optimistic assumptions where authoritative confirmation is required

The frontend must never:

- access PostgreSQL directly
- access Supabase PostgreSQL directly
- expose backend secrets
- perform authoritative grading
- verify payments authoritatively
- make authoritative promotion decisions
- replace backend authorization

## Runtime School Branding

School branding is presentation configuration.

Branding must come from authoritative backend configuration.

Use theme tokens/CSS variables.

Branding must never modify:

- authorization
- business rules
- semantic status meanings
- accessibility requirements
- API architecture
- database architecture

Semantic colors such as success, warning, error, and informational must remain system-defined.

---

# 20. Security Rules

Security is a backend responsibility.

Use:

- Spring Security
- secure password hashing
- JWT authentication
- RBAC
- capability authorization
- resource/relationship authorization
- server-side validation
- safe error responses
- secure headers
- appropriate CORS
- rate limiting where required
- audit logging
- transactions for critical operations

Never expose or commit:

- password hashes
- JWT secrets
- database passwords
- Supabase service-role keys
- Cloudinary secrets
- Firebase private keys
- Paystack secret keys
- SMTP passwords
- Sentry authentication tokens

Use environment variables or approved secret-management mechanisms.

Never log:

- passwords
- tokens
- OTPs
- secret keys
- sensitive credentials
- unnecessary personal data

---

# 21. Audit Logging

Audit sensitive and business-critical operations.

Examples include:

- role changes
- user changes
- student record changes
- assessment changes
- grade changes
- result submission
- result review
- result publication
- result correction
- promotion decisions
- payment claims
- payment verification
- payment allocation
- payment reversal
- refund
- discounts/waivers
- admission decisions
- configuration changes
- support access by `SUPER_ADMIN`

Audit records should identify, where appropriate:

- actor
- tenant
- action
- resource
- timestamp
- relevant before/after state
- reason
- correlation/reference identifier

Do not store secrets in audit logs.

---

# 22. Historical Integrity

Historical records are first-class product requirements.

Never allow current configuration changes to silently rewrite historical business meaning.

This applies to:

- academic structures
- enrollments
- assessments
- grading schemes
- results
- reports
- fees
- charges
- payments
- allocations
- discounts
- promotion decisions
- audit records

Where configuration is versioned, historical records must reference or preserve the applicable version.

Corrections should create traceable changes rather than destructive replacement.

---

# 23. Do Not Change Architecture Without Approval

Do not silently change:

- PostgreSQL
- Spring Boot
- Next.js
- modular monolith architecture
- REST API architecture
- `/api/v1`
- JWT authentication architecture
- authorization architecture
- JPA/Hibernate
- Flyway
- storage responsibilities
- payment architecture
- academic architecture
- repository structure
- tenant architecture

If the architecture appears insufficient:

STOP.

Report:

1. Why the current architecture is insufficient
2. Proposed change
3. Files/modules affected
4. Risks
5. Alternatives

Wait for explicit approval.

### Approved Roadmap Changes

The following are approved architectural directions when implemented consistently with the relevant source-of-truth document and ADR:

- pooled multi-tenancy
- identity/membership model
- capability-based authorization
- PostgreSQL RLS as defense-in-depth where adopted by ADR
- configurable assessment/result lifecycle
- configurable grading schemes
- controlled promotion workflows
- approved integrations
- Redis for appropriate rate limiting/queues
- school-specific Paystack arrangements
- Storybook
- Playwright
- axe
- Lighthouse CI

Approval for a roadmap direction does not authorize unrelated architectural changes.

---

# 24. Scope Control

Implement only the requested task.

Do not automatically implement:

- unrelated features
- future roadmap features
- speculative AI
- unrelated integrations
- large refactors
- alternative architecture
- full accounting ERP
- automated timetable optimization
- AI assessment intelligence
- unrelated public-site redesigns

Design systems, tokens, component libraries, and application shells may be implemented ahead of backend readiness.

Feature screens must only be implemented against:

- existing backend endpoints, or
- explicitly approved API contracts tracked as implementation work

Do not invent backend behavior merely to make a frontend screen appear functional.

If related work is discovered:

document it as follow-up work rather than silently implementing it.

---

# 25. Existing Functionality

Before creating a:

- component
- service
- endpoint
- entity
- repository
- DTO
- hook
- store
- utility
- API client
- validation schema
- page

search the repository for an existing implementation.

Prefer extending or reusing an existing implementation over creating duplicates.

Do not create duplicate:

- authentication systems
- API clients
- validation utilities
- authorization logic
- database entities
- services
- UI components
- state stores

---

# 26. Code Quality

Prefer:

- simple solutions
- explicit business rules
- clear naming
- small cohesive modules
- maintainability
- testability
- appropriate abstraction
- reusable components where justified
- clear contracts

Avoid:

- unnecessary abstractions
- speculative generic utilities
- premature optimization
- duplicate implementations
- broad refactors during feature work
- unnecessary dependencies

Do not add dependencies unless they solve a real requirement.

---

# 27. Testing

Every meaningful implementation requires appropriate verification.

## Backend

Use where appropriate:

- unit tests
- service/business-rule tests
- controller/API tests
- authorization tests
- tenant-isolation tests
- integration tests
- database tests
- migration tests

Security-sensitive functionality requires authorization tests.

Tenant-owned functionality requires cross-tenant/IDOR tests.

Financial functionality requires ledger/business-rule tests.

Assessment functionality requires calculation/lifecycle tests.

Reporting functionality requires publication/snapshot/version tests.

## Frontend

Use where appropriate:

- lint
- TypeScript checking
- component tests
- feature tests
- Playwright
- accessibility testing
- production build

## Build Verification

A successful compile alone is not sufficient.

Verify:

- behavior
- authorization
- data integrity
- tenant isolation
- business rules
- relevant UI states
- production build

Never claim tests passed unless they were actually executed.

---

# 28. Git Discipline

Work normally occurs on a feature branch.

Preferred flow:

```text
feature/*
→ Pull Request
→ CI
→ review
→ develop
→ testing
→ main
→ production
```

Do not:

- push shared branches
- merge
- rebase shared branches
- force-push

unless explicitly instructed.

The implementation agent must not commit unless explicitly instructed.

Before a requested commit:

```powershell
git status --short
git diff --check
git diff
```

Review the full diff.

---

# 29. Change Integrity and Git Forensics

Antigravity must treat the existing repository state as authoritative unless the task explicitly requires a change.

A passing test suite does not prove that the working tree contains only correct changes.

## Before Editing

Run:

```powershell
git status --short
git diff --stat
git diff
git branch --show-current
```

For relevant existing files, inspect `HEAD`:

```powershell
git show HEAD:<path>
```

Then:

1. Identify exactly what the task requires.
2. Establish the relevant baseline.
3. Search for existing implementations.
4. Identify related tests.
5. Make the smallest appropriate change.

## Existing-File Rule

When modifying an existing file:

- preserve unrelated code
- preserve security behavior
- preserve existing API behavior
- preserve existing tests
- preserve formatting unless formatting is part of the task
- avoid full-file rewrites when targeted edits are sufficient

Every changed line must have a reason related to the task.

## Change Classification

After implementation, classify changes as:

- `KEEP` — required and correct
- `CORRECT` — required but implemented incorrectly and must be fixed
- `REVERT` — unrelated or accidental
- `INVESTIGATE` — cannot be verified

Do not complete the task while unexplained changes remain.

## Security Diff Review

Any change involving:

- authentication
- authorization
- Spring Security
- JWT
- CORS
- CSRF
- roles
- capabilities
- resource ownership
- public/protected endpoints

requires explicit comparison against `HEAD`.

Inspect the complete authorization chain.

## Database Change Review

Before changing migrations/entities:

- inspect existing migrations
- inspect schema
- inspect constraints
- inspect indexes
- inspect foreign keys
- inspect entity mappings
- verify migration ordering
- verify historical compatibility

Never silently rename established schema structures.

## Dependency Review

Before changing dependencies:

- inspect existing declarations
- inspect framework versions
- inspect dependency tree where necessary
- determine whether existing dependencies already provide the functionality
- verify runtime/test impact

Do not apply advice for another framework major version without verification.

## No Broad Cleanup

Do not automatically:

- reformat unrelated files
- normalize line endings
- reorder unrelated imports
- rename unrelated identifiers
- upgrade dependencies
- refactor neighboring modules
- update unrelated documentation
- fix unrelated lint warnings

Record such work as follow-up recommendations.

## Temporary Files

Do not leave:

- scratch files
- generated review files
- debug files
- temporary logs
- test artifacts

in the repository.

---

# 30. Documentation Integrity

Documentation must match actual repository state.

Never document:

- tests that were not executed
- features that were not implemented
- migrations that were not applied
- files that were not changed
- a clean working tree when changes exist
- future work as completed
- API endpoints that do not exist
- architecture that has not been approved

When implementation and documentation disagree:

1. Inspect the implementation.
2. Determine the actual state.
3. Update the relevant documentation if appropriate.
4. Do not invent implementation evidence.

Update `docs/DEVELOPMENT_STATUS.md` only when the completed task materially changes implementation status.

---

# 31. Stop Conditions

Stop and ask for clarification/approval if:

- requirements conflict with authoritative documentation
- two source-of-truth documents conflict
- an ADR conflicts with the proposed implementation
- database migration strategy is unclear
- authorization is ambiguous
- tenant isolation is ambiguous
- security-sensitive behavior is ambiguous
- financial ledger behavior is ambiguous
- assessment calculation behavior is ambiguous
- historical data integrity is at risk
- existing code contradicts project documentation
- a major dependency/framework change is required
- MVP/product scope would materially expand
- a new architectural pattern is required

Do not guess about:

- security
- authorization
- tenant isolation
- financial state
- assessment calculation
- published results
- historical records
- data deletion
- migration safety

---

# 32. Antigravity Working Model

The repository uses controlled AI-assisted development.

Roles:

- **Project owner/developer:** Daniel
- **Implementation agent:** Antigravity IDE
- **External guidance/reviewer:** project guidance supplied by the owner

Antigravity is an implementation agent.

It is not the authority for changing:

- product direction
- architecture
- security model
- tenant model
- financial rules
- assessment rules
- reporting rules
- historical data behavior

When documentation resolves an ambiguity, use the documentation.

When documentation does not resolve a material ambiguity:

STOP.

---

# 33. Before Every Task

Before modifying anything:

1. Read `AGENTS.md`.
2. Read `docs/PROJECT_CONTEXT.md`.
3. Read `docs/DEVELOPMENT_STATUS.md`.
4. Identify the applicable source-of-truth document(s).
5. Read relevant ADRs.
6. Read relevant API/database/workflow documentation.
7. Inspect existing implementation.
8. Inspect related tests.
9. Check Git branch/status/diff.
10. Identify the smallest correct implementation.

Do not restart the project from scratch.

Do not recreate existing functionality because it is not immediately visible.

Inspect first.

Modify second.

Test third.

Report fourth.

---

# 34. Completion Protocol

A task is not complete merely because the code compiles.

Where applicable, completion requires:

1. Implementation complete
2. Backend validation implemented
3. Authorization implemented
4. Tenant isolation implemented/verified
5. Business rules implemented
6. Frontend validation implemented
7. Loading state handled
8. Empty state handled
9. Error state handled
10. Responsive UI handled
11. Tests added/updated
12. Relevant tests executed
13. Documentation updated where necessary
14. Security implications reviewed
15. Git diff reviewed
16. Relevant lint/type/build checks pass
17. No unintended files remain changed

Before reporting completion, run:

```powershell
git status --short
git diff --check
git diff --stat
git diff
```

Review the complete diff.

Do not begin another unrelated task automatically.

---

# 35. Task Completion Report

At the end of every task, report:

## Implemented

- ...

## Files Changed

- ...

## Database Changes

- ...

## API Changes

- ...

## Tests

- ...

## Validation

- ...

## Security

- ...

## Tenant Isolation

- ...

## Documentation

- ...

## Known Issues

- ...

## Follow-up Recommendations

- ...

## Suggested Next Task

- ...

Suggest exactly one logical next task.

Do not automatically start it.

---

# 36. Phase Completion Report

When a task is explicitly part of a phase, additionally report:

- actual test counts
- relevant API/HTTP evidence
- migration evidence
- tenant-isolation evidence where relevant
- authorization evidence
- build evidence
- Git diff classification:
  - `KEEP`
  - `CORRECT`
  - `REVERT`
  - `INVESTIGATE`

- known limitations
- GO / NO-GO decision for the next phase

Do not declare a phase complete solely because tests pass.

---

# 37. Product Scope Guardrails

Karatu should prioritize production-quality school operations over breadth.

Do not expand the platform into unrelated enterprise software.

Current product boundaries include:

- academic operations
- student/people management
- assessment and grading
- attendance
- reporting
- student fees/billing/collections
- parent portal
- school administration
- communication/integrations where approved

Finance does not automatically mean:

- general ledger
- payroll
- procurement
- inventory accounting
- full accounting ERP

Assessment does not automatically mean:

- AI grading
- AI-generated assessments
- automated learning intelligence
- predictive analytics

Reporting does not automatically mean:

- a separate calculation engine
- uncontrolled report customization
- duplicated result storage

AI differentiation should be introduced only when the underlying authoritative operational data and workflows are reliable.

---

# 38. Core Product Principles

For detailed product principles, use:

`docs/product/KARATU_PRODUCT_PRINCIPLES.md`

The implementation agent must preserve these principles:

### Configurable, Not Hard-Coded

School policy should be represented as configuration where the domain permits variation.

### One Authoritative Truth

Each domain must have an authoritative source of truth.

Do not create duplicate competing representations of:

- results
- financial balances
- enrollments
- payments
- reports
- tenant identity

### Backend Authority

The backend owns authoritative business decisions.

### Workflow First

Build workflows around what school staff actually do, not merely around database entities.

### Historical Integrity

Past business meaning must remain reproducible.

### Ghana-First, Not Ghana-Locked

Ghana/NaCCA-aligned defaults are valuable, but Karatu must support legitimate variation between schools.

### Production Quality Before AI

Reliable operational data and workflows come before AI features.

### Tenant Isolation Everywhere

Tenant isolation is a system-wide invariant, not merely a database concern.

---

# 39. Core Rule

The implementation agent must follow this sequence:

```text
Understand
→ Inspect
→ Compare with Source of Truth
→ Identify Existing Functionality
→ Plan Smallest Correct Change
→ Implement
→ Test
→ Security/Authorization Review
→ Tenant-Isolation Review
→ Git Diff Review
→ Document
→ Report
```

Never:

```text
Assume
→ Rewrite
→ Add Features
→ Declare Complete
```

The repository's existing implementation, tests, migrations, ADRs, and authoritative documentation must be treated as evidence.

When evidence conflicts with assumptions, **evidence wins**.

When authoritative project decisions conflict, **stop and ask**.

When a task is complete, **stop**.
