# KARATU ACADEMIC OPERATIONS

## Product, Domain & Architecture Source of Truth

**Document Status:** Authoritative Product & Architecture Specification
**Product:** Karatu School Management SaaS
**Domain:** Academic Operations
**Primary Market:** Ghana / Africa-first, configurable for other school systems
**Last Updated:** October 2026

---

# 1. PURPOSE

This document defines the product behavior, domain model, business rules, relationships, workflows, and architectural principles for **Karatu Academic Operations**.

It is a source of truth for:

- product decisions
- domain modeling
- database design
- backend implementation
- API design
- frontend workflows
- authorization
- academic-period behavior
- enrollment
- curriculum and subjects
- teacher assignments
- timetable
- promotion
- term closing
- integration with Attendance
- integration with Assessment & Grading
- integration with Report Generation
- integration with Finance

Any implementation agent working on Academic Operations MUST read this document before making changes.

---

# 2. IMPLEMENTATION PRINCIPLE

The objective is NOT to copy an existing school-management system.

Karatu should use established school-information-system patterns where they are proven, while improving:

- data integrity
- historical accuracy
- contextual authorization
- workflow consistency
- tenant isolation
- configurability
- operational efficiency
- usability

The system should be designed around the actual operation of a school rather than around a collection of unrelated CRUD modules.

The central philosophy is:

> **Karatu is a school operating system, not merely a collection of school-management modules.**

---

# 3. CORE PRODUCT MODEL

Karatu should be built around five fundamental concepts:

```text
Tenant / School
        +
Academic Period
        +
People
        +
Enrollment / Assignment
        +
Authoritative Records
```

These concepts connect the major school operations.

The platform should maintain a single authoritative source of truth for each domain while allowing the domains to work together.

---

# 4. THE KARATU SCHOOL OPERATING MODEL

The overall academic lifecycle is:

```text
School
  ↓
Academic Year
  ↓
Terms
  ↓
Academic Structure
  ↓
Grades / Classes
  ↓
Sections
  ↓
Subjects / Curriculum
  ↓
Teacher Assignments
  ↓
Student Enrollments
  ↓
Subject Enrollments
  ↓
Timetable
  ↓
Attendance
  ↓
Assessment
  ↓
Grading
  ↓
Results
  ↓
Report Generation
  ↓
Parent Portal
```

Finance operates alongside this lifecycle:

```text
Student
  +
Enrollment
  +
Academic Period
        ↓
Finance
  ├── Charges
  ├── Invoices
  ├── Payments
  ├── Allocations
  ├── Credits
  └── Statements
```

Communication and notifications should respond to important events across these domains.

---

# 5. CORE DESIGN PHILOSOPHY

Karatu should not simply store information.

It should understand relationships between school entities.

For example:

A teacher should not merely have a role of `TEACHER`.

Karatu should know:

```text
Teacher
  ↓
Assigned to
  ↓
Basic 6A
  ↓
Mathematics
  ↓
2026/2027 Term 1
```

That relationship determines what the teacher should be allowed to access.

Similarly, a student should not merely have:

```text
student.class_id
```

The system should understand:

```text
Student
  ↓
Enrollment
  ↓
Academic Year
  ↓
Term
  ↓
Grade
  ↓
Section
```

This preserves historical accuracy.

---

# 6. SCHOOL / TENANT

Every school is a tenant.

Karatu is a shared-hosted multi-tenant SaaS.

Example:

```text
Karatu
├── School A
├── School B
├── School C
└── School D
```

Academic data must never cross tenant boundaries.

Tenant-scoped entities include, where applicable:

- academic years
- terms
- grades
- sections
- subjects
- curriculum offerings
- teacher assignments
- enrollments
- subject enrollments
- rooms
- timetable configurations
- timetable entries
- academic policies
- promotion rules
- academic events

Authenticated tenant identity must be derived from the server-side tenant context.

Never trust a client-supplied `schoolId` as the authority for tenant access.

Use the existing tenant architecture, including:

`TenantContext.requireSchoolId()`

---

# 7. MASTER DATA VS ACADEMIC-PERIOD DATA

Karatu must distinguish between long-lived master data and records that exist within an academic period.

## Master data

Examples:

- Student
- Parent/Guardian
- Staff/Teacher
- Subject
- Room
- Grade definition
- School configuration

These entities can exist across many academic years.

## Academic-period data

Examples:

- Student enrollment
- Teacher assignment
- Subject offering
- Student subject enrollment
- Timetable
- Assessment
- Attendance
- Results

These records must preserve their academic context.

Do not duplicate master entities simply because the academic year changes.

---

# 8. ACADEMIC YEAR

An Academic Year represents the school's academic cycle.

Example:

```text
2026/2027
```

An academic year contains one or more terms.

The school should be able to configure its academic calendar.

Do not hard-code exactly three terms into the database model.

For Ghana/basic-school defaults, the UI may provide a three-term reference configuration.

Example:

```text
2026/2027
├── Term 1
├── Term 2
└── Term 3
```

However, the domain should remain configurable.

---

# 9. TERM

A Term belongs to an Academic Year.

Example:

```text
2026/2027
├── Term 1
│   Start: September
│   End: December
│
├── Term 2
│   Start: January
│   End: April
│
└── Term 3
    Start: April
    End: July
```

Actual dates are school-configurable.

A term should have a lifecycle.

Recommended:

```text
DRAFT
→ OPEN
→ IN_PROGRESS
→ READY_TO_CLOSE
→ CLOSED
```

A school should not be able to arbitrarily edit historical term data after closure.

