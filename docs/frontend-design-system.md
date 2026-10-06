# Karatu SIS

# Frontend Design System, Version 3.0

**Document:** `docs/frontend-design-system.md`
**Applies to:** `apps/web/src/app/(auth)/**`, `apps/web/src/app/(portal)/**`, authenticated shared components, and authenticated feature surfaces.
**Public website:** `docs/frontend-design-system-public.md`
**Status:** Active
**Audience:** Engineers and AI coding agents
**Purpose:** The single source of truth for Karatu's authenticated frontend visual design, UX, layout, interaction, accessibility, responsive behavior, component standards, and presentation architecture.

---

# 0. Design System Contract

## 0.1 Scope

This document defines the visual and interaction system for the authenticated Karatu SaaS application.

It governs:

- application shell
- navigation
- page layout
- responsive behavior
- typography
- spacing
- color tokens
- school branding
- cards
- tables
- forms
- dialogs
- notifications
- status presentation
- dashboards
- workflows
- accessibility
- motion
- loading and error states
- frontend performance
- shared component boundaries
- presentation-level security rules

It does **not** define:

- backend business rules
- database schema
- tenant-isolation implementation
- academic calculation rules
- finance rules
- admissions business rules
- API authorization
- backend workflows
- product roadmap
- public marketing content

Those belong to the appropriate architecture and product source-of-truth documents.

---

## 0.2 Design principles

Karatu's authenticated interface MUST follow these principles:

1. **Clarity over decoration**
2. **Hierarchy over density**
3. **Consistency over novelty**
4. **Progressive disclosure over overwhelming screens**
5. **Task completion over visual spectacle**
6. **Accessible by default**
7. **Responsive by construction**
8. **Backend truth over frontend assumptions**
9. **Tenant-aware presentation**
10. **Stable patterns over one-off interfaces**
11. **Minimal cognitive load**
12. **Production quality over visual experimentation**

Karatu is a school operating system. The interface must feel dependable, structured, and calm.

---

# 1. Rule Language

The following words have fixed meanings.

- **MUST** — mandatory.
- **MUST NOT** — prohibited.
- **MAY** — explicitly optional.

There is no implicit "should".

If an exception is required, the exception MUST be documented.

---

## 1.1 Verification methods

| Code   | Meaning                                    |
| ------ | ------------------------------------------ |
| LINT   | Enforced by ESLint/typecheck               |
| UNIT   | Covered by Vitest                          |
| E2E    | Covered by Playwright                      |
| AXE    | Covered by automated accessibility testing |
| REVIEW | Requires human or agent review             |
| PERF   | Covered by performance testing             |

---

# 2. Source-of-Truth Precedence

When sources disagree, use this order:

1. Security requirements
2. Accessibility requirements
3. This design system
4. Approved shared components
5. Reference implementations
6. Feature requirements

Existing code does not override this document merely because it already exists.

If existing code violates this system, the implementation is wrong unless a documented decision record explicitly exempts it.

---

# 3. Core Visual Language

## 3.1 Visual character

Karatu authenticated interfaces MUST be:

- clean
- professional
- information-dense without being crowded
- restrained
- predictable
- accessible
- business-oriented
- suitable for daily operational use

The interface MUST NOT resemble a consumer social application or promotional landing page.

---

## 3.2 Prohibited visual effects

The authenticated application MUST NOT use:

- gradients
- glassmorphism
- backdrop blur
- neumorphism
- decorative glow
- excessive shadows
- animated background effects
- parallax
- decorative particle effects
- oversized decorative illustrations
- decorative badges without semantic meaning

Cards and panels use borders rather than shadows wherever possible.

---

# 4. Design Tokens

## 4.1 Token architecture

Tokens have four layers:

1. **Tenant brand tokens**
2. **Derived brand tokens**
3. **Fixed neutral tokens**
4. **Fixed semantic status tokens**

Tenant branding MUST NOT alter semantic status colors.

---

## 4.2 Brand tokens

Administrators MAY configure:

- school logo
- primary color
- brand accent color

The following MUST remain fixed:

- typography
- spacing
- radius
- neutral palette
- status colors
- accessibility thresholds
- motion
- layout dimensions

Tenant branding changes presentation only.

It MUST NOT change authorization, business rules, workflows, academic rules, finance rules, or security behavior.

---

## 4.3 Default brand

Karatu's default brand:

| Token          | Default   |
| -------------- | --------- |
| `primary`      | `#1B3A6B` |
| `brand-accent` | `#2E5FA3` |

Derived values are calculated by the theme derivation system.

---

