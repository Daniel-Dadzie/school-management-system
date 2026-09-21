# TASK 008.1 â€” Admissions Workflow Proposal

## 1. Current Implementation
The repository currently implements the initial phase of admissions using an `AdmissionApplication` entity.
- Tracks applicant details and parent contact info.
- Uses an `AdmissionStatus` enum (`PENDING`, `UNDER_REVIEW`, `APPROVED`, `REJECTED`).
- Existing endpoints handle submission (`POST`) and administrative review (`GET`, `PATCH`).
- Application state transitions are currently unconstrained in code.

## 2. Confirmed Business Requirements
The verified CarePoint admissions flow is:
```text
APPLICATION
    â†“
PENDING
    â†“
UNDER_REVIEW
    â”œâ”€â”€ REJECTED
    â”‚      â†“
    â”‚   Rejection notification
    â”‚
    â””â”€â”€ APPROVED
           â†“
      Acceptance notification
           â†“
      Manual follow-up
           â†“
      Assessment scheduled
           â†“
      Assessment completed
          â”œâ”€â”€ FAILED
          â””â”€â”€ PASSED
                 â†“
          Admission confirmed
                 â†“
          Eligible for enrollment
                 â†“
          Authorized enrollment action
```
**CRITICAL RULE:** `APPROVED` does not mean `ENROLLED`. Application approval simply opens the assessment phase.

## 3. Application State Machine
Application review transitions must be strictly enforced.
**Valid Baseline Transitions:**
* `PENDING` â†’ `UNDER_REVIEW`
* `UNDER_REVIEW` â†’ `APPROVED`
* `UNDER_REVIEW` â†’ `REJECTED`

**Blocked Invalid Transitions:**
* `PENDING` â†’ `APPROVED` (Must be reviewed first)
* `PENDING` â†’ `REJECTED`
* `REJECTED` â†’ `APPROVED` / `PENDING`
* `APPROVED` â†’ `REJECTED` / `PENDING`

*Open Business Decision:* Should administrators be allowed to reopen a `REJECTED` application back to `UNDER_REVIEW`? Until defined, this transition will remain blocked.

## 4. Assessment Model
A separate `AdmissionAssessment` entity is proposed with a Many-to-One relationship to `AdmissionApplication`.
```text
AdmissionApplication 1 â”€â”€â”€â”€ N AdmissionAssessment
```
**Why Multiple Assessments (1:N)?**
Multiple records preserve history for cancelled assessments, rescheduling requests, or formal reassessments.

**Assessment Lifecycle and Result Separated:**
*   **Lifecycle:** `SCHEDULED`, `COMPLETED`, `CANCELLED` (Physical logistics).
*   **Result:** `PENDING`, `PASSED`, `FAILED` (Academic evaluation).

**Valid Lifecycle Transitions:**
*   `SCHEDULED` â†’ `COMPLETED`
*   `SCHEDULED` â†’ `CANCELLED`

**Valid Result Transitions:**
*   `PENDING` â†’ `PASSED`
*   `PENDING` â†’ `FAILED`

*Business Rule:* A result (`PASSED`/`FAILED`) may only be recorded when the lifecycle status is `COMPLETED`.
*Open Business Decision:* Which assessment determines admission eligibility? (e.g. the most recent `COMPLETED` assessment, or any `PASSED` assessment). Does the school allow reassessment if the first assessment fails?

## 5. Contact-History Model
Instead of storing a single status on the application, we propose a lightweight `AdmissionContact` (or `AdmissionFollowUp`) entity in a Many-to-One relationship:
```text
AdmissionApplication 1 â”€â”€â”€â”€ N AdmissionContact
```
**Contact Record Fields:**
*   `applicationId`
*   `contactDate`
*   `contactedBy` (Admin/User ID)
*   `outcome` (Enum: `NOT_CONTACTED`, `CONTACTED`, `NO_ANSWER`, `CONFIRMED_ASSESSMENT`, `REQUESTED_RESCHEDULE`)
*   `notes`
*   `createdAt`

**Why 1:N for Contacts?**
It preserves a minimal contact history (e.g. "Called Monday: No Answer", "Called Tuesday: Confirmed"). This prevents losing history when multiple attempts are required, without building a heavy CRM subsystem.

## 6. Notification Model
To prevent silently losing notifications when an email delivery fails after a database commit, we propose a lightweight durable outbox/notification model rather than a simple `@Async` fire-and-forget.

**Entity:** `AdmissionNotification`
*   `notificationEvent` (e.g., `APPLICATION_APPROVED`, `APPLICATION_REJECTED`)
*   `recipientEmail`
*   `deliveryStatus` (Enum: `PENDING`, `SENT`, `FAILED`)
*   `attemptError` (Text for failure reasons)
*   `createdAt`, `sentAt`

**Workflow:**
1. Transaction commits application status change AND inserts a `PENDING` notification record.
2. An asynchronous worker/job picks up `PENDING` notifications and attempts delivery via SMTP.
3. On success, status becomes `SENT`. On failure, status becomes `FAILED` with error details recorded.
*This separates the application decision from notification delivery. An email delivery failure will NOT silently revert the application decision.*

## 7. Admission Confirmation Model
Distinguish between distinct phases:
`Application Approved` â‰  `Assessment Passed` â‰  `Admission Confirmed` â‰  `Enrollment`

We propose evaluating **Option B (Explicit business action/state)** for Admission Confirmation.
*Why Option B?* A derived state (Option A: automatically eligible when an assessment passes) removes administrative control. The school likely needs a human checkpoint to review the assessment results, verify class capacity, and formally confirm the admission offer before the applicant is eligible for enrollment.

