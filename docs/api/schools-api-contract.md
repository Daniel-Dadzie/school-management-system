# Schools API Contract

## Provision a school

`POST /api/v1/platform/schools`

* Requires `SUPER_ADMIN`.
* Creates an active school and its first `IT_ADMIN` account in one transaction.
* Request includes school name, unique slug, optional profile fields, and the
  initial administrator email, username, and temporary password.
* Password is hashed by the API and is never returned.
* Returns `201 Created` with the school profile.

## Read the current school

`GET /api/v1/schools/current`

* Requires an authenticated school user (`IT_ADMIN`, `ADMIN`, `TEACHER`, or `PARENT`).
* Returns the profile for the school associated with that user.
* The client does not select a school ID.

## Update the current school profile

`PATCH /api/v1/schools/current`

* Requires the school's `IT_ADMIN` or `ADMIN` role.
* Supports partial updates to name, contact details, address, logo URL,
  timezone, and currency.
* Timezone must be a valid IANA timezone. Currency is a three-letter code.

## School user management

All user endpoints derive the school from the authenticated `IT_ADMIN` token;
clients cannot submit a `schoolId`.

* `GET /api/v1/schools/current/users` lists users in the current school.
* `GET /api/v1/schools/current/users/{userId}` reads one user in the current
  school. A user from another school returns `404 Not Found`.
* `POST /api/v1/schools/current/users` creates an enabled user with a required
  password of at least 12 characters. Only `ADMIN`, `TEACHER`, and `PARENT`
  roles may be assigned; `IT_ADMIN` and platform `SUPER_ADMIN` cannot be
  assigned through this endpoint.
* `PATCH /api/v1/schools/current/users/{userId}` can update email, username,
  password, school role, and enabled status. Self-deactivation, self-role
  changes, and self-password resets are rejected.
* Every operation requires `IT_ADMIN`. Passwords are hashed by the API and
  never returned. Create, update, role-change, credential-reset, deactivation,
  and reactivation actions are recorded in the school-scoped audit log.

## Tenant selection for public admissions

`POST /api/v1/admissions` requires `X-School-Slug` and accepts applications
only for an active school. Authenticated school APIs derive tenant scope from
the authenticated user's school association.

## Current boundary

Academic-year, term, class, subject, enrollment, teacher-assignment,
attendance, and admissions records are scoped to their school. This contract
does not define grading-scheme, fee, report-template, subscription, or billing
APIs; those domains are not yet implemented in the production backend.