Authorized corrections must use controlled workflows and audit trails.

---

# 10. GHANA EDUCATIONAL STRUCTURE

Karatu's Ghana reference configuration should support:

```text
KINDERGARTEN
├── KG 1
└── KG 2

PRIMARY
├── Basic 1
├── Basic 2
├── Basic 3
├── Basic 4
├── Basic 5
└── Basic 6

JUNIOR HIGH SCHOOL
├── JHS 1
├── JHS 2
└── JHS 3
```

The Ghana curriculum framework recognizes:

- 2 years Kindergarten
- 6 years Primary
- 3 years Junior High School

This reference structure is derived from Ghana's national pre-tertiary curriculum framework.

Karatu must still keep the academic structure configurable because the SaaS may eventually support schools with different structures.

---

# 11. GRADE / CLASS LEVEL

A Grade Level represents the academic level.

Examples:

```text
KG 1
KG 2
Basic 1
Basic 2
Basic 6
JHS 1
JHS 3
```

Do not use the section name itself as the canonical grade identity.

For example:

```text
Basic 6A
```

should conceptually be:

```text
Grade = Basic 6
Section = A
```

---

# 12. SECTION

A Section represents a grouping of students within a grade.

Example:

```text
Basic 6
├── A
├── B
└── C
```

The UI may display:

```text
Basic 6A
Basic 6B
Basic 6C
```

but the underlying model should preserve:

```text
Grade
+
Section
```

This allows:

- section transfers
- promotion
- reporting by grade
- reporting by section
- class capacity
- teacher assignments
- timetable management

without treating `Basic 6A` as an independent academic level.

---

# 13. STREAM

Stream and Section must not be treated as identical concepts.

A section is a grouping.

A stream can represent an academic pathway or specialization.

For the current KG → Primary → JHS scope, streams should be optional.

The system should support:

```text
Grade
  ↓
Section
  ↓
Optional Stream
```

rather than requiring streams for every school.

Example without streams:

```text
JHS 1
├── A
├── B
└── C
```

Potential future example:

```text
JHS 3
├── Science
│   ├── A
│   └── B
└── General
    ├── A
    └── B
```

Do not introduce unnecessary stream complexity into schools that do not use streams.

---

# 14. STUDENT

A Student is a long-lived person record.

The Student entity should NOT directly encode the student's current academic history as its only source of truth.

Avoid relying on:

```text
student.class_id
```

as the authoritative historical academic relationship.

Instead, use enrollment.

---

# 15. STUDENT ENROLLMENT

Enrollment is the authoritative relationship between a student and an academic placement.

Conceptually:

```text
Student
  ↓
Enrollment
  ├── School
  ├── Academic Year
  ├── Term
  ├── Grade
  ├── Section
  ├── Optional Stream
  ├── Start Date
  ├── End Date
  └── Status
```

Example:

```text
Daniel

2025/2026 Term 3
→ Basic 5A

2026/2027 Term 1
→ Basic 6A

2026/2027 Term 2
→ Basic 6A

2026/2027 Term 3
→ Basic 6A

2027/2028 Term 1
→ JHS 1A
```

Historical enrollment must remain intact.

---

# 16. STUDENT CLASS TRANSFER

If a student moves sections during a term:

Do NOT overwrite the old enrollment.

Example:

```text
October 1
Basic 6A

October 20
Approved transfer

October 21
Basic 6B
```

Store:

```text
Enrollment 1
Basic 6A
Oct 1 → Oct 20

Enrollment 2
Basic 6B
Oct 21 → ...
```

This is important for:

- attendance
- assessment
- reports
- teacher access
- historical records

---

# 17. STUDENT PROMOTION

Promotion is a workflow.

Do not implement:

```text
if average >= 50:
    move student to next class
```

as the universal rule.

Instead:

```text
Term 3
  ↓
Results Finalized
  ↓
Promotion Review
  ↓
School Promotion Policy
  ↓
Decision
```

Possible outcomes:

```text
PROMOTED
PROMOTED_WITH_SUPPORT
CONDITIONAL_PROMOTION
REPEAT
PENDING_DECISION
```

The school may configure automated recommendation rules.

However, authorized administrators must be able to review and override recommendations.

Every override should be audited.

---

# 18. PROMOTION AND NEW ENROLLMENT

Promotion should create the next academic placement.

Example:

```text
Basic 5A
     ↓
Promoted
     ↓
2027/2028
     ↓
Basic 6A
```

The previous enrollment remains historical.

Promotion does not mutate historical attendance or academic results.

---

# 19. SUBJECT MASTER CATALOGUE

A Subject is a reusable master entity.

Examples:

```text
English Language
Mathematics
Science
Computing
French
History
RME
Physical Education
Ghanaian Language
Creative Arts
```

A subject should not be duplicated simply because a different class teaches it.

---

# 20. CURRICULUM OFFERING

Subject availability should be modeled through an academic offering.

Conceptually:

```text
Subject
  ↓
Curriculum Offering
  ├── School
  ├── Academic Year
  ├── Grade
  ├── Subject
  ├── Required / Optional
  ├── Active
  ├── Periods Per Week
  ├── Assessment Enabled
  └── Report Enabled
```

Example:

```text
Basic 6

Mathematics
Required
5 periods/week

Science
Required
4 periods/week

French
Optional
2 periods/week
```

This must not be hard-coded.

---

# 21. SUBJECT AVAILABILITY BY GRADE

Different subjects may apply to different educational levels.

Therefore:

```text
Subject Catalogue
        ↓
Grade / Curriculum Offering
```

not:

```text
Every Subject
        ↓
Every Grade
```

Example:

```text
Mathematics
├── Basic 1 ✓
├── Basic 2 ✓
├── Basic 3 ✓
├── Basic 4 ✓
├── Basic 5 ✓
├── Basic 6 ✓
├── JHS 1 ✓
├── JHS 2 ✓
└── JHS 3 ✓
```

Another subject may only be offered at selected levels.

Karatu should provide a Ghana/NaCCA reference configuration but allow each school to customize its offerings.

---

# 22. REQUIRED VS OPTIONAL SUBJECTS

A school should be able to configure:

```text
Required
Optional
Elective
Inactive
```

Example:

```text
Basic 6

English          Required
Mathematics      Required
Science          Required
History          Required
French           Optional
Computing        Optional
```

Do not assume every student takes every optional subject.

---

# 23. STUDENT SUBJECT ENROLLMENT

Where subject choice exists, support:

```text
Student
  ↓
Student Subject Enrollment
  ├── Academic Year
  ├── Term
  ├── Subject Offering
  └── Status
```

This allows:

- optional subjects
- electives
- subject changes
- individual student subject differences

For simple primary classes, the system may derive default subject membership from the class offering rather than requiring manual enrollment for every student.

---

# 24. TEACHER

Teacher is a person/staff record.

Teacher role does not by itself determine which classes or subjects the teacher can access.

Access should be contextual.

---

# 25. TEACHER ASSIGNMENT

A Teacher Assignment establishes the relationship between a teacher and an academic teaching context.

Conceptually:

```text
Teacher Assignment
├── School
├── Academic Year
├── Term
├── Grade
├── Section
├── Subject
├── Teacher
├── Role
├── Start Date
├── End Date
└── Status
```

Example:

```text
Mr Mensah
2026/2027
Term 1
Basic 6A
Mathematics
Lead Teacher
```

---

# 26. TEACHER ASSIGNMENT AS AUTHORIZATION

Teacher permissions should be contextual.

Instead of:

```text
ROLE = TEACHER
→ can access all assessment records
```

use:

```text
Teacher
  ↓
Active Assignment
  ↓
Class + Subject + Academic Period
  ↓
Authorized academic access
```

This should control access to:

- class roster
- attendance
- assessments
- result entry
- student academic information
- timetable

This must remain tenant-scoped.

---

# 27. MULTIPLE TEACHERS

Karatu must support multiple teachers for one teaching context.

Example:

```text
Basic 6A Science

Lead:
Mr Mensah

Co-teacher:
Madam Ama
```

The model should not assume exactly one teacher.

---

# 28. TEMPORAL TEACHER ASSIGNMENTS

Assignments may change during a term.

Example:

```text
September → October
Mr Mensah

November → December
Madam Ama
```

The system must preserve both assignments.

This is important for:

- historical access
- attendance
- assessment
- auditing
- teacher workload
- timetable history

---

# 29. CLASS TEACHER VS SUBJECT TEACHER

These should be separate concepts.

Example:

```text
Basic 6A

Class Teacher:
Madam Ama

Subject Teachers:

Mathematics → Mr Mensah
Science → Mr Kofi
English → Madam Yaa
Computing → Mr Daniel
```

A class teacher may have broader pastoral/administrative responsibilities.

A subject teacher primarily has subject-specific academic responsibilities.

---

# 30. CLASS TEACHER ASSIGNMENT

Conceptually:

```text
Class Teacher Assignment
├── School
├── Academic Year
├── Term
├── Grade
├── Section
├── Teacher
├── Start Date
├── End Date
└── Status
```

Do not assume the class teacher is always one of the subject teachers, although it may often be the same person.

---

# 31. TIMETABLE

The timetable is the scheduled operational representation of teaching.

A timetable entry conceptually contains:

```text
Academic Year
Term
Day
Period
Class/Section
Subject or Activity
Teacher
Room
```

The timetable should be built from already-existing:

- classes
- sections
- subjects
- subject offerings
- teacher assignments
- rooms
- timetable periods

Do not allow timetable creation to bypass these relationships.

---

# 32. TIMETABLE SETUP ORDER

Recommended setup sequence:

```text
1. Academic Year
        ↓
2. Terms
        ↓
3. Grades
        ↓
4. Sections
        ↓
5. Subjects
        ↓
6. Curriculum Offerings
        ↓
7. Teachers
        ↓
8. Teacher Assignments
        ↓
9. Rooms
        ↓
10. Timetable Configuration
        ↓
11. Periods
        ↓
12. Timetable Entries
```

---

# 33. TIMETABLE DAYS

Do not hard-code Monday-Friday as the only possible model.

The school should configure operating days.

Typical:

```text
Monday
Tuesday
Wednesday
Thursday
Friday
```

But the data model should not prevent other schedules.

---

# 34. TIMETABLE PERIODS

Do not hard-code:

```text
Period 1
Period 2
...
Period 8
```

Instead configure actual time intervals.

Example:

```text
08:00–08:40
08:40–09:20
09:20–10:00
10:00–10:30 BREAK
10:30–11:10
11:10–11:50
11:50–12:30
```

Period duration should be configurable by school and potentially by educational phase.

Ghana's curriculum framework provides different instructional-time structures for different phases, so the timetable model must not assume one universal period length.

---

# 35. TIMETABLE ACTIVITY TYPES

A timetable entry should not be restricted to academic subjects.

Support activity types such as:

```text
LESSON
BREAK
ASSEMBLY
CLUB
SPORT
REMEDIAL
EXAM
PROJECT
MEETING
OTHER
```

