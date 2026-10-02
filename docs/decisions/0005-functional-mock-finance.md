# Functional Mock Finance Domain

- **Date:** 2026-09-28
- **Scope:** `apps/web` finance routes, mock service, and MockDatabase only.
- **Rule:** `docs/frontend-agent-rules.md` backend-readiness rule and `docs/frontend-design-system.md` D5/D9.
- **Decision:** Implement a FinanceService and FinanceAdapter backed by MockDatabase because the project owner explicitly requested a complete mock-only finance implementation and prohibited changes to `apps/api` and Spring Boot. New permissions are mock-session checks only. No endpoint, live payment integration, or production readiness is implied.
- **Money:** Store integer minor units in mock records to preserve exact arithmetic; convert and format at the UI boundary.
- **Payment:** All admin-entered payments are simulated records; no funds are transferred. Parent payment initiation is unavailable.
