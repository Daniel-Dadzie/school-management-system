# Karatu SIS

Karatu SIS is a shared-hosted school management SaaS. CarePoint Community School is its first tenant. The repository is a monorepo with a Next.js frontend and a Spring Boot API backed by PostgreSQL. School-owned records use `school_id`; authenticated tenant context is derived from the user record. Flyway is the database schema authority.

## Applications

- `apps/web` — Next.js App Router frontend.
- `apps/api` — Java 21 / Spring Boot REST API (`/api/v1`).
- `docs/` — architecture decisions, API contracts, and development status.

## Local development

Prerequisites: Java 21, Node.js 20, pnpm 12.5.1, Docker Desktop, and a PostgreSQL URL for the API's development profile.

Backend:

```powershell
cd apps/api
./mvnw spring-boot:run
```

The development profile reads `KARATU_DB_URL`, `KARATU_DB_USERNAME`, `KARATU_DB_PASSWORD`, and `KARATU_JWT_SECRET`; its defaults and safe placeholders are documented in `apps/api/.env.example` and `apps/api/src/main/resources/application-dev.yml`. Do not use production credentials for local work.

Frontend:

```powershell
cd apps/web
pnpm install --frozen-lockfile
pnpm dev
```

The frontend uses mock mode in development by default. Set `NEXT_PUBLIC_KARATU_API_MODE=api` and `NEXT_PUBLIC_KARATU_API_URL` to use the Spring API. Production builds always select API mode and cannot fall back to local mock storage. `NEXT_PUBLIC_KARATU_DEFAULT_SCHOOL_SLUG` selects the tenant for the legacy `/admissions/apply` URL; tenant-specific public applications can use `/{schoolSlug}/admissions/apply`.

## Verification

```powershell
cd apps/api
./mvnw clean test

cd ../web
pnpm lint
pnpm exec tsc --noEmit
pnpm build
```

Backend integration tests use disposable PostgreSQL 16 Testcontainers. They do not require a persistent test database.

## Initial platform owner

To create the first global `SUPER_ADMIN`, provide all three environment variables to the API process before startup:

- `KARATU_PLATFORM_SUPER_ADMIN_EMAIL`
- `KARATU_PLATFORM_SUPER_ADMIN_USERNAME`
- `KARATU_PLATFORM_SUPER_ADMIN_INITIAL_PASSWORD` (12–72 characters and at most 72 UTF-8 bytes; supply through a secret manager)

The startup initializer is idempotent: it creates a global user with a BCrypt password hash and requires a password change at first login. It does not reset an existing matching platform account. If any bootstrap value is supplied, all three must be valid. Remove the initial password secret after successful provisioning. The password change endpoint is `POST /api/v1/auth/change-password` with the authenticated access token and current/new password fields.

## Architecture notes

- The application is a modular monolith: Next.js → Spring Boot → PostgreSQL.
- Pooled multitenancy uses one shared database and schema with school ownership represented by `school_id`.
- `SUPER_ADMIN` is platform scoped; `IT_ADMIN`, `ADMIN`, `TEACHER`, and `PARENT` are school scoped.
- Public admission submission is unauthenticated and resolves an active school using `X-School-Slug`. Authenticated school APIs derive tenant identity from the persisted user record.
- Product identity is configured centrally with `KARATU_PRODUCT_NAME`, `KARATU_PRODUCT_SLUG`, and optional `KARATU_ROOT_DOMAIN` for the API, plus the corresponding `NEXT_PUBLIC_KARATU_*` values for the frontend. Leave the root domain blank until selected. CarePoint remains the first tenant and its school slug is `carepoint`.

For project status and known gaps, see [`docs/DEVELOPMENT_STATUS.md`](docs/DEVELOPMENT_STATUS.md) and [`docs/decisions/0007-shared-hosted-multitenancy.md`](docs/decisions/0007-shared-hosted-multitenancy.md).