## 4.4 Semantic neutral tokens

| Token                    | Purpose                          |
| ------------------------ | -------------------------------- |
| `background`             | Application canvas               |
| `foreground`             | Primary text                     |
| `card`                   | Surface/panel                    |
| `card-foreground`        | Text on surfaces                 |
| `popover`                | Floating surface                 |
| `popover-foreground`     | Floating surface text            |
| `secondary`              | Secondary control/surface        |
| `secondary-foreground`   | Secondary text                   |
| `muted`                  | Muted surface                    |
| `muted-foreground`       | Supporting text                  |
| `subtle`                 | Decorative/supporting icons only |
| `border`                 | Dividers and boundaries          |
| `input`                  | Form-control boundaries          |
| `destructive`            | Destructive actions              |
| `destructive-foreground` | Text on destructive controls     |

Components MUST use semantic tokens rather than raw colors.

---

# 5. Typography

## 5.1 Typeface

The authenticated application uses:

**Inter**

Allowed weights:

- 400
- 500
- 600

No other font is permitted without a design-system decision record.

---

## 5.2 Type scale

| Purpose             |        Size | Weight |
| ------------------- | ----------: | ------ |
| Page title          | 24px / 32px | 600    |
| Section heading     | 18px / 28px | 600    |
| Card title          | 16px / 24px | 600    |
| Body                | 14px / 20px | 400    |
| Long-form/help text | 16px / 24px | 400    |
| Table body          | 14px / 20px | 400    |
| Table header        | 12px / 16px | 500    |
| Form label          | 14px / 20px | 500    |
| Button              | 14px / 20px | 500    |
| Supporting text     | 14px / 20px | 400    |
| Caption             | 12px / 16px | 400    |
| Metric value        | 30px / 36px | 600    |

No text smaller than 12px.

---

## 5.3 Typography hierarchy

A page MUST communicate hierarchy through:

1. size
2. weight
3. spacing
4. semantic grouping

Color MUST NOT be the primary mechanism for hierarchy.

---

# 6. Spacing System

Allowed spacing values:

```text
0.5
1
1.5
2
2.5
3
3.5
4
6
8
12
16
```

Preferred patterns:

| Context                  | Spacing      |
| ------------------------ | ------------ |
| Page padding             | `p-4 md:p-6` |
| Page sections            | `space-y-6`  |
| Form fields              | `space-y-4`  |
| Form sections            | `space-y-6`  |
| Label/control            | `space-y-2`  |
| Card padding             | `p-4 md:p-6` |
| Toolbar gap              | `gap-2`      |
| Card grid                | `gap-4`      |
| Major dashboard sections | `gap-6`      |

Large spacing MUST indicate a meaningful structural boundary.

---

# 7. Layout System

## 7.1 Application canvas

The authenticated application uses:

```text
┌─────────────────────────────────────────────────────────────┐
│                         Header                              │
├───────────────┬─────────────────────────────────────────────┤
│               │                                             │
│   Sidebar     │              Main content                   │
│               │                                             │
│               │     PageContainer                           │
│               │                                             │
│               │     PageHeader                              │
│               │                                             │
│               │     Page content                            │
│               │                                             │
└───────────────┴─────────────────────────────────────────────┘
```

---

## 7.2 Application shell

### Desktop — 1024px+

```text
Header: 56px
Sidebar: 256px expanded / 64px collapsed
Main: remaining viewport width
```

The header is sticky.

The sidebar is persistent.

The main content is independently scrollable.

---

## 7.3 Tablet — 768px to 1023px

```text
┌──────────────────────────────────────────┐
│ Header + navigation trigger              │
├──────────────────────────────────────────┤
│                                          │
│ Main content                             │
│                                          │
└──────────────────────────────────────────┘
```

The sidebar becomes a drawer.

---

## 7.4 Mobile — 320px to 767px

```text
┌───────────────────────────────┐
│ Menu   Page title      User   │
├───────────────────────────────┤
│                               │
│ Page content                  │
│                               │
│                               │
└───────────────────────────────┘
```

Navigation is drawer-based.

Actions stack when necessary.

Tables transform according to their mobile pattern.

---

# 8. Page Container

`PageContainer` MUST provide:

```text
width: 100%
max-width: 1280px
margin-inline: auto
padding-inline: 16px mobile
padding-inline: 24px tablet+
```

Conceptually:

```text
Viewport
└── PageContainer
    ├── PageHeader
    ├── Summary
    ├── Toolbar
    ├── Main content
    └── Pagination / supporting actions
```

---

## 8.1 Wide pages

