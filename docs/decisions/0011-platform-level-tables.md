# 11. Platform-Level Tables

Date: 2026-10-05

## Status

Accepted

## Context

In a pooled multi-tenant SaaS application, most data belongs to a specific tenant (school). Karatu enforces this via school_id NOT NULL and composite foreign keys on school-owned tables. However, some data is inherently cross-tenant or platform-level (such as SaaS subscriptions, product usage metrics, platform-level users like SUPER_ADMIN, or global configuration).

To ensure tenant isolation is not accidentally bypassed by treating a tenant-owned table as a platform table, we explicitly document all tables that are permitted to lack a school_id column.

## Decision

The following tables are explicitly designated as **Platform-Level Tables** and are permitted to exist without a mandatory school_id column (or with a nullable one):

1. **schools**: The core tenant identity table.
2. **users**: Contains both platform-level administrators (SUPER_ADMIN where school_id IS NULL) and tenant-level users (school_id IS NOT NULL). Thus, school_id must remain nullable.
3. **efresh_tokens**: Authentication tokens associated with users(id), applicable to both platform and tenant users.
4. **lyway_schema_history**: Managed by Flyway for tracking database migrations.

No other tables currently exist without school_id.

## Consequences

- Any new table introduced in future migrations must include school_id NOT NULL and composite foreign keys unless it is explicitly added to this ADR as a platform-level table.
- SUPER_ADMIN users operate at the platform level and cannot have a school_id.
- Application logic querying these platform tables must carefully distinguish between platform administration operations and tenant-scoped operations.

