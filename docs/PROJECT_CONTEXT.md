# CarePoint School Management System — Project Context

## 1. Project Overview

CarePoint is a community-based school.

The School Management System is an end-to-end digital platform designed to support the school's academic, administrative, communication, admissions, payment, reporting, and parent-facing workflows.

The MVP deadline is September 30, 2026.

The system should be production-oriented while remaining appropriately scoped for the MVP.

---

## 2. Product Surfaces

The system has three conceptual surfaces.

### Public Website

Accessible without authentication.

Primary purposes:

* present the school
* provide school information
* publish news/events
* display gallery/media
* provide contact information
* provide admissions information
* allow prospective parents/guardians to submit admission applications

### Secure School Management Portal

Authenticated staff/admin environment.

Users include:

* Super Admin
* Principal/Admin
* Teacher
* Parent/Guardian

### Parent Portal

The Parent Portal is part of the secure application.

Parents can access only their linked wards.

---

## 3. MVP Student Authentication

Students are represented as core backend entities.

Students do not have login access in the MVP.

Student authentication is a post-MVP feature unless explicitly approved.

---

## 4. Technology Stack

### Frontend

* Next.js App Router
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
* `/api/v1`

### Database

* PostgreSQL
* JPA/Hibernate
* Flyway
* Supabase-hosted PostgreSQL in production

### Infrastructure/Services

* Redis
* Cloudinary
* Supabase Storage
* Firebase FCM
* SMTP
* Paystack
* Sentry
* Docker
* GitHub Actions

---

## 5. Architecture

The application uses a modular monolith.

The frontend communicates with the backend through HTTPS REST APIs.

Architecture:

Public Website / Secure Portal
|
| HTTPS REST
v
Spring Boot API
|
v
PostgreSQL

Supporting services connect to the backend where required.

The frontend never directly connects to PostgreSQL.

---

## 6. Repository Structure

```text
school-management-system/
├── apps/
│   ├── web/
│   └── api/
├── packages/
│   └── types/
├── docs/
│   ├── architecture/
│   ├── api/
│   ├── database/
│   ├── decisions/
│   └── workflows/
├── infrastructure/
├── scripts/
├── .github/
├── AGENTS.md
├── README.md
├── docker-compose.yml
└── ...
```

---

## 7. Frontend Route Structure

The Next.js application is intended to use route groups:

```text
app/
├── (public)/
├── (auth)/
└── (portal)/
```

Public routes do not require authentication.

Authentication routes contain login and related authentication flows.

Portal routes require authentication and appropriate authorization.

---

## 8. Roles

### Super Admin / IT

Technical/system administration.

Responsibilities include:

* users
* roles
* system settings
* security
* audit
* technical configuration
* system operations

Does not make academic promotion decisions.

### Principal/Admin

School-wide academic and administrative authority.

Responsibilities include:

* results review/approval
* result publication
* promotion decisions
* admissions
* incidents
* reports
* school-wide administration

### Teacher

Teachers manage academic activities assigned to them.

Responsibilities include:

* attendance
* assessments
* scores
* incidents
* assigned class/subject activities

### Class Teacher

A teacher may receive additional class-level permissions.

Class Teacher is not necessarily a separate top-level system role.

### Parent/Guardian

Parents can access only their linked wards.

They may view:

* results
* report cards
* attendance
* fees
* payments
* announcements
* notifications
* relevant teacher comments

Note: the system UI displays this role as "Guardian." "Parent" is the
backend/domain term (see `docs/frontend-design-system.md` §21.2). Do not
rename the backend entity or role key to match the UI label.

### Student

Core entity.

No login in MVP.

---

## 9. Authorization Model

Authorization uses:

RBAC + resource/relationship authorization.

Authentication answers:

"Who is this user?"

Authorization answers:

"Is this user allowed to perform this action on this specific resource?"

### Teacher

Teacher authorization must verify the teacher's assignment to the relevant:

* class
* subject
* academic year
* term

### Parent

Parent authorization must verify an actual parent-child/guardian relationship.

### Principal/Admin

School-wide academic authority.

### Super Admin

Technical/system authority.

Backend authorization is authoritative.

Frontend role checks are only for user experience and navigation.

---

## 10. Academic Hierarchy