The following may use `width="wide"`:

- gradebook
- attendance register
- timetable
- results broadsheet

A new wide page requires an explicit design-system update.

---

# 9. Page Composition

Every authenticated routed page MUST use the following hierarchy where applicable:

```text
Page
│
├── PageHeader
│   ├── Breadcrumbs
│   ├── H1
│   ├── Description
│   └── Actions
│
├── Context / summary
│
├── Toolbar
│
├── Primary content
│
└── Pagination / supporting actions
```

Not every page requires every section.

---

## 9.1 PageHeader

`PageHeader` supports:

- title
- breadcrumbs
- description
- primary action
- secondary actions
- contextual status
- optional back navigation

Rules:

- exactly one `h1`
- maximum one primary action
- destructive actions do not appear as primary header actions
- more than three secondary actions go into `More actions`
- mobile actions become full-width where necessary

---

# 10. Information Hierarchy

Every screen MUST have one obvious primary task.

Visual hierarchy follows:

```text
1. Page identity
2. Current context
3. Primary task
4. Important information
5. Secondary information
6. Supporting actions
7. Destructive actions
```

A page MUST NOT give multiple unrelated elements equal visual prominence.

---

# 11. Page Archetypes

Karatu uses standard page archetypes.

## 11.1 Dashboard

```text
Page header
      ↓
Key metrics
      ↓
Priority work / alerts
      ↓
Operational data
      ↓
Secondary information
```

Dashboards MUST prioritize actionable information.

They MUST NOT become collections of decorative metric cards.

---

## 11.2 List page

```text
PageHeader
    ↓
Toolbar
    ↓
Result count
    ↓
DataTable / RecordCard
    ↓
Pagination
```

---

## 11.3 Detail page

```text
PageHeader
    ↓
Identity / summary
    ↓
Primary information
    ↓
Related information
    ↓
History / activity
```

Important information appears before secondary metadata.

---

## 11.4 Create/edit page

```text
PageHeader
    ↓
FormSection
    ↓
FormSection
    ↓
FormSection
    ↓
Action bar
```

Forms MUST NOT become one undifferentiated wall of fields.

---

## 11.5 Workflow/review page

```text
Context
   ↓
Current state
   ↓
Evidence / information
   ↓
Decision area
   ↓
Primary action
```

Workflow pages MUST make the current state and next available action obvious.

---

# 12. Cards and Surfaces

Cards are structural containers, not default wrappers.

Use cards for:

- metrics
- focused workflow sections
- grouped form sections
- important status blocks
- compact summaries

Do not wrap every table, toolbar, or paragraph in a card.

---

## 12.1 Card anatomy

```text
┌─────────────────────────────────────┐
│ Title                    Action     │
│ Description                        │
├─────────────────────────────────────┤
│                                     │
│ Content                             │
│                                     │
└─────────────────────────────────────┘
```

Cards:

- `bg-card`
- `border`
- `rounded-lg`
- no shadow

Nested cards are prohibited.

Use separators and spacing inside cards.

---

# 13. Metrics

`MetricCard` is for meaningful operational metrics.

Example:

```text
Students
1,284

+6.2% from last term
```

Metrics MUST:

- have a clear label
- use formatted values
- optionally provide context
- optionally link to relevant data
- remain useful without color

Maximum:

- 4 metrics per row
- 8 metrics on a dashboard

---

# 14. Data Tables

## 14.1 Table selection

| Production records | Behavior                      |
| ------------------ | ----------------------------- |
| 1–10               | Client                        |
| 11–50              | Client search/sort            |
| >50                | Server search/sort/pagination |

The realistic production maximum determines the classification.

---

## 14.2 Table hierarchy

Preferred column order:

```text
Identity
→ descriptors
→ status
→ numerical values
→ dates
→ actions
```

Business identifiers may be displayed.

Database identifiers MUST NOT be displayed.

---

## 14.3 Table density

Desktop:

- approximately 40px row height

Mobile:

- approximately 48px row height

No zebra striping.

Use borders and hover/selected surfaces.

---

## 14.4 Mobile tables

Every table MUST explicitly declare:

```text
mobilePattern:
  cards
  or
  scroll
```

### Cards

Use for:

- students
- teachers
- applications
- users
- assessments
- payments
- incidents
- audit logs
- normal CRUD tables

### Scroll

Use only where comparison across columns is essential:

- gradebook
- attendance register
- timetable
- results broadsheet

The page itself MUST never horizontally scroll.

---

# 15. Forms

## 15.1 Form structure

Forms follow:

