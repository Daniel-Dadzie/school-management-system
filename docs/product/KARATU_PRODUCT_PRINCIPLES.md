# Karatu Product Principles

## 1. Product Identity

Karatu is a multi-tenant school operating system delivered as SaaS.

CarePoint Community School is the first tenant.

CarePoint is not the product identity.

Karatu must be designed so that additional schools can operate independently without requiring separate application architectures.

---

# 2. Product Vision

Karatu connects the school's:

- people
- academic periods
- classes
- subjects
- enrollments
- teachers
- attendance
- assessments
- results
- reports
- finances
- communications

into one coherent operating system.

The goal is not to create disconnected modules.

---

# 3. North-Star Principle

> Karatu connects the school's people, academic periods, enrollments, assignments and authoritative records into one coherent operating system.

---

# 4. Domain Ownership

Each domain owns its authoritative records.

```text
Academic Operations
→ academic context

Attendance
→ attendance records

Assessment
→ assessments, results, grading

Reporting
→ templates, snapshots, reports

Finance
→ charges, payments, allocations, balances

Communication
→ messages and notifications
```

No domain should duplicate another domain's authority.

---

# 5. Context First

Karatu should understand the current academic context:

```text
School
↓
Academic Year
↓
Term
↓
Grade / Section
↓
Student / Teacher / Subject
```

Users should not repeatedly provide information the system already knows from context.

---

# 6. Record → Calculate → Report

A conventional school-management system often follows:

```text
Record
    ↓
Calculate
    ↓
Report
```

Karatu should evolve toward:

```text
Plan
  ↓
Assess
  ↓
Understand
  ↓
Intervene
  ↓
Reassess
  ↓
Report
```

The second model is a future product direction, not permission to over-engineer the current system.

---

# 7. Configuration Over Hard-Coding

School-specific policies should be configurable.

Examples:

- grading
- assessment weighting
- billing frequency
- ranking
- report sections
- promotion rules
- subject offerings
- timetable configuration
- attendance rules

Platform invariants must remain protected.

Do not make security, tenant isolation, or historical integrity configurable.

---

# 8. Ghana-First, Not Ghana-Locked

Karatu should provide Ghana / NaCCA-aligned reference configurations.

Examples include:

- academic structure
- curriculum references
- assessment terminology
- grading templates
- report conventions

These are defaults/reference configurations.

They must not prevent a school from configuring its own legitimate policies.

---

# 9. Historical Integrity

Changing current configuration must not silently rewrite history.

Examples:

Changing:

- class
- teacher
- grading scheme
- assessment policy
- fee structure
- report template

must not silently mutate historical:

- enrollments
- attendance
- results
- reports
- financial transactions
- teacher assignments

---

# 10. One Source of Truth

Every important business fact should have one authoritative owner.

For example:

```text
Final Grade
→ Assessment domain

Payment
→ Finance domain

Attendance
→ Attendance domain

Report Snapshot
→ Reporting domain

Student Enrollment
→ Academic Operations
```

Other domains consume these records rather than recreating them.

---

# 11. Backend Authority

The backend is authoritative for:

- authorization
- tenant isolation
- grading
- payment verification
- financial balances
- promotion
- report eligibility
- historical integrity
- security-sensitive business rules

Frontend calculations may support presentation but must not become authoritative.

---

# 12. Simplicity Before Intelligence

Karatu should first establish:

- correct data
- correct relationships
- correct authorization
- correct workflows
- correct audit history
- correct calculations

Only then should advanced intelligence be layered on top.

Do not introduce AI simply because a workflow can technically use AI.

---

# 13. Operational Efficiency

Karatu should reduce repetitive administrative work.

Examples:

- smart defaults
- contextual navigation
- bulk actions
- imports
- reusable configurations
- automated calculations
- recurring billing
- report generation
- timetable conflict detection
- academic rollover

Automation must remain auditable.

---

# 14. Teacher Experience

Teacher workflows should be optimized around teaching work rather than database administration.

The teacher should quickly answer:

- What class do I teach next?
- What subject am I teaching?
- Which students are present?
- What assessments are pending?
- Which results require submission?
- Which learners need attention?

---

# 15. Parent Experience

Parents should have a child-centric experience.

The parent should quickly see:

- children
- classes
- attendance
- academic performance
- reports
- timetable
- financial status
- payment history
- school communications

