# Karatu Authenticated Frontend Rules for Agents

## 0. Purpose

This document governs the authenticated Karatu application surfaces:

```text
apps/web/src/app/(auth)/**
apps/web/src/app/(portal)/**
```

The authenticated frontend is a **business application**, not a marketing website.

Its primary UX objectives are:

1. task completion
2. information clarity
3. predictable navigation
4. operational efficiency
5. accessibility
6. data integrity
7. appropriate information density
8. responsive behavior
9. clear system feedback
10. consistent interaction patterns

Load this document for every authenticated frontend task.

Also load:

```text
docs/frontend-design-system.md
```

whenever creating or changing UI.

---

# 1. Product UX Model

Karatu is a school-management SaaS.

The authenticated frontend must therefore behave like a coherent operating system for school administration rather than a collection of unrelated dashboards.

The UX should reflect:

```text
Context
  ↓
Task
  ↓
Data
  ↓
Decision
  ↓
Action
  ↓
Feedback
```

Users should always understand:

- where they are
- what school they are operating in
- what academic year/term they are working with
- what the current task is
- what data they are viewing
- what actions are available
- what happened after an action

---

# 2. Context Is Mandatory

Where applicable, authenticated screens must make relevant context visible.

Typical context:

```text
School
Academic Year
Term
Class / Section
Subject
Student
```

Do not make users repeatedly infer context from page content.

Example:

```text
Academic Year: 2026/2027
Term: Term 1

Grade 6
  └── Mathematics
       └── Assessments
```

Context should be represented through approved selectors, breadcrumbs, page headers, or contextual navigation.

Do not expose internal database IDs as user-facing context.

---

# 3. Before Writing Code

Before implementation:

### 3.1 Inspect existing architecture

Inspect:

- route structure
- existing page patterns
- component catalog
- design tokens
- API contracts
- query hooks
- mutation hooks
- permissions
- domain services
- existing tests

### 3.2 Search before creating

Search for an existing:

- component
- hook
- utility
- page pattern
- table pattern
- form pattern
- dialog
- empty state
- error state
- permission pattern

Reuse existing infrastructure wherever practical.

### 3.3 Verify the backend contract

Do not invent:

- endpoints
- HTTP methods
- request fields
- response fields
- permission keys
- enum values
- status values
- error codes

If the required backend contract does not exist, report the gap.

Do not silently create a frontend-only interpretation.

---

# 4. Page Architecture

Every application page should have a clear information hierarchy.

Standard structure:

```text
┌────────────────────────────────────────────────────┐
│ Global Application Header                           │
├───────────────┬────────────────────────────────────┤
│               │ Breadcrumb / Context                │
│ Sidebar       ├────────────────────────────────────┤
│ Navigation    │ Page Header                         │
│               │ Title                               │
│               │ Description                         │
│               │ Primary Actions                     │
│               ├────────────────────────────────────┤
│               │ Filters / Context / Tabs            │
│               ├────────────────────────────────────┤
│               │ Main Content                        │
│               │                                    │
│               │ Table / Cards / Form / Dashboard   │
│               │                                    │
│               └────────────────────────────────────┘
└────────────────────────────────────────────────────┘
```

Use the existing `PageContainer` and `PageHeader` components.

Do not create a new page-shell architecture for an individual feature.

---

# 5. Page Header

A page header should answer:

```text
Where am I?
What is this page for?
What can I do here?
```

Recommended structure:

```text
Breadcrumb
   ↓
Page Title
   ↓
Supporting description
   ↓
Primary action
```

Secondary actions may be placed beside the primary action where appropriate.

Do not force unrelated actions into the page header.

A page may legitimately have:

- one primary action
- several secondary actions

The hierarchy must remain visually obvious.

---

# 6. Dashboard Design

Dashboards should support decisions rather than merely display statistics.

Preferred hierarchy:

```text
Page Header
     ↓
Context
     ↓
Important KPI / Status Summary
     ↓
Priority Actions / Alerts
     ↓
Operational Data
     ↓
Trends / Secondary Information
```

Do not create dashboards composed entirely of decorative statistic cards.

Every dashboard element should answer a useful operational question.

Examples:

- What needs attention?
- What changed?
- What is overdue?
- What requires approval?
- What requires intervention?

---

# 7. Data-Dense Interfaces

School management systems frequently contain large datasets.

