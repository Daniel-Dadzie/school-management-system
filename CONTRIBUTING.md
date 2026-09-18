# Contributing to CarePoint School Management System

Welcome to the CarePoint project! This document outlines the human contributor workflow.
For machine/AI agent operating rules, please read `AGENTS.md`.

## Project Purpose
CarePoint is a Community-Based School Management System. It consists of a public school website, a secure School Management Portal, and a Parent Portal. The system is designed as a production-oriented MVP with a focus on strict architectural separation, security, and data integrity.

## Repository Structure
This is a monorepo containing:
* `apps/api/` - Spring Boot backend
* `apps/web/` - Next.js frontend
* `docs/` - System architecture, decisions, and documentation
* `infrastructure/` - Deployment and Docker configurations

## Prerequisites
* Java 21+
* Node.js (v20+)
* Docker and Docker Compose (for local database and Testcontainers)
* Git

## Local Development Setup

### Backend Setup
1. Navigate to `apps/api/`.
2. Copy `.env.example` to `.env` and fill in any required local overrides.
3. The backend uses Maven. Use the wrapper: `.\mvnw spring-boot:run`.

### Frontend Setup
1. Navigate to `apps/web/`.
2. Copy `.env.example` to `.env.local`.
3. Install dependencies: `npm install`.
4. Run the development server: `npm run dev`.

### PostgreSQL/Testcontainers Expectations
* We use Flyway as the absolute schema authority. Do NOT use Hibernate `ddl-auto: update` or `create`. It must remain `validate`.
* The local development environment uses `docker-compose.yml` to spin up a PostgreSQL instance.
* Integration tests use Testcontainers to automatically provision isolated databases. Ensure Docker Desktop/Daemon is running before executing tests.

### Environment Variables
* Real `.env` files contain secrets and MUST NOT be committed.
* Provide safe defaults or placeholders in `.env.example` files and commit them.

## Testing and Validation

### How to run backend tests
From `apps/api/`, run:
```bash
./mvnw clean test
```

### How to run frontend validation
From `apps/web/`, run:
```bash
npm run lint
npm run build
```

## Git Workflow

### Branch Naming
Use descriptive prefixes for branches:
* `feature/` - New features
* `fix/` - Bug fixes
* `chore/` - Maintenance, dependencies, governance
* `docs/` - Documentation updates

### Commit Conventions
Follow Conventional Commits format:
`type(scope): description`
Example: `feat(auth): implement JWT authentication foundation`

### Pull Request Workflow
1. Branch from `develop`.
2. Make your changes following the architectural rules.
3. Push your branch and open a Pull Request against `develop`.
4. Fill out the mandatory Pull Request Template.
5. Await CI checks and code review.

### Code Review Expectations
* Code owners will review your PR.
* Reviewers will check for security, architecture boundary enforcement, and tests.

## Rules & Conventions

### Security Expectations
* Security is a backend responsibility.
* Never commit secrets, passwords, JWT secrets, or tokens.
* API boundaries must never expose password hashes or sensitive internal entities (use DTOs).

### Database Migration Rules
* Schema changes must be represented through Flyway migrations in `apps/api/src/main/resources/db/migration`.
* Do not rewrite or delete historical migrations that have been applied.

### API Conventions
* All API endpoints must be prefixed with `/api/v1`.
* Maintain consistent HTTP methods, status codes, request/response DTOs, and error handling.

### Definition of Done
A task is done when:
1. Implementation is complete.
2. Backend and Frontend validation is implemented.
3. Authorization and Business rules are enforced on the backend.
4. Loading, error, and empty states are handled on the frontend.
5. Tests are added/updated and pass.
6. Documentation is updated.
7. CI checks pass.

### What Contributors Must NOT Do
* Do NOT change architecture (Next.js, Spring Boot, Postgres, Flyway, JWT) without explicit approval.
* Do NOT bypass the DTO boundary to expose JPA entities.
* Do NOT implement unauthorized scope creep or speculative features.
* Do NOT assume the frontend is the authority for security or grading.

### How to Handle Architectural Uncertainty
If requirements are ambiguous or conflict with an existing architectural decision:
* STOP.
* Document the ambiguity or conflict.
* Propose a solution and wait for explicit approval before proceeding.

### How to Work Safely with AI Coding Agents
* AI agents operating in this repository MUST strictly follow `AGENTS.md`.
* Review agent-generated code exactly as you would human-written code.
* Ensure agents do not silently overwrite architectural decisions or recreate existing infrastructure.