```text
AcademicYear
    └── Term
         ├── Class
         │    └── Student
         │
         └── Subject
              └── TeacherAssignment
```

---

## 11. Core Entities

Expected core entities include:

* User
* Role
* Student
* Parent
* Teacher
* ParentStudent
* AcademicYear
* Term
* Class
* Subject
* TeacherAssignment
* Enrollment
* Assessment
* AssessmentScore
* GradingScheme
* AssessmentWeight
* GradingBand
* StudentSubjectResult
* ReportCard
* Attendance
* FeeStructure
* FeeAssignment
* Payment
* AdmissionApplication
* Incident
* Promotion
* Notification
* AuditLog

The exact schema should be governed by database documentation and approved migrations.

---

## 12. Assessment Model

An Assessment represents a specific academic assessment.

Typical assessment types include:

* CLASS_TEST
* ASSIGNMENT
* PROJECT
* EXAM

The school should be able to configure the grading scheme rather than requiring source-code changes when academic rules change.

Assessment contains concepts such as:

* title
* type
* maximum score
* weight where applicable
* subject
* class
* term
* academic year
* date
* status

AssessmentScore stores a student's raw score.

Blank/null is distinct from zero.

---

## 13. Gradebook

The gradebook is spreadsheet-like.

Expected structure:

* students as rows
* assessments as columns
* student identity column
* score cells
* clear save/submit state

Teachers enter raw scores.

The backend calculates authoritative results.

---

## 14. Grading

Grading is configuration-driven.

A grading scheme contains:

### Assessment Weights

Weights for assessment categories.

All active assessment weights must total exactly 100%.

### Grading Bands

Each band contains:

* minimum score
* maximum score
* grade
* remark

Bands must be valid and non-overlapping.

A grading scheme is associated with an academic year.

There should be one active scheme per academic year.

Historical schemes must remain traceable.

Final results reference the grading scheme used.

---

## 15. Grading Formula

For an assessment:

```text
weightedScore =
(rawScore / maximumScore) × weightPercent
```

Final score:

```text
totalScore =
sum(all weighted assessment scores)
```

The resulting score is mapped to the appropriate grading band.

The backend is the authority for this calculation.

Use appropriate decimal precision, preferably `BigDecimal`/PostgreSQL numeric types for score calculations.

---

## 16. Result Lifecycle

Results should support a controlled lifecycle.

Conceptually:

```text
Draft
  ↓
Submitted
  ↓
Reviewed
  ↓
Approved
  ↓
Published
  ↓
Locked
```

The exact implementation may vary according to approved API/database design.

Published results must not be silently modified.

Corrections must be traceable.

---

## 17. Report Cards

Report cards are generated from approved academic data.

Flow:

```text
Assessment Scores
        ↓
Grading Engine
        ↓
Student Subject Results
        ↓
Overall Results
        ↓
Principal Review
        ↓
Approval
        ↓
PDF Generation
        ↓
Supabase Storage
        ↓
Parent Portal
```

Report cards may contain:

* school identity/logo
* academic year
* term
* student identity
* student photo
* class
* subject results
* scores
* grades
* remarks
* attendance
* comments
* conduct
* promotion status
* next class
* approval information

Approved report cards must remain historically traceable.

Corrections should create a traceable new version rather than silently replacing history.

---

## 18. Attendance

Teachers can record attendance for assigned classes.

Statuses may include:

* PRESENT
* ABSENT
* EXCUSED

Attendance is associated with the relevant:

* student
* class
* date
* teacher
* term
* academic year

Parents can view attendance for their linked wards.

Teacher assignment authorization applies.

---

## 19. Promotion

Promotion is a Principal/Admin academic decision.

General workflow:

```text
Approved Results
      ↓
Evidence
      ↓
Review
      ↓
Principal Decision
      ↓
Promotion Record
      ↓
New Enrollment/Class
```

The system can calculate supporting evidence.

The Principal/Admin makes the academic decision.

Promotion must record:

* student
* academic year
* from class
* to class
* decision
* approver
* approval timestamp

Promotion decisions must be auditable.

---

## 20. Admissions

Public admissions flow:

```text
Public Website
      ↓
Admission Application
      ↓
Review
      ↓
Approved / Rejected
      ↓
Enrollment
      ↓
Student
```

Submitting an admission application does not automatically create a Student.

Admission statuses:

* PENDING
* UNDER_REVIEW
* APPROVED
* REJECTED

Public admission endpoints require:

* validation
* rate limiting/abuse protection
* request-size limits
* safe errors
* controlled file uploads where applicable

---

## 21. Fees and Payments

Parents can view:

* fee assignments
* balances
* payment history
* payment status
* receipts

Paystack handles payment processing.

Flow:

```text
Parent
  ↓
Fee Balance
  ↓
Initialize Payment
  ↓
Paystack
  ↓
Webhook / Server Verification
  ↓
Backend Validation
  ↓
Idempotency Check
  ↓
Database Transaction
  ↓
Successful Payment
  ↓
Receipt
  ↓
Notification
```

The frontend callback is not payment authority.

---

## 22. Incidents

Incidents may include:

* fighting
* accident
* bullying
* misconduct
* other configured categories

General flow:

```text
Teacher/Staff Reports
        ↓
Relevant Authority Notification
        ↓
Principal Review
        ↓
Action
        ↓
Close
```

Incident records require restricted authorization.

Parents should only see relevant information concerning their linked child and only where permitted by the system's privacy rules.

---

## 23. Notifications

Notification channels include:

* in-app notifications
* email via SMTP
* push notifications via Firebase FCM

Examples:

* result published
* report card available
* payment received
* admission status changed
* attendance notification
* announcements

Long-running tasks should use background processing where appropriate.

Examples:

* PDF generation
* email delivery
* push notifications
* reminders

Redis should only be introduced where it provides a concrete requirement.

---

## 24. Storage

### Cloudinary

Primarily:

* profile photos
* school logo
* gallery
* public media
* appropriate image uploads

### Supabase Storage

Primarily:

* generated report-card PDFs
* generated documents

PostgreSQL stores metadata and storage references.

---

## 25. Monitoring

The system should support:

* Sentry
* structured application logs
* health endpoints
* readiness checks

Sensitive information must not appear in logs.

---

## 26. Security-Sensitive Audit Events

Audit logging should cover important mutations including:

* student record changes
* role changes
* grade changes
* result publication
* promotion approval
* payment state changes
* incident updates
* admission decisions
* administrative actions

---

## 27. MVP Scope

### Core MVP

* authentication
* RBAC
* resource authorization
* users
* students
* parents
* teachers
* classes
* subjects
* teacher assignments
* attendance
* assessments
* gradebook
* grading
* results
* report cards
* parent portal
* admissions
* fees
* Paystack payments
* incidents
* promotions
* notifications
* reports
* public website
* audit logging

### Supporting

* email
* push notifications
* OpenAPI
* automated tests
* Docker
* CI/CD
* security hardening
* monitoring

---

## 28. Post-MVP

Do not implement these unless explicitly requested:

* student login/dashboard
* payroll
* accounting system
* library management
* transport management
* hostel management
* timetable automation
* advanced analytics
* AI features
* SMS integration
* biometric attendance
* mobile application
* complex CMS
* advanced messaging

---

## 29. Golden Path

The primary end-to-end workflow is:

```text
Public Website
      ↓
Parent Login
      ↓
Parent Sees Ward
```

Teacher workflow:

```text
Teacher Login
      ↓
Class
      ↓
Subject
      ↓
Assessment
      ↓
Gradebook
      ↓
Submit Scores
      ↓
Grading Engine
      ↓
Final Results
      ↓
Principal Review
      ↓
Approve / Publish
      ↓
Generate Report Card
      ↓
PDF
      ↓
Parent Portal
      ↓
View / Download
```

Other critical workflows:

```text
Teacher Attendance
      ↓
Parent Views Attendance
```

```text
Parent
  ↓
Fees
  ↓
Paystack
  ↓
Webhook / Verification
  ↓
Receipt
```

```text
Teacher
  ↓
Incident
  ↓
Principal
  ↓
Review / Action
```

```text
Approved Results
  ↓
Promotion Review
  ↓
Principal Decision
```

---

## 30. Current Development Philosophy

The project should prioritize:

1. Correctness
2. Security
3. Data integrity
4. Clear architecture
5. Maintainability
6. Usable UI
7. Appropriate testing
8. Delivery within MVP scope

Do not sacrifice security or data integrity merely to increase feature count.

Do not over engineer the MVP.