A timetable activity may reference a subject or may be a non-subject activity.

---

# 36. SUBJECT FREQUENCY

Subject offerings should be able to specify expected weekly frequency.

Example:

```text
Basic 6

English       5 periods/week
Mathematics   5 periods/week
Science       4 periods/week
Computing     2 periods/week
History       2 periods/week
French        2 periods/week
RME          2 periods/week
PE            2 periods/week
```

The timetable engine can use this to determine whether the school has scheduled enough instruction.

If required instructional demand exceeds available timetable capacity, warn the administrator.

---

# 37. TIMETABLE CONFLICT DETECTION

The system must detect conflicts before saving/publishing a timetable.

## Teacher conflict

```text
Teacher
Monday
Period 3

Basic 6A Mathematics
AND
Basic 5A Mathematics
```

Invalid.

## Class conflict

```text
Basic 6A
Monday
Period 3

Mathematics
AND
Science
```

Invalid.

## Room conflict

```text
Science Lab
Monday
Period 4

Basic 6A Science
AND
JHS 2 Science
```

Invalid.

## Availability conflict

If a teacher is unavailable during a period, the system must prevent or warn against scheduling them.

---

# 38. TIMETABLE CAPACITY VALIDATION

Before publishing a timetable, Karatu should validate:

- available periods
- required subject frequency
- teacher availability
- room availability
- class availability
- locked periods
- breaks
- activities
- teacher workload

Example:

```text
Required teaching load: 30 periods/week
Available teaching capacity: 25 periods/week
```

Show:

> Insufficient timetable capacity.

Do not silently publish an incomplete timetable.

---

# 39. TIMETABLE PHASES

Do not start with an AI scheduling engine.

Recommended roadmap:

### Phase 1

Manual timetable builder:

- drag/select slots
- conflict detection
- teacher availability
- room conflicts
- class conflicts
- workload validation

### Phase 2

Assisted scheduling:

- suggest available periods
- suggest rooms
- suggest teacher slots
- identify best alternative slots

### Phase 3

Automatic timetable generation:

Use constraints such as:

- teacher availability
- teacher workload
- subject frequency
- room availability
- class availability
- double periods
- locked lessons
- preferred periods
- practical subjects
- breaks

---

# 40. EXAMINATION TIMETABLE

Regular timetable and examination timetable should be separate domains/concepts.

Regular timetable:

```text
Recurring weekly schedule
```

Examination schedule:

```text
Specific date
Specific time
Subject
Class
Venue
Invigilator
```

Do not force examination scheduling into recurring timetable entries.

---

# 41. ACADEMIC YEAR ROLLOVER

Karatu should support preparing a new academic year without rebuilding everything.

Example:

```text
2026/2027
      ↓
Prepare Next Academic Year
      ↓
2027/2028 Draft
```

Potentially copy:

- grade structure
- sections
- subjects
- curriculum offerings
- timetable configuration
- rooms
- report templates
- assessment policy
- grading scheme

Do NOT blindly copy:

- student enrollments
- attendance
- results
- financial transactions
- historical teacher assignments

These require controlled rollover workflows.

---

# 42. PROMOTION DURING ROLLOVER

At the end of the academic year:

```text
Term 3
  ↓
Results Finalized
  ↓
Promotion Review
  ↓
Promotion Decision
  ↓
Next Academic Year Enrollment
```

Example:

```text
Basic 5A
→ Promoted
→ Basic 6A

Basic 5B
→ Promoted
→ Basic 6B

Basic 5C
→ Repeat
→ Basic 5C
```

The previous enrollment remains unchanged.

---

# 43. TERM CLOSURE

Recommended lifecycle:

```text
DRAFT
↓
OPEN
↓
IN_PROGRESS
↓
READY_TO_CLOSE
↓
CLOSED
```

When a term is closed:

Protected historical information includes:

- attendance history
- published results
- report snapshots
- historical enrollment
- historical teacher assignments
- financial transactions

Controlled corrections remain possible through authorized workflows.

No silent mutation of historical data.

---

# 44. TERM CLOSURE VALIDATION

Before allowing a term to close, Karatu should optionally validate:

- required assessments completed
- eligible results reviewed
- required results published
- reports generated where required
- unresolved academic exceptions
- attendance completeness
- promotion decisions where applicable
- pending administrative tasks

The school should see a readiness checklist.

Example:

```text
TERM CLOSURE

✓ Attendance complete
✓ Assessment results submitted
✓ Results reviewed
✓ Results published
✓ Reports generated
⚠ 2 students have pending promotion decisions

[Review Pending Items]
```

The system should not blindly close a term with unresolved critical issues.

---

# 45. ACADEMIC CONTEXT

Karatu should understand the user's current academic context.

For example:

```text
2026/2027
Term 1
```

The system can use this context to determine:

- relevant classes
- active enrollments
- teacher assignments
- active subjects
- attendance
- assessments
- results
- finance period
- reports

The context should be selectable by authorized users.

---

# 46. ROLE-SPECIFIC ACADEMIC CONTEXT

## Super Admin

May operate across tenants according to platform authorization.

## Admin

Works primarily within their school.

Can configure:

- academic year
- terms
- grades
- sections
- subjects
- curriculum offerings
- teacher assignments
- enrollments
- timetable
- promotion
- term closure

## Teacher

Sees only relevant assigned academic contexts.

Example:

```text
Mr Mensah

2026/2027 Term 1

Basic 6A — Mathematics
Basic 5A — Mathematics
JHS 1 — Science
```

## Parent

