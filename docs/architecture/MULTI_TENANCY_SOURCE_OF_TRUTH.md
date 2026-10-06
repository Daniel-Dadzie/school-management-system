# FILE 1

# docs/architecture/MULTI_TENANCY_SOURCE_OF_TRUTH.md

# Karatu Multi-Tenancy — Source of Truth

## 1. Purpose

Karatu is a shared-hosted, multi-tenant school-management SaaS.

Each school is a tenant.

This document defines the permanent rules for tenant isolation across:

- database
- backend
- APIs
- authorization
- files
- reports
- background jobs
- caches
- integrations
- audit logs
- frontend behavior

This document must be read before implementing any tenant-owned feature.

---

# 2. Tenant Model

Conceptually:

```text
Karatu Platform
│
├── School A
│   ├── Users
│   ├── Students
│   ├── Academic Data
│   ├── Finance
│   └── Reports
│
├── School B
│   ├── Users
│   ├── Students
│   ├── Academic Data
│   ├── Finance
│   └── Reports
│
└── Platform Administration
```

Schools share infrastructure but must not share tenant-owned data.

---

# 3. Tenant Context

The backend must derive tenant identity from authenticated server-side context.

The canonical mechanism is:

```text
Authenticated User
        ↓
School Membership / Active School Context
        ↓
TenantContext.requireSchoolId()
        ↓
Tenant-scoped business operation
```

Never trust tenant identity supplied by:

- request body
- query parameter
- path parameter
- arbitrary header
- client state
- frontend store
- untrusted token claim

Public tenant routes may resolve a tenant through an approved public identifier such as a slug or hostname, but the resulting tenant context must be explicitly established and safely cleared.

---

# 4. School-Owned Tables

Every school-owned table should normally contain:

```text
school_id NOT NULL
```

It should also have:

- foreign key to `schools`
- index beginning with `school_id`
- tenant-aware uniqueness where appropriate
- same-school composite foreign keys where required

Platform-level tables that intentionally do not contain `school_id` must be explicitly documented.

---

# 5. Repository Rules

Tenant-owned repository access must be explicitly scoped.

Preferred:

```text
findByIdAndSchoolId(...)
findBySchoolId(...)
existsByIdAndSchoolId(...)
deleteByIdAndSchoolId(...)
```

Do not rely on:

```text
findById(...)
existsById(...)
deleteById(...)
```

for school-owned resources unless tenant enforcement is demonstrably guaranteed by a higher-level mechanism and the architecture explicitly approves it.

Unscoped native queries are prohibited for tenant-owned data.

---

# 6. Service Layer

Services must obtain tenant context from the server.

Example:

```text
schoolId = TenantContext.requireSchoolId()
```

The service then passes the tenant boundary into repository operations.

Do not accept a client-provided school ID and treat it as authoritative.

---

# 7. API Security

A request containing an identifier belonging to another tenant should normally behave as:

```text
404 Not Found
```

rather than exposing:

```text
403 Forbidden
```

where appropriate.

The goal is to avoid cross-tenant resource disclosure.

---

# 8. IDOR Protection

Every tenant-owned identifier-based endpoint must be tested for:

```text
Tenant A user
      ↓
Tenant B resource ID
      ↓
Access denied
```

Tests should cover:

- GET
- PUT/PATCH
- DELETE
- POST relationships
- nested resources
- exports
- downloads
- reports
- file access

---

# 9. Database Integrity

Tenant isolation must be reinforced at the database level through:

- foreign keys
- same-school composite foreign keys
- constraints
- indexes
- appropriate database policies where approved

PostgreSQL Row-Level Security may provide defense in depth.

RLS is not a replacement for correct service/repository authorization.

---

# 10. Files

Files must be tenant-scoped.

Tenant boundaries must apply to:

- uploads
- downloads
- object keys
- signed URLs
- report PDFs
- student documents
- images
- exports
- temporary files

A user from School A must never be able to access School B's private files.

---

# 11. Reports

Reports are tenant-owned.

Report generation must derive tenant context from the relevant academic/student record.

A report URL or identifier must never bypass tenant authorization.

---

# 12. Background Jobs

Background jobs must carry explicit tenant context.

Examples:

- recurring billing
- report generation
- notification jobs
- payment reconciliation
- scheduled academic processing

A scheduled job must never assume a global school context.

---

# 13. Caches

Caches must be tenant-aware.

A cached object belonging to School A must never be returned to School B.

Cache keys should include tenant identity where appropriate.

---

# 14. Audit Logs

Audit events must identify the tenant for tenant-owned actions.

Platform-level actions must be distinguishable from tenant-level actions.

Super Admin support access must be separately auditable.

---

# 15. Super Admin

SUPER_ADMIN is a platform role.

It is not ordinary school administration.

Super Admin may provision schools and perform authorized support operations.

Any access to tenant business data must:

- be explicitly authorized
- be attributable
- be audited
- include a reason where required

---

# 16. Integrations

Tenant isolation applies to integrations.

Examples:

- Paystack configuration
- email
- SMS
- WhatsApp
- Cloudinary
- Supabase Storage
- FCM
- Sentry metadata

Tenant credentials must never be mixed.

---

# 17. Testing

Every new tenant-owned module must include:

- cross-tenant read tests
- cross-tenant write tests
- IDOR tests
- repository scoping tests
- relationship tests
- file-access tests where relevant
- background-job tests where relevant

---

# 18. Core Principle

> Shared infrastructure does not mean shared data.

Every Karatu feature must answer:

1. What is the tenant boundary?
2. Where is tenant context established?
3. How is tenant scope enforced?
4. How is cross-tenant access tested?
5. How are files/jobs/caches/reports isolated?

If those questions cannot be answered, the feature is not ready for implementation.

---
