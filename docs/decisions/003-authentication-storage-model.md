# Architecture Decision Record: Authentication Storage Model

## Context

During the implementation of the Frontend/API Integration Foundation (TASK 007), a review of the authentication storage mechanism was conducted. The Next.js frontend currently utilizes Zustand with the `persist` middleware to store the JWT returned by the backend in the browser's `localStorage`.

For a school-management system handling sensitive student records, academic information, and payment data, storing long-lived access tokens or refresh tokens in `localStorage` exposes the credentials to potential Cross-Site Scripting (XSS) attacks.

A stronger production security model necessitates:
- Short-lived access tokens.
- `HttpOnly`, `Secure`, and `SameSite`-configured cookies for refresh/session material.
- Server-side control over refresh credentials.
- No exposure of long-lived authentication material to client-side JavaScript.

## Current Backend Capabilities (MVP Approach)

An inspection of the current Spring Boot backend reveals the following MVP implementation:
- `AuthController` issues a single JWT in the JSON body (`AuthResponse`).
- `JwtAuthenticationFilter` strictly reads the token from the `Authorization: Bearer <token>` HTTP header.
- The backend does not currently issue refresh tokens.
- The backend does not set any cookies (`HttpOnly` or otherwise).

## Decision

Because the backend does not yet support the stronger cookie-based refresh/session model, we are adhering to the following rules to prevent rushed or partial redesigns:
1. **Maintain the MVP Approach**: The frontend will continue to use Zustand `persist` (localStorage) for the MVP phase to keep the frontend functional and compatible with the existing backend architecture, avoiding disruptive user experiences (e.g., losing session on page refresh).
2. **Document the Production-Hardening Requirement**: This document serves as the formal identification of the required security upgrade before production deployment.

## Required Backend Changes for Production Hardening

To transition to the preferred security model, the following backend changes will be required in a future task:
1. **Token Separation**: Implement a short-lived Access Token (e.g., 15 minutes) and a long-lived Refresh Token (e.g., 7 days).
2. **Cookie-Based Refresh**: Modify `AuthController` to return the Access Token in the JSON body (or also in a cookie), and set the Refresh Token exclusively as an `HttpOnly`, `Secure`, `SameSite=Strict` (or `Lax`) cookie via the `Set-Cookie` header.
3. **Refresh Endpoint**: Create a `/api/v1/auth/refresh` endpoint that reads the `HttpOnly` refresh cookie, validates it against the server's tracking (e.g., a database or Redis), and issues a new Access Token.
4. **Logout Mechanism**: Modify the logout endpoint to instruct the browser to clear the refresh cookie.
5. **CSRF Protection**: Implement appropriate CSRF mitigation (e.g., a Synchronizer Token Pattern or Double Submit Cookie) if the Access Token is also moved to a cookie, since cookies are automatically sent by the browser.

Once these backend features are implemented, the frontend `apiClient` and `auth-store.ts` can be updated to drop `localStorage` persistence and securely orchestrate the refresh flow in memory.
