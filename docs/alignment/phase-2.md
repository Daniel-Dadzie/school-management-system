# Phase 2 Alignment Report — Karatu SIS product identity

## Product inputs

- Product name: **Karatu SIS**
- Product slug: **karatu**
- Root domain: **not selected by the product owner**; domain-dependent routing stays unset.

## Identity inventory and decisions

| Item | Current location | Decision | Reason |
|---|---|---|---|
| Product labels already updated in this worktree | Web metadata, authentication layout/login, portal header/sidebar/mobile navigation/dashboard; README and active project docs | KEEP and complete | The UI now identifies the hosted service as Karatu SIS. Finish central configuration and consistency checks. |
| School public website and school-authored content | `apps/web/app/(public)/**`, public components and metadata | KEEP | These pages describe CarePoint Community School, the first tenant. The product website and tenant website split belongs to Phase 8. |
| School profile defaults and report-card identity | Portal school settings, `student-report-card.tsx`, API/demo seed data | KEEP | CarePoint here is tenant content/sample data, not the product name. |
| Public admissions default slug | `apps/web/lib/api/admissions.ts`, public admissions route/wizard, V9 seed | KEEP | `carepoint` is the first school's tenant slug and must not become the product slug. |
| Historical migrations and decision/task records | Flyway V1–V11 and completed historical docs | KEEP | Applied migration names/schema and historical records are immutable; old product names in history remain historical. |
| Java namespace and Maven coordinates | `com.schoolmanagement` across 145 Java source files; `apps/api/pom.xml` | ADAPT | Rename to the Karatu SIS namespace and coordinates, moving source paths with package declarations so Spring component scanning continues to work. |
| Spring application, actuator, log, and pool identity | `application*.yml`, logging configuration, `/actuator/info` | ADAPT | Expose Karatu SIS identity while retaining framework-defined Spring profile and port variables. |
| JWT issuer and refresh cookie | `JwtService`, `AuthController`, auth integration tests | ADAPT | Add a Karatu issuer and rename the cookie. Existing tokens/cookies will require reauthentication; record this operational effect. |
| Backend and frontend environment variables | `apps/api/.env.example`, `apps/web/.env.example`, profile YAML, API client, auth bootstrap, admission client | ADAPT | Rename application-owned variables to a Karatu prefix. Keep standard platform variables such as `SPRING_PROFILES_ACTIVE` and `PORT`. Local ignored `.env` files are owner-managed and will not be edited. |
| Product configuration | New shared backend/frontend configuration surfaces | ADAPT | Centralize name, slug, and optional root domain. An empty/unset root domain is intentional until supplied; do not fabricate a domain. |
| Database and Compose defaults | `application-dev.yml`, root `.env.example`, `docker-compose.yml` | ADAPT | New local environments use Karatu database/user/container/network names. Preserve the existing Compose volume key to avoid silently abandoning local PostgreSQL data. |
| Frontend package identity and lockfiles | `apps/web/package.json`, npm and pnpm lockfiles | ADAPT | Set a Karatu package identity and keep committed lockfiles consistent; CI continues to use pnpm. |
| Email sender default and outbound identity | API environment templates and active setup docs | ADAPT | Use the product sender label where the code currently defines one; preserve school-configurable sender identity as a later tenant capability. No SMS sender implementation was found. |
| Logo and favicon | Existing graduation-cap UI mark and `apps/web/app/favicon.ico` | ADAPT | Keep the neutral graduation-cap placeholder where used and replace framework/demo favicon artwork with a neutral placeholder pending final Karatu brand assets. |
| Old browser mock-storage keys | Functional mock database/session repositories | KEEP for compatibility | These keys identify existing local demo data. Renaming them without a migration would orphan saved browser data; they are storage identifiers, not user-facing product labels. |
| Ownership policy file overwritten by research prose | `.github/CODEOWNERS` | ADAPT | Restore the existing repository ownership rules from history and update the Java path to the Karatu package. The research report is not valid CODEOWNERS syntax and must not replace the policy. |

## Plan

1. Add characterization tests for the Karatu JWT issuer, refresh-cookie name, and application metadata.
2. Centralize product name/slug/optional domain in the frontend and backend configuration; keep domain-dependent values empty.
3. Rename Java packages/Maven coordinates and update API configuration, environment templates, Compose defaults, frontend package identity, and active product documentation.
4. Preserve tenant data, historical migrations, and mock-storage keys; document the required environment-variable migration and forced re-login.
5. Replace generic/demo favicon artwork with a neutral placeholder and mark final visual assets pending.
6. Run backend tests, frontend lint/source type-check/build where the running Next.js development process permits, inspect the complete diff, and report the phase gate without pushing.

## Domain constraint

The root domain is intentionally not configured. Production CORS origins and domain routing must be supplied before deployment/domain work; local path-based school routes continue to use the existing tenant slug.

## Verification and phase gate — 2026-10-05

Implemented the Karatu SIS identity changes described above. Java main and test packages compile under `com.karatu.sis`; the API Maven coordinates are `com.karatu.sis:karatu-api`; frontend product labels/configuration and API environment names use the Karatu prefix. JWT issuer and refresh cookie use Karatu values. The product root domain remains unset. Historical migrations and the CarePoint tenant slug/data remain unchanged.

- Backend clean suite: **PASS**, 124 tests, 0 failures, 0 errors, 0 skipped. Testcontainers used disposable PostgreSQL 16; Flyway V1–V11 applied.
- Platform owner bootstrap integration test: **PASS**, 2 tests after changing the fixture to the renamed `KARATU_PLATFORM_SUPER_ADMIN_*` properties. The original full-suite failure was a stale test fixture, not an application bootstrap defect.
- Frontend lint: **FAIL**, 6 errors and 61 warnings. All six errors are `no-explicit-any` in `apps/web/components/portal/super-admin/schools.tsx`, an untracked concurrent change outside this phase. This file was left untouched.
- Phase-specific frontend lint: **PASS**, zero errors and four existing warnings across the changed branding files.
- Full frontend TypeScript check: **FAIL**, three errors in the untracked concurrent Super Admin UI (`permissions.platformManage` and missing API client `get`/`post` methods).
- Isolated frontend production build: **FAIL**, at existing `components/assessments/student-report-card.module.css:6`: CSS Modules rejects `:global(body *)` as an impure selector. The isolated build left the active Next development output untouched.
- Authenticated login over HTTP: **PASS** as part of `PlatformAdminBootstrapIntegrationTest`, including initial password change and platform school provisioning under the renamed bootstrap environment settings.
- `git diff --check`: **PASS** after removing the two extra trailing blank lines. Git still prints expected LF-to-CRLF working-copy notices on this Windows environment.
- Commit gate: **NO-GO**. The working tree also contains the unrelated receipt edit and concurrent Super Admin navigation/schools changes, so the phase cannot be committed as a clean, isolated change set yet.

**Phase 2 gate: NO-GO for Phase 3.** Clear the Super Admin UI lint/type errors and the existing CSS Modules build failure, then isolate the unrelated worktree changes before beginning Phase 3 tenant-isolation hardening.
