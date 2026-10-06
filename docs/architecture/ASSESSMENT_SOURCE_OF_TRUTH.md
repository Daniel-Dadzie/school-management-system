# Karatu Assessment & Grading — Source of Truth

## 1. Purpose

This document is the authoritative product and architecture source of truth for Assessment, Grading, Results, and academic performance calculation in Karatu.

It defines:

- assessment concepts
- assessment purposes
- assessment categories
- assessment configuration
- assessment weighting
- grading schemes
- grade bands
- result calculation
- result lifecycle
- result review and publication
- corrections and historical integrity
- teacher permissions
- administrator permissions
- parent visibility
- report integration
- tenant isolation
- audit requirements
- database and API principles
- frontend workflow expectations

Any implementation agent modifying Assessment or Grading must read this document before making changes.

This document complements:

- `docs/architecture/ACADEMIC_OPERATIONS_SOURCE_OF_TRUTH.md`
- `docs/architecture/MULTI_TENANCY_SOURCE_OF_TRUTH.md`
- `docs/architecture/REPORTING_SOURCE_OF_TRUTH.md`
- `docs/product/KARATU_PRODUCT_PRINCIPLES.md`

---

# 2. Product Philosophy

Karatu must not treat assessment as merely a place where teachers enter marks.

The assessment system should support the complete academic performance lifecycle:

> Plan → Assess → Record Evidence → Calculate → Review → Understand → Intervene → Reassess → Report

The system must remain authoritative, deterministic, auditable, configurable, and school-aware.

Karatu should provide a Ghana / NaCCA-aligned reference configuration while allowing each school to configure its own assessment policy.

Karatu must never imply that one grading table, weighting model, or assessment structure is universally mandatory for every school.

---

# 3. Relationship With Academic Operations

Academic Operations provides the context.

Assessment owns:

- assessments
- assessment categories
- assessment purposes
- assessment components
- assessment results
- weighting
- grading
- result lifecycle
- result publication

Academic Operations provides:

- school
- academic year
- term
- grade
- section
- student enrollment
- subject
- curriculum offering
- teacher assignment

The relationship is:

```text
Academic Year
    ↓
Term
    ↓
Grade / Section
    ↓
Subject
    ↓
Teacher Assignment
    ↓
Assessment
    ↓
Assessment Results
    ↓
Calculation
    ↓
Final Result
```

---

# 4. Assessment Policy

Each school should have an assessment policy.

The policy may define:

- assessment categories
- assessment purposes
- weighting rules
- grading scheme
- pass mark
- rounding rules
- ranking rules
- result publication rules
- correction rules
- report-card behavior

Assessment policies are school configuration.

Platform-level invariants must not be configurable away.

Examples of platform invariants:

- tenant isolation
- authorization
- auditability
- historical integrity
- deterministic calculation
- published-result protection

---

# 5. Assessment Purposes

Karatu should support at least:

```text
DIAGNOSTIC
FORMATIVE
SUMMATIVE
INTERNAL_ASSESSMENT
```

### Diagnostic

Used to understand a learner's starting point or existing knowledge.

A diagnostic assessment may not contribute to the final academic result.

### Formative

Used during learning to monitor progress and provide feedback.

A formative assessment may contribute to the final result if the school's policy says so.

### Summative

Used to evaluate achievement at the end of a learning period.

### Internal Assessment

Used for school-controlled assessment components such as SBA-related evidence, class tests, practical work, projects, or other configured activities.

The system must not assume that every assessment contributes to the final result.

---

# 6. Assessment Categories

Schools should be able to configure categories.

Examples:

- Classwork
- Homework
- Quiz
- Class Test
- Project
- Practical
- Presentation
- Assignment
- SBA / Internal Assessment
- Examination
- Other

A category should be configurable rather than hard-coded into calculation logic.

---

# 7. Assessment Structure

Conceptually:

```text
Assessment
├── School
├── Academic Year
├── Term
├── Grade / Section
├── Subject
├── Teacher
├── Category
├── Purpose
├── Maximum Score
├── Weight
├── Assessment Date
├── Status
└── Results
```

An assessment may contain components when required.