```text
Form title
Description
Required-field explanation

FormSection
  Label
  Control
  Help
  Error

FormSection
  ...

Action bar
```

---

## 15.2 Responsive form layout

Mobile:

```text
Field
Field
Field
Field
```

Tablet/desktop:

```text
Field             Field
Field             Field
Long field        Long field
```

Forms with more than six fields MAY use two columns from 768px upward.

Long text fields span both columns.

---

## 15.3 Form sections

Forms with more than ten fields MUST be divided into meaningful `FormSection`s.

Examples:

- Student information
- Contact information
- Academic information
- Guardian information
- Financial information

Sections MUST represent conceptual groups, not arbitrary field counts.

---

# 16. Actions and Buttons

## 16.1 Action hierarchy

```text
Primary
Secondary
Neutral
Destructive
```

Only one primary action per context.

---

## 16.2 Button variants

| Variant       | Purpose                          |
| ------------- | -------------------------------- |
| `default`     | Primary action                   |
| `secondary`   | Secondary action                 |
| `outline`     | Neutral action                   |
| `ghost`       | Low-emphasis/toolbar/icon action |
| `destructive` | Destructive confirmation         |
| `link`        | Inline navigation                |

---

## 16.3 Button labels

Use:

**Verb + object**

Examples:

- Add student
- Create assessment
- Save scores
- Approve application
- Export results
- Submit scores

Avoid vague labels such as:

- Proceed
- Continue
- Process
- Done

unless context makes the action unambiguous.

---

# 17. Navigation

## 17.1 Navigation hierarchy

Navigation MUST reflect the user's work.

Conceptually:

```text
System
Administration
Teaching
Family
```

Only groups relevant to the current user's permissions appear.

---

## 17.2 Sidebar

Desktop:

```text
School logo
School name

Dashboard

Administration
  Students
  Teachers
  Admissions
  Academic structure

Teaching
  Classes
  Attendance
  Assessments
  Gradebook

Reports
  Results
  Report cards

Finance
  Fees and payments

System
  Users
  Settings
  Audit logs
```

The exact navigation remains controlled by backend permissions and the product architecture.

---

## 17.3 Active navigation

Active navigation MUST be communicated using:

- active surface
- typography
- icon/state
- `aria-current="page"`

Do not rely on color alone.

---

# 18. Header

Header height:

**56px**

Desktop:

```text
Breadcrumbs        Child switcher   Notifications   User
```

Mobile:

```text
Menu   Page title                    User
```

For guardians with multiple children, `ChildSwitcher` is displayed.

The active child MUST remain obvious throughout the guardian experience.

---

# 19. Responsive Design

Breakpoints:

| Range    | Name    |
| -------- | ------- |
| 320–767  | Mobile  |
| 768–1023 | Tablet  |
| 1024+    | Desktop |

Required test widths:

```text
320
375
768
1024
1280
1440
```

---

## 19.1 Responsive transformation rule

Responsive design is not merely scaling.

Components MUST transform according to the task.

Examples:

```text
Desktop table
      ↓
Mobile record cards
```

```text
Desktop sidebar
      ↓
Mobile navigation drawer
```

```text
Desktop two-column form
      ↓
Mobile single-column form
```

```text
Desktop header actions
      ↓
Mobile stacked actions
```

---

## 19.2 Mobile-first constraints

At 320px:

- no horizontal page scrolling
- no clipped primary content
- no inaccessible controls
- no overlapping fixed elements
- no text requiring horizontal scrolling

At 200% zoom:

- content remains usable
- controls remain reachable
- layout reflows

---

# 20. Loading, Empty, Error, and Permission States

Every data view MUST explicitly support:

1. Loading
2. Empty
3. Filtered empty
4. Error
5. Forbidden
6. Not found
7. Populated

---

## 20.1 Loading

Initial load:

- skeleton matching final structure
- `aria-busy="true"`

Refetch:

- preserve existing content
- show lightweight updating indicator

Do not replace usable content with a full skeleton during ordinary refetching.

---

## 20.2 Empty

Example:

```text
No students yet

Students added to this school will appear here.

[Add student]
```

The action appears only when the user has permission.

---

## 20.3 Error

Errors must explain:

1. what happened
2. what the user can do next

Example:

```text
We could not load students.

Check your connection and try again.

[Try again]
```

---

# 21. Status System

Statuses MUST use semantic status tokens.

Supported categories:

- success
- warning
- error
- info
- neutral

Status MUST never be represented by color alone.

Every status includes:

- icon
- text label
- semantic color

---

## 21.1 Status examples

