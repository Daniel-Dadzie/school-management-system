# Task 021: Reporting and Category Integration

## 1. Objective
Finalize the integration of the reporting engine with the frontend and remove the remaining mock dependencies for assessment categories. 

This covers:
1. Refactoring frontend reporting hooks (`usePublishReportCard` and `useGenerateReportCardPdf`) to consume the backend's reporting endpoints instead of mock APIs.
2. Creating an `AssessmentCategoryController` on the backend for dynamic category management.
3. Updating the frontend's `GradingAdapter` to consume the actual assessment category API.

## 2. Implementation Steps

### 2.1. Frontend Reporting Hooks Refactoring
The frontend integration for reports previously relied on mocks because the backend endpoints for fetching, generating PDFs, and publishing report cards for a specific student were missing or incorrectly mapped.
- **`usePublishReportCard`**: Updated to send a POST request to `/api/v1/reporting/snapshots/student/{studentId}/publish` with the academic context (`academicYearId`, `termId`), removing the hardcoded mock call.
- **`useGenerateReportCardPdf`**: Integrated with `StudentResultAdapter.generateReportCardPdf` which correctly constructs the API URL for `GET /api/v1/reporting/snapshots/student/{studentId}/pdf` when the mock mode is disabled.
- **`StudentResultAdapter.getReportCard`**: Refactored to fetch the report snapshot via the API and properly map the backend's `ReportSnapshotDto` and student data to the `StudentReportCard` format required by the UI.

### 2.2. Assessment Category Backend Implementation
The `AssessmentCategory` entity and repository already existed on the backend as part of the domain, but they were missing the service and API layers, forcing the frontend to use mocks for category management.
- **`AssessmentCategoryDto` & `AssessmentCategoryCreateRequest`**: Created to securely encapsulate the data sent to and returned by the API.
- **`AssessmentCategoryService`**: Implemented logic to fetch all active assessment categories for a tenant and to dynamically create new categories with an auto-generated or user-provided code.
- **`AssessmentCategoryController`**: Exposed `GET /api/v1/assessment-categories` and `POST /api/v1/assessment-categories`, guarded by Spring Security `@PreAuthorize` rules ensuring `TEACHER`, `ADMIN`, or `SUPER_ADMIN` access for reading, and `ADMIN` or `SUPER_ADMIN` for creation.

### 2.3. Assessment Category Frontend Integration
- **`GradingAdapter`**: Removed the `isMockMode` conditional logic in `getCategories()` and `createCategory()`. Replaced it with direct `apiClient` calls to `/assessment-categories`.

## 3. Verification & Adherence to Rules
- **Authentication & Tenant Isolation**: All new endpoints enforce tenant isolation strictly via `TenantContext.requireSchoolId()` and role-based `@PreAuthorize` assertions.
- **Authoritative Backend**: Calculations, domain state manipulation, and category generation remain strictly within the Spring Boot boundaries. The frontend continues to simply coordinate API calls without maintaining overlapping logic.
- **Existing Tests preserved**: The existing backend test suite successfully executes and validates these boundaries.

## 4. Status
The frontend reporting UI now properly synchronizes with the actual backend pipeline, avoiding simulated delays or hard-coded assumptions. Dynamic assessment categories are securely available to authorized personnel, completing the final link for customizable assessment policy configuration.
