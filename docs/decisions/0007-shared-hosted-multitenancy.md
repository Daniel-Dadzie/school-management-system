# ADR 0007: Shared hosted school tenancy

## Status

Accepted for the backend tenancy foundation.

## Context

CarePoint is being prepared to serve multiple schools through one hosted
application. The existing Spring Boot API and PostgreSQL schema were scoped to
one school. Frontend mock records that carried `tenantId` did not provide API
or database isolation.

## Decision

Use a pooled model: one application and PostgreSQL database, with a `schools`
record for each tenant and a `school_id` on each school-owned record. The
authenticated user's school is loaded from the database and establishes the
request tenant context. Clients cannot choose the tenant for authenticated
school operations.

The platform `SUPER_ADMIN` role has no school assignment and is reserved for
the SaaS platform owner and cross-school provisioning. It is not seeded by
school provisioning. `IT_ADMIN` is the school-scoped technical administrator;
school staff operate only inside their assigned school. Public admission submissions select
an active school by its public slug supplied in the `X-School-Slug` header.

Existing records are assigned to the default CarePoint school during Flyway
migration. Same-school relationships are additionally protected by composite
database foreign keys where the current schema supports them.

## Consequences

* Existing academic and admissions APIs must query inside the request school.
* The public admissions client must send `X-School-Slug`.
* School profile editing and tenant provisioning are backend APIs.
* Grading schemes, configurable attendance policies, fee management, report
  templates, subscriptions, invitations, and billing still require their own
  production domain contracts and implementations.
* Cross-school integration tests are required before enabling real customer
  schools in production.

## Alternatives considered

* A separate database/deployment per school: stronger physical separation, but
  greater provisioning and operations cost for this MVP.
* Keep a single CarePoint deployment: simpler now, but does not meet the
  approved hosted multi-school product direction.
