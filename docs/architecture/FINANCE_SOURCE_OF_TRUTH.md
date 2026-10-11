# Karatu Finance & Billing — Source of Truth

## 1. Purpose

This document defines the authoritative product and architecture rules for Finance in Karatu.

The Finance domain covers:

- student fees
- fee structures
- billing
- charges
- invoices
- payments
- payment allocations
- partial payments
- credits
- discounts
- waivers
- scholarships
- arrears
- payment claims
- payment verification
- receipts
- reversals
- refunds
- student statements
- class financial summaries
- school financial summaries
- finance auditability

This phase does not attempt to turn Karatu into a full accounting ERP.

---

# 2. Finance Scope

Karatu Finance is:

> Student Fees, Billing, Collections & Receivables.

It is not currently:

- general ledger accounting
- payroll accounting
- statutory accounting
- full double-entry accounting ERP
- corporate treasury management
- procurement accounting

Those may integrate with Karatu in the future.

---

# 3. Core Principle

The financial ledger is authoritative.

Every financial summary must be derived from authoritative financial records.

Do not maintain independent mutable balances that can drift from the underlying transactions.

Conceptually:

```text
Charges
+
Payments
+
Allocations
+
Credits
+
Adjustments
+
Reversals
+
Refunds
=
Authoritative Student Financial State
```

---

# 4. Billing Frequency

Karatu's default billing frequency is:

> MONTHLY

Schools may configure:

- monthly
- termly
- annual
- custom schedules where justified

Billing frequency and payment behavior are different concepts.

A monthly charge may be paid:

- once
- twice
- in several installments

A termly charge may also be paid:

- once
- partially
- through multiple installments

Do not use "installment" as a replacement for monthly/termly billing schedules.

---

# 5. Financial Domain Model

```text
School
 └── Academic Year
      └── Term
           └── Fee Configuration
                ├── Fee Categories
                ├── Fee Structures
                ├── Fee Items
                └── Billing Rules
                     ↓
                Student Charges
                     ↓
                   Invoice
                     ↓
             Adjustments / Discounts
                     ↓
                  Payments
                     ↓
             Payment Allocations
                     ↓
               Student Balance
                     ↓
              Financial Statement
```

---

# 6. Core Ledger Concepts

## Charge

Represents money owed.

## Invoice

Represents a bill or collection of charges presented to a payer.

## Payment

Represents money received or an authoritative payment transaction.

## Payment Allocation

Represents how a payment is applied to one or more charges.

## Credit

Represents money received or credited that has not yet been consumed by a charge.

## Reversal

Corrects an existing financial transaction without silently deleting history.

## Refund

Represents money returned to the payer.

---

# 7. Student Financial Account

Every student must have a complete financial statement.

A student account should be able to answer:

- What was charged?
- Why was it charged?
- What has been paid?
- When was it paid?
- How was it paid?
- What remains outstanding?
- Is there a credit?
- Were discounts or waivers applied?
- Were payments reversed?
- Were refunds issued?
- What is overdue?

Example statement:

```text
Date       Description          Debit     Credit    Balance
-----------------------------------------------------------
01 Sep     Tuition               500       0         500
10 Sep     Payment                 0       200       300
20 Sep     Payment                 0       100       200
01 Oct     Activity                50       0         250
```

---

# 8. Fee Categories

Schools should be able to configure fee categories.

Examples:

- Tuition
- Admission
- Registration
- Books
- Uniform
- Transport
- Feeding
- Examination
- ICT
- Activity
- Sports
- Club
- Trip
- Excursion
- Fun Fair
- Other

Categories must not create separate payment systems.

---

# 9. Activities

Trips, excursions, fun fairs, books, uniforms, clubs, transport and similar items should use the same financial ledger.

Example:

```text
Student
  ↓
Financial Account
  ├── Tuition
  ├── Books
  ├── Uniform
  ├── Trip
  ├── Club
  └── Fun Fair
```

Do not create a separate payment architecture for each activity.

---

# 10. Discounts, Waivers and Scholarships

The system should support:

- discounts
- sibling discounts
- scholarships
- waivers
- authorized adjustments

These must be recorded explicitly.

Each adjustment should identify:

- student
- charge/invoice
- amount
- type
- actor
- timestamp
- reason
- approval where required

Do not silently modify the original charge.

---

# 11. Partial Payments

Partial payment is a first-class feature.

Example:

```text
Invoice = GHS 1,000

Payment 1 = GHS 300
Payment 2 = GHS 400
Payment 3 = GHS 300

Total Paid = GHS 1,000
Balance = GHS 0
```

A payment may also be allocated across multiple charges.

---

# 12. Overpayments and Credits

If:

```text
Amount Owed = GHS 500
Amount Paid = GHS 600
```

the system must not lose the GHS 100.

The result should be:

```text
Outstanding = GHS 0
Credit = GHS 100
```

Credits may later be applied according to school policy.

---

# 13. Payment Methods

The system should support:

- cash
- bank transfer
- mobile money
- Paystack/online payment
- cheque where required
- other configured methods

Payment method is metadata about the payment.

It does not change the underlying financial ledger.

---