Parents should not be exposed to unnecessary internal administration concepts.

---

# 16. Administrator Experience

Administrators need operational visibility.

Important signals include:

- attendance issues
- incomplete results
- timetable conflicts
- pending admissions
- outstanding fees
- payment verification
- academic performance
- pending approvals
- system activity

Dashboards must be derived from authoritative records.

---

# 17. Super Admin Experience

Super Admin is platform administration.

Responsibilities include:

- school provisioning
- platform configuration
- subscription/plan management
- platform health
- support access

Super Admin tenant-data access must be controlled and audited.

---

# 18. Security by Default

Security should not depend on frontend behavior.

Every protected operation must enforce:

```text
Authentication
+
Tenant
+
Role/Capability
+
Relationship
+
Resource ownership
+
Action
```

---

# 19. Auditability

Important mutations must be attributable.

The system should be able to answer:

- who changed it?
- what changed?
- when?
- for which school?
- why?
- what was the previous state?

Audit history is part of the product, not merely a debugging mechanism.

---

# 20. No Silent Destructive Operations

Do not silently delete or overwrite important business history.

This applies especially to:

- financial transactions
- published results
- enrollments
- promotion decisions
- report snapshots
- audit records

Use controlled correction/versioning workflows.

---

# 21. Product Surface Separation

Karatu has distinct surfaces:

```text
Karatu Marketing
       ↓
School Public Website
       ↓
Authentication
       ↓
School Management Portal
       ↓
Parent Portal
```

The CarePoint public website should not be modified during ordinary authenticated-platform development unless explicitly requested.

---

# 22. UI Philosophy

The interface should prioritize:

- clarity
- speed
- information density
- accessibility
- responsive behavior
- operational usefulness

Avoid unnecessary:

- decorative gradients
- excessive animation
- glassmorphism
- excessive shadows
- visual clutter

The UI should help school staff complete real work.

---

# 23. API Philosophy

APIs should represent business operations rather than exposing database structure.

Prefer:

```text
Enroll Student
Transfer Student
Assign Teacher
Submit Results
Publish Results
Record Payment
Verify Payment
Generate Report
Promote Student
Close Term
```

over exposing every internal database table as generic CRUD without business rules.

---

# 24. Integration Philosophy

External providers are integrations, not domain authorities.

Examples:

```text
Paystack
→ payment provider

Cloudinary
→ media provider

Supabase Storage
→ file storage

FCM
→ push notification provider
```

Karatu's domain model remains authoritative.

---

# 25. Extensibility

Karatu should support additional schools without rewriting the product.

Architecture should favor:

- configuration
- modular domains
- stable contracts
- reusable workflows
- tenant isolation
- versioned historical records

Avoid one-school-specific assumptions in domain logic.

---

# 26. Future Differentiation

Future capabilities may include:

- Student 360
- learning intelligence
- learning-gap detection
- intervention tracking
- learner growth
- academic heatmaps
- teacher workload intelligence
- assisted timetable generation
- automated timetable optimization
- predictive insights

These capabilities must be built on authoritative foundational data.

---

# 27. Avoid Over-Engineering

Do not prematurely introduce:

- microservices
- event-driven infrastructure everywhere
- AI scheduling
- complex distributed systems
- speculative abstractions

Karatu currently uses a modular monolith.

The architecture should remain simple until real scale or product requirements justify a change.

---

# 28. Definition of a Good Feature

A feature is good when it is:

- correct
- secure
- tenant-aware
- auditable
- maintainable
- configurable where appropriate
- usable by its intended role
- historically safe
- tested
- integrated with the appropriate domain

A feature is not complete merely because its UI exists.

---

# 29. Source-of-Truth Hierarchy

When documents disagree, use this order:

1. Approved architectural decisions / ADRs
2. Domain source-of-truth documents
3. `AGENTS.md`
4. API contracts
5. Development status
6. Existing implementation
7. Temporary task instructions

If an existing implementation conflicts with the intended architecture, do not silently rewrite it.

Inspect, document the gap, determine migration impact, and obtain approval where architectural change is required.

---

# 30. Core Principle

> Build the foundation correctly before adding intelligence.

Karatu should become valuable because it makes school operations coherent, reliable and efficient before it attempts to become intelligent.
