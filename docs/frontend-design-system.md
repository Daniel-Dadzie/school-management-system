# CarePoint School Management System

# Frontend Design System

**Document:** `docs/frontend-design-system.md`
**Applies to:** `apps/web`
**Status:** Active
**Purpose:** Frontend visual, UX, layout, interaction, accessibility, and component standards.

---

## 1. Purpose

This document is the source of truth for frontend design and user experience decisions in the CarePoint School Management System.

All frontend pages, components, dashboards, forms, tables, dialogs, navigation, and workflows must follow these standards unless a documented design decision explicitly changes them.

The system is an operational school-management application. The interface must prioritize:

* Clarity
* Trust
* Efficiency
* Accessibility
* Consistency
* Information density
* Responsive usability
* Role-appropriate workflows

The design should feel like a professional education-management SaaS platform rather than a marketing website.

Avoid unnecessary visual decoration that competes with operational tasks.

---

# 2. Design Philosophy

### 2.1 Professional and trustworthy

The interface should communicate reliability and control because the system handles:

* Student records
* Academic results
* Attendance
* Admissions
* Teacher assignments
* Financial information
* Parent information
* Administrative actions

### 2.2 Task-oriented

Users should be able to complete common tasks with minimal navigation.

Prioritize:

* Clear primary actions
* Contextual actions
* Useful defaults
* Search and filtering
* Visible system status
* Clear confirmation and feedback

### 2.3 Information-efficient

School administrators and teachers may work with large datasets.

Prefer:

* Structured tables
* Compact but readable forms
* Clear hierarchy
* Useful filtering
* Appropriate pagination
* Consistent status indicators

Avoid unnecessary large cards and excessive whitespace when they reduce operational efficiency.

### 2.4 Consistent

Similar actions must behave and look the same throughout the application.

For example:

* All destructive actions use the same confirmation pattern.
* All loading states follow the same skeleton conventions.
* All validation errors follow the same structure.
* All status badges use consistent semantic meanings.

---

## 3. Visual Identity

The following palette defines the default CarePoint theme.

These colors establish the initial visual identity and design-system defaults. They must not be treated as permanently hard-coded application colors.

Frontend components must consume semantic theme tokens/CSS variables rather than depending directly on specific hexadecimal brand colors.

This allows authorized administrators to configure supported school branding through the application's Settings interface without requiring frontend source-code changes.

Semantic status colors such as success, warning, error/destructive, and informational remain system-defined and independent of school branding.

## 3.1 Primary palette

| Token           | Value     | Usage                                             |
| --------------- | --------- | ------------------------------------------------- |
| `primary`       | `#1B3A6B` | Primary navigation, primary actions, important UI |
| `primary-hover` | `#153057` | Hover/active state for primary elements           |
| `accent`        | `#2E5FA3` | Secondary emphasis and interactive elements       |
| `accent-light`  | `#4A90D9` | Supporting emphasis and selected states           |

## 3.2 Neutral palette

| Token            | Value     | Usage                            |
| ---------------- | --------- | -------------------------------- |
| `background`     | `#F8FAFC` | Application background           |
| `surface`        | `#FFFFFF` | Cards, panels, dialogs, forms    |
| `border`         | `#E2E8F0` | Borders and dividers             |
| `text-primary`   | `#0F172A` | Main text                        |
| `text-secondary` | `#475569` | Secondary text                   |
| `text-muted`     | `#64748B` | Supporting and muted information |

## 3.3 Semantic colors

| Token     | Value     | Usage                                     |
| --------- | --------- | ----------------------------------------- |
| `success` | `#16A34A` | Successful operations and positive status |
| `warning` | `#D97706` | Warnings and attention-required states    |
| `error`   | `#DC2626` | Errors and destructive states             |
| `info`    | `#2563EB` | Informational states                      |

Semantic colors must not be the only way important information is communicated. Pair them with text, icons, or status labels.

---

## 4. Runtime School Branding

The system must support configurable school branding without requiring frontend source-code changes.

The default CarePoint theme is the initial visual identity. It is not a permanent hard-coded color scheme.

### Branding Configuration

Authorized administrators should be able to configure supported school-branding settings from the Settings interface.