Use:

- tables
- filters
- search
- pagination
- sorting
- bulk actions
- contextual actions
- detail views

appropriately.

Do not force all information into cards.

---

# 8. Tables

Every `DataTable` must define an intentional mobile strategy.

Possible strategies:

```text
Desktop table
       ↓
Responsive table
       OR
Priority columns + horizontal scrolling
       OR
Card/list representation
       OR
Detail drawer/page
```

Do not allow tables to create uncontrolled horizontal overflow.

For lists that may exceed approximately 50 records, use server-side:

- pagination
- sorting
- filtering

List state should be represented in the URL where appropriate so that:

- refresh preserves state
- links are shareable
- browser navigation works
- state is recoverable

---

# 9. Forms

Forms should follow:

```text
Context
   ↓
Section
   ↓
Fields
   ↓
Validation
   ↓
Review
   ↓
Submit
   ↓
Confirmation
```

Forms should:

- group related fields
- use clear labels
- explain unusual requirements
- preserve user input after recoverable failures
- validate at the appropriate level
- provide actionable errors
- prevent accidental duplicate submissions

Do not create extremely long undifferentiated forms.

For large forms, use:

- sections
- progressive disclosure
- steps
- tabs
- or separate workflow stages

when justified by the domain.

---

# 10. Forms and Responsive Layout

Desktop:

```text
┌──────────────────────────────────────────┐
│ Student Information                      │
│                                          │
│ First Name          Last Name             │
│ [___________]       [___________]        │
│                                          │
│ Date of Birth       Gender                │
│ [___________]       [___________]        │
└──────────────────────────────────────────┘
```

Mobile:

```text
┌────────────────────────────┐
│ Student Information        │
│                            │
│ First Name                 │
│ [______________________]   │
│                            │
│ Last Name                  │
│ [______________________]   │
│                            │
│ Date of Birth              │
│ [______________________]   │
└────────────────────────────┘
```

Do not maintain two-column forms on narrow screens simply to preserve desktop structure.

---

# 11. Destructive Actions

Every destructive action must require deliberate confirmation.

Use `ConfirmDialog` according to the design-system destructive-action levels.

Examples:

- delete
- permanently remove
- reject
- revoke
- reverse
- refund
- publish irreversible data
- close an academic period

Where an action is reversible, communicate that clearly.

Where an action changes historical records, explain the consequence before confirmation.

---

# 12. Workflow States

Business workflows must have explicit state transitions.

Examples:

```text
DRAFT
  ↓
SUBMITTED
  ↓
REVIEWED
  ↓
APPROVED
  ↓
PUBLISHED
  ↓
LOCKED
```

The UI must reflect the actual backend state.

Do not create frontend-only states that have no domain meaning.

Buttons should communicate:

- current state
- available next action
- unavailable action
- reason when appropriate

---

# 13. Loading, Empty, Error and Permission States

Every data view must intentionally handle:

```text
Loading
Empty
Filtered Empty
Error
Forbidden
Not Found
Populated
```

Where useful, also handle:

```text
Saving
Submitting
Processing
Success
Partial Success
Conflict
Offline / Network Failure
```

Never leave a blank content area without explanation.

---

# 14. Permissions and Authorization

Frontend permission checks are for UX.

They are not security boundaries.

The backend remains authoritative.

The frontend must correctly handle:

```text
401 Unauthorized
403 Forbidden
404 Not Found
409 Conflict
422 Validation Error
5xx Server Error
```

Controls should be:

- hidden when the role can never use them
- disabled when the action is valid for the role but blocked by current state

When disabled because of state, provide a useful explanation where appropriate.

Never expose controls merely because the user can manipulate the UI.

---

# 15. Data and API Rules

Server data must use TanStack Query.

Do not call `fetch` directly from presentation components.

Use appropriate:

- query hooks
- mutation hooks
- cache invalidation
- optimistic updates only where safe
- retry behavior
- stale-time policies

Every mutation must explicitly define affected query invalidation.

---

# 16. Validation

Every API response used by the frontend should be validated at the application boundary using the project's schema-validation strategy.

Use Zod where required by the architecture.

Do not duplicate backend business rules unnecessarily.

The frontend may provide early validation for UX, but the backend remains authoritative.

---

# 17. Numbers, Money and Dates

Money must be represented safely.

Do not perform monetary arithmetic using JavaScript floating-point numbers.

