# Portal Functional Mode Migration Report

## Implemented

The four previously empty adapters now route domain operations through the
Functional Mode boundary. Mock mode uses services, repositories, and the
persisted `MockDatabase` store. API mode uses the existing API modules and
central API client.

* Academic setup: years, terms, classes, subjects, teacher assignments, and
  enrollments.
* Admissions: public submission, admin listing/detail, and status updates.
* Users: list, detail, and create in mock mode; API mode continues to call the
  existing `/users` API module.
* Attendance: term history through the adapter in mock mode and through the
  existing `/attendance` API call in API mode.

No accepted admission creates student, parent, or enrollment records.
Admission status transitions in mock mode follow the backend's existing
`PENDING` → `UNDER_REVIEW` → `APPROVED` / `REJECTED` rules.

## Known Backend Dependencies

* User management endpoints are not implemented by the backend. API mode
  retains the existing `/users` requests, which remain backend-dependent.
* The backend attendance list requires a term plus a class and subject, or a
  student. The current history screen only supplies a term, so its existing
  API-mode request does not satisfy the backend filter contract. Mock mode
  supports term-wide history; the UI/API contract needs a separately scoped
  follow-up before term-wide history can work against the backend.
* Dashboard metrics and recent incidents remain backend-dependent.
* Super Admin `/system/metrics` and `/audit/recent` remain intentionally
  backend-only. `/actuator/health` remains a direct backend health check.

## Persistence

`MockDatabase.getStore()` initializes seed data only when there is no valid
stored value. Repository mutations read the current store and persist the
updated value with `MockDatabase.saveStore()`. Authentication logout does not
clear the store, which remains in browser local storage across reloads and
browser restarts.

## Validation

* `pnpm --filter web lint`: passed with existing warnings; no lint errors.
* `pnpm --filter web build`: passed.
* Unsafe TypeScript pattern scan in `apps/web/lib/functional` and
  `apps/web/hooks`: no matches.
* No zero-byte functional adapters remain.
* Mock storage smoke check passed for initial seed creation, preserved legacy
  store data, mutation persistence, logout/login, and module reload using the
  same local-storage backing value. Browser restart itself was not exercised;
  persistence across it relies on the browser's localStorage implementation.
* Backend working tree diff: none.

No commit was created.
