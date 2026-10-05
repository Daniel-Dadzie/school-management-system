# ADR 0008: Environment-driven platform owner bootstrap

## Status

Accepted for initial platform provisioning.

## Context

V9 converts pre-existing school Super Admin users into school-scoped IT administrators. The platform `SUPER_ADMIN` role has no school assignment, but no first platform owner can be provisioned through the existing school provisioning endpoints.

## Decision

At API startup, create a global `SUPER_ADMIN` only when all three environment variables `KARATU_PLATFORM_SUPER_ADMIN_EMAIL`, `KARATU_PLATFORM_SUPER_ADMIN_USERNAME`, and `KARATU_PLATFORM_SUPER_ADMIN_INITIAL_PASSWORD` are configured. The initial password is BCrypt-hashed and must be changed before other authenticated API operations are allowed. Missing all three values disables the bootstrap; a partial or conflicting identity configuration fails startup. Once the account exists, restarts do not reset its credentials or the password-change flag.

Password change uses `POST /api/v1/auth/change-password`, requires the authenticated account's current password, and accepts a new password of 12–72 characters. New Flyway changes use V11; historical V9/V10 migrations remain unchanged.

## Consequences

- Deployment secrets must be configured only for the initial platform provisioning window and removed after use.
- The global platform owner is distinct from each school's IT_ADMIN.
- Restoring access after loss of the initial owner credential requires a controlled administrative recovery procedure; this ADR does not define that recovery process.