Sees only authorized child academic contexts.

Example:

```text
Daniel
Basic 6A
2026/2027 Term 1
```

---

# 47. TEACHER DASHBOARD CONCEPT

The teacher dashboard should be context/action-oriented.

Example:

```text
GOOD MORNING, MR MENSAH

MONDAY, 6 OCTOBER 2026

NEXT CLASS
────────────────────────
10:00–10:40
Basic 6A
Mathematics
Room 4

[Take Attendance]
[Open Class]

TODAY
────────────────────────
08:00  Mathematics — Basic 6A     ✓
09:00  Mathematics — Basic 5A     ✓
10:00  Mathematics — Basic 6A     →
11:00  Science — JHS 1             ○

PENDING
────────────────────────
3 assessments awaiting submission
2 result sets awaiting completion
```

The teacher should not have to navigate through multiple unrelated modules to perform common actions.

---

# 48. ADMIN ACADEMIC OPERATIONS DASHBOARD

The admin dashboard should emphasize operational actions.

Example:

```text
ACADEMIC OPERATIONS

CURRENT PERIOD
2026/2027 — Term 1

PRIORITIES

⚠ 12 unexplained absences
⚠ 18 result sets awaiting review
⚠ 3 timetable conflicts
⚠ 2 pending enrollment approvals
⚠ 5 incomplete subject assignments

QUICK ACTIONS

[Manage Classes]
[Assign Teachers]
[Build Timetable]
[Review Attendance]
[Review Results]
[Manage Enrollment]
```

Analytics can appear below the action area.

---

# 49. PARENT ACADEMIC EXPERIENCE

Parents should experience Karatu through their children, not through internal modules.

Example:

```text
MY CHILDREN

┌───────────────────────────────┐
│ Daniel Dadzie                 │
│ Basic 6A                      │
│                               │
│ Attendance      92.5%         │
│ Average         77%           │
│ Fees Due        GHS 1,200     │
│                               │
│ [View Student]                │
└───────────────────────────────┘
```

Inside the student:

```text
Daniel
├── Overview
├── Today
│   ├── Timetable
│   ├── Attendance
│   └── Notices
├── Academics
│   ├── Assessments
│   ├── Results
│   └── Reports
├── Finance
│   ├── Charges
│   ├── Payments
│   └── Statement
└── Communication
```

---

# 50. ATTENDANCE INTEGRATION

Attendance should consume academic context from:

- student enrollment
- teacher assignment
- class/section
- subject
- academic year
- term
- timetable where applicable

For example:

```text
Teacher Assignment
        ↓
Basic 6A Mathematics
        ↓
Today's timetable
        ↓
Attendance
        ↓
Basic 6A roster
```

Teacher should not manually select arbitrary students outside the assigned context.

Existing Attendance rules remain authoritative where already implemented.

---

# 51. ASSESSMENT INTEGRATION

Assessment should reference:

```text
Academic Year
Term
Grade / Section
Subject
Teacher Assignment
```

Teacher authorization should be based on the active teaching assignment.

Results should remain associated with the correct academic period and enrollment context.

The Assessment domain remains responsible for:

- assessments
- assessment results
- calculation
- grading
- result lifecycle
- publication

Academic Operations provides the context.

---

# 52. REPORT INTEGRATION

Reports consume authoritative published academic results.

Flow:

```text
Academic Operations
      ↓
Assessment
      ↓
Published Results
      ↓
Report Generation
      ↓
Report Snapshot
      ↓
PDF
      ↓
Parent Portal
```

Academic Operations must not independently calculate report grades.

---

# 53. FINANCE INTEGRATION

Finance remains an independent financial domain.

However, Finance uses academic context.

Example:

```text
Student
+
Enrollment
+
Academic Year
+
Term
+
Fee Policy
        ↓
Student Charge
```

Academic Operations should not calculate balances.

Finance remains authoritative for:

- charges
- payments
- allocations
- credits
- reversals
- refunds
- balances
- statements

---

# 54. NOTIFICATION INTEGRATION

Important academic events may trigger notifications.

Examples:

```text
Student absent
→ Parent notification

Assessment result published
→ Parent notification

Report published
→ Parent notification

Timetable changed
→ Teacher/student/parent notification where appropriate

Enrollment approved
→ Parent notification

Promotion decision published
→ Parent notification
```

Notification delivery should remain a separate service/domain.

Academic Operations produces the business event.

---

# 55. EVENT-DRIVEN BUSINESS THINKING

Karatu does not need to become a microservices system merely because business events exist.

The architectural principle is:

```text
Business Event
      ↓
Relevant Domain Action
      ↓
Relevant Notification / Update
```

Example:

```text
Payment Verified
      ↓
Finance updates ledger
      ↓
Balance changes
      ↓
Receipt available
      ↓
Parent notified
```

This can initially be implemented within the modular monolith.

Do not introduce distributed infrastructure prematurely.

---

# 56. SCHOOL POLICY VS PLATFORM INVARIANTS

Karatu must distinguish between what the platform guarantees and what schools configure.

## Platform invariants

Karatu controls:

- tenant isolation
- authorization
- audit history
- historical integrity
- financial ledger integrity
- published-result integrity
- data ownership
- transaction consistency
- security

## School policies

Schools control:

- grading
- assessment weighting
- billing frequency
- ranking
- report sections
- promotion rules
- subject offerings
- timetable configuration
- attendance rules

## Presentation

Schools may customize:

- logo
- school name
- branding
- report template
- terminology
- notification templates

Do not make every internal rule configurable.

Over-configurability creates complexity and poor UX.

