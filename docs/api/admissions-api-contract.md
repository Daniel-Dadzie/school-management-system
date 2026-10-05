# Admissions API Contract

## Overview
This document defines the API contract for the Admissions module. The system handles admissions using a standalone application model, where submitting an application does not automatically create downstream Student or Parent records until further automated processes or manual interventions are put in place.

## Submit Application

**Endpoint:** `POST /api/v1/admissions`

**Required Header:** `X-School-Slug` (the public slug of an active school)

The public frontend sends the slug in this header for both the legacy
`/admissions/apply` route (using `NEXT_PUBLIC_KARATU_DEFAULT_SCHOOL_SLUG`, defaulting
to the initial `carepoint` tenant) and the explicit `/{schoolSlug}/admissions/apply`
route. The header is public tenant selection only; it is never used to scope
authenticated requests.

**Authorization:** Public (No authentication required)

**Request Body:** `AdmissionApplicationRequest`
- `studentFirstName` (String, required)
- `studentLastName` (String, required)
- `dateOfBirth` (LocalDate, required)
- `gender` (String, required)
- `applyingForClass` (String, required)
- `parentName` (String, required)
- `parentEmail` (String, required, valid email)
- `parentPhone` (String, required)
- `relationship` (String, required)
- `additionalNotes` (String, optional)

**Response:** `201 Created` with `AdmissionApplicationResponse`

**Behavior:**
- Trims whitespace from string fields.
- Lowercases `parentEmail`.
- Status is set to `PENDING`.
- Does NOT automatically create Student, Parent, or Enrollment records.

---

## Administrative Workflow

### List Applications

**Endpoint:** `GET /api/v1/admissions`

**Authorization:** `hasRole('ADMIN')`

**Response:** `200 OK` with `List<AdmissionApplicationResponse>`

### Get Single Application

**Endpoint:** `GET /api/v1/admissions/{id}`

**Authorization:** `hasRole('ADMIN')`

**Response:**
- `200 OK` with `AdmissionApplicationResponse`
- `404 Not Found` if application does not exist

### Update Application Status

**Endpoint:** `PATCH /api/v1/admissions/{id}/status`

**Authorization:** `hasRole('ADMIN')`

**Request Body:** `AdmissionStatusUpdateRequest`
- `status` (AdmissionStatus enum: PENDING, UNDER_REVIEW, APPROVED, REJECTED, required)

**Response:**
- `200 OK` with updated `AdmissionApplicationResponse`
- `400 Bad Request` if status is invalid or missing
- `404 Not Found` if application does not exist

**Behavior:**
- Updates the status of the admission application.
- State transitions are strictly validated according to the following rules:
  - `PENDING` â†’ `UNDER_REVIEW`
  - `UNDER_REVIEW` â†’ `APPROVED`
  - `UNDER_REVIEW` â†’ `REJECTED`
- `APPROVED` and `REJECTED` are terminal states for the current MVP. No further status changes are allowed.
- Arbitrary status replacement is not supported. Same-status updates are invalid transitions and return `400 Bad Request`.
- Invalid state transitions will result in a `400 Bad Request` response.
- Side effects (such as automatic Student/Parent record creation) are currently deferred. Approval is purely a status transition.
