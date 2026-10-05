# Phase 1 Alignment Report

Product parameters supplied for the implementation brief:

- Product name: **Karatu SIS**
- Product slug: **karatu**
- Root domain: **not supplied** (domain-dependent routing and deployment configuration remain deferred)

| Item | Current location | Decision | Reason |
|---|---|---|---|
| Tenant model and migrations | `apps/api/src/main/resources/db/migration/V9__add_school_tenancy.sql`; V10 | KEEP | V9/V10 are already committed. Phase 1 verifies them on disposable PostgreSQL; future schema work uses V11 onward. |
| Public admissions tenant lookup | `AdmissionController`, `AdmissionService`, `SchoolService` | KEEP | The API requires `X-School-Slug`, looks up an active school, and sets tenant context for the insert. Preserve and connect the client to this contract. |
| Public admissions client | `apps/web/lib/api/admissions.ts`, public admissions wizard | ADAPT | The frontend call omitted the API-required school slug header. Slug-specific public apply routes and the legacy default slug now pass the explicit header. |
| Existing school Super Admin accounts | V9 role conversion and `User`/`Role` | KEEP | V9 demotes existing school Super Admin users to IT_ADMIN; platform SUPER_ADMIN remains global with null `school_id`. Never rewrite V9. |
| Platform Super Admin provisioning | No bootstrap implementation found | ADAPT | Add an idempotent environment-configured bootstrap using the existing user table and BCrypt encoder; require a password change before platform access. |
| Frontend mock admission adapter | `apps/web/lib/functional/adapters/admission-adapter.ts` and mock service | KEEP for development | Existing mock mode is retained for local demonstration. Production public submission must use the backend API and must not silently fall back to mock data. |
| Existing public site content | `apps/web/app/(public)/**` | KEEP | The public site represents the CarePoint tenant. Domain-dependent routing and platform marketing remain deferred. |

## Verification notes

- The pushed baseline was `333107f` on `feature/assessments`; implementation is isolated on `feature/karatu-phase-1`.
- Flyway V1 through V11 applied successfully to disposable PostgreSQL 16 during the full backend suite.
- An initial local deletion of `apps/web/components/portal/dashboards/parent-timeline-feed.tsx` blocked early frontend checks. The file was restored to the pushed baseline before final verification; the final frontend lint, typecheck, and production build passed.
- Final backend result: 123 tests, 0 failures, 0 errors, 0 skipped. Admission and bootstrap integration tests exercised the real HTTP server.
