# Public Website Frontend Rules for Agents

## 0. Purpose

This document governs the **public-facing website surface** of Karatu's web application.

### Current scope

The current public implementation originated as the **CarePoint Community School public website**.

The public website may later be transformed into the **Karatu marketing website**. Therefore:

- Do not introduce assumptions that permanently couple the public UI to CarePoint.
- Keep reusable marketing components generic where practical.
- Keep school-specific content/configuration separate from reusable presentation components.
- Do not redesign or migrate the public site to Karatu marketing content unless explicitly requested.
- The authenticated Karatu platform and the public marketing/site surface are separate UX surfaces.

### Applies to

```text
apps/web/src/app/(public)/**
```

This document governs `(public)` only.

For authenticated application surfaces such as `(auth)` and `(portal)`, load:

```text
docs/frontend-agent-rules.md
docs/frontend-design-system.md
```

For public UI design, also load:

```text
docs/frontend-design-system-public.md
```

The public design-system document is authoritative for public-site tokens, typography, spacing, components, motion, icons, and accessibility.

---

# 1. Public-Site Design Principles

The public website must communicate:

1. **Clarity**
2. **Trust**
3. **Professionalism**
4. **Accessibility**
5. **Fast comprehension**
6. **Clear calls to action**
7. **Responsive behavior**
8. **Consistent visual hierarchy**

The public website is not an application dashboard.

Do not introduce application-style information density, dashboard navigation, data tables, dense filters, or administrative interaction patterns unless explicitly required by the public-site feature.

---

# 2. Visual Design Rules

## 2.1 No visual effects that reduce clarity

Do not use:

- gradients
- glassmorphism
- excessive blur
- glow effects
- decorative neon effects
- excessive shadows
- animated backgrounds
- visual noise

This applies to:

- hero sections
- cards
- buttons
- navigation
- overlays
- modals
- banners

A flat visual hierarchy is preferred.

## 2.2 Color system

Use only approved design-system tokens.

Do not introduce:

- arbitrary hex values
- RGB values
- HSL values
- arbitrary Tailwind colors
- one-off color variables

If a new semantic color is genuinely required, update the design system rather than creating a local color.

## 2.3 Typography

Use the approved typography system.

Typography must communicate hierarchy through:

- size
- weight
- line height
- spacing
- semantic HTML

Do not create hierarchy by excessive capitalization, arbitrary font sizes, or decorative text treatments.

---

# 3. Page Layout Architecture

Every public page should follow a predictable visual structure unless the page type explicitly requires otherwise.

```text
┌─────────────────────────────────────────────┐
│ Header / Navigation                         │
├─────────────────────────────────────────────┤
│                                             │
│ Page-specific Hero / Intro                  │
│                                             │
├─────────────────────────────────────────────┤
│                                             │
│ Main Content                                │
│                                             │
│ Section                                     │
│ Section                                     │
│ Section                                     │
│                                             │
├─────────────────────────────────────────────┤
│ Primary CTA / Conversion Section             │
├─────────────────────────────────────────────┤
│ Footer                                      │
└─────────────────────────────────────────────┘
```

## 3.1 Standard content width

Public pages should use a consistent centered content container.

Recommended conceptual layout:

```text
Viewport
│
├── Full-width section
│
│   └── Centered content container
│       ├── Heading
│       ├── Supporting content
│       └── Actions
│
└── Full-width section
```

Do not allow unrelated sections to independently choose different maximum widths.

Use the approved container and spacing tokens.

## 3.2 Section rhythm

Sections should have deliberate vertical rhythm.

Avoid:

- cramped sections
- excessive whitespace
- inconsistent section padding
- arbitrary margins between unrelated elements

A page should visually communicate:

```text
Section
   ↓
Supporting content
   ↓
Next section
```

rather than appearing as a collection of unrelated components.

---

# 4. Responsive Layout

Design mobile-first.

Supported reference widths:

```text
320px
375px
768px
1024px
1280px
1440px
```

The implementation must remain usable between these reference widths as well.

## 4.1 Responsive behavior

Do not simply shrink desktop layouts.

Responsive behavior should intentionally determine:

- navigation collapse
- column changes
- card stacking
- typography scaling
- image cropping
- button stacking
- form layout
- table behavior
- spacing changes

Example:

```text
Desktop:

┌──────────────┬──────────────┬──────────────┐
│ Card         │ Card         │ Card         │
└──────────────┴──────────────┴──────────────┘

Tablet:

┌──────────────┬──────────────┐
│ Card         │ Card         │
├──────────────┼──────────────┤
│ Card         │ Card         │
└──────────────┴──────────────┘

Mobile:

┌─────────────────────────────┐
│ Card                        │
├─────────────────────────────┤
│ Card                        │
├─────────────────────────────┤
│ Card                        │
└─────────────────────────────┘
```

