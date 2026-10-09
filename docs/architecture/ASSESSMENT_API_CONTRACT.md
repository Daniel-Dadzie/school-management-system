# Assessment & Grading API Contract

## 1. Domain Model Discrepancy & Resolution

During the initial implementation audit, a significant discrepancy was identified between the frontend mock interfaces and the authoritative backend domain model:

- **Frontend (Mock)**: The UI created assessments by directly passing `termId`, `classId`, and `subjectId`.
- **Backend (Authoritative)**: The backend domain relies on `TeacherAssignment`, which safely encapsulates the relationship between a teacher, subject, class, academic year, and term.
- **Security Issue**: Permitting the frontend to arbitrarily submit `classId` and `subjectId` risks bypassing checks that guarantee a teacher is actually assigned to teach that specific cohort.

### Resolution
The API contract is explicitly updated to enforce `TeacherAssignment` as the nexus of academic context for assessments.
1. The frontend MUST fetch the active assignments for the authenticated teacher (`GET /api/v1/teacher-assignments/me`).
2. When creating an assessment, the frontend MUST provide the `teacherAssignmentId`.
3. The backend derives and validates the `termId`, `classId`, and `subjectId` strictly from the provided `TeacherAssignment`.

---

## 2. Core API Schemas

### AssessmentCreateRequest
Used to create a new assessment. The frontend will no longer pass raw academic context identifiers.

```json
{
  "title": "Midterm Examination",
  "teacherAssignmentId": "uuid-string",
  "categoryId": "uuid-string",
  "assessmentDate": "2026-10-15",
  "maximumScore": 100,
  "weightPercent": 30.0,
  "description": "Optional details",
  "isCurrentFinal": false
}
```

### AssessmentResponse
The response flattens the academic context for frontend UI convenience, but the source of truth remains the `TeacherAssignment`.

```json
{
  "id": "uuid-string",
  "tenantId": "uuid-string",
  "title": "Midterm Examination",
  "teacherAssignmentId": "uuid-string",
  "termId": "uuid-string",
  "classId": "uuid-string",
  "subjectId": "uuid-string",
  "categoryId": "uuid-string",
  "assessmentDate": "2026-10-15",
  "maximumScore": 100,
  "weightPercent": 30.0,
  "status": "DRAFT",
  "lifecycleStatus": "CREATED",
  "isCurrentFinal": false,
  "createdAt": "2026-10-09T10:00:00Z",
  "updatedAt": "2026-10-09T10:00:00Z"
}
```

### AssessmentResultBulkUpdateRequest
Used by teachers to input scores for their roster.

```json
{
  "results": [
    {
      "studentId": "uuid-string",
      "score": 85.5,
      "isAbsent": false,
      "isExcused": false,
      "remarks": "Excellent work"
    },
    {
      "studentId": "uuid-string",
      "score": null,
      "isAbsent": true,
      "isExcused": false,
      "remarks": null
    }
  ]
}
```

---

## 3. Endpoints

### 3.1 Assessments (CRUD)
- **`GET /api/v1/assessments`**
  - **Query Params**: `teacherAssignmentId` (optional), `termId` (optional)
  - **Role**: `TEACHER` (sees own), `ADMIN` (sees all).
- **`GET /api/v1/assessments/{id}`**
  - **Role**: `TEACHER` (if owner), `ADMIN`.
- **`POST /api/v1/assessments`**
  - **Body**: `AssessmentCreateRequest`
  - **Role**: `TEACHER` (must own the `teacherAssignmentId`).
- **`PUT /api/v1/assessments/{id}`**
  - **Role**: `TEACHER` (must own and status must be `DRAFT` or `RETURNED`).
- **`DELETE /api/v1/assessments/{id}`**
  - **Role**: `TEACHER` (must own and status must be `DRAFT`).

### 3.2 Assessment Lifecycle
Transitions follow the Assessment Source of Truth document.
- **`POST /api/v1/assessments/{id}/submit`**
  - **Role**: `TEACHER`
  - **Effect**: Moves status to `SUBMITTED`. Locks editing.
- **`POST /api/v1/assessments/{id}/approve`**
  - **Role**: `ADMIN` (or explicit reviewer capability).
  - **Effect**: Moves status to `REVIEWED`.
- **`POST /api/v1/assessments/{id}/reject`**
  - **Body**: `{ "reason": "Missing scores for 5 students" }`
  - **Role**: `ADMIN`
  - **Effect**: Moves status to `RETURNED`. Unlocks editing.
- **`POST /api/v1/assessments/{id}/publish`**
  - **Role**: `ADMIN`
  - **Effect**: Moves status to `PUBLISHED`. Visible in parent portals/report cards.

### 3.3 Assessment Results
- **`GET /api/v1/assessments/{id}/results`**
  - **Role**: `TEACHER`, `ADMIN`.
  - **Returns**: Array of `AssessmentResultResponse`.
- **`PUT /api/v1/assessments/{id}/results`**
  - **Role**: `TEACHER`
  - **Body**: `AssessmentResultBulkUpdateRequest`
  - **Validation**: Fails if assessment is not in a modifiable state (`DRAFT` or `RETURNED`). Ensure score <= `maximumScore`.

### 3.4 Auxiliary (Roster/Students)
A new endpoint is required to fetch the eligible students for grading, based on the teacher assignment context.
- **`GET /api/v1/teacher-assignments/{id}/students`**
  - **Role**: `TEACHER` (if owner), `ADMIN`.
  - **Returns**: Array of student profiles currently enrolled in the class/academic year tied to the assignment.
  - **Usage**: Used by the frontend to build the grading sheet roster.

---

## 4. Authorization & Tenant Isolation Rules

1. **Tenant Isolation**: EVERY endpoint must validate that the requested resources (`Assessment`, `TeacherAssignment`, `Student`) belong to the currently authenticated user's `TenantContext.getSchoolId()`.
2. **Teacher Ownership**: `TEACHER` role does NOT imply global access. When an endpoint is accessed by a `TEACHER`, the backend must explicitly verify that the user's `userId` matches the `teacher_id` on the resolved `TeacherAssignment`.
3. **Immutability of Published Data**: Results linked to a `PUBLISHED` assessment cannot be altered via standard PUT endpoints. Corrections must follow the official correction workflow (to be implemented via separate correction endpoints) to preserve audit trails.