# 14. Cash Payment Workflow

```text
Parent
  ↓
School
  ↓
Finance user records payment
  ↓
Payment verified/authoritative
  ↓
Allocation
  ↓
Receipt
  ↓
Balance updated
```

Cash payments should be attributable to the finance user who recorded them.

---

# 15. Bank Transfer Workflow

```text
Parent
  ↓
Bank transfer
  ↓
Payment claim / proof
  ↓
Pending verification
  ↓
Finance verification
  ↓
Authoritative payment
  ↓
Allocation
  ↓
Receipt
```

Uploading proof does not mean payment has automatically been verified.

The school must be able to verify the transaction against bank records.

---

# 16. Online Payment Workflow

```text
Parent
  ↓
Karatu
  ↓
Paystack
  ↓
Provider confirmation
  ↓
Webhook / server verification
  ↓
Authoritative payment
  ↓
Allocation
  ↓
Receipt
```

The browser must never be the final authority for payment confirmation.

Webhook processing must be idempotent.

---

# 17. Payment Integration and Idempotency Requirements

**MANDATORY PREREQUISITE:** Payment idempotency is an outstanding finance-integrity requirement that must be fully implemented before implementing Paystack webhooks or exposing any retryable payment-processing workflow to real users.

Paystack is an integration, not the Finance domain itself.

Each school uses its own settlement arrangement. Karatu must never hold school funds.

To ensure strict financial integrity during payment integration:

1. **Identity Separation**: The system must define and enforce distinct identifiers for:
   - **Internal payment records**: Uniquely generated by Karatu (e.g., UUID).
   - **Client/API idempotency keys**: Where applicable, supplied by the client to prevent duplicate capture attempts over unstable network connections.
   - **Payment-provider transaction references**: The external reference generated by or shared with the payment provider.
   - **Provider webhook event identifiers**: Where available, unique IDs provided by the payment gateway for a specific webhook event.

2. **Webhook/Callback Idempotency**:
   - The system must prevent duplicate webhook processing. Webhook event identifiers and/or provider transaction references must be checked against the database within a transactional and concurrent-safe boundary to safely drop duplicate events.
   - Provider callbacks must not be trusted solely because they were received.

3. **Provider Verification**:
   - Webhook endpoints must mathematically verify provider signatures (e.g., HMAC-SHA512) before processing.
   - Upon receiving a webhook or callback, the system must validate the actual transaction amount, currency, status, and applicable tenant/order association against the internal ledger *before* transitioning a payment record to `VERIFIED`.

---

# 18. Bank Reconciliation

The financial ledger must be correct before bank reconciliation is implemented.

Future reconciliation may support:

```text
Bank Transaction
       ↓
Import / API
       ↓
Matching
       ↓
Review
       ↓
Confirm
       ↓
Ledger Payment
```

Bank import/API integration is an integration layer over the core ledger.

It must not replace the ledger.

---

# 19. Payment Allocation

Payments and invoices are separate concepts.

A payment should be allocated to charges.

Example:

```text
Payment = GHS 1,000

Tuition        → 600
Books          → 200
Transport      → 200
```

Allocation history must be auditable.

Changing an allocation must not destroy the historical transaction.

---

# 20. Reversals and Refunds

Payments must not simply be deleted.

Instead:

```text
Original Payment
      ↓
Reversal / Refund
      ↓
Correct Financial State
```

The original transaction remains visible.

A reversal/refund must include:

- actor
- timestamp
- reason
- amount
- reference
- related transaction

---

# 21. Receipts

Receipts should be generated from authoritative payment records.

A receipt should include appropriate:

- school identity
- receipt number
- student/payer
- date
- payment amount
- payment method
- reference
- allocation information
- remaining balance where appropriate

Receipt numbers must be unique according to school policy.

---

# 22. Arrears

The system should identify:

- current balance
- overdue balance
- prior-term arrears
- aging where configured

Arrears must be derived from charges and allocations.

Do not store an independent arrears number that can drift.

---

# 23. Student Statement

A student's financial statement should provide:

- opening balance where applicable
- charges
- payments
- allocations
- discounts
- waivers
- credits
- reversals
- refunds
- current balance
- outstanding amount
- overdue amount

Parents and authorized finance users should have appropriate access.

---

# 24. Class Financial Summary

Class summaries should be derived from student accounts.

Example metrics:

- number of students
- total billed
- total paid
- total outstanding
- collection rate
- overdue amount
- credits

Users must be able to drill down:

```text
Class
  ↓
Student
  ↓
Financial Statement
```

---

# 25. School Financial Dashboard

School-level reporting may include:

- total billed
- total collected
- outstanding
- overdue
- credits
- collection rate
- revenue by category
- payments by method
- payments by date
- class collection rates
- term comparison
- academic-year comparison

All figures must be derived from authoritative financial records.

---

# 26. Academic Reports and Finance

Finance should not automatically block academic report publication because a student has unpaid fees.

A school may configure financial-policy behavior where appropriate.

Academic reporting and financial collection are separate domains.

---

# 27. Financial Auditability

Audit:

- charge creation
- invoice creation
- adjustment
- discount
- waiver
- scholarship
- payment claim
- proof upload
- payment verification
- payment rejection
- payment allocation
- allocation change
- reversal
- refund
- receipt generation
- credit application

Audit should capture:

- actor
- tenant
- student
- transaction
- timestamp
- action
- previous state
- new state
- reason/reference

---

# 28. Immutability Principle

Financial history must be reconstructable.

Do not silently:

- delete payments
- rewrite payment history
- alter historical charges without trace
- change a receipt without version/history
- overwrite reconciliation decisions

Corrections should create traceable financial events.

---

# 29. Tenant Isolation

Every school-owned financial record must be tenant-scoped.

Tenant identity comes from server-side authenticated context.

Never trust client-supplied school identifiers.

Financial IDOR and cross-tenant access tests are mandatory.

---

# 30. Monetary Calculations

Use decimal-safe arithmetic.

Java implementations should use `BigDecimal`.

Do not use floating-point arithmetic for authoritative monetary calculations.

Currency must be explicit.

For the Ghana reference configuration:

```text
Currency = GHS
```

but currency should remain configurable at the appropriate school/platform level.

---

# 31. Database Principles

Use:

- foreign keys
- NOT NULL
- unique constraints
- check constraints
- tenant-scoped uniqueness
- appropriate indexes
- transaction boundaries
- idempotency keys/references where appropriate

Never rewrite an applied Flyway migration.

---

# 32. Frontend Principles

Finance interfaces should support:

- student account search
- invoice/charge views
- payment recording
- payment verification
- payment claims
- proof review
- allocation
- receipts
- statements
- filters
- date ranges
- payment methods
- class summaries
- school summaries

Every data view must support appropriate loading, empty, filtered-empty, error, forbidden and populated states.

---

# 33. Parent Finance Experience

Parents should be able to:

- view charges
- view outstanding balance
- view payment history
- view receipts
- submit payment claims where supported
- upload bank proof where supported
- initiate online payment where supported
- see payment status

Parents must never be able to modify authoritative financial records directly.

---

# 34. Recurring Billing

Recurring billing should generate charges according to school billing configuration.

Examples:

```text
Monthly:
September → October → November

Termly:
Term 1 → Term 2 → Term 3
```

Recurring billing must be idempotent.

The same billing period must not generate duplicate charges.

---

# 35. Testing Requirements

Finance requires tests for:

- tenant isolation
- authorization
- charge creation
- billing schedules
- duplicate billing prevention
- partial payments
- allocation
- overpayment
- credits
- discounts
- waivers
- arrears
- reversals
- refunds
- receipts
- Paystack webhook idempotency
- payment verification
- bank proof workflow
- historical integrity
- audit logging
- monetary precision

---

# 36. Definition of Done

Finance is production-ready when the authoritative ledger correctly supports:

- billing
- charges
- invoices
- monthly/termly configuration
- partial payments
- allocations
- credits
- discounts
- waivers
- arrears
- payment claims
- verification
- receipts
- reversals
- refunds
- student statements
- class summaries
- school summaries
- audit history
- tenant isolation
- authorization
- backend-authoritative calculations
- idempotency
- production frontend workflows

---

# 37. Core Principle

> Finance records what the school is owed, what has been received, how money was allocated, and how corrections occurred. Every balance and report must be derived from that authoritative history.

Finance is a ledger and receivables domain, not a collection of disconnected payment screens.

---

# 38. Financial Adjustment Integrity and Legacy Duplicate Reversals

## Accounting Invariant

A duplicate or otherwise invalid reversal must never create an additional financial benefit for a student, reduce a charge balance twice, or distort a statement. A valid reversal must continue to reverse the intended original adjustment exactly once. Historical financial records must remain auditable.

## Treatment of Legacy Duplicate Records

Due to a historical concurrency defect in Task 028, duplicate reversal records were persisted in early environments. Migration V22 resolves the database constraints by detaching duplicates (nullifying their `original_adjustment_id`) rather than destroying financial history.

To ensure robust database-level integrity going forward, migration V23 introduces an explicit `is_legacy_duplicate` marker and enforces a strict `CHECK` constraint: `CHECK (type <> 'REVERSAL' OR original_adjustment_id IS NOT NULL OR is_legacy_duplicate = TRUE)`. This ensures that all newly created valid reversals must reference an original adjustment, while safely accommodating the retained legacy duplicates.

## Correction Selected

To preserve history while ensuring accurate balance calculations, the application layer dynamically excludes `REVERSAL` adjustments that have `is_legacy_duplicate = TRUE`. This guarantees these orphaned duplicates remain in the database for auditing but exert no financial effect on the ledger.

## Migration History Considerations

Migration V22 was determined to have not yet reached production or shared environments, as it remained uncommitted. However, it may exist in local developer databases. Since the application logic now safely ignores these orphaned records via the `is_legacy_duplicate` flag, V22 requires no further correction, and historical databases can safely retain the records without manual reconciliation.

## Evidence

Regression tests guarantee that legacy duplicates exert no financial impact, and concurrent duplicate-reversal attempts produce an HTTP 409 Conflict, preserving strict transactional consistency.