## 8. Enrollment Handoff Dependencies
The final step is transitioning an eligible admission into a full `Enrollment`.
Before designing the final enrollment command, the following domain dependencies must be resolved:
*   **DEPENDENCY:** How does the system handle duplicate applicant/person detection?
*   **DEPENDENCY:** How are parent `User` credentials (passwords, welcome emails) generated and safely distributed?
*   **DEPENDENCY:** How is a unique `admissionNumber` generated for the `Student`?
*   **DEPENDENCY:** How are `AcademicYear` and `SchoolClass` capacity constraints enforced?
*   **DEPENDENCY:** What is the exact transaction boundary to ensure idempotency when creating User, Parent, Student, and Enrollment?

## 9. API Proposal
**Existing Endpoints (To remain / be hardened):**
*   `POST   /api/v1/admissions`
*   `GET    /api/v1/admissions`
*   `GET    /api/v1/admissions/{id}`
*   `PATCH  /api/v1/admissions/{id}/status` (Hardened to enforce state machine)

**Proposed Endpoints:**
*   `POST   /api/v1/admissions/{id}/contacts` â€” Record a follow-up contact
*   `GET    /api/v1/admissions/{id}/contacts` â€” View contact history
*   `POST   /api/v1/admissions/{id}/assessments` â€” Schedule a new assessment
*   `GET    /api/v1/admissions/{id}/assessments` â€” List assessments for application
*   `PATCH  /api/v1/assessments/{id}/lifecycle` â€” Update to COMPLETED/CANCELLED
*   `PATCH  /api/v1/assessments/{id}/result` â€” Record PASSED/FAILED
*   `POST   /api/v1/admissions/{id}/confirm` â€” Formally confirm admission (Option B)

## 10. Authorization Matrix
| Action | SUPER_ADMIN | ADMIN | TEACHER | PARENT |
| :--- | :---: | :---: | :---: | :---: |
| Submit application | â€” | â€” | â€” | Public applicant |
| View applications | âœ“ | âœ“ | â€” | â€” |
| Review application | âœ“ | âœ“ | â€” | â€” |
| Update application decision | âœ“ | âœ“ | â€” | â€” |
| Record contact | âœ“ | âœ“ | â€” | â€” |
| Schedule assessment | âœ“ | âœ“ | Define* | â€” |
| Complete assessment | âœ“ | âœ“ | Define* | â€” |
| Record assessment result | âœ“ | âœ“ | Define* | â€” |
| Confirm admission | âœ“ | âœ“ | â€” | â€” |
| Enroll student | âœ“ | âœ“ | â€” | â€” |

*\*Open Business Decision: Must define whether TEACHER roles are authorized to schedule, complete, or score assessments.*

## 11. Frontend Impact
Admissions Dashboard requirements:
*   **Application List:** Filter by status and assessment results.
*   **Detail View:** Hardened status transitions (disable invalid options).
*   **Contact History Panel:** View past contacts and log new ones.
*   **Assessment Panel:** Display the 1:N assessment history. Allow scheduling new assessments, updating lifecycle, and recording results.
*   **Confirmation & Enrollment:** UI actions reflecting the sequential eligibility requirements, blocked until domain dependencies are met.

## 12. Database Proposal
Proposed schema additions (no migrations to be created yet):
*   `admission_contacts` table (FK to `admission_applications`)
*   `admission_assessments` table (FK to `admission_applications`)
*   `admission_notifications` table (durable outbox)
*   *Required:* Indexes on FKs, constraint checks for valid enums.

## 13. Testing Strategy
*   **State Transitions:** Verify invalid state changes (e.g. `PENDING` -> `APPROVED`) are rejected.
*   **Contact History:** Verify multiple contacts can be appended and retrieved.
*   **Assessments:** Verify `PASSED` can only be set when lifecycle is `COMPLETED`.
*   **Notifications:** Verify outbox records are created transactionally with status changes.
*   **Authorization:** Verify `TEACHER` and `PARENT` receive `403 Forbidden` for unauthorized actions.

## 14. Documentation Changes
*   `docs/DEVELOPMENT_STATUS.md`:
    *   Separate the "Administrative application review" (Completed) from the "Full admissions pipeline" (Not yet complete: assessment, contact history, notification delivery, admission confirmation, enrollment handoff).
    *   Update stale test counts: replace `37/37` with `44/44` (only when independently verified without OOM errors).
*   `docs/api/admissions-api-contract.md`: Update to reflect the hardened state machine and proposed endpoints when implemented.

## 15. Implementation Sequence
1. Freeze application state machine
2. Freeze assessment/contact/notification domain model
3. Resolve Student/Parent/Enrollment handoff requirements
4. Review and approve schema design
5. Implement Flyway migration
6. Implement contact history
7. Implement assessment domain
8. Implement notification delivery
9. Implement admission eligibility/confirmation
10. Implement enrollment handoff
11. Extend API
12. Extend Admissions Dashboard
13. Integration/regression tests
14. Documentation reconciliation

## 16. Open Business Decisions
*   Can administrators reopen a `REJECTED` application?
*   Which assessment determines admission eligibility (e.g. most recent)? Is reassessment allowed?
*   Can a `TEACHER` manage assessments?
*   How are parent `User` credentials generated upon enrollment?
*   How is the student `admissionNumber` generated?

## 17. Explicit Non-Goals
*   Do NOT automatically enroll students on application approval.
*   Do NOT invent Student/Parent fields or automated credential logic without explicit domain design.
*   Do NOT introduce a heavy messaging platform (Kafka/RabbitMQ); use simple durable tables.
*   Do NOT introduce a full CRM.