| Domain value   | Presentation |
| -------------- | ------------ |
| Active         | success      |
| Approved       | success      |
| Paid           | success      |
| Present        | success      |
| Published      | success      |
| Pending        | warning      |
| Late           | warning      |
| Partially paid | warning      |
| Rejected       | error        |
| Overdue        | error        |
| Absent         | error        |
| Submitted      | info         |
| Excused        | info         |
| Under review   | info         |
| Draft          | neutral      |
| Inactive       | neutral      |
| Unpaid         | neutral      |
| Withdrawn      | neutral      |

A new backend status MUST be explicitly mapped before use.

---

# 22. Dialogs and Destructive Actions

## 22.1 Severity

| Level | Use                                                           |
| ----- | ------------------------------------------------------------- |
| 1     | Reversible action                                             |
| 2     | Irreversible individual record / academic or financial change |
| 3     | Structural or bulk irreversible change                        |

---

## 22.2 Dialog structure

```text
Title
Description

Consequences

Reversibility statement

Reason, where required

Cancel        Confirm
```

Level 2 and 3 destructive actions require a reason.

Level 3 actions may require typed confirmation.

---

# 23. Toasts and Notifications

Use Sonner.

Maximum:

**3 visible toasts**

Success:

- short
- specific
- human-readable

Errors:

- never expose raw API messages
- provide a recovery action where appropriate
- include trace reference where available

Toasts MUST NOT replace:

- field validation
- page errors
- permission states
- important workflow confirmation

---

# 24. Icons

Use `lucide-react`.

Standard sizes:

| Context           | Size |
| ----------------- | ---- |
| Controls          | 16px |
| Badges            | 12px |
| Navigation        | 20px |
| Empty/error state | 40px |

Icon-only controls MUST have accessible names.

Tooltips MAY supplement but MUST NOT replace accessible names.

---

# 25. Motion

Motion is functional only.

Allowed:

- hover/focus transitions
- dialogs
- drawers
- popovers
- sidebar collapse
- loading indicators

Maximum decorative transition:

**300ms**

Forbidden:

- page-transition animations
- parallax
- autoplay animation
- decorative looping animation

Reduced-motion support is mandatory.

---

# 26. State Management

## 26.1 Server state

TanStack Query owns:

- API data
- loading state
- cache
- refetching
- mutation state

Server data MUST NOT be duplicated in Zustand.

---

## 26.2 Zustand

Zustand is reserved for genuinely client-owned state such as:

- UI preferences
- temporary gradebook drafts
- selected guardian child

A new global store requires a decision record.

---

## 26.3 URL state

List-page state belongs in the URL:

```text
?q=
&sort=
&page=
&size=
&filter=
```

This enables:

- deep linking
- browser navigation
- refresh persistence
- shareable filtered views

---

# 27. Tenant-Aware Branding

Karatu is a multi-tenant SaaS.

Branding MUST be resolved in the context of the current school/tenant.

The frontend MUST NOT assume CarePoint is the global product identity.

---

## 27.1 Tenant branding

A tenant MAY configure:

- logo
- primary color
- accent color

The tenant branding applies only to that tenant's authenticated and permitted surfaces.

---

## 27.2 Branding isolation

Branding MUST NOT leak between tenants.

Caches MUST include tenant context where the architecture requires it.

A branding cache MUST NOT use a global key such as:

```text
["branding"]
```

unless the application architecture guarantees tenant resolution outside the query key.

Preferred conceptual form:

```text
["tenant", tenantContext, "branding"]
```

The exact tenant-context representation is determined by the authentication/tenant architecture.

---

## 27.3 Product identity

The authenticated interface represents:

**Karatu SIS**

with the active school's identity presented through tenant branding.

CarePoint is one tenant, not the product identity.

---

# 28. Security Presentation Rules

The frontend is not an authorization boundary.

The backend remains authoritative.

The frontend MUST NOT:

- store access/refresh tokens in localStorage
- expose secrets
- trust client-supplied tenant authorization
- display database IDs
- log personal data
- use `dangerouslySetInnerHTML`
- infer permissions from role names when backend permissions exist

---

# 29. Permission-Aware UX

Use:

```text
usePermission()
<Can />
```

where appropriate.

Rules:

### Hide

Hide an action when the user never has permission to perform it.

### Disable

Show disabled when:

- permission exists
- but current record state prevents the action

Example:

```text
Results are published and can no longer be edited.
```

The backend MUST still enforce the restriction.

---

# 30. Forms and Validation

Use:

- React Hook Form
- Zod
- shared field components

Validation flow:

```text
User input
    ↓
Client validation
    ↓
Submit
    ↓
Backend validation
    ↓
Field/server error mapping
```

The backend is authoritative.

---

## 30.1 Validation messages

Messages MUST:

- identify the field
- explain the problem
- provide a useful correction
- use sentence case
- end with a period

Examples:

```text
Student name is required.
Enter a valid email address.
Score must be between 0 and 100.
Select a class.
```

---

# 31. API Presentation Boundary

Components MUST NOT directly call the API.

Architecture:

```text
Page
 ↓
Feature component
 ↓
TanStack Query hook
 ↓
Feature API adapter
 ↓
API client
 ↓
Spring Boot API
```

Responses MUST be validated before reaching presentation components.

The frontend MUST NOT invent:

- endpoints
- permissions
- enum values
- error codes
- business rules

---

# 32. Money and Numerical Data

Money MUST remain decimal-safe.

Frontend code MUST NOT perform authoritative financial calculations.

The backend supplies authoritative totals.

Display through:

```text
formatMoney()
```

not:

```text
toLocaleString()
```

or direct numeric formatting scattered throughout components.

---

# 33. Dates and Time

Formatting MUST use the shared formatting layer.

Default school context:

```text
Timezone: Africa/Accra
Currency: GHS
Locale: en-GH
```

The backend remains authoritative for persisted timestamps.

---

# 34. Workflow Design

Karatu workflows MUST communicate:

1. current state
2. available action
3. consequences
4. next state

Example:

```text
Draft
  ↓
Submitted
  ↓
Reviewed
  ↓
Published
```

The UI MUST NOT make workflow state ambiguous.

---

# 35. Academic Screens

Academic interfaces require higher information density but MUST remain structured.

## Gradebook

```text
Assessment context
        ↓
Class / subject context
        ↓
Student rows
        ↓
Score entry
        ↓
Save
        ↓
Submit for grading
```

The gradebook may use horizontal scrolling because column comparison is intrinsic to the task.

Mobile MUST preserve:

- student identity
- score entry
- absent state
- save state
- submission state

---

# 36. Attendance

Attendance uses a compact operational layout.

```text
Class context
      ↓
Date
      ↓
Student list
      ↓
Attendance status
      ↓
Save attendance
```

The four states are:

- Present
- Absent
- Late
- Excused

The UI MUST distinguish these semantically.

---

# 37. Admissions Review

Admission review is a workflow, not merely CRUD.

Preferred layout:

```text
Application identity
        ↓
Student information
        ↓
Guardian information
        ↓
Academic information
        ↓
Application status
        ↓
Review actions
```

Approve and reject actions MUST clearly communicate consequences.

Reject requires a reason.

---

# 38. Dashboard Design

Dashboards are role-aware.

They MUST prioritize the user's work.

### Teacher

```text
Today's classes
      ↓
Attendance actions
      ↓
Gradebook work
      ↓
Recent academic activity
```

### Admin

```text
Operational metrics
      ↓
Pending work
      ↓
Recent activity
      ↓
Important alerts
```

### Guardian

```text
Child selector
      ↓
Child summary
      ↓
Attendance
      ↓
Results
      ↓
Fees
      ↓
Notifications
```

### Super Admin

The Super Admin interface is a platform-level surface and MUST clearly distinguish:

- platform operations
- tenant/school management
- security
- audit
- configuration

Cross-tenant actions MUST be visually and contextually obvious.

---

# 39. Accessibility

Target:

**WCAG 2.2 AA**

Requirements include:

- keyboard accessibility
- visible focus
- semantic HTML
- accessible labels
- sufficient contrast
- screen-reader-compatible state changes
- accessible dialogs
- accessible tables
- accessible forms
- reduced motion
- touch targets

Interactive targets MUST be at least:

- 24×24px generally
- 44×44px below 768px

---

# 40. Accessibility Focus

Standard focus:

```text
focus-visible:outline-none
focus-visible:ring-2
focus-visible:ring-ring
focus-visible:ring-offset-2
focus-visible:ring-offset-background
```

Focus MUST never be removed without replacing it with an equivalent visible indicator.

---

# 41. Component Architecture

Directory:

```text
apps/web/src/
├── app/
│   ├── (auth)/
│   └── (portal)/
│
├── components/
│   ├── ui/
│   └── shared/
│
├── features/
│   └── <feature>/
│       ├── api.ts
│       ├── hooks.ts
│       ├── schemas.ts
│       ├── components/
│       └── pages/
│
├── theme/
│   ├── defaults.ts
│   ├── derive.ts
│   ├── provider.tsx
│   └── theme.css
│
├── hooks/
├── lib/
│   ├── api/
│   ├── format/
│   ├── validation/
│   └── permissions.ts
│
└── navigation.ts
```

