# Task 013: Assessments & Grading Implementation Reconciliation

## Objective

Establish the current, evidence-based implementation status of Karatu's Assessments & Grading domain by reconciling the existing audit, API contract, research report, authoritative requirements, and actual source code.

## 1. Document Discrepancies and Codebase Status

A direct review of the actual codebase compared to the existing documentation reveals significant mismatches. Specifically, the prior audit (`task_011_assessments_grading_audit.md`) inaccurately concluded that REST controllers for assessments were absent. They exist but are misaligned with the intended API contracts.

### Traceability Matrix

| Requirement / Component | Existing Documentation (Audit/Contracts) | Actual Codebase Implementation | Status | Resolution / Action Required |
| --- | --- | --- | --- | --- |
| **REST Controllers** | Audit claimed no REST controllers exist for assessments. | `AssessmentController`, `AssessmentLifecycleController`, `AssessmentResultController` are present. | **DOCUMENTATION CONFLICT** | Update understanding: Controllers exist but require heavy refactoring to meet the new API contract. |
| **Assessment Data Model** | API Contract explicitly requires `teacherAssignmentId`. | `AssessmentCreateRequest` and `AssessmentService` still rely on `termId`, `classId`, and `subjectId`. | **IMPLEMENTED INCORRECTLY** | Refactor `AssessmentCreateRequest` and backend service to strictly accept and use `teacherAssignmentId`. |
| **Student Roster API** | API Contract requires `GET /api/v1/teacher-assignments/{id}/students`. | Endpoint does not exist in `TeacherAssignmentController` or related controllers. | **NOT IMPLEMENTED** | Implement the roster endpoint bounded by the teacher assignment to support the frontend. |
| **Assessment Lifecycle** | API Contract defines paths: `/submit`, `/approve`, `/reject`, `/publish`. | Code uses: `/lifecycle/submit`, `/lifecycle/review`, `/lifecycle/reject`, `/lifecycle/publish`, `/lifecycle/revert-to-draft`. | **API CONTRACT CONFLICT** | Refactor codebase to align with the new `/api/v1/assessments/{id}/[action]` API contract paths. |
| **Bulk Assessment Results** | API Contract defines `PUT /api/v1/assessments/{id}/results` using `AssessmentResultBulkUpdateRequest`. | Code uses `POST /api/v1/assessments/{id}/results/batch` accepting a list of creates. | **API CONTRACT CONFLICT** | Refactor endpoint to use standard HTTP methods (`PUT`) and structured DTOs per the contract. |
| **Frontend Adapter** | Frontend should consume new API contract. | `assessment-adapter.ts` uses the outdated paths (`/lifecycle/*`, `/batch`) and raw ID payloads (`termId`, `classId`, `subjectId`). | **IMPLEMENTED INCORRECTLY** | Refactor the frontend `assessment-adapter.ts` once the backend is aligned with the API contract. |
| **Backend Test Coverage** | Audit reported 129 passing tests overall. | No integration or unit tests exist for `com.karatu.sis.assessments.*` controllers or services. | **NOT IMPLEMENTED** | Create a robust test suite for Assessment CRUD, Lifecycle, and Results matching the new specs. |

## 2. Core Findings

1. **Domain Mismatch Exists in Code, not just Frontend:** The `teacherAssignmentId` nexus established in the API Contract and Domain Source of Truth is entirely missing from the current backend implementation. The backend still resolves teacher assignments dynamically based on individual `termId`, `classId`, and `subjectId` passed in the `AssessmentCreateRequest`.
2. **False Assumptions from Prior Audits:** The previous audit failed to identify the existing controllers for the assessment domain, leading to the assumption that they needed to be built from scratch.
3. **No Testing for Assessments:** The 129 passing tests do not include any tests covering the `assessments` module, leaving the existing implementation completely unverified.

## 3. Recommended Implementation Sequence

To safely bring Karatu SIS to production readiness for Assessments & Grading without breaking the test baseline, the following steps must be taken sequentially:

### Phase 1: API Contract Alignment & Backend Refactoring
1. **Refactor Assessment Data Model:** Update `AssessmentCreateRequest` and `AssessmentService` to use `teacherAssignmentId` strictly. Remove `termId`, `classId`, and `subjectId` from the payload.
2. **Refactor Assessment Controllers:** Align endpoint paths in `AssessmentLifecycleController` and `AssessmentResultController` with the `ASSESSMENT_API_CONTRACT.md`.
3. **Implement Roster API:** Build `GET /api/v1/teacher-assignments/{id}/students` to provide authorized access to enrolled students for grading.
4. **Implement Backend Tests:** Write comprehensive unit and integration tests for the refactored assessment controllers to establish a reliable baseline.

### Phase 2: Frontend Integration
1. **Update Frontend Types:** Align Next.js `AssessmentCreateRequest` and related types to match the backend updates.
2. **Refactor Assessment Adapter:** Modify `apps/web/lib/functional/adapters/assessment-adapter.ts` to call the newly aligned backend endpoints.
3. **Remove Raw ID Dependencies:** Remove logic in the frontend that passes `termId`, `classId`, and `subjectId` to assessment operations, replacing it with `teacherAssignmentId`.

### Phase 3: Advanced Domain Features (As per Source of Truth)
1. Implement and test grading schemes and assessment weights.
2. Implement exact calculation algorithms (Round Half Up, missing vs. zero).
3. Connect final results to the Report Snapshot domain.
