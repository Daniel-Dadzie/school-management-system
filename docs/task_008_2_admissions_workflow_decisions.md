# TASK 008.2 — ADMISSIONS WORKFLOW DECISIONS

## 1. Purpose
The purpose of this document is to finalize the business and technical decisions required before implementing the CarePoint Admissions Workflow. It resolves previously unresolved questions from the Task 008.1 proposal based on concrete repository evidence, creating a firm contract for the upcoming implementation phase.

## 2. Repository Evidence Reviewed
* **People/Auth Domain:** Inspected `User`, `Student`, and `Parent` entities, and the `AuthService`. `Student` requires a mandatory `admissionNumber`. `Parent` requires a 1:1 `User` mapping.
* **Credentials:** No existing mechanism for generating temporary passwords, sending welcome emails, or activating accounts was `NOT FOUND IN REPOSITORY`.
* **Admission Number:** The `admissionNumber` field exists on `Student` with a database uniqueness constraint, but no auto-generation sequence or logic was `NOT FOUND IN REPOSITORY`.
* **Enrollment Domain:** Inspected `Enrollment` and `EnrollmentService`. Enrollment is separate from `Student` creation. It successfully enforces non-duplicate active enrollments for a given academic year. It requires existing `Student`, `AcademicYear`, and `SchoolClass` IDs.

## 3. Final Application State Machine
**DECIDED:** The following state machine will be strictly enforced for the `AdmissionApplication` entity.
```text
PENDING
   |
   v
UNDER_REVIEW
   |
   +-----------> REJECTED
   |
   v
APPROVED
```
**Rules:**
*   `PENDING -> UNDER_REVIEW` (VALID)
*   `UNDER_REVIEW -> APPROVED` (VALID)
*   `UNDER_REVIEW -> REJECTED` (VALID)
*   `REJECTED -> UNDER_REVIEW` (INVALID) — REJECTED is terminal for MVP.
*   `APPROVED -> REJECTED` (INVALID)
*   `APPROVED -> PENDING` (INVALID)

## 4. Assessment Decisions
**DECIDED:**
*   **Assessment Cardinality:** 1:N (`AdmissionApplication` 1 ──── N `AdmissionAssessment`).
*   **MVP Reassessment Policy:** Not enabled. `FAILED` does not automatically permit reassessment in the MVP workflow.
*   **Assessment Eligibility:** Eligibility must be determined from the assessment explicitly designated as the applicant's final/current admission assessment. "Any passed assessment" is not a sufficient rule.
*   **Lifecycle vs Result:** `Lifecycle` (`SCHEDULED`, `COMPLETED`, `CANCELLED`) and `Result` (`PENDING`, `PASSED`, `FAILED`) remain strictly separate.

## 5. Contact-History Decision
**DECIDED:**
*   Implement a lightweight `AdmissionContact` entity in a 1:N relationship with `AdmissionApplication`.
*   This prevents creating a heavy CRM subsystem while preserving minimal necessary contact history (e.g., date, outcome, notes, author).

## 6. Notification/Outbox Decision
**Durable Notification Outbox**

**Decision:**
A durable notification outbox is the approved implementation pattern for admission notifications.

**Status:**
Architecture finalized; implementation deferred to the Task 008 implementation phase.

The decision does not mean that the outbox has already been implemented in source code.

## 7. Teacher Authorization Decision
**DECIDED:**
*   **Authorization:** `ADMIN` and `SUPER_ADMIN` only.
*   `TEACHER` roles are NOT granted permission to schedule, complete, or score admission assessments in the MVP.
*   This keeps the workflow strictly administrative until the school explicitly establishes teachers as entrance-assessment assessors.

## 8. Parent Credential Decision
**DEFERRED:**
*   Since automated password generation, welcome emails, and account activation workflows were `NOT FOUND IN REPOSITORY`, the process of initializing a `Parent` User's credentials during enrollment handoff is `DEFERRED`.
*   This must be designed and explicitly approved in a subsequent domain decision before the enrollment handoff can be fully built.

## 9. Admission-Number Decision
**DEFERRED:**
*   `Student.admissionNumber` format is `DEFERRED` because no explicit format (e.g., CP-2026-0001) exists in the repository requirements.
*   **Generation Strategy:** Must be server-side.
*   **Uniqueness:** Database-enforced (already present).

## 10. Admission-Confirmation Decision
**DECIDED:**
*   Admission Confirmation will be an explicit business action/state (Option B), rather than silently derived from a passed assessment.
*   An authorized administrator must explicitly confirm the admission offer.

## 11. Enrollment Handoff Decision
**Enrollment Handoff**

**Decision:**
The approved design separates responsibilities across the Admission, People, and Enrollment domains.
The boundary is explicitly separated: `Admission Confirmation -> Enrollment Service`.

**Status:**
Domain boundary finalized; implementation deferred to the Task 008 implementation phase.

The enrollment handoff has NOT yet been implemented.

## 12. End-to-End Workflow
**DECIDED:**
```text
Applicant submits application
        |
        v
PENDING
        |
        v
ADMIN reviews
        |
        v
UNDER_REVIEW
        |
        +--------------------------+
        |                          |
        v                          v
    REJECTED                    APPROVED
        |                          |
        v                          v
Rejection notification      Acceptance notification
                                   |
                                   v
                           Administrative follow-up
                                   |
                                   v
                         Assessment scheduled
                                   |
                                   v
                         Assessment completed
                                   |
                              +----+----+
                              |         |
                              v         v
                           FAILED    PASSED
                              |         |
                              |         v
                              |    Admission confirmed
                              |         |
                              |         v
                              |      Enrollment
                              |         |
                              |         v
                              |   Student/Parent/
                              |   Enrollment setup
                              |
                              v
                         Not eligible
```

## 13. Explicit Implementation Boundaries
This proposal enforces the following strict boundaries:
*   Approval does NOT automatically create a Student, Parent, or Enrollment.
*   Assessment tracking is isolated from the `AdmissionApplication` state machine.
*   No `PRINCIPAL` role will be created.

## 14. Decision Summary

### FINALIZED DECISIONS
- Rejected applications are terminal for MVP.
- Assessment eligibility uses the designated final/current assessment.
- Automatic reassessment is not enabled.
- TEACHER is not authorized for admission assessment workflows.
- Admission confirmation is an explicit human action.

### DEFERRED DESIGN DECISIONS
- Parent User credential generation/activation.
- Student admissionNumber generation format/strategy.

## 15. Task 008 Implementation Prerequisites
Before the final enrollment API endpoint can be built, the following dependencies must be resolved:
1.  **Identity Resolution:** Design rules for preventing duplicate parent/student creation if they already exist in the database.
2.  **Credential Distribution:** Implement secure account-activation or password-distribution infrastructure.
3.  **Identity Generation:** Implement server-side `admissionNumber` generation.

