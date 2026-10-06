# 12. Identity Model for Phone Numbers

Date: 2026-10-05

## Status

Accepted

## Context

In Phase 3 (Tenant Isolation Hardening & Identity Model), the identity model needs to support users (staff and parents) who will be invited and log in using their phone numbers (SMS) as well as email. The model must support E.164 normalized phone numbers (e.g., Ghana +233) without enabling account enumeration.

Currently, the users table mandates email and username as NOT NULL strings.

## Decision

We will adjust the users table to support phone number identities:
1. Add a phone_number column (VARCHAR 20, UNIQUE, NULLABLE).
2. Alter email and username to be NULLABLE.
3. Add a check constraint: CHECK (email IS NOT NULL OR phone_number IS NOT NULL).
4. The authentication logic will accept an identifier which will be checked against both email, username, and phone_number.
5. Spring Security's UserDetails.getUsername() will return username, email, or phone_number in that order of preference to satisfy its non-null requirement.
6. To prevent account enumeration, all login and password reset APIs will return generic "Invalid credentials" or "If an account exists, instructions have been sent" responses. Error messages will not disclose whether an identifier exists in the database.

## Consequences

- The users table schema becomes more flexible.
- API requests for login/invitation must be updated to handle phone_number.
- Phone numbers must be normalized to E.164 before saving or querying.