The initial supported configuration should include:

* School logo
* Primary brand color
* Secondary/accent brand color
* Reset to default theme

Where practical, the Settings interface should provide a live or near-live preview of branding changes before the administrator saves them.

### Theme Tokens

Frontend components must consume semantic theme tokens rather than directly depending on a specific school's hexadecimal colors.

Examples include:

```text
--primary
--primary-foreground
--accent
--accent-foreground
--background
--foreground
--card
--card-foreground
--border
--muted
--muted-foreground
```

Components should express visual intent through semantic tokens such as:

```text
primary action
muted surface
border
destructive action
```

rather than repeatedly embedding specific hexadecimal values.

### Backend Authority

Branding configuration is application configuration and must be stored and retrieved through the backend.

The recommended flow is:

```text
Administrator
    ↓
Settings → School Branding
    ↓
Spring Boot API
    ↓
Persisted School Configuration
    ↓
Frontend loads branding configuration
    ↓
Theme Provider / CSS Variables
    ↓
Application UI
```

The frontend may cache branding configuration for performance, but the backend remains authoritative.

Local storage must not be treated as the authoritative source of school branding.

### Color Validation

Configured brand colors must be validated before being accepted.

The system should:

* Accept only supported color formats.
* Reject malformed color values.
* Check appropriate foreground/background contrast.
* Prevent branding choices from making essential controls unreadable.
* Preserve accessible focus states.
* Preserve sufficient text contrast.

If a selected color creates an accessibility problem, the system should reject it or require a safer alternative.

### Semantic Status Colors

School branding must not redefine semantic status colors.

The following meanings remain system-defined:

* Success
* Warning
* Error/Destructive
* Informational

Brand colors communicate school identity.

Semantic colors communicate system state.

For example, changing the school's primary color to green must not cause every success indicator to become indistinguishable from the school's primary brand color.

### Security Boundary

Branding configuration is presentation configuration only.

Branding settings must never modify:

* User roles
* Permissions
* Authorization rules
* Academic rules
* Grading rules
* Payment rules
* Promotion rules
* Audit requirements
* API security
* Database security
* Business logic

Changing a school's visual branding must never change what a user is authorized to do.

### Multi-School Consideration

If the system is later expanded into a multi-school SaaS platform, branding configuration should become school/tenant scoped.

For the current CarePoint MVP, do not introduce full multi-tenancy solely to support configurable branding.

The current implementation should remain simple while keeping the configuration model extensible enough for future school-specific branding.

### Implementation Rule

All new frontend components must use the semantic design tokens defined by the application theme.

Do not introduce component-specific hard-coded brand colors such as:

```text
#1B3A6B
#2E5FA3
#4A90D9
```

unless the value is intentionally part of a documented fixed design-system token.

The default theme belongs in the application's theme configuration, not repeatedly inside individual components.

# 5. Typography

Use **Inter** as the primary interface typeface.

Recommended hierarchy:

| Element         |    Size |
| --------------- | ------: |
| Page title      | 24–32px |
| Section heading | 18–22px |
| Body text       | 14–16px |
| Table text      | 13–14px |
| Labels          | 12–14px |
| Supporting text | 12–14px |

Typography should emphasize hierarchy rather than excessive font-size variation.

Use readable line heights and avoid overly condensed text.

---

# 6. Spacing

Use the application's established Tailwind/shadcn spacing tokens consistently.

Prefer predictable spacing between:

* Page sections
* Form fields
* Table controls
* Cards
* Dialog content
* Navigation items

Do not introduce arbitrary spacing values when an existing spacing token provides the required result.

---

# 7. Border Radius and Elevation

Use restrained rounding.

Recommended approach:

* Inputs: small to medium radius
* Buttons: consistent medium radius
* Cards: medium radius
* Dialogs: medium to large radius
* Badges: pill or compact radius

Prefer subtle borders and surface contrast over heavy shadows.

Avoid excessive:

* Drop shadows
* Floating cards
* Glassmorphism
* Neumorphism
* Decorative gradients

---

# 8. Layout and Information Architecture

## 8.1 Application shell

Desktop layout should use:

```text
┌───────────────────────────────────────────────┐
│ Top Header                                    │
├──────────────┬────────────────────────────────┤
│ Sidebar      │ Main Content                   │
│ Navigation   │                                │
│              │                                │
│              │                                │
└──────────────┴────────────────────────────────┘
```

Use:

* Persistent/collapsible sidebar on desktop
* Sticky top header
* Main content area
* Responsive navigation drawer on smaller screens

## 8.2 Sidebar

The sidebar should contain role-appropriate navigation.

Navigation must not expose options that the current user cannot reasonably access.

The sidebar should support:

* Active route indication
* Collapsed state
* Grouped navigation
* Clear icons
* Tooltips when collapsed

## 8.3 Top header

The top header should contain contextual information such as:

* Breadcrumbs
* Page title when appropriate
* Page-level actions
* Notifications
* User/profile controls

Examples of page actions:

* New Student
* New Class
* Create Assessment
* Export
* Approve
* Generate Report

## 8.4 Content width

Primary content should normally use a readable maximum width such as:

`max-w-7xl`

Pages that legitimately require wider data tables may exceed the normal readable width only when necessary.

---

# 9. Page Structure

Pages should generally follow:

```text
Page Header
├── Breadcrumb
├── Page Title
├── Description / Context
└── Primary Actions

Filters / Search

Main Content
├── Table / Cards / Form
└── Supporting Information
```

Primary actions should be visually distinct from secondary actions.

Avoid presenting multiple competing primary actions.

---

# 10. Cards and Dashboard Metrics

Cards should group related information rather than simply decorate the page.

Use cards for:

* Summary metrics
* Related information
* Filters
* Important status information
* Focused workflow sections

Use subtle:

* Borders
* Surface contrast
* Radius

Avoid excessive card nesting.

Dashboard metric cards should communicate:

* Metric name
* Current value
* Relevant context
* Optional trend/change indicator

---

# 11. Data Tables

Tables are a primary operational interface.

## 11.1 Scanability

* Left-align names and alphanumeric text.
* Right-align numbers and monetary values where appropriate.
* Right-align dates when this improves scanability.
* Vertically center status badges.
* Keep column headings clear and concise.
* Maintain consistent column ordering.

## 11.2 Table features

When appropriate, tables should support:

* Search
* Filtering
* Sorting
* Pagination
* Loading state
* Empty state
* Error state
* Row actions

Do not add unnecessary table features when the dataset is small.

## 11.3 Long content

Long notes, identifiers, or other fields should not destroy table layout.

Use:

* Truncation
* Tooltips
* Detail views

when appropriate.

Never hide important information without providing a way to inspect it.

## 11.4 Row actions

Operational actions should be available from the relevant row when appropriate.

Examples:

* View
* Edit
* Approve
* Reject
* Deactivate
* Assign
* Generate

Users should not always be forced to open a separate detail page simply to perform a common operational action.

---

# 12. Destructive Actions

Destructive or irreversible actions must be deliberate.

Examples:

* Reject application
* Deactivate user
* Delete record
* Withdraw enrollment
* Cancel operation

Use an explicit confirmation dialog.

The dialog should clearly communicate:

1. What will happen
2. Which entity is affected
3. Whether the action is reversible
4. The consequences where relevant
5. The confirmation action

For important administrative operations, allow or require a reason note when appropriate.

Never make destructive actions indistinguishable from ordinary navigation actions.

---

# 13. Forms

Forms must be designed for efficient data entry.

## 13.1 Labels

Every field must have a clear, persistent label.

Do not rely on placeholder text as the only field label.

## 13.2 Validation

Use schema-based validation where appropriate.

Client-side validation should provide early feedback, commonly on:

* `onBlur`
* Field interaction
* Submission

Validation messages must be:

* Concise
* Specific
* Positioned near the invalid field
* Understandable to non-technical users

Example:

> Email address is required.

Avoid:

> Invalid input.

## 13.3 Server validation

Client-side validation does not replace backend validation.

The backend remains authoritative for:

* Business rules
* Authorization
* Data integrity
* Uniqueness
* State transitions

Display backend validation errors clearly when returned by the API.