---

# 57. ONBOARDING

Onboarding is a product feature.

A new school should eventually be able to go through:

```text
1. School Information
        ↓
2. Academic Structure
        ↓
3. Academic Year
        ↓
4. Terms
        ↓
5. Classes / Sections
        ↓
6. Subjects
        ↓
7. Curriculum Offerings
        ↓
8. Staff / Teachers
        ↓
9. Student Import
        ↓
10. Parent / Guardian Matching
        ↓
11. Finance Configuration
        ↓
12. Assessment Configuration
        ↓
13. Report Template
        ↓
14. Review
        ↓
15. Go Live
```

The system should support importing existing school data through controlled CSV/Excel workflows where appropriate.

---

# 58. DATA IMPORT PRINCIPLES

Imports must not bypass business rules.

For example:

Student import should validate:

- required fields
- duplicate student identifiers
- duplicate names where relevant
- guardian relationships
- class placement
- academic year
- enrollment

Teacher import should validate:

- staff identity
- teacher status
- assignments

Subject import should validate:

- duplicate subjects
- grade availability
- curriculum offerings

Financial imports must follow Finance's authoritative ledger rules.

---

# 59. HISTORICAL DATA PRINCIPLE

Karatu must preserve historical truth.

Changing:

```text
Current Class
```

must not change:

```text
Past Attendance
Past Results
Past Reports
Past Enrollment
Past Teacher Assignment
Past Finance
```

Historical records should point to the academic context that was true at the time.

---

# 60. NO SILENT HISTORICAL MUTATION

Do not silently overwrite:

- old enrollments
- published results
- teacher assignments
- historical timetable records
- report snapshots
- financial transactions

Use:

- effective dates
- versioning
- correction records
- audit events
- reversal workflows

where appropriate.

---

# 61. TERM CLOSURE AND IMMUTABILITY

Closing a term is not the same as making the database absolutely immutable.

Instead:

```text
Closed
→ Historical data protected
→ Normal edits disabled
→ Authorized correction workflow available
→ Corrections audited
```

This preserves operational flexibility while protecting historical integrity.

---

# 62. ARCHITECTURAL RELATIONSHIPS

The target conceptual architecture is:

```text
                         SCHOOL / TENANT
                                │
                    ┌───────────┴───────────┐
                    │                       │
                MASTER DATA           ACADEMIC PERIOD
                    │                       │
          ┌─────────┼──────────┐            │
          │         │          │        Academic Year
       People    Subjects     Rooms          │
          │                    │            Terms
          │                    │              │
          └─────────┬──────────┘              │
                    │                         │
              ACADEMIC SETUP                  │
                    │                         │
             Grade + Section                  │
                    │                         │
               Enrollment                     │
                    │                         │
          ┌─────────┴─────────┐               │
          │                   │               │
 Curriculum Offering   Teacher Assignment     │
          │                   │               │
          └─────────┬─────────┘               │
                    │                         │
                Timetable                     │
                    │                         │
       ┌────────────┼──────────────┐          │
       │            │              │          │
   Attendance   Assessment     Activities     │
                    │                         │
                 Grading                      │
                    │                         │
                 Results                      │
                    │                         │
               Report Card                   │
                    │                         │
               Parent Portal                 │
```

---

# 63. DOMAIN OWNERSHIP

Academic Operations owns:

- academic years
- terms
- grades
- sections
- subject catalogue integration
- curriculum offerings
- enrollments
- student subject enrollment
- teacher assignments
- class teacher assignments
- rooms
- timetable configuration
- timetable entries
- promotion workflow
- term lifecycle

Attendance owns:

- attendance records
- attendance status
- attendance calculations

Assessment owns:

- assessments
- assessment results
- calculation
- grading
- result lifecycle

Report domain owns:

- report templates
- report snapshots
- report generation
- report versions
- PDF generation

Finance owns:

- charges
- invoices
- payments
- allocations
- credits
- refunds
- reversals
- financial statements

Communication owns:

- notifications
- messages
- announcements
- delivery tracking

Do not duplicate domain authority.

---

# 64. API PRINCIPLES

APIs should reflect domain operations rather than exposing raw database CRUD unnecessarily.

Prefer business operations such as:

```text
Create Academic Year
Open Term
Close Term
Create Section
Enroll Student
Transfer Student
Assign Teacher
Assign Class Teacher
Configure Subject Offering
Enroll Student in Subject
Create Timetable Entry
Publish Timetable
Promote Student
Prepare Next Academic Year
```

over blindly exposing:

```text
POST /rows
PUT /rows
DELETE /rows
```

Use DTOs.

Do not expose persistence entities directly.

---

# 65. AUTHORIZATION PRINCIPLES

Authorization must consider:

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

Example:

```text
Teacher
+
Karatu School A
+
2026/2027 Term 1
+
Assigned to Basic 6A Mathematics
+
ENTER_RESULT
```

Allowed.

But:

```text
Teacher
+
Karatu School A
+
2026/2027 Term 1
+
Not assigned to Basic 5B Mathematics
+
ENTER_RESULT
```

Denied.

---

# 66. DATABASE DESIGN PRINCIPLES

Use:

- foreign keys
- unique constraints
- check constraints
- indexes
- tenant-scoped uniqueness
- effective dates where required
- optimistic locking where appropriate

Do not rely exclusively on application-level validation.

Important relationships should be protected at the database level where practical.

---

# 67. PERFORMANCE

Avoid:

- N+1 queries
- loading entire schools into memory
- repeated timetable calculations
- repeated roster queries
- unnecessary recalculation
- unbounded academic-history queries

