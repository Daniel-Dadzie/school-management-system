# Decision 004: Implement promotions in Functional Mock Mode

Rule ID: `docs/frontend-design-system.md` 0.3 and section 27
Reason: The project owner explicitly requested the promotion vertical slice to use the existing mock database and mock service architecture while leaving `apps/api`, Spring Boot, PostgreSQL, Flyway, and real API integration untouched. Waiting for the promotion API would prevent review of the requested mock workflow.
Scope (files, pages, or components): `apps/web` promotion workflow, mock persistence, mock authorization, and student academic history only. This exception does not authorize API integration or changes to another backend domain.
Date: 2026-09-28
Approved by: Project owner (explicit instruction in the task conversation)
