# Public Website Design System

**Version:** 2.0

**Current implementation:** CarePoint Community School public website
**Future target:** Karatu marketing website

**Applies to:**

```text
apps/web/src/app/(public)/**
components/public/**
features/admissions-public/**
```

**Companion:** `docs/frontend-design-system.md`

---

## 0. Purpose

This document extends the core Karatu frontend design system for unauthenticated public-facing experiences.

The core design system remains authoritative for:

- color tokens;
- typography tokens;
- spacing;
- radii;
- elevation;
- icons;
- motion;
- accessibility;
- content formatting;
- shared UI primitives.

This document defines the additional visual and layout language required for:

- public school/marketing pages;
- public navigation;
- hero sections;
- content sections;
- imagery;
- public calls to action;
- admissions application flows;
- public confirmation screens.

The current public implementation represents **CarePoint Community School**.

The eventual product direction is to convert this surface into the **Karatu marketing website**. This document therefore avoids unnecessary coupling between the visual system and the current CarePoint brand.

---

# 1. Design Philosophy

The public website should communicate:

- clarity;
- trust;
- warmth;
- professionalism;
- accessibility;
- educational credibility;
- simplicity.

The visual system MUST feel related to the authenticated Karatu platform without making the public website look like an administration dashboard.

Public pages MAY use more visual storytelling than the portal through:

- photography;
- larger content sections;
- editorial layouts;
- testimonials;
- school highlights;
- feature storytelling.

However, visual richness MUST NOT come from unnecessary effects.

---

# 2. Visual Invariants

## DS-P1 — No Gradients

The public design system MUST NOT use decorative gradients.

This includes:

- hero backgrounds;
- buttons;
- cards;
- borders;
- text;
- image overlays.

**Exception:** none.

---

## DS-P2 — No Glassmorphism

MUST NOT use:

- backdrop blur;
- frosted glass;
- translucent glass cards;
- glowing borders;
- decorative blur;
- neon/glow effects.

Public design should rely on:

- spacing;
- typography;
- photography;
- solid surfaces;
- borders;
- restrained elevation.

---

## DS-P3 — Design Tokens Only

All visual values MUST come from the shared design system or approved public-brand configuration.

Do not introduce arbitrary:

```text
color
spacing
font-size
font-weight
border-radius
shadow
breakpoint
```

values when an existing token applies.

---

# 3. Layout Foundation

## DS-P4 — Page Container

Public content SHOULD use a consistent centered container.

Conceptually:

```text
┌────────────────────────────────────────────────────┐
│                    Full viewport                   │
│                                                    │
│    ┌──────────────────────────────────────────┐    │
│    │              Content Container           │    │
│    │                                          │    │
│    └──────────────────────────────────────────┘    │
│                                                    │
└────────────────────────────────────────────────────┘
```

The container SHOULD:

- have a consistent maximum width;
- use responsive horizontal padding;
- align major page sections to the same content edges.

Do not create independent container widths for individual sections without a clear layout reason.

---

## DS-P5 — Conceptual Grid

Desktop public layouts SHOULD use a 12-column conceptual grid.

Typical compositions:

```text
12 columns
┌──────┬──────┬──────┬──────┐
│      │      │      │      │
│  3   │  3   │  3   │  3   │
│      │      │      │      │
└──────┴──────┴──────┴──────┘
```

or:

```text
┌──────────────────┬─────────┐
│                  │         │
│      8 cols      │ 4 cols  │
│                  │         │
└──────────────────┴─────────┘
```

Use the grid to establish hierarchy rather than manually positioning elements.

---

## DS-P6 — Responsive Layout

Public layouts MUST support:

- mobile;
- tablet;
- desktop.

The layout should transform rather than merely shrink.

Typical transformation:

```text
Desktop:
[ 3 columns ]

Tablet:
[ 2 columns ]

Mobile:
[ 1 column ]
```

Navigation, forms, feature grids, testimonials, statistics, and CTA sections MUST have intentional mobile behavior.

---

# 4. Section System

A public page is generally composed from:

```text
Page
├── Header
├── Hero / Page Intro
├── Section
├── Section
├── CTA
└── Footer
```

## DS-P7 — Section Structure

A standard content section MAY contain:

```text
Eyebrow
H2
Supporting description
Content
Optional CTA
```

Example:

```text
ABOUT OUR SCHOOL

A strong educational foundation

Supporting description explaining the section.

┌────────────┐ ┌────────────┐ ┌────────────┐
│ Content    │ │ Content    │ │ Content    │
└────────────┘ └────────────┘ └────────────┘
```

Not every section needs an eyebrow, description, or CTA.

---

## DS-P8 — Section Rhythm

Sections MUST have consistent vertical rhythm.

Use the shared spacing tokens.

Do not create excessive empty space simply to make a page appear more premium.

Visual hierarchy should come from:

- spacing;
- alignment;
- typography;
- imagery;
- content grouping.

---

# 5. Typography

The public site inherits the core typography system.

Public marketing pages MAY use larger display typography than authenticated screens when the content hierarchy requires it.

The exact implementation MUST use approved design tokens rather than arbitrary one-off sizes.

Recommended semantic hierarchy:

```text
Display
↓
H1
↓
H2
↓
H3
↓
Body
↓
Supporting / Caption
```

## DS-P9 — Hero Typography

A hero MAY use a display/H1 scale larger than normal portal headings.

The visual hierarchy should be:

```text
Eyebrow
↓
Large H1
↓
Supporting text
↓
CTA group
```

Avoid excessive font weights.

The public brand SHOULD remain consistent with the core typography family.

---

# 6. Hero System

## DS-P10 — Hero Structure

A standard hero SHOULD follow:

```text
┌───────────────────────────────────────────────────┐
│                                                   │
│   Eyebrow                                         │
│                                                   │
│   Clear primary headline                          │
│                                                   │
│   Supporting message                              │
│                                                   │
│   [ Primary CTA ]  [ Secondary action ]           │
│                                                   │
│                              ┌───────────────┐     │
│                              │               │     │
│                              │    Image      │     │
│                              │               │     │
│                              └───────────────┘     │
│                                                   │
└───────────────────────────────────────────────────┘
```

This is a pattern, not a requirement that every hero use two columns.

---

## DS-P11 — Hero CTA Hierarchy

A hero SHOULD have:

- one primary CTA;
- optionally one secondary action.

The secondary action MUST NOT visually compete with the primary CTA.

Examples:

```text
[ Apply for admission ]   Learn more
```

or:

```text
[ Get started ]
```

Do not force two CTAs when one is sufficient.

---

## DS-P12 — Hero Imagery

Hero imagery SHOULD be:

- relevant;
- authentic;
- high quality;
- appropriately cropped;
- optimized for the viewport.

Avoid generic decorative stock imagery when meaningful school/product imagery is available.

---

# 7. Image System

## DS-P13 — Image Treatment

Images MUST have intentional aspect ratios.

Common public patterns:

```text
Hero:
16:9 or wide editorial crop

Card:
4:3 or 3:2

Portrait:
3:4

Gallery:
consistent aspect ratio
```

Do not allow unpredictable image dimensions to create layout shifts.

---

## DS-P14 — Image Overlay

When text appears over photography, use a flat solid-color scrim when necessary for contrast.

Do not use gradient overlays.

The combination of:

```text
image + scrim + text
```

MUST maintain sufficient contrast.

---

## DS-P15 — Decorative Images

Decorative imagery MUST NOT compete with primary content.

Decorative images use empty alternative text:

```text
alt=""
```

Informative images require meaningful alternative text.

---

# 8. Card Vocabulary

Public cards MAY be more expressive than portal cards, but they remain restrained.

Approved patterns include:

### Feature Card

```text
┌─────────────────────────┐
│ Icon                    │
│                         │
│ Feature title           │
│ Short supporting text   │
└─────────────────────────┘
```

### Image Card

```text
┌─────────────────────────┐
│                         │
│        Image            │
│                         │
├─────────────────────────┤
│ Heading                 │
│ Description             │
│ Optional action         │
└─────────────────────────┘
```

