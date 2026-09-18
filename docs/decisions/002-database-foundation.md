# TASK 002: Database Foundation — Engineering Report & Analysis

This document provides a comprehensive breakdown of the architectural changes, implementation details, and verification steps performed during **TASK 002: Database Foundation** for the CarePoint School Management System.

## 1. Goal

The objective was to establish a robust, production-ready database foundation ensuring that:
1. **Flyway** acts as the absolute schema authority (not Hibernate).
2. Local development mimics production through **Docker Compose**.
3. Integration testing automatically provisions isolated database instances via **Testcontainers**.
4. The environment and build configurations are rock-solid, secure, and compatible with the project's Windows/JDK 21+ constraints.

---

## 2. Implementation Breakdown

### 2.1 Dependency & Build Configuration (`pom.xml`)
- **Cleaned invalid dependencies**: Replaced six non-existent Spring Boot test starters (left over from a previous scaffold) with the correct `spring-boot-starter-test` and `spring-security-test`.
- **Integrated Testcontainers**: Added the `testcontainers-bom` (v1.21.4) to `<dependencyManagement>` (as Spring Boot 4.1.1's BOM omitted it), alongside `spring-boot-testcontainers` and `org.testcontainers:postgresql`.
- **Optimized Maven Surefire**: 
  - Increased the forked JVM heap to `-Xms256m -Xmx768m -XX:+UseG1GC`. The default 256m was inadequate for booting Spring Boot, JPA, Flyway, and Testcontainers concurrently, leading to OOM crashes.
  - Added `-XX:+EnableDynamicAgentLoading` to suppress JVM warnings related to Mockito's dynamic agent on JDK 21+.
  - Injected `<DOCKER_HOST>npipe:////./pipe/dockerDesktopLinuxEngine</DOCKER_HOST>` via `<environmentVariables>` to ensure Testcontainers smoothly locates Docker Desktop on Windows.

### 2.2 Local Infrastructure (`docker-compose.yml` & `.env`)
- **Docker Compose**: Created a standard local development stack utilizing `postgres:16-alpine`. Configured it with named volumes (`postgres_data`) for data persistence, isolated networking (`carepoint-network`), and robust healthchecks using `pg_isready`.
- **Redis Strategy**: Added Redis configuration but left it commented out. Following MVP scope control, Redis will remain disabled until a concrete caching or session management requirement demands it.
- **Environment Management**: Fixed `.gitignore` to allow `.env.example` files to be checked in. Created dedicated environment templates for the root (`.env.example`), backend (`apps/api/.env.example`), and frontend (`apps/web/.env.example`) to document all required infrastructure, SaaS, and API keys.

### 2.3 Spring Profile Strategy (`application.yml`)
Implemented a robust multi-profile configuration separating concerns across environments:
- **`application-dev.yml`**: Designed for local execution. Points to `localhost:5432/carepoint_dev` by default. Configured HikariCP (max 10 connections), disables OSIV (Open-In-View) to prevent lazy-loading bugs, and sets `hibernate.ddl-auto: validate`.
- **`application-prod.yml`**: Designed for the Supabase production environment. Enforces that all database variables (`DB_URL`, `DB_USERNAME`, `DB_PASSWORD`) are supplied via environment variables without fallbacks. Configured HikariCP (max 20 connections) with TCP keepalive settings appropriate for cloud databases.
- **`application-test.yml`**: Strips out hardcoded database URLs, empowering Testcontainers to inject the dynamic connection details at runtime.

### 2.4 Schema Migration Authority (Flyway)
- **Hibernate Restricted**: Globally set `spring.jpa.hibernate.ddl-auto: validate`. Hibernate will now only map Java entities to the existing database schema and is strictly forbidden from creating or altering tables.
- **Baseline Migration**: Created `V1__init.sql` to initialize standard PostgreSQL extensions required for the project: `"uuid-ossp"` (for primary keys) and `"pgcrypto"` (for potential database-level encryption or hashing).

### 2.5 Integration Testing Architecture
- **`TestcontainersConfiguration.java`**: Implemented a reusable `@TestConfiguration` that defines a `PostgreSQLContainer` bean. 
- **`@ServiceConnection`**: Utilized Spring Boot's new `@ServiceConnection` annotation to automatically wire the ephemeral Testcontainer's JDBC URL, username, and password directly into the Spring Context and Flyway configuration, completely eliminating the need for `DynamicPropertyRegistry`.
- **Validation**: Updated `ApiApplicationTests.java` to boot the full context against the isolated container.

---

## 3. Verification & Analysis

The foundation was verified end-to-end to ensure it handles real-world scenarios:

1. **Docker Compose Verification**: `docker-compose up -d` successfully bound `0.0.0.0:5432` on the host after stopping a conflicting local container (`educore-postgres`). The container reaches a `(healthy)` state.
2. **Integration Test Verification**: `.\mvnw.cmd clean test` compiled successfully and executed the context load test in ~62 seconds.
   - Testcontainers successfully reached out to the Docker Desktop daemon via the named pipe.
   - A fresh PostgreSQL 16 container was spun up.
   - Flyway executed `V1__init.sql` successfully.
   - JPA initialized, and the Spring application reported `ReadinessState changed to ACCEPTING_TRAFFIC`.
   - The test terminated cleanly with `BUILD SUCCESS` and a 0 exit code.

## 4. Next Steps
With the persistence and infrastructure tier fully solidified, the architecture dictates that the next logical step is **Authentication**. This involves:
- Defining the `User` JPA entity (mapping it via Flyway).
- Implementing Spring Security configuration.
- Establishing the JWT filter and login/registration endpoints.