---

# 42. Shared Components

Common patterns MUST be centralized.

Core shared components include:

```text
PageContainer
PageHeader
Button
MetricCard
DataTable
RecordCard
ConfirmDialog

EmptyState
ErrorState
ForbiddenState
NotFoundState

TableSkeleton
CardSkeleton
FormSkeleton
OfflineBanner

TextField
TextareaField
SelectField
EntityCombobox
DateField
NumberField
CheckboxField
RadioGroupField
SwitchField
FileField

FormSection
FormAlert
ErrorSummary

StatusBadge
StatusAlert
StatusIcon

Can
ChildSwitcher
LogoFallback
ErrorBoundary
```

A feature MUST NOT recreate an existing shared pattern.

---

# 43. Component Extraction

A component becomes shared when:

- it is used in three or more places, or
- consistency is critical across the product, or
- accessibility behavior would otherwise be duplicated, or
- the component represents a core Karatu interaction pattern.

The three-use threshold is a guideline for ordinary components, not a reason to duplicate critical accessibility or workflow primitives.

---

# 44. Feature Boundaries

Feature folders MUST NOT import from other feature folders.

Shared code belongs in:

```text
components/shared
hooks
lib
```

Cross-feature domain coupling belongs behind explicit shared abstractions.

---

# 45. Shadcn Components

`components/ui` contains primitives.

Feature-specific behavior belongs in:

```text
components/shared
```

or feature components.

Direct modification of shadcn primitives MUST be minimized.

---

# 46. Performance

Core budgets:

| Measure                   |  Budget |
| ------------------------- | ------: |
| Sign-in JavaScript gzip   | ≤150 KB |
| App shell JavaScript gzip | ≤250 KB |
| Lazy route chunk gzip     | ≤100 KB |
| LCP                       |  ≤2.5 s |
| CLS                       |    ≤0.1 |
| INP                       | ≤200 ms |

The interface MUST avoid unnecessary client components.

Server Components are preferred when no browser interactivity is required.

---

# 47. Images and Media

Authenticated screens MUST use images only when they provide functional or contextual value.

Images MUST:

- have explicit dimensions
- avoid layout shift
- use appropriate optimization
- include meaningful alt text where informative
- use empty alt text when purely decorative

Large decorative media is not appropriate for operational screens.

---

# 48. Error Boundaries

The application shell MUST remain usable when an individual page fails.

Structure:

```text
Application Error Boundary
        ↓
Application shell
        ↓
Page Error Boundary
        ↓
Feature content
```

A page-level render failure MUST NOT unnecessarily remove the global navigation.

Error telemetry MUST exclude personal data.

---

# 49. Authentication Screens

Sign-in is intentionally simpler than the authenticated application shell.

```text
School / tenant identity
        ↓
Sign-in card
        ↓
Email / username
        ↓
Password
        ↓
Sign in
```

No unnecessary promotional content.

No "Remember me" control unless explicitly supported by the authentication architecture.

Authentication errors MUST NOT reveal whether a specific account exists.

---

# 50. Content and Terminology

Use sentence case.

Avoid:

- exclamation marks
- unnecessary "Please"
- vague system terminology
- technical database language

Preferred Karatu terms:

| Use           | Avoid                                    |
| ------------- | ---------------------------------------- |
| Student       | Pupil                                    |
| Guardian      | Parent when referring to the domain role |
| Teacher       | Instructor                               |
| Class         | Grade                                    |
| Academic year | Session                                  |
| Term          | Semester                                 |
| Assessment    | Test when referring to the domain        |
| Score         | Mark                                     |
| Result        | Grade when referring to computed outcome |
| Report card   | Report sheet                             |
| Application   | Admission form                           |
| Fees          | Bills                                    |
| Payment       | Transaction                              |
| Sign in       | Login                                    |
| Sign out      | Logout                                   |
| Deactivate    | Disable                                  |

Domain-specific terminology may override these mappings where the backend/product source of truth explicitly defines a different term.

---

# 51. State and Persistence

Persistent client state MUST be minimal.

Allowed categories:

- non-sensitive UI preference
- temporary workflow draft
- selected child context

Authentication tokens MUST NOT be stored in browser storage.

Tenant-sensitive state MUST be scoped correctly.

On sign out:

```text
Clear query cache
Clear temporary drafts
Clear selected tenant/child context
Return to authentication
```

---

# 52. Security and Privacy

