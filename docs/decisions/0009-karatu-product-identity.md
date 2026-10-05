# ADR 0009: Karatu SIS product identity

## Status

Accepted for the product rename phase.

## Decision

Use **Karatu SIS** as the hosted product name and `karatu` as its technical
slug. Keep CarePoint Community School and the `carepoint` slug as the first
school tenant. Product name, slug, and optional root domain are configured in
the frontend and API; the root domain stays blank until the product owner
selects one.

Rename the application-owned Java namespace, Maven coordinates, app/package
names, runtime configuration, and prefixed environment variables to Karatu
SIS. Continue using framework-standard variables such as
`SPRING_PROFILES_ACTIVE` and `PORT`. Keep historical Flyway migrations,
tenant records, school content, and existing mock-browser storage keys
unchanged.

New local database defaults use `karatu_dev` and `karatu`. The Docker Compose
volume key remains `postgres_data` so the product rename does not redirect a
local development setup to a different named volume. Production CORS origins
must be explicitly configured; no root domain is assumed.

JWTs use the issuer `karatu-sis`, and refresh cookies use
`karatu_refresh_token`. Existing access tokens with no issuer and old
`refresh_token` cookies are rejected after deployment. Users must sign in
again. This is an intentional session invalidation; refresh-token rows remain
subject to their existing expiry/revocation lifecycle.

## Environment migration

Rename API variables as follows before starting the renamed service:

| Old name | New name |
|---|---|
| `DB_URL` | `KARATU_DB_URL` |
| `DB_USERNAME` | `KARATU_DB_USERNAME` |
| `DB_PASSWORD` | `KARATU_DB_PASSWORD` |
| `JWT_SECRET` | `KARATU_JWT_SECRET` |
| `JWT_ACCESS_EXPIRATION_MS` / `JWT_EXPIRATION_MS` | `KARATU_JWT_ACCESS_EXPIRATION_MS` |
| `JWT_REFRESH_EXPIRATION_MS` | `KARATU_JWT_REFRESH_EXPIRATION_MS` |
| `JWT_COOKIE_SECURE` | `KARATU_JWT_COOKIE_SECURE` |
| `JWT_COOKIE_SAME_SITE` | `KARATU_JWT_COOKIE_SAME_SITE` |
| `CORS_ALLOWED_ORIGINS` | `KARATU_CORS_ALLOWED_ORIGINS` |
| `PLATFORM_SUPER_ADMIN_EMAIL` | `KARATU_PLATFORM_SUPER_ADMIN_EMAIL` |
| `PLATFORM_SUPER_ADMIN_USERNAME` | `KARATU_PLATFORM_SUPER_ADMIN_USERNAME` |
| `PLATFORM_SUPER_ADMIN_INITIAL_PASSWORD` | `KARATU_PLATFORM_SUPER_ADMIN_INITIAL_PASSWORD` |
| `NEXT_PUBLIC_API_MODE` | `NEXT_PUBLIC_KARATU_API_MODE` |
| `NEXT_PUBLIC_API_URL` | `NEXT_PUBLIC_KARATU_API_URL` |
| `NEXT_PUBLIC_DEFAULT_SCHOOL_SLUG` | `NEXT_PUBLIC_KARATU_DEFAULT_SCHOOL_SLUG` |

Provider variables in the API template now use the `KARATU_` prefix. Update
deployment secrets and local ignored `.env` files manually; the repository
does not rewrite those files. Do not copy old CarePoint database defaults
into a new Karatu installation without deliberately preserving its existing
database and Compose volume.

`SPRING_PROFILES_ACTIVE`, `PORT`, and the `NEXT_PUBLIC_` exposure convention
remain framework/platform conventions. The product root domain can later be
set with `KARATU_ROOT_DOMAIN` and `NEXT_PUBLIC_KARATU_ROOT_DOMAIN` without
changing the product slug or school slug.

## Consequences

- Updating deployment configuration is required before a renamed API starts.
- Existing browser sessions must authenticate again after the issuer/cookie
  change.
- Local `.env` files are user-managed and are intentionally not rewritten.
- The generic Next.js favicon was replaced with a neutral graduation-cap
  placeholder. Final Karatu logo and favicon assets remain design work.
- No database migration is required for this application identity change.
- Root-domain routing, custom domains, and production domain allow-lists
  remain deferred until a domain is selected.