Do not force multi-column layouts onto narrow screens.

---

# 5. Navigation

The public header should provide:

- clear brand identity
- primary navigation
- primary conversion action where applicable
- accessible mobile navigation

Navigation should remain consistent across related public pages.

Do not create page-specific navigation unless the page represents a distinct workflow.

The header should not expose authenticated application navigation.

---

# 6. Hero Sections

A hero should answer three questions quickly:

1. What is this?
2. Why does it matter?
3. What should the visitor do next?

Recommended structure:

```text
Eyebrow / Context
        ↓
Primary Heading
        ↓
Supporting Description
        ↓
Primary CTA
        ↓
Optional Secondary CTA
        ↓
Supporting Visual
```

Do not fill hero sections with unnecessary text.

Do not use gradient overlays.

If text appears over an image, use a flat scrim and verify WCAG contrast.

---

# 7. Content Sections

Public content should follow a clear hierarchy.

Preferred pattern:

```text
Section Label
Section Heading
Supporting Description
        ↓
Content
        ↓
Optional CTA
```

Cards should be used only when the information benefits from grouping.

Do not turn every paragraph into a card.

---

# 8. Calls to Action

Each page should have a clear primary user objective.

Examples:

- Apply
- Contact
- Learn More
- Explore Programs
- Visit School
- Sign In

A page may contain:

- one primary CTA
- one or more secondary actions

Do not create multiple visually competing primary CTAs in the same section.

CTA hierarchy must be obvious.

---

# 9. Images and Media

Images must have a clear purpose.

Use images to:

- establish context
- demonstrate the institution/product
- support comprehension
- create appropriate emotional context

Do not add images merely to fill empty space.

Every meaningful image requires appropriate alternative text.

Decorative images should use empty alternative text where appropriate.

Do not use image backgrounds when normal `<img>`/Next Image semantics provide better accessibility and performance.

---

# 10. Forms and Public Workflows

Public forms must prioritize:

- clear labels
- progressive disclosure
- understandable validation
- preservation of user input
- mobile usability
- keyboard navigation
- error recovery

Never rely on placeholder text as the only field label.

Validation should be associated with the relevant field.

Errors should explain:

```text
What went wrong
+
How the user can fix it
```

Do not expose raw backend exceptions.

---

# 11. Admissions/Application Wizard

The application wizard is an MVP four-step workflow:

```text
1. Student
      ↓
2. Academic
      ↓
3. Guardian
      ↓
4. Review & Submit
```

There is currently **no Documents step**.

The backend currently accepts JSON rather than document uploads.

Do not add a document-upload step unless the backend contract is explicitly expanded.

## 11.1 Form architecture

Use:

- one React Hook Form instance
- one validation model
- step-level validation
- one final submission

Do not create independent forms for each step.

Do not introduce a client-side state store for the wizard unless explicitly approved.

Draft values may be persisted to `localStorage`.

Uploaded files must not be persisted to `localStorage`.

Clear the saved draft after successful submission.

## 11.2 Wizard layout

Recommended:

```text
┌───────────────────────────────────────────┐
│ Brand                                     │
├───────────────────────────────────────────┤
│ Application                               │
│                                           │
│ Step 1 ─── Step 2 ─── Step 3 ─── Step 4 │
│                                           │
│ ┌───────────────────────────────────────┐ │
│ │ Current Step                           │ │
│ │                                       │ │
│ │ Fields                                │ │
│ │                                       │ │
│ └───────────────────────────────────────┘ │
│                                           │
│ Back                    Continue / Submit │
└───────────────────────────────────────────┘
```

On mobile:

```text
Application
Step 2 of 4
──────────────

Current fields

──────────────

Back        Continue
```

The wizard must clearly communicate:

- current step
- completed steps
- remaining steps
- validation errors
- whether data was restored
- submission progress
- submission result

---

# 12. Status and Transactional Pages

Status/result pages should use a minimal layout.

Examples:

- application submitted
- application status
- confirmation
- public error page

Preferred structure:

```text
Brand
   ↓
Status / Result
   ↓
Explanation
   ↓
Primary next action
```

Do not add the full marketing navigation and footer to focused transactional workflows unless explicitly required.

The application status lookup page is currently **not part of the MVP**.

Do not implement it until its backend contract is approved and available.

---

# 13. Accessibility

All public pages must meet the project's accessibility standard.

At minimum:

- semantic HTML
- keyboard accessibility
- visible focus
- sufficient color contrast
- accessible names
- correct heading hierarchy
- labels for controls
- meaningful alternative text
- no keyboard traps
- reduced-motion support where applicable