## 13.4 Foreign relationships

Do not require users to manually enter database IDs.

Use purpose-built selectors such as:

* Searchable comboboxes
* Typed selects
* Autocomplete fields

Examples:

* Teacher → Subject
* Student → Class
* Class → Academic Year
* Class → Term

## 13.5 Submit behavior

Prevent unnecessary submissions when no changes have been made.

During an active mutation:

* Disable duplicate submission.
* Show a loading indicator.
* Use a descriptive action label.

Examples:

* `Saving...`
* `Approving...`
* `Submitting...`
* `Generating...`

Do not allow users to accidentally trigger duplicate mutations.

---

# 14. Interface States

Every dynamic view must explicitly handle four states:

## 14.1 Loading

Use meaningful skeleton loaders that approximate the final layout.

Avoid blank white screens whenever data is being loaded.

## 14.2 Empty

Explain what is missing and why it matters.

Where the user's role permits creation, provide an appropriate next action such as:

* Create Student
* Create Assessment
* Add Subject

Do not show creation actions to users who are not authorized to create the resource.

## 14.3 Error

Show a clear error state.

Where retrying is meaningful, provide:

**Retry**

Do not expose:

* Stack traces
* Database errors
* Internal implementation details
* Secrets
* Sensitive identifiers

## 14.4 Populated

The populated state should provide the complete operational interface appropriate to the user's role.

---

# 15. Toast Notifications

Use contextual toast notifications for asynchronous operations.

Successful notifications should identify the affected entity where useful.

Examples:

* `Application for Kwesi Appiah approved.`
* `Assessment created successfully.`
* `Attendance saved successfully.`

Avoid vague notifications such as:

> Success!

For authorization, conflict, or important backend errors:

* Use clear persistent or non-auto-dismissing error feedback where appropriate.
* Explain what the user can do next.
* Never expose raw backend exception messages.

Toast notifications must not replace important inline validation or page-level error states.

---

# 16. Responsive Design

The application must work across:

* Mobile: 320–767px
* Tablet: 768–1023px
* Desktop: 1024px+

Important test widths:

* 320px
* 375px
* 768px
* 1024px
* 1280px
* 1440px

Responsive design is not simply shrinking the desktop interface.

## Mobile

Use:

* Navigation drawer
* Stacked layouts
* Full-width controls
* Touch-friendly actions
* Appropriate table adaptations

Tables may use:

* Controlled horizontal scrolling
* Responsive card/list representations
* Prioritized columns

Do not allow accidental page-wide horizontal overflow.

---

# 17. Accessibility

Frontend interfaces must follow accessible web practices.

Requirements include:

* Semantic HTML
* Keyboard navigation
* Visible focus states
* Proper form labels
* Accessible dialogs
* Appropriate ARIA usage
* Sufficient color contrast
* Meaningful button labels
* Descriptive links
* Status information not communicated by color alone

Interactive controls must have adequate touch/click targets.

Do not use icons without accessible labels when the icon is the only control representation.

---

# 18. Icons

Use **Lucide** consistently for interface icons.

Icons should:

* Support comprehension
* Have consistent sizing
* Align with surrounding text
* Avoid unnecessary decoration

Do not introduce multiple icon libraries for the same interface.

---

# 19. Animation and Motion

Animation should communicate state or improve comprehension.

Appropriate uses include:

* Sidebar transitions
* Dialog appearance
* Loading indicators
* Toast appearance
* Small state transitions

Avoid:

* Excessive page animations
* Decorative motion
* Long transitions
* Motion that delays task completion

Respect reduced-motion preferences where appropriate.

---

# 20. Component Architecture

Use the existing shadcn/ui foundation and shared application components.

Reusable components should be created for repeated patterns such as:

* Buttons
* Inputs
* Selects
* Comboboxes
* Dialogs
* Tables
* Status badges
* Empty states
* Error states
* Loading skeletons
* Page headers
* Confirmations

Do not duplicate the same UI pattern across multiple pages when a shared component is appropriate.

Do not create abstractions prematurely for one-off components.

---

# 21. State Management

Use:

### TanStack Query

For:

* API/server state
* Queries
* Mutations
* Cache management
* Refetching
* Server synchronization