Use appropriate:

- indexes
- pagination
- projections
- batch operations
- caching where justified

Do not prematurely introduce distributed infrastructure.

---

# 68. AUDITABILITY

Important academic mutations should be auditable.

Examples:

- student enrollment created
- enrollment transferred
- enrollment ended
- teacher assignment created
- teacher assignment changed
- timetable changed
- timetable published
- promotion decision made
- term opened
- term closed
- academic policy changed
- subject offering changed

Audit should capture:

- actor
- tenant
- timestamp
- action
- target
- old state where appropriate
- new state where appropriate
- reason where appropriate

---

# 69. UX PRINCIPLES

The system should optimize for school staff.

Do not force users to repeatedly select the same context.

If the system already knows:

```text
2026/2027 Term 1
Basic 6A
Mathematics
Mr Mensah
```

the UI should use that context wherever appropriate.

Use:

- contextual dashboards
- smart defaults
- recent contexts
- filters
- bulk actions
- clear validation
- meaningful empty states
- actionable warnings

---

# 70. OPERATIONAL DASHBOARDS

Dashboards should prioritize actions over vanity metrics.

Bad:

```text
Students: 542
Teachers: 43
Classes: 18
```

Better:

```text
12 attendance issues
18 results awaiting review
3 timetable conflicts
7 pending enrollments
5 teacher assignments incomplete
```

Metrics can still be displayed, but operational priorities should be prominent.

---

# 71. MOBILE / RESPONSIVE CONSIDERATION

Teachers often interact with school systems during active school operations.

Teacher workflows should therefore work well on:

- desktop
- laptop
- tablet
- mobile browser

High-frequency actions such as:

- attendance
- timetable
- result entry
- announcements

should not require a large desktop-only layout.

---

# 72. REPORTING AND ANALYTICS

Analytics should be derived from authoritative domain records.

Examples:

Attendance analytics derive from Attendance.

Academic analytics derive from Assessment/Results.

Financial analytics derive from Finance.

Do not maintain independent mutable summary values that can drift away from the source of truth.

---

# 73. WHAT KARATU SHOULD NOT DO

Do not:

- hard-code one school's grading system
- hard-code 30/70 assessment weighting
- hard-code Monday-Friday periods
- hard-code exactly 8 periods
- hard-code every student taking every subject
- hard-code one promotion rule
- hard-code one report format
- make every school configuration option mandatory
- give teachers unrestricted academic access
- use `student.class_id` as the only historical placement
- silently overwrite historical records
- calculate reports independently from published results
- create separate payment systems for trips/events
- create duplicate domain logic
- introduce unnecessary microservices

---

# 74. FUTURE DIFFERENTIATION

Karatu should eventually use this academic foundation for higher-level intelligence.

Potential future features:

## Learning intelligence

```text
Assessment
→ Performance Trend
→ Learning Gap
→ Intervention
→ Reassessment
```

## Academic heatmaps

```text
Class
→ Subject
→ Topic / Outcome
→ Performance
```

## Teacher workload intelligence

```text
Teacher
→ Classes
→ Subjects
→ Periods
→ Workload
```

## Timetable optimization

```text
Constraints
→ Suggested Schedule
→ Conflict-free Timetable
```

## Student 360

```text
Student
├── Academics
├── Attendance
├── Finance
├── Behaviour
├── Communication
├── Activities
└── History
```

These should be built on top of the authoritative foundation.

---

# 75. IMPLEMENTATION STRATEGY

When implementing this domain in the existing Karatu repository:

## NEVER assume the current implementation is wrong.

First perform:

```text
Repository Inspection
        ↓
Current Architecture Analysis
        ↓
Current vs Target Comparison
        ↓
Gap Analysis
        ↓
Migration Risk Analysis
        ↓
Implementation Plan
        ↓
Implementation
        ↓
Tests
        ↓
Verification
```

For every existing concept, classify it as:

```text
KEEP
KEEP + HARDEN
EXTEND
REFACTOR
MIGRATE
DEPRECATE
REMOVE
```

Provide a reason for every non-trivial change.

---

# 76. EXISTING DATA MUST BE PROTECTED

Before modifying existing academic tables:

- inspect migrations
- inspect foreign keys
- inspect existing references
- inspect production-like seed data
- inspect tests
- inspect API consumers
- inspect frontend consumers

Do not casually rename or delete columns.

If a migration is required, create a new Flyway migration.

Never rewrite an already-applied migration simply to make the new architecture easier.

---

# 77. MIGRATION PRINCIPLE

When moving from a simpler model to the target model:

Example:

Current:

```text
Student
  ↓
school_class_id
```

Target:

```text
Student
  ↓
Enrollment
  ↓
Grade + Section + Academic Year + Term
```

The migration should:

1. Preserve existing student records.
2. Create required grade/section records.
3. Create enrollment records from existing class assignments.
4. Preserve historical information where possible.
5. Update dependent records safely.
6. Add constraints only after data is valid.
7. Verify counts before/after migration.
8. Add regression tests.

Never destroy historical data merely to simplify migration.

---

# 78. DEFINITION OF DONE

Academic Operations is not complete merely because CRUD screens exist.

A production-ready implementation must support:

- academic year management
- term management
- grade/class management
- section management
- subject catalogue
- subject offerings
- required/optional subjects
- student enrollment
- historical enrollment
- student transfer
- teacher assignment
- class teacher assignment
- multiple teachers
- temporal assignments
- timetable configuration
- timetable periods
- rooms
- timetable entries
- conflict detection
- workload validation
- promotion
- academic rollover
- term closure
- auditability
- tenant isolation
- authorization
- API validation
- frontend production states
- tests
- documentation