Money received from the API should remain a decimal-safe representation, such as a decimal string, until deliberately formatted for display.

Use:

```text
lib/format
```

for:

- currency
- dates
- numbers
- percentages
- durations

Do not create local formatting implementations unless there is a documented reason.

---

# 18. Identifiers

Users should not be required to type internal database IDs.

Prefer:

- Select
- EntityCombobox
- searchable entity selector
- human-readable reference

Do not expose UUIDs as primary UI labels unless the identifier is intentionally part of the business workflow.

---

# 19. Notifications and Feedback

Use consistent feedback.

Success:

```text
Action completed.
```

Validation:

```text
Correct the highlighted fields.
```

Failure:

```text
We couldn't complete this action. Please try again.
```

Do not expose raw backend response messages directly to users.

Where useful, provide enough context for the user to recover.

---

# 20. Navigation

Navigation must reflect the user's mental model.

Prefer grouping by operational domain rather than technical implementation.

For example:

```text
Dashboard

Academic
  Academic Years
  Terms
  Classes
  Subjects
  Timetable
  Attendance
  Assessments
  Results

Students
  Students
  Admissions
  Enrollments

Finance
  Fees
  Billing
  Payments
  Statements

Reports
  Academic Reports
  Financial Reports

Administration
  Users
  Roles
  School Settings
```

Do not create navigation entries for internal technical concepts.

Navigation should be role-aware.

---

# 21. Responsive Application Shell

Desktop:

```text
┌─────────────────────────────────────────────────────┐
│ Logo │ Context │ Search │ Notifications │ Profile  │
├──────────────┬──────────────────────────────────────┤
│              │                                      │
│ Sidebar      │ Main content                         │
│              │                                      │
│              │                                      │
└──────────────┴──────────────────────────────────────┘
```

Tablet:

```text
┌────────────────────────────────────────────┐
│ Header / Compact navigation               │
├────────────────────────────────────────────┤
│                                            │
│ Main content                               │
│                                            │
└────────────────────────────────────────────┘
```

Mobile:

```text
┌────────────────────────────┐
│ Menu │ Page │ Actions      │
├────────────────────────────┤
│                            │
│ Main content               │
│                            │
├────────────────────────────┤
│ Contextual navigation      │
└────────────────────────────┘
```

The exact implementation must follow the existing design system.

Do not invent a second mobile navigation system.

---

# 22. Accessibility

Target:

**WCAG 2.2 AA**

All authenticated interfaces must support:

- keyboard navigation
- visible focus
- semantic HTML
- accessible names
- appropriate ARIA only where needed
- sufficient contrast
- correct heading hierarchy
- accessible dialogs
- accessible form errors
- accessible tables
- screen-reader-compatible status changes

Do not use color as the only indicator of:

- status
- errors
- success
- warnings
- permissions

Use icon + text or another non-color indicator.

---

# 23. Visual Design

Use design-system tokens only.

Do not introduce:

- arbitrary colors
- arbitrary spacing
- arbitrary radii
- arbitrary shadows
- gradients
- blur
- glow effects
- custom typography

Do not use Tailwind palette classes directly when a semantic token exists.

`StatusBadge` must remain visually flat and must not use gradients or glow.

---

# 24. Interaction Design

Interactive elements must communicate state.

For mutations:

```text
Idle
 ↓
Pending
 ↓
Success
```

or:

```text
Idle
 ↓
Pending
 ↓
Error
 ↓
Retry
```

During pending state:

- prevent duplicate submission
- communicate progress
- preserve context

Examples:

```text
Save
→ Saving...

Submit
→ Submitting...

Approve
→ Approving...
```

Do not silently disable a button without communicating why.

---

# 25. Search, Filters and Bulk Operations

Search should be used when users need to locate known entities.

Filters should be used when users need to narrow a dataset.

Bulk actions should be used when users repeatedly perform the same operation across records.

Do not combine excessive filters into the initial screen.

Prefer:

```text
Search
+
Common Filters
+
Advanced Filters
```

where the domain requires many filtering dimensions.

Bulk destructive actions require explicit confirmation and clear affected-record counts.

---

# 26. Error Boundaries and Observability

Every routed application page must be protected by the project's error-boundary strategy.

A rendering failure should produce an intentional error state rather than a blank page.

Use:

```text
ErrorState
+
Reload / Retry
```

Sentry or other observability systems must not receive unnecessary personal or sensitive data.

Never log:

- passwords
- access tokens
- refresh tokens
- payment credentials
- sensitive student information

---

# 27. State Management

Use TanStack Query for server state.

Use local React state for local UI state.

Use Zustand only when state genuinely needs to be shared across components/routes and cannot reasonably be represented by:

- URL state
- server state
- React state
- existing application context

Adding a new Zustand store requires an architecture decision.

Do not create global state merely for convenience.

---

# 28. Dependencies and Shared Infrastructure

Do not add runtime dependencies without architectural review.

Do not modify:

```text
components/ui
components/shared
theme
```

for an isolated feature unless the change is genuinely a shared-system improvement.

When a shared component needs improvement:

1. identify the affected consumers
2. verify backward compatibility
3. update the design system if necessary
4. test existing usage
5. document the change

---

# 29. Backend Boundary

The frontend must not become a second business-logic engine.

The backend owns:

- authorization
- tenant isolation
- financial calculations
- grading calculations
- workflow transitions
- validation of authoritative business rules
- audit decisions
- data integrity

The frontend owns:

- presentation
- interaction
- client-side convenience validation
- navigation
- state presentation
- user feedback

Where the frontend and backend disagree, the backend contract is authoritative.

---

# 30. Historical and Published Data

Published academic, financial, or official records must be treated as historical business data.

The UI must not provide casual editing paths that can silently rewrite historical records.

For corrections, the interface should use the domain's approved correction/version/reversal workflow.

Examples:

```text
Published Result
      ↓
Correction Request
      ↓
Authorized Review
      ↓
Corrected Version
```

and:

```text
Payment
      ↓
Reversal / Refund
      ↓
Corrected Financial State
```

Do not implement destructive mutation where the domain requires an auditable correction.

---

# 31. Security Rules

Never:

- store authentication tokens in web storage
- expose secrets
- trust client-side authorization
- use `dangerouslySetInnerHTML` without approved sanitization
- expose tenant identifiers as authorization mechanisms
- assume a hidden button provides security
- log sensitive information

All tenant authorization is enforced server-side.

---

# 32. Design-System Precedence

When rules conflict, use this precedence:

```text
1. Security requirements
2. Accessibility requirements
3. Backend/API contract
4. Domain source-of-truth documents
5. Architecture decision records
6. Design system
7. Shared components/pattern registry
8. Feature-specific UX requirements
9. Implementation convenience
```

If a conflict cannot be resolved safely, stop and report it.

Do not silently choose an architecture.

---

# 33. Never Without a Decision Record

The following require explicit review:

- new runtime dependency
- new global state store
- new navigation architecture
- new page-shell architecture
- changes to design-system tokens
- changes to shared UI primitives
- new authentication behavior
- new authorization model
- new API assumptions
- new domain state
- changes to published/historical data behavior
- adding a page to a special-width layout group

---

# 34. Required Verification

Before completing a frontend implementation, run:

```text
lint
typecheck
test
test:e2e
build
```

For every changed UI surface verify:

### Responsive

```text
320px
375px
768px
1024px
1280px
1440px
```

### Functional

- loading state
- empty state
- filtered-empty state
- error state
- forbidden state
- not-found state
- populated state
- mutation pending state
- mutation success state
- mutation failure state

### Accessibility

- keyboard navigation
- visible focus
- labels
- headings
- dialogs
- forms
- tables
- status announcements where required

### Quality

- no horizontal overflow
- no console errors
- no new console warnings
- no broken navigation
- no dead buttons
- no fake success states
- no placeholder production UI
- no invented backend contracts

For changed pages, automated accessibility testing should report zero serious/critical violations.

---

# 35. Completion Report

Every frontend task must conclude with:

1. Files changed
2. Routes/pages changed
3. Components reused
4. New components created
5. Design-system rules checked
6. Domain/API contracts used
7. Permission behavior checked
8. Responsive breakpoints checked
9. Accessibility checks
10. Tests
11. Build result
12. New dependencies, if any
13. Conflicts found
14. Missing backend contracts
15. Known limitations
16. Registry/pattern documentation updates, where applicable

The completion report must distinguish:

```text
Implemented
Verified
Blocked
Deferred
```

Do not claim a feature is complete when only its visual layer has been implemented.