Frontend telemetry MUST NOT expose:

- student names
- guardian names
- scores
- payment amounts
- personal contact information
- authentication credentials
- access tokens
- refresh tokens
- sensitive tenant data

Development logging MUST also follow the same rule.

---

# 53. Testing Requirements

## New shared component

Must test:

- rendering
- variants
- keyboard behavior
- accessibility
- loading/error states where relevant

## New page

Must test:

- 375px
- 1280px
- all relevant data states
- no horizontal overflow
- accessibility

## New form

Must test:

- validation
- invalid submit focus
- pending state
- server validation
- successful submission
- unsaved changes

## New mutation

Must test:

- success
- error
- permission failure
- cache invalidation

---

# 54. Responsive Test Matrix

Every significant new page MUST be checked at:

```text
320px
375px
768px
1024px
1280px
1440px
```

Check:

- horizontal overflow
- clipping
- text wrapping
- navigation
- tables
- forms
- dialogs
- action hierarchy
- focus behavior

---

# 55. Definition of Done

Frontend work is complete only when:

- [ ] lint passes
- [ ] typecheck passes
- [ ] unit tests pass
- [ ] E2E tests pass
- [ ] build succeeds
- [ ] accessibility scan passes
- [ ] no serious/critical axe violations exist
- [ ] no horizontal overflow exists
- [ ] loading/empty/error/forbidden states exist
- [ ] mutation pending/success/error states exist
- [ ] responsive behavior is verified
- [ ] keyboard behavior is verified
- [ ] no unauthorized tenant assumptions exist
- [ ] no personal data is leaked into logs
- [ ] no new dependency lacks a decision record
- [ ] no backend contract was invented
- [ ] shared patterns were reused
- [ ] design-system exceptions are documented

---

# 56. AI Coding Agent Rules

AI coding agents MUST:

1. Read this document before modifying frontend UI.
2. Inspect existing shared components before creating new ones.
3. Inspect existing feature patterns before implementing new screens.
4. Follow the established layout system.
5. Reuse semantic tokens.
6. Avoid introducing new visual patterns without justification.
7. Never invent backend contracts.
8. Never invent permission keys.
9. Never invent tenant behavior.
10. Never bypass shared API adapters.
11. Preserve accessibility.
12. Test responsive behavior.
13. Report missing contracts rather than guessing.
14. Report deviations from this system.
15. Include files changed and validation results in the completion summary.

---

# 57. Pattern Registry

The first implementation of a pattern becomes its reference implementation.

Reference implementations MUST be recorded here.

| Pattern              | Reference        |
| -------------------- | ---------------- |
| Application shell    | To be registered |
| Dashboard            | To be registered |
| Server-side list     | To be registered |
| Client-side list     | To be registered |
| Detail page          | To be registered |
| Create/edit form     | To be registered |
| Workflow/review page | To be registered |
| Gradebook            | To be registered |
| Attendance register  | To be registered |
| School branding      | To be registered |
| Approval workflow    | To be registered |
| Promotion workflow   | To be registered |

Feature implementation MUST NOT create a new pattern when an approved pattern already exists.

---

# 58. Relationship With Public Design System

`docs/frontend-design-system-public.md` extends this document.

The public design system may introduce:

- editorial layouts
- marketing sections
- hero layouts
- photography
- public navigation
- public CTAs
- public admissions presentation

It MUST NOT redefine:

- typography foundations
- accessibility requirements
- semantic tokens
- status semantics
- core spacing principles
- shared interaction principles
- security principles

The public website may be visually richer because its purpose differs, but it remains part of the same Karatu design language.

---

# 59. Relationship With Engineering Rules

This document defines **what the interface should look and behave like**.

The following documents define **how the frontend is implemented**:

```text
docs/frontend-agent-rules.md
docs/frontend-agent-rules-public.md
```

Architecture and product decisions remain authoritative in:

```text
docs/architecture/
docs/product/
```

No design-system rule may silently redefine a domain or business rule.

---

# 60. Design-System Definition of Done

The design system itself is considered healthy when:

- shared patterns are actually reused
- pages have predictable hierarchy
- responsive transformations are intentional
- accessibility is automated where possible
- tenant branding remains isolated
- visual tokens are centralized
- feature teams do not create competing patterns
- operational screens remain efficient at high data density
- public and authenticated surfaces share a coherent brand foundation
- CarePoint-specific assumptions do not leak into Karatu core architecture
- AI coding agents can implement a new screen without inventing a visual language

The design system is successful when a new Karatu feature looks like it belongs to Karatu without requiring a new design language.
