# Assessment & Grading Domain — Implementation Readiness Audit

**Date:** 2026-10-09
**Status:** Audit Completed
**Domain:** Assessments & Grading

## 1. Executive Summary

This audit evaluates the current implementation state of the Assessments & Grading domain in the Karatu SIS repository to determine readiness for full backend implementation and integration. 

**Key Findings:**
1. **Frontend Functional Mock Mode Exists:** The frontend contains a complete mock implementation of the Assessment workflow (list, create, detail, enter results, student report cards). However, it relies heavily on local browser storage (`assessment-adapter.ts`).
2. **Backend Domain Disconnect:** The backend contains Assessment entities, repositories, and DTOs (under `com.karatu.sis.assessments` and `com.karatu.sis.grading`), but lacks REST controllers and end-to-end service integration to connect to the frontend.
3. **Data Model Mismatch:** 
   * **Frontend Expectation:** The frontend mock relies on a simplified `term`, `class`, and `subject` relationship for creating and fetching assessments.
   * **Backend Expectation:** The backend domain models strictly bind assessments to `teacher_assignment_id`. 
4. **Build State:** The backend build and test baseline was initially broken due to a missing repository method (`findByStudentIdAndAcademicYearIdAndTermIdAndSchoolId`) in `ReportSnapshotRepository.java`. **This has been fixed, and all 129 backend integration tests now pass successfully.**

## 2. Detailed Findings

### 2.1 Backend Implementation State
* **Entities & Repositories:** Entities such as `Assessment`, `AssessmentResult`, `GradingScheme`, and their associated repositories exist.
* **Services:** `AssessmentLifecycleService` and `AssessmentCalculationService` exist and define the state machine (`DRAFT` -> `SUBMITTED` -> `REVIEWED` -> `PUBLISHED`) and score calculation logic.
* **Missing Components:** There are no REST controllers exposing these services to the frontend. The `AssessmentService` itself appears disconnected from end-to-end API workflows.
* **Test Coverage:** Existing tests in the backend currently cover core people, academic operations, tenant isolation, and admissions. Assessment integration tests are missing or incomplete.

### 2.2 Frontend Implementation State
* **Mock Mode:** A robust `Functional Mock Mode` is active for assessments. It allows UI manipulation but does not interact with the Spring Boot backend.
* **Mismatched Payloads:** The mock data structure and the API data structure (DTOs) are not aligned. Replacing the mock adapter with real API calls will require significant mapping or backend refactoring to align with the `teacher_assignment_id` requirement.

## 3. Recommended Implementation Sequence

To safely implement and integrate the Assessments & Grading domain, follow this sequence:

### Phase 1: Reconcile the Domain Contract
1. **Align Data Models:** Reconcile the mismatch between the frontend's `term/class/subject` model and the backend's `teacher_assignment_id` model. The backend's architectural requirement of `teacher_assignment` is authoritative and should be enforced on the frontend.
2. **Define API Contracts:** Document the final REST API contracts (`GET /api/v1/assessments`, `POST /api/v1/assessments`, etc.) before writing implementation code.

### Phase 2: Backend Implementation
1. **Develop REST Controllers:** Implement controllers for `Assessment` and `AssessmentResult`.
2. **Connect Services:** Wire `AssessmentLifecycleService` and `AssessmentCalculationService` into the controllers.
3. **Integration Testing:** Write comprehensive integration tests for the new assessment endpoints, ensuring tenant isolation and role-based access control (RBAC).

### Phase 3: Frontend Integration
1. **Update API Client:** Replace the functional mock adapter (`assessment-adapter.ts`) with a real API adapter calling the Spring Boot backend.
2. **Update UI Components:** Refactor frontend components to construct valid API requests (e.g., passing `teacher_assignment_id` instead of raw term/class/subject IDs).
3. **End-to-End Verification:** Perform full workflow verification from the UI to the database.

## 4. Conclusion
The repository is now structurally sound and the test baseline is fully restored. Implementation of the Assessments & Grading domain can safely proceed by strictly adhering to the recommended sequence, prioritizing contract alignment and backend test coverage before altering the frontend mock mode.