Target:

**WCAG 2.2 AA**

Accessibility is not a final QA step; it is part of component and layout design.

---

# 14. Performance

Public pages should prioritize fast initial rendering.

Marketing/informational pages should remain server-rendered where practical.

Avoid unnecessary client components.

Do not introduce client-side state merely for visual presentation.

Optimize:

- image loading
- font loading
- JavaScript execution
- component hydration
- unnecessary network requests

Do not sacrifice accessibility or maintainability for micro-optimizations.

---

# 15. Rendering and Data Rules

Marketing/informational pages should be server-rendered unless interactivity genuinely requires client-side execution.

Do not call authenticated APIs from the public site.

Do not access:

- authentication tokens
- authenticated session state
- private portal APIs
- private student/parent/teacher data

Public endpoints must be explicitly public.

Never trust client-provided tenant identifiers for authorization.

---

# 16. Shared Components

Reuse existing approved components where appropriate.

Do not duplicate:

- form fields
- validation messages
- status components
- buttons
- typography primitives
- layout primitives
- accessibility patterns

Before creating a component, search for an existing equivalent.

If a shared component is missing functionality, determine whether the correct solution is:

1. extend the existing component,
2. create a public-specific composition,
3. or request a shared component change.

Do not silently modify portal-owned shared infrastructure.

---

# 17. Dependencies and Architecture

Do not add a dependency merely to solve a problem that can reasonably be solved with the existing stack.

New dependencies require architectural review.

Examples include:

- CAPTCHA
- analytics
- UI libraries
- animation libraries
- form libraries
- state-management libraries

The existing project stack and design system should be preferred.

---

# 18. SEO and Metadata

Every public route must define appropriate metadata.

At minimum:

- title
- description

Where appropriate:

- canonical URL
- Open Graph metadata
- social preview metadata
- structured data

Metadata must describe the actual page.

Do not duplicate titles/descriptions across unrelated pages.

---

# 19. Security

Never:

- expose secrets
- expose private API responses
- trust client-side authorization
- place authentication tokens in localStorage
- use `dangerouslySetInnerHTML` without an explicitly reviewed sanitization strategy
- leak personally identifiable information into client logs

Public forms must treat all user input as untrusted.

---

# 20. Error and Loading States

Every asynchronous public interaction must have an intentional state for:

```text
Idle
Loading
Success
Validation Error
Server Error
Network Error
```

Do not leave users staring at a blank page.

Do not display raw exceptions, stack traces, database errors, or API payloads.

---

# 21. Animation and Motion

Motion should communicate:

- state changes
- hierarchy
- navigation
- feedback

Motion must never be required to understand content.

Avoid:

- excessive entrance animations
- perpetual animations
- decorative motion
- motion that delays interaction

Respect `prefers-reduced-motion`.

---

# 22. Current Public-Site Boundary

The following are outside normal public-site work unless explicitly requested:

- authenticated portal functionality
- Super Admin functionality
- finance dashboards
- teacher dashboards
- parent dashboards
- academic administration
- tenant administration
- private student information
- internal reporting
- backend domain redesign

The future conversion of this surface into the **Karatu marketing site** is a separate product/design task.

---

# 23. Never Without an Explicit Decision

Do not:

- introduce a new dependency
- change the design system
- change shared portal components
- introduce a new navigation architecture
- introduce analytics/tracking
- introduce CAPTCHA
- create a new public workflow
- add authentication
- add a new backend contract
- implement the status lookup workflow

without the appropriate architecture/product decision.

---

# 24. Required Verification

Before completing a public-site change, run:

```text
lint
typecheck
test
test:e2e
build
```

For UI changes, verify at:

```text
320px
375px
768px
1024px
1280px
1440px
```

Verify:

- no horizontal overflow
- keyboard navigation
- visible focus
- correct heading hierarchy
- accessible labels
- accessible errors
- responsive navigation
- image behavior
- loading/error states
- no console errors
- no console warnings introduced by the change
- no broken links
- metadata exists
- mobile touch targets remain usable

For the application wizard specifically verify:

- draft restoration
- draft clearing after successful submission
- step validation
- navigation between steps
- final submission
- duplicate-submit prevention
- server error recovery
- mobile usability
- keyboard navigation

---

# 25. Completion Report

Every public-site implementation task should report:

1. Files changed
2. UI/UX patterns used
3. Design-system rules checked
4. Accessibility checks
5. Responsive breakpoints checked
6. Backend/API contracts used
7. New dependencies, if any
8. Conflicts or unresolved issues
9. Test results
10. Build result
11. Known limitations

If a requirement could not be implemented because the backend contract does not exist, state that explicitly rather than inventing the contract.
