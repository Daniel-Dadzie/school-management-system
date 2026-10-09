# Finance Implementation Readiness Assessment

## Objective
Assess the current state of the Karatu finance module against the authoritative product requirements defined in `docs/architecture/FINANCE_SOURCE_OF_TRUTH.md` and establish an evidence-based implementation plan.

## 1. Current State Assessment

### 1.1 Database Foundation (V15 Migration)
The base schema for finance has been created in `V15__create_finance_foundation.sql`. It includes the following tenant-scoped tables:
- `fee_categories`
- `invoices`
- `charges`
- `payments`
- `payment_allocations`
- `financial_adjustments` (Discounts, Waivers, Scholarships, Credits)
- `receipts`

**Status:** The schema is largely aligned with the source of truth, emphasizing the ledger model (Charges + Payments + Allocations + Adjustments).

### 1.2 Backend Service Implementation
The backend implementation (`FinanceController`, `FinanceServiceImpl`) currently provides a minimal, proof-of-concept subset of the required functionality:
- **Implemented:**
  - Individual invoice and charge creation.
  - Recording a verified payment.
  - Simple FIFO payment allocation to unpaid charges.
  - Fetching invoices and payments for a student.
- **Missing or Incomplete:**
  - **Overpayments & Credits:** If a payment amount exceeds the total unpaid charges, the remaining amount is currently discarded rather than stored as a credit.
  - **Financial Adjustments:** Discounts, waivers, and scholarships are not yet implemented or factored into balance calculations, despite the table existing.
  - **Receipt Generation:** Verified payments do not generate authoritative receipts in the `receipts` table.
  - **Student Statements:** There is no comprehensive ledger view (statement) showing a chronological history of all financial events.
  - **Reversals and Refunds:** No capability to reverse a payment or issue a refund.
  - **Payment Verification Workflows:** Payments are immediately marked as `VERIFIED`. There is no support for bank transfer claims (pending proof verification) or Paystack webhook integration.
  - **Recurring/Batch Billing:** No engine to generate termly or monthly bills for a class/school.
  - **Summaries:** Class and school financial summaries do not exist.
  - **Auditability:** Finance events are not currently audited.

### 1.3 Frontend Implementation
The frontend route for finance (`apps/web/src/app/(portal)/[tenantId]/finance`) does not exist yet. The UI for managing fees, recording payments, and viewing student statements remains to be built.

## 2. Implementation Plan

Based on the source of truth, the finance module must be implemented in controlled phases to ensure the integrity of the financial ledger.

### Phase 1: Core Ledger Integrity & Adjustments
**Goal:** Ensure the fundamental financial math is flawless and historically accurate.
1. Implement **Financial Adjustments**: Allow creation of discounts and waivers. Update invoice balance calculations to respect adjustments.
2. Implement **Overpayments (Credits)**: Modify the payment allocation logic to safely store excess payment amounts as credits in `financial_adjustments`, rather than losing the funds.
3. Implement **Receipt Generation**: Automatically generate a unique receipt in the `receipts` table upon successful payment allocation.
4. Implement **Student Statements**: Create a chronological ledger endpoint that aggregates charges, payments, allocations, and adjustments into a unified statement.

### Phase 2: Billing & Workflows
**Goal:** Support school operations for billing and collections.
1. Implement **Batch Billing**: Create a service to configure fee structures and bill entire classes/grades for a term.
2. Implement **Payment Reversals**: Add the ability to reverse a payment (creating a reversal transaction and un-allocating funds) without silently deleting history.
3. Implement **Payment Verification (Bank Transfers)**: Introduce a `PENDING` state for payments and a workflow for finance users to review proof of payment and verify it.

### Phase 3: Reporting & Integrations
**Goal:** Provide insights and external payment methods.
1. Implement **Financial Summaries**: Build class and school-level financial dashboards derived directly from student accounts.
2. Implement **Online Payments (Paystack)**: Integrate Paystack webhooks with idempotent processing to record online payments automatically.
3. Implement **Parent Portal Visibility**: Expose the student statement and payment history to the parent portal.

## 3. Recommendations & Invariants
- **Do not use floating-point math.** The current backend correctly uses `BigDecimal`. This must be strictly maintained.
- **Do not delete records.** Corrections must always be handled via reversals or adjustments to preserve auditability.
- **Tenant Isolation:** All queries must continue to enforce `school_id` derived from `TenantContext`.

## Conclusion
The current implementation provides a solid structural foundation but lacks the rigorous ledger logic and operational workflows required for production. Execution of the proposed phases will bridge the gap between the current state and the `FINANCE_SOURCE_OF_TRUTH.md`.