### Zustand

For appropriate client-side state such as:

* UI state
* Local workflow state
* Temporary gradebook drafts
* Persistent client preferences where justified

Do not use Zustand as a replacement for server-state management.

### React Hook Form + Zod

Use for complex forms where structured validation and controlled form state are beneficial.

---

# 22. API Integration

The frontend communicates with the Spring Boot API.

The frontend must:

* Use defined API contracts.
* Handle loading states.
* Handle API errors.
* Handle authorization failures.
* Handle validation errors.
* Avoid assuming successful mutations.
* Refresh or invalidate relevant cached data after mutations.

The frontend must never:

* Connect directly to PostgreSQL.
* Implement privileged database operations.
* Store backend secrets.
* Treat frontend authorization as security.
* Bypass backend validation.

---

# 23. Role-Specific UX

## Teacher

Prioritize:

* Today's classes
* Assigned classes
* Assigned subjects
* Attendance
* Assessments
* Gradebook
* Results

The teacher should not have to search through unrelated administrative functionality.

## Principal / Admin

Prioritize:

* Dashboard
* Students
* Teachers
* Admissions
* Academic structure
* Results
* Promotions
* Reports
* Fees and payments
* Incidents

## Parent / Guardian

Prioritize:

* Children
* Attendance
* Results
* Report cards
* Fees
* Notifications

Parents should only see information belonging to their linked students.

## Super Admin / IT

Prioritize:

* Users
* Roles
* System configuration
* Audit logs
* Security-related administration

---

# 24. Authorization-Aware UX

The frontend should adapt its interface according to authenticated user permissions.

For example:

* Hide unavailable actions where appropriate.
* Disable actions when a clear reason should be communicated.
* Prevent navigation to inaccessible areas where possible.
* Handle backend `401` and `403` responses gracefully.

However:

> Frontend authorization is a user-experience mechanism, not a security boundary.

The backend remains the authoritative enforcement point.

---

# 25. Operational Workflow Principles

Common workflows should minimize unnecessary navigation.

For example:

```text
Teacher Login
    ↓
Assigned Class
    ↓
Assigned Subject
    ↓
Assessment
    ↓
Gradebook
    ↓
Submit
    ↓
Grading
    ↓
Results
```

Actions should appear where users naturally need them.

Do not make users repeatedly navigate between unrelated screens to complete a single operational workflow.

---

# 26. Security-Sensitive UI

Because the system handles student and financial information:

Never display sensitive information unnecessarily.

Do not expose:

* Passwords
* Access tokens
* Refresh tokens
* Payment secrets
* Internal database identifiers when unnecessary
* Raw backend exceptions
* Sensitive audit information to unauthorized roles

Financial operations must display authoritative payment status returned by the backend.

---

# 27. Frontend Definition of Done

Frontend work is not complete until:

* [ ] Desktop layout works.
* [ ] Tablet layout works.
* [ ] Mobile layout works.
* [ ] No unintended horizontal overflow exists.
* [ ] Loading state exists where required.
* [ ] Empty state exists where required.
* [ ] Error state exists where required.
* [ ] Successful state is handled.
* [ ] Forms have appropriate validation.
* [ ] Mutation buttons prevent duplicate submissions.
* [ ] Destructive actions require confirmation.
* [ ] API errors are handled safely.
* [ ] Authorization-aware UI is implemented.
* [ ] Accessibility requirements are addressed.
* [ ] Shared components are reused where appropriate.
* [ ] No arbitrary design tokens were introduced.
* [ ] No unnecessary UI library was introduced.
* [ ] No secrets are exposed to the client.
* [ ] Browser console contains no unexplained errors.
* [ ] Production build succeeds.

---

# 28. Design Decision Rule

When implementing a new frontend feature, use this order of priority:

1. Existing application patterns
2. This design system
3. Existing shadcn/ui components
4. Established project design tokens
5. Accessibility and responsive requirements
6. The feature's specific UX requirements

Do not invent a new visual pattern when an existing pattern already solves the problem.

If a genuinely new pattern is required, implement it consistently and update this document when the pattern becomes part of the application's standard design language.
