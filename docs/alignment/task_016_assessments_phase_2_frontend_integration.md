# Task 016: Assessments & Grading Phase 2 - Frontend Integration Plan

## 1. Executive Summary

Karatu's Assessment & Grading backend Phase 1 has been committed, successfully updating the API to enforce `teacherAssignmentId` as the source of truth for creating and managing assessments. 

The frontend working tree currently contains uncommitted refactors aligning the mock layer, shared types, and UI components (`AssessmentCreateRequest`, `AssessmentService`, `use-assessments.ts`) to rely on `teacherAssignmentId`.

This document verifies the correctness of these uncommitted changes, establishes the integration architecture that preserves mock mode, and plans the precise API mappings needed to connect the frontend to the real backend endpoints.

## 2. Verification of Existing Frontend Changes

The uncommitted frontend changes were tested using the project's build and verification tools.

- **Type Checking**: `npx tsc --noEmit` and `next build` executed successfully without errors. The Next.js build (`npm run build`) completed, confirming that the type updates to `AssessmentCreateRequest` and the related UI components correctly propagate throughout the application.
- **Mock Mode Stability**: The mock mode `AssessmentService` continues to function and return correctly structured data mapping `teacherAssignmentId` to the UI components. No regression was introduced to the presentation layer's functionality when operating in mock mode.
- **Git State**: The modifications remain isolated to the frontend types, hooks, services, adapters, and specific assessment pages, correctly leaving backend and configuration code untouched.

**Conclusion**: The existing frontend changes are structurally correct and safe to commit as a bridge commit before wiring the actual API endpoints.

## 3. API Architecture (Mock vs. Real Data)

Karatu maintains a strict separation between UI presentation and data fetching using an adapter pattern.

- **Toggle Configuration**: An environment/config toggle `isMockMode` controls which layer fulfills the request.
- **Mock Service (`AssessmentService`)**: Returns static/seeded data for local development without backend dependencies.
- **Adapter Layer (`AssessmentAdapter`)**: Exposes methods that conditionally route to either the mock service or the real backend (`apiClient`).

**Phase 2 Objective**: The `AssessmentAdapter` and `apiClient` configurations will be updated to target the backend's `/api/v1/assessments` and `/api/v1/teacher-assignments` endpoints. Mock mode will be preserved; only the `if (!isMockMode)` branches will be modified to ensure robust integration.

## 4. Assessment Operation Compatibility Matrix

To safely integrate, the frontend adapter methods must accurately map to the backend API contract (`ASSESSMENT_API_CONTRACT.md`).

| Operation | Frontend Action | Authoritative Backend Endpoint (Real API) |
| --- | --- | --- |
| **Fetch Teacher Roster** | Get assignments | `GET /api/v1/teacher-assignments/me` |
| **List Assessments** | List for teacher | `GET /api/v1/assessments?teacherAssignmentId={id}` |
| **Get Assessment** | View details | `GET /api/v1/assessments/{id}` |
| **Create Assessment** | Submit form | `POST /api/v1/assessments` (body: `AssessmentCreateRequest` with `teacherAssignmentId`) |
| **Update Assessment** | Edit form | `PUT /api/v1/assessments/{id}` |
| **Delete Assessment** | Delete action | `DELETE /api/v1/assessments/{id}` |
| **Submit Assessment** | Lifecycle action | `POST /api/v1/assessments/{id}/submit` |
| **Approve Assessment**| Lifecycle action | `POST /api/v1/assessments/{id}/approve` |
| **Reject Assessment** | Lifecycle action | `POST /api/v1/assessments/{id}/reject` (body: `{ reason }`) |
| **Publish Assessment**| Lifecycle action | `POST /api/v1/assessments/{id}/publish` |
| **Get Results** | View scores | `GET /api/v1/assessments/{id}/results` |
| **Save Results** | Save scores | `PUT /api/v1/assessments/{id}/results` (body: `AssessmentResultBulkUpdateRequest`) |
| **Get Roster Students**| Grading sheet | `GET /api/v1/teacher-assignments/{id}/students` |

## 5. Action Plan for Integration

### Step 5.1: Commit the Bridge Refactor
Commit the current uncommitted frontend refactoring (which updates types, UI, and mock services to `teacherAssignmentId`) to establish a clean, passing baseline.

### Step 5.2: Update `AssessmentAdapter`
Modify `apps/web/lib/functional/adapters/assessment-adapter.ts` to implement the real API calls defined in the compatibility matrix:
1. Update `getAssessments` to pass query parameters (e.g. `teacherAssignmentId`).
2. Add `getTeacherAssignments` pointing to `/api/v1/teacher-assignments/me`.
3. Add `getTeacherAssignmentStudents` pointing to `/api/v1/teacher-assignments/{id}/students`.
4. Update lifecycle actions (`submit`, `approve`, `reject`, `publish`) to POST to their respective endpoints rather than executing local mock logic.

### Step 5.3: Update Query Hooks
Update `apps/web/hooks/use-assessments.ts` (and any related hooks) to utilize the new adapter methods, ensuring TanStack Query keys reflect the `teacherAssignmentId` context for correct caching and invalidation.

### Step 5.4: Test Real Integration
1. Verify the frontend compiles and lints correctly (`npm run build`).
2. Temporarily set `isMockMode = false` (if a local backend is running) and verify HTTP requests are formatted correctly.
3. Validate that UI boundaries handle API responses smoothly.

By following this plan, Karatu will safely connect its fully refactored UI to the Phase 1 backend API while retaining the ability to fall back to mock services during active UI development.
