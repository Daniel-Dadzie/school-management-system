# 10. PostgreSQL Row-Level Security

Date: 2026-10-05

## Status

Accepted (Rejected implementation of RLS)

## Context

In Phase 3 (Tenant Isolation Hardening), we evaluated PostgreSQL Row-Level Security (RLS) as an additional safety net to enforce tenant isolation at the database level. Karatu is a pooled multi-tenant SaaS where multiple schools share the same PostgreSQL database, and tenant isolation is currently enforced at the application level via school_id checks on all queries.

RLS would allow us to define database policies (e.g., school_id = current_setting('application.current_school_id')) that automatically filter rows based on the current transaction's tenant context.

## Decision

We have decided to **reject** the implementation of PostgreSQL Row-Level Security (RLS) for Karatu at this time. 

Instead, we will rely on **Explicit Tenant Scoping** and **Database-Level Defense in Depth (Constraints)** as our primary tenant isolation mechanisms.

## Rationale

1. **Explicit Repository Scoping is Sufficient:** We have enforced explicit indByIdAndSchoolId, existsByIdAndSchoolId, and deleteByIdAndSchoolId methods across all Spring Data JPA repositories. All application services (*Service.java) must explicitly pass the schoolId obtained from the authenticated user's TenantContext to these repository methods.
2. **Architectural Complexity:** Implementing RLS requires separating the database roles into a karatu_migration role (used by Flyway, bypassing RLS) and a karatu_app role (used by Spring Boot/Hibernate, bound by RLS). It also requires a Hibernate Interceptor or AOP aspect to inject SET LOCAL application.current_school_id into every transaction, introducing overhead and edge cases with connection pooling (e.g. leaked state if auto-commit non-transactional reads occur).
3. **Hibernate Caching and RLS Mismatch:** If second-level caching is ever enabled, Hibernate cache does not respect RLS natively, creating a risk of cross-tenant cache pollution unless the cache is explicitly partitioned by tenant.
4. **Maintenance Overhead:** Every new school-owned table would require explicit RLS policies to be written in Flyway migrations, increasing the surface area for developer error.

## Compensating Controls

To ensure strict tenant isolation without RLS, the following compensating controls are enforced:

1. **Explicit Application Scoping:** All database access paths (JPA Repositories, Native Queries, HQL) explicitly require school_id in their WHERE clauses. Bare indById methods are strictly prohibited for school-owned entities.
2. **Tenant Context Immutability:** TenantContext is derived solely from the authenticated user's database record (or resolved securely via X-School-Slug on public routes) and is never trusted from arbitrary client headers/payloads.
3. **Database Defense in Depth:** 
   - Every school-owned table must have school_id NOT NULL.
   - Every school-owned table must have a foreign key to the schools table.
   - Every school-owned table must have an index leading with school_id.
   - Every cross-table relationship between two school-owned entities must use a **composite foreign key** that includes school_id (e.g., FOREIGN KEY (school_id, class_id) REFERENCES classes (school_id, id)). This guarantees at the database schema level that a teacher in School A cannot be assigned to a class in School B, even if the application logic fails.
4. **Automated Testing:** We maintain a comprehensive suite of cross-tenant isolation tests and IDOR (Insecure Direct Object Reference) tests that verify a user in School A cannot access or modify resources belonging to School B, returning a safe 404 Not Found.