### Information Card

```text
┌─────────────────────────┐
│ Label                   │
│ Primary information     │
│ Supporting information  │
└─────────────────────────┘
```

Cards MUST NOT become the default container for every piece of content.

Prefer open layouts when a card does not provide meaningful grouping.

---

# 9. Feature Grids

Feature grids SHOULD normally use:

```text
Desktop: 3–4 columns
Tablet: 2 columns
Mobile: 1 column
```

A feature item MAY contain:

- icon;
- heading;
- short description;
- optional link.

Use Lucide icons or approved brand imagery.

Icons MUST communicate meaning rather than exist purely as decoration.

---

# 10. Navigation System

## DS-P16 — Desktop Header

The public header SHOULD contain:

```text
Logo | Primary navigation | Login | Primary CTA
```

Current CarePoint navigation:

```text
Home
About
Academics
Admissions
Contact
Log in
Apply now
```

The eventual Karatu marketing navigation MAY differ after the brand migration.

---

## DS-P17 — Mobile Header

Mobile navigation SHOULD reduce to:

```text
Logo                         Menu
```

The menu opens a navigation drawer/sheet.

The drawer MUST preserve clear hierarchy and touch targets.

---

## DS-P18 — Header Density

Do not overcrowd the public header.

Navigation should contain only meaningful destinations.

A primary CTA MAY remain visually distinct.

---

# 11. Footer System

A standard public footer MAY contain:

```text
Brand
Short description

Navigation
Admissions
Academics
About
Contact

Contact information
Address
Phone
Email

Legal
Privacy
Terms
Copyright
```

Footer columns MUST collapse cleanly on mobile.

The footer SHOULD provide useful navigation without becoming an oversized sitemap.

---

# 12. CTA System

Public CTAs use a clear hierarchy:

```text
Primary
Secondary
Tertiary / Link
```

## Primary

For the most important action:

```text
Apply for admission
Get started
Contact us
```

## Secondary

For a meaningful alternative:

```text
Learn more
Explore academics
```

## Tertiary

For low-emphasis navigation:

```text
View details →
```

Do not use multiple primary buttons in the same visual group.

---

# 13. Admissions Wizard Visual System

The admissions wizard is a focused transactional experience rather than a marketing page.

It SHOULD use:

```text
Minimal header
↓
Progress indicator
↓
Form content
↓
Navigation/action bar
```

## DS-P19 — Wizard Header

The wizard header SHOULD contain:

- logo;
- optional return-home action;
- progress indicator.

The full marketing navigation and standard footer SHOULD be removed.

---

## DS-P20 — Wizard Progress

Desktop:

```text
1 Student ─── 2 Academic ─── 3 Guardian ─── 4 Review
```

Mobile:

```text
Step 2 of 4
━━━━━━━━━━━━━━
Academic information
```

Completed steps MAY be selectable.

Future incomplete steps MUST NOT be presented as directly accessible.

---

## DS-P21 — Wizard Form Layout

Desktop:

```text
┌───────────────────────────────────────┐
│ Step title                            │
│ Supporting description                │
│                                       │
│ [ Field ]             [ Field ]       │
│ [ Field ]             [ Field ]       │
│                                       │
└───────────────────────────────────────┘
```

Mobile:

```text
Step title

[ Field ]
[ Field ]
[ Field ]
[ Field ]
```

Related fields SHOULD be grouped.

---

## DS-P22 — Wizard Action Bar

Standard:

```text
[ Back ]                         [ Next ]
```

Final step:

```text
[ Back ]                  [ Submit application ]
```

The primary action MUST remain visually obvious.

---

# 14. Confirmation Screen

The confirmation page SHOULD use a focused success layout:

```text
              ✓

       Application submitted

       Application reference

       550e8400-...

       [ Copy ]

       Supporting information

       [ Return to homepage ]
```

Do not surround the confirmation page with unnecessary marketing sections.

The success state should make the next action obvious.

---

# 15. Forms

Public forms inherit the core form component system.

Preferred structure:

```text
Label
Input
Helper text
Validation message
```

Do not create visually different field components solely for public pages unless the public interaction genuinely requires a different pattern.

Form controls MUST have:

- clear labels;
- visible focus;
- adequate touch targets;
- clear validation states;
- consistent spacing.

---

# 16. Content Density

Public pages SHOULD be easier to scan than administrative screens.

Use:

- short paragraphs;
- clear headings;
- bullets where useful;
- strong visual hierarchy;
- meaningful whitespace.

Avoid large walls of text.

However, do not artificially shorten important information merely to preserve a marketing aesthetic.

---

# 17. Accessibility

The public design system targets:

**WCAG 2.2 AA**

All visual patterns MUST support:

- keyboard navigation;
- visible focus;
- readable contrast;
- semantic headings;
- accessible names;
- reduced motion;
- accessible form errors;
- non-color-only state communication.

Visual design MUST never override accessibility.

---

# 18. Motion

Public pages MAY use slightly richer motion than the portal, but motion remains purposeful.

Appropriate uses:

- menu transitions;
- section reveal;
- image transitions;
- hover feedback;
- wizard progression.

Avoid:

- perpetual animation;
- distracting parallax;
- bouncing elements;
- excessive page transitions.

Respect:

```text
prefers-reduced-motion
```

---

# 19. Responsive Breakpoint Philosophy

Do not design independently for arbitrary device widths.

The design system should reason in terms of:

```text
Mobile
Tablet
Desktop
Wide desktop
```

Components MUST remain usable between defined breakpoints.

Do not rely on a specific device model.

---

# 20. Public Page Archetypes

The public design system supports these page patterns.

### Marketing Landing Page

```text
Header
Hero
Value proposition
Features / benefits
Proof / credibility
Supporting content
CTA
Footer
```

### Informational Page

```text
Header
Page intro
Content sections
Related CTA
Footer
```

### Admissions Information

```text
Header
Admissions overview
Requirements
Process
Important information
Apply CTA
Footer
```

### Application Wizard

```text
Minimal header
Progress
Form
Action bar
```

### Confirmation

```text
Minimal header
Success state
Application reference
Next action
```

---

# 21. What This Design System Does Not Define

This document does NOT define:

- API endpoints;
- authentication;
- authorization;
- tenant isolation;
- database behavior;
- API request/response contracts;
- application status workflows;
- server-side business rules;
- admissions domain rules;
- payment behavior;
- persistence implementation;
- frontend state-management architecture.

Those belong to the appropriate architecture and agent-rule documents.

---

# 22. MVP Public-Site Scope

The current public MVP includes:

```text
Home
About
Academics
Contact
Admissions
Admissions Application
Application Confirmation
```

The current admissions wizard contains:

```text
1. Student Information
2. Academic Information
3. Guardian Information
4. Review & Submit
```

The following are intentionally deferred:

```text
Document Upload
Public Application Status Lookup
```

The design system MUST NOT require UI components for deferred functionality.

When those features are approved, the design patterns should be added here before implementation.

---

# 23. Design-System Definition of Done

A new public component is ready when:

- it follows the shared design tokens;
- its responsive behavior is defined;
- its accessibility behavior is defined;
- its states are defined;
- its mobile behavior is defined;
- its intended usage is clear;
- it does not duplicate an existing shared primitive;
- it does not introduce arbitrary visual values;
- it does not introduce gradients, glass effects, or decorative glow;
- it works with real content rather than only ideal placeholder content.

---

# 24. Relationship With the Portal Design System

The public design system is an extension of:

```text
docs/frontend-design-system.md
```

The relationship is:

```text
                    Core Design System
                           │
             ┌─────────────┴─────────────┐
             │                           │
       Authenticated Portal       Public Website
             │                           │
 frontend-design-system.md     frontend-design-system-public.md
```

The core system defines the shared visual language.

The public system adds:

- marketing layouts;
- editorial composition;
- public navigation;
- photography;
- public CTA patterns;
- admissions wizard presentation.

Neither system should duplicate the other's foundational tokens.