Example:

```text
Mathematics SBA
├── Classwork
├── Quiz
├── Test
└── Project
```

The exact structure is controlled by school policy.

---

# 8. Missing, Zero, Absent and Excused

These states must not be treated as identical.

At minimum the system must distinguish:

```text
NOT_ENTERED
SCORED
ZERO
ABSENT
EXCUSED
```

A blank score must never silently become zero.

An absent learner must not automatically receive zero unless the school's explicit assessment policy requires that behavior.

Excused absence must remain distinguishable from an unexcused absence.

Calculation rules must explicitly define how these states affect results.

---

# 9. Weighting

Weighting must be configurable.

For example, a school may use:

```text
Internal Assessment = 30%
Examination        = 70%
```

Another school may use a different structure.

The system must not hard-code 30/70.

Weights must:

- be validated
- be decimal-safe
- produce deterministic calculations
- have clear scope
- be versioned where historical integrity requires it

The backend is authoritative for weighting calculations.

---

# 10. Calculation Pipeline

The conceptual calculation pipeline is:

```text
Raw Score
    ↓
Validate
    ↓
Percentage
    ↓
Assessment Weight
    ↓
Weighted Contribution
    ↓
Aggregate
    ↓
Rounding Rule
    ↓
Grading Scheme
    ↓
Grade Band
    ↓
Final Result
```

Calculations must use appropriate decimal arithmetic.

Java implementations should use `BigDecimal` where appropriate.

The calculation must be deterministic.

Given:

```text
same inputs
+
same assessment policy
+
same grading scheme
```

the result must be the same.

---

# 11. Grading Schemes

Grading schemes are configuration.

A grading scheme contains:

- grade bands
- minimum score
- maximum score
- grade
- optional remark
- optional points
- pass/fail classification

Example only:

```text
80–100 → A
70–79  → B
60–69  → C
50–59  → D
Below 50 → F
```

This example is illustrative and must not be treated as a universal Ghanaian grading requirement.

Karatu may provide Ghana / NaCCA-aligned reference templates, but each school owns its active grading configuration.

---

# 12. Grade Band Validation

The system must prevent invalid grading configurations.

Examples of invalid configurations:

- overlapping bands
- gaps where gaps are not explicitly allowed
- duplicate grades
- invalid minimum/maximum ranges
- invalid ordering
- impossible boundaries

The backend must validate these rules.

---

# 13. Result Lifecycle

The authoritative result lifecycle is:

```text
DRAFT
   ↓
SUBMITTED
   ↓
REVIEWED
   ↓
APPROVED
   ↓
PUBLISHED
   ↓
LOCKED
```

A school may use a smaller operational workflow internally, but published results must have a protected authoritative state.

Possible correction workflow:

```text
PUBLISHED
   ↓
Correction Request
   ↓
Authorized Review
   ↓
New Result Version
   ↓
Republish
```

Published results must not be silently overwritten.

---

# 14. Teacher Responsibilities

Teachers may:

- view their assigned classes
- view their assigned subjects
- create assessments where authorized
- enter results
- edit draft results
- submit results
- respond to returned results
- add teacher comments

Teachers must only access academic contexts to which they are assigned.

Teacher authorization is contextual:

```text
Role
+
Tenant
+
Teacher Assignment
+
Academic Year
+
Term
+
Class / Section
+
Subject
+
Action
```

A teacher must not be able to access another teacher's unrelated results simply because both are teachers in the same school.

---

# 15. Administrator Responsibilities

Authorized administrators may:

- configure assessment policy
- configure categories
- configure grading schemes
- review submitted results
- approve results
- publish results
- authorize corrections
- configure report settings
- view school-wide academic performance

Super Admin access to tenant academic data is platform support access and must be separately authorized and audited.

---

# 16. Parent Access

Parents may view only results belonging to their own children.

Parent access must be relationship-based.

The parent must not be able to:

- modify results
- modify grading
- modify assessment configuration
- access another student's results
- access another parent's child

Parent reports should consume published authoritative results.

---

# 17. Ranking and Position

Ranking is optional.

Schools may configure:

- no ranking
- class ranking
- section ranking
- grade/year-group ranking

Ranking must only use the appropriate published result set.

Draft or unapproved results must not be used to publish official rankings.

Ties must be handled according to school configuration.

The ranking engine must not assume that every school wants ranking.

---

# 18. Historical Integrity

Historical results must remain reproducible.

If a school changes:

- grading scheme
- assessment weighting
- assessment categories
- report template

previous published results must not silently change.

Results should reference the policy/configuration version used for their calculation where required.

---

# 19. Corrections

Published result corrections must be traceable.

A correction should preserve:

- original result
- corrected result
- actor
- timestamp
- reason
- affected student
- affected assessment/result
- previous state
- new state

The system should prefer versioned correction over destructive update.

---

# 20. Report Integration

Assessment does not own report generation.

Assessment provides authoritative published results to the Reporting domain.

Flow:

```text
Assessment
    ↓
Final Result
    ↓
Review
    ↓
Approval
    ↓
Publication
    ↓
Reporting
```

The Reporting domain generates report snapshots and PDFs.

Assessment must not duplicate report-generation logic.

---

# 21. Auditability

Audit important mutations including:

- assessment creation
- assessment modification
- assessment deletion where permitted
- score entry
- score modification
- result submission
- result review
- result approval
- result publication
- result correction
- grading-policy changes
- weighting changes
- ranking changes

Audit records should identify:

- actor
- school
- action
- target
- timestamp
- relevant old/new state
- reason where appropriate

Do not store secrets or sensitive credentials in audit logs.

---

# 22. Tenant Isolation

Every assessment-owned record must be tenant-scoped.

The backend must derive tenant context from authenticated server-side context.

Do not trust:

```text
schoolId
```

from the client.

Assessment queries must not permit cross-school access.

All important ID-based endpoints require cross-tenant and IDOR tests.

See:

`docs/architecture/MULTI_TENANCY_SOURCE_OF_TRUTH.md`

---

# 23. Database Principles

Use:

- foreign keys
- NOT NULL constraints where appropriate
- unique constraints
- check constraints
- tenant-scoped uniqueness
- appropriate indexes
- effective dates where needed
- optimistic locking where needed

Do not rewrite applied Flyway migrations.

Schema evolution must use new Flyway migrations.

---

# 24. API Principles

Prefer business operations over generic CRUD.

Examples:

```text
Create Assessment
Submit Assessment Results
Review Results
Approve Results
Publish Results
Request Result Correction
Apply Result Correction
Configure Assessment Policy
Configure Grading Scheme
```

Use DTOs.

Do not expose JPA entities directly when DTOs are appropriate.

Backend validation is authoritative.

---

# 25. Frontend Principles

Teacher workflows should prioritize fast result entry.

Important UX features include:

- class selection
- subject selection
- assessment selection
- roster display
- bulk score entry
- keyboard-friendly navigation
- validation
- missing-score visibility
- save draft
- submit
- review feedback
- clear status indicators

All data views must handle:

- loading
- empty
- filtered empty
- error
- forbidden
- populated

The frontend must never calculate the authoritative final result independently of the backend.

---

# 26. Testing Requirements

Assessment implementation requires tests for:

- tenant isolation
- authorization
- teacher assignment restrictions
- parent relationship restrictions
- score validation
- missing vs zero
- absent/excused behavior
- weighting
- decimal calculations
- rounding
- grading bands
- invalid grading configurations
- lifecycle transitions
- published-result protection
- corrections
- audit events
- duplicate prevention
- historical integrity
- report integration

---

# 27. Future Intelligence

Future Karatu capabilities may include:

- learning-gap detection
- performance trends
- assessment heatmaps
- learner growth
- intervention tracking
- reassessment tracking
- teacher insights
- curriculum outcome mapping
- assessment blueprints
- AI-assisted academic analysis

These capabilities must consume authoritative assessment data.

They must not replace the core assessment ledger or calculation engine.

---

# 28. Core Principle

> Assessment records evidence. The calculation engine produces authoritative results. The Reporting domain presents published results.

Assessment is not a second reporting system and reporting is not a second calculation engine.
