# Implementation Plan: Production Authentication Hardening

## Objective
Replace the MVP authentication storage model with a robust, production-oriented architecture featuring short-lived access tokens, `HttpOnly` refresh cookies, and database-backed refresh token rotation.

## Open Questions
- None. Proceeding with the documented requirements.

## Proposed Changes

### 1. Refresh Token vs JwtService
- `JwtService` remains exclusively for JWT access-token creation and validation.
- `RefreshTokenService` generates cryptographically random opaque tokens, hashes them (SHA-256) for DB storage, and handles validation, rotation, revocation, and reuse detection.
- Refresh tokens will not be represented as JWTs.

### 2. Refresh-Token Database Model
#### [NEW] `apps/api/src/main/resources/db/migration/V5__create_refresh_tokens_schema.sql`
- Table: `refresh_tokens`
  - `id UUID PRIMARY KEY`
  - `user_id UUID REFERENCES users(id)`
  - `token_hash VARCHAR(255) UNIQUE NOT NULL`
  - `family_id UUID NOT NULL` (to group token chains)
  - `expires_at TIMESTAMP NOT NULL`
  - `created_at TIMESTAMP NOT NULL`
  - `revoked_at TIMESTAMP NULL`
  - `replaced_by UUID NULL REFERENCES refresh_tokens(id)`
- Add appropriate indices on `token_hash`, `user_id`, and `family_id`. Never store the raw refresh token.

### 3. Cookie Configuration
- Inspect deployment topology and environment configuration to determine `SameSite`. Choose the least permissive configuration that works.
- Restrict cookie `Path` to `/api/v1/auth`. This allows the cookie to be sent to `/api/v1/auth/refresh` and `/api/v1/auth/logout` while preventing it from being sent to unrelated endpoints.
- Production cookies MUST be `HttpOnly` and `Secure`. Development uses `Secure=false` strictly for localhost HTTP.
- Make cookie attributes environment-configurable.

### 4. CSRF Protection
- Only `/refresh` and `/logout` endpoints consume the authentication cookie. All other protected endpoints strictly use the Bearer access token.
- CSRF Mitigation for `/refresh` and `/logout`:
  - Treat the final defense as the combination of appropriate `SameSite`, `Secure`, `HttpOnly`, restricted cookie Path, explicit Origin validation, credentialed CORS configuration, and the JSON/custom-header requirement according to the actual deployment topology.
  - Explicitly validate the `Origin` header to ensure it matches the configured allowed origins.
  - Keep the JSON/custom-header requirement to prevent simple cross-origin form submissions.

### 5. Authentication Response Contract
- `POST /api/v1/auth/login`: Returns short-lived `accessToken` (15 mins) and safe user info. Sets HttpOnly refresh cookie. Refresh token is NEVER returned in JSON and is NEVER exposed to JavaScript.
- `POST /api/v1/auth/refresh`: Returns new `accessToken` and user info. Sets new HttpOnly refresh cookie.
- `POST /api/v1/auth/logout`: Revokes the server-side refresh session and clears the cookie.

### 6. Frontend Security Model
#### [MODIFY] `apps/web/stores/auth-store.ts`
- Remove Zustand `persist` middleware entirely. Access token and user info are held strictly in-memory. Refresh token must never enter JavaScript storage.
- On page reload, restore authentication by calling `/api/v1/auth/refresh` with `credentials: "include"`.

### 7. API Client Behavior
#### [MODIFY] `apps/web/lib/api/client.ts`
- Remove arbitrary absolute-URL bypasses (`if (endpoint.startsWith("http"))`).
- Attach `credentials: "include"` exclusively to requests requiring the cookie (like `/refresh`).
- Add 401 interceptor:
  - If 401 occurs, pause all pending requests.
  - Trigger `/refresh` exactly once.
  - If successful, resume all paused requests with the new access token.
  - Prevent concurrent requests from triggering multiple refresh operations.
  - Prevent refresh loops.
  - If refresh fails, clear in-memory auth state and require re-authentication.

### 8. CORS Config
- Inspect the existing backend CORS configuration.
- Use explicit environment-driven origins. Never use `*` together with credentialed CORS.
- Configure `allowCredentials=true` only where required.

### 9. Security Logging
- Do not log access tokens, refresh tokens, cookies, Authorization headers, passwords, or credential-bearing request bodies.

### 10. Testing
- Add tests verifying security behavior, not merely HTTP success:
  - successful login, invalid login
  - access-token expiry
  - refresh cookie creation, refresh token absent from JSON
  - valid refresh, expired refresh, revoked refresh, invalid refresh
  - refresh-token rotation, old refresh-token reuse, token-family/session revocation after reuse detection
  - logout, cleared cookie after logout, subsequent refresh failure after logout
  - existing 401/403 behavior, existing RBAC/resource authorization

### 11. Documentation
#### [MODIFY] `docs/decisions/003-authentication-storage-model.md`
- Update document to detail the transition from MVP to the final implemented architecture.
#### [MODIFY] `docs/DEVELOPMENT_STATUS.md`
- Reconcile old statements with the new hardened architecture instead of appending contradictions.

### 12. Scope Control
- This implementation is ONLY the authentication/security hardening task. Do not modify Academic, Admissions, Attendance, Assessments, Results, Payments, or unrelated frontend/backend functionality.

## Verification Plan
### Automated Tests
- Run backend tests: `cd apps/api && .\mvnw.cmd test`
- Run frontend checks: `cd apps/web && npm run lint && npx tsc --noEmit && npm run build`
### Manual Verification
- Review the Git Diff to ensure no credentials are logged, CORS is explicit, and configurations are secure.