---

# 79. VERIFICATION REQUIREMENTS

Before declaring the domain complete, verify:

## Data

- no orphaned enrollments
- no orphaned assignments
- no duplicate active assignments
- no invalid subject offerings
- no duplicate timetable entries
- no invalid historical relationships

## Security

- no cross-tenant access
- no teacher IDOR
- no parent IDOR
- no unauthorized enrollment modification
- no unauthorized timetable modification

## Academic correctness

- historical enrollment remains accurate
- promotion creates correct new enrollment
- subject offerings apply correctly
- teacher assignments are period-aware
- timetable conflicts are prevented
- closed terms are protected

## Integration

Verify:

```text
Academic Operations
→ Attendance

Academic Operations
→ Assessment

Academic Operations
→ Report Generation

Academic Operations
→ Finance

Academic Operations
→ Parent Portal
```

---

# 80. TARGET USER EXPERIENCE

Karatu should make common tasks feel like:

```text
What is happening?
      ↓
Who is involved?
      ↓
What academic period?
      ↓
What action is required?
```

rather than:

```text
Open module
→ search database
→ select school
→ select year
→ select term
→ select class
→ select subject
→ finally perform action
```

The system should infer context wherever it is safe to do so.

---

# 81. CORE PRODUCT DIFFERENTIATOR

Karatu's differentiation should not primarily be:

> "We have more modules."

It should be:

> **Karatu connects the school's people, academic periods, enrollments, assignments and authoritative records into one coherent operating system.**

The system should understand the relationships between:

```text
Student
Teacher
Class
Section
Subject
Academic Year
Term
Enrollment
Assignment
Timetable
Attendance
Assessment
Finance
Report
Parent
```

rather than treating each as a disconnected feature.

---

# 82. RESEARCH BASIS

The target architecture is informed by established school-information-system patterns and Ghana's educational context.

Examples of researched systems and references include:

### Fedena

Fedena's documented workflow connects institution setup with courses/batches, subjects, teachers, students, attendance and gradebook workflows.

Reference:
https://support.fedena.com/support/solutions/articles/266503-process-flow-start-using-fedena

### Veracross

Veracross emphasizes a centralized student/person record and connected school operations.

Reference:
https://www.veracross.com/

### PowerSchool

PowerSchool documentation demonstrates concepts including:

- sections
- teacher assignments
- scheduling
- course requests
- academic periods
- scheduling constraints

References:

https://ps.powerschool-docs.com/pssis-admin/latest/sections

https://ps.powerschool-docs.com/pssis-admin/latest/teacher-scheduling-information

https://ps.powerschool-docs.com/pssis-admin/25.1/course-requests-and-schedule

### Blackbaud

Blackbaud documentation demonstrates academic scheduling workflows involving:

- courses
- sections
- teachers
- rooms
- periods
- constraints
- schedule generation

Reference:

https://webfiles-sc1.blackbaud.com/files/support/helpfiles/education/k12/full-help/content/sis-schedule-maker.html

### Ghana / NaCCA

Ghana's National Council for Curriculum and Assessment provides the national curriculum and pre-tertiary curriculum framework.

Reference:

https://nacca.gov.gh/curriculum/

Reference:

https://nacca.gov.gh/learning-areas-subjects/new-standards-based-curriculum-2019/

The Ghanaian reference structure used by Karatu is:

```text
2 years Kindergarten
+
6 years Primary
+
3 years JHS
```

This should be treated as the default/reference configuration rather than an immutable SaaS limitation.

### Ghana School ERP

School ERP Ghana demonstrates configurable academic workflows including:

- classes
- subjects
- SBA
- curriculum
- lesson planning
- examination scheduling
- grading
- reports

Reference:

https://docs.schoolerpghana.com/en/main/index.html

---

# 83. FINAL ARCHITECTURAL PRINCIPLE

The most important rule in this document is:

> **Academic Operations provides the context. Specialized domains own their authoritative records.**

Therefore:

```text
Academic Operations
       │
       ├── Who?
       │   Student / Teacher
       │
       ├── Where?
       │   School / Grade / Section / Room
       │
       ├── When?
       │   Academic Year / Term / Date / Period
       │
       └── Relationship?
           Enrollment / Assignment / Offering
```

Then:

```text
Attendance
→ owns attendance

Assessment
→ owns assessment and results

Finance
→ owns financial transactions

Reports
→ owns report snapshots and documents

Communication
→ owns notifications/messages
```

No domain should duplicate another domain's authoritative logic.

---

# 84. KARATU ACADEMIC OPERATIONS NORTH STAR

The intended experience is:

```text
                         KARATU
                           │
                    "What is happening?"
                           │
                           ↓
                  ACADEMIC CONTEXT
                           │
             ┌─────────────┼─────────────┐
             │             │             │
           WHO?          WHEN?         WHERE?
             │             │             │
          Student      Term/Year     Class/Room
          Teacher                       │
             │                          │
             └─────────────┬────────────┘
                           │
                      RELATIONSHIP
                           │
             Enrollment / Assignment
                           │
                           ↓
                       ACTION
                           │
       ┌───────────────────┼───────────────────┐
       │                   │                   │
   Attendance          Assessment          Timetable
       │                   │                   │
       └───────────────────┼───────────────────┘
                           │
                         Result
                           │
                        Report
                           │
                         Parent
```

Karatu should make the correct action obvious from the current context.

That is the intended operating model for Academic Operations.
