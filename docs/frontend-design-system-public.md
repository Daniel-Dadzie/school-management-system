# CarePoint Public Website

# Frontend Design Rules, Version 1.0

**Applies to:** `apps/web/src/app/(public)/**`, `components/public/**`,
`features/admissions-public/**`
**Companion to:** `docs/frontend-design-system.md` (the portal document).
This document does not repeat shared rules. Tokens, typography, spacing,
radius, elevation, icons, motion, accessibility, and content/format rules
in sections 3, 5, 6, 15, 17, 18, and 21 of the portal document apply here
unmodified. This document defines only what is different for the public
site: imagery, marketing layout, the admissions wizard, navigation, and a
looser card/section vocabulary. Where this document is silent, the portal
document governs.

## 0. Rule language

Same as the portal document (section 0.1): MUST, MUST NOT, MAY, and a
verification method per rule (LINT, UNIT, E2E, AXE, REVIEW).

## 1. Hard rules

| ID | Rule | Verified by |
| --- | --- | --- |
| P1 | No gradients, backdrop blur, glassmorphism, or decorative glow, including on hero sections. Same as portal rule T7, same lint enforcement, no exception for marketing pages. | LINT |
| P2 | No color literals outside theme files. The public site uses the same brand tokens as the portal, fetched from the same public `GET /api/v1/branding` endpoint. It MUST NOT define its own color values. | LINT |
| P3 | Public pages MUST NOT call authenticated endpoints and MUST NOT store or read any auth token. | REVIEW |
| P4 | Every public route defines a page title and description through the Next.js metadata API. | REVIEW |
| P5 | Every image has real alt text. Purely decorative images use `alt=""`. | AXE |
| P6 | A hero or section image with text over it MUST use a flat, solid-color scrim (a single semi-transparent layer, not a gradient) between the image and the text, sized so the text meets 4.5 to 1 contrast against the busiest part of the image beneath it. | UNIT |
| P7 | The admission wizard autosaves step values (excluding files) to `localStorage` under `carepoint.public.admission-draft.v1`, and clears that key on successful submission. | UNIT |
| P8 | Marketing pages (`/`, `/about`, `/academics`, `/contact`, `/admissions`) are server rendered; they MUST NOT be client components merely for convenience. | REVIEW |
| P9 | The wizard and status lookup pages hide the full site navigation and footer, replacing them with a minimal header (logo plus, on the wizard, the step progress indicator). | REVIEW |

## 2. Stack

Same as the portal document section 2.1 (Next.js, TypeScript, Tailwind,
shadcn/ui, TanStack Query, React Hook Form, Zod, lucide-react). No Zustand
store is needed for the public site; the application wizard uses a single
React Hook Form instance across all steps rather than per-step state or a
client store — this keeps the data in one place and avoids duplicating it
between a store and a form.

## 3. Directory layout

```text
apps/web/src/
  app/(public)/
    page.tsx                    home
    about/
    academics/
    contact/
    admissions/
      page.tsx                  admissions info
      apply/
        page.tsx                the wizard
        confirmation/
      status/                   contingent — see section 7
  components/public/
    site-header.tsx
    site-footer.tsx
    wizard-header.tsx
    hero.tsx
    section-heading.tsx
    feature-grid.tsx
    cta-section.tsx
    wizard/
      wizard-shell.tsx
      step-student.tsx
      step-academic.tsx
      step-guardian.tsx
      step-documents.tsx
      step-review.tsx
    status-lookup-form.tsx
    status-result.tsx
  features/admissions-public/
    api.ts
    schemas.ts
    hooks.ts
```

Reused from the portal, not duplicated: `components/ui` (shadcn
primitives), `components/shared` field components (`TextField`,
`SelectField`, `DateField`, `FileField`, `Button`), `StatusBadge`,
`ErrorState`, and `lib/format`, `lib/validation/messages.ts`.

## 4. Navigation

* `SiteHeader`: logo (from branding), nav links (Home, About, Academics,
  Admissions, Contact), a "Log in" link to `/login`, and a primary
  button "Apply now" using the `default` button variant. Below 768px:
  hamburger opening the shared `Sheet` drawer.
* `WizardHeader` (used only on `/admissions/apply/*`): logo only, links
  to home (confirms first if the form is dirty), plus the step progress
  indicator. No nav links, no footer. This is intentional — a full nav
  bar next to a multi-step form measurably increases drop-off, so the
  wizard gets minimal chrome (P9).
* `SiteFooter`: contact details, address, quick links, copyright. Not
  shown on the wizard.

## 5. Marketing layout patterns

* **Hero**: full-width section. Headline at `text-4xl md:text-5xl
  font-semibold` (larger than any size in the portal's type scale —
  this is the one place a bigger step is allowed; still Inter, still
  600 weight max). Subtext at `text-lg text-muted-foreground`. Two
  CTAs: primary "Apply for admission", secondary (`outline`) "Learn
  more". Background is either a `primary` tint or a real photograph
  with the P6 scrim.
* **FeatureGrid**: 2 to 4 columns, icon (lucide, `size-8`) + heading +
  one sentence per item.
* **Section pattern**: `SectionHeading` (optional eyebrow label, `h2`,
  one-sentence subtext) followed by content, with an optional
  `CTASection` at the end of a page.
* **Images**: `next/image`, Cloudinary-hosted, explicit `width` and
  `height`. The hero image gets `priority`; everything else is lazy.

## 6. The admission application wizard

`WizardShell` wraps a single React Hook Form instance. Each step has its
own Zod schema; the step schemas merge into one schema for the final
submit payload, matching the JSON body accepted by the existing
`POST /api/v1/admissions` endpoint. `mode: "onBlur"`.

The wizard is four steps for MVP. A document upload step is deferred
until the backend supports multipart submission — see section 6.5.

* **Steps, fixed order:** 1. Student information — 2. Academic
  information (class applying for, academic year, previous school) —
  3. Guardian information — 4. Review and submit.
* **Progress indicator:** from 768px, a row of step labels as buttons,
  clickable only for a step already completed (never forward). Below
  768px, collapse to text "Step 2 of 4: Academic information" plus a
  thin progress bar (`bg-primary`, width proportional to step).
* **Footer:** "Back" (`outline`, disabled on step 1) and "Next"
  (`default`), or "Submit application" (`default`) on the final step.
* **Fields:** use the shared field components (`TextField`,
  `SelectField`, `DateField`) from the portal's `components/shared`. Do
  not rebuild them.
* **Validation messages:** the same templates as the portal document
  section 13.3, from the same `lib/validation/messages.ts`.
* **Draft persistence (P7):** on every step change, write current field
  values to `localStorage` under `carepoint.public.admission-draft.v1`.
  On mount, if a draft exists, show "Continue your application? You
  have a saved application in progress." with "Continue" and "Start
  over". Clear the draft key on successful submit.
* **Leaving mid-wizard:** browser back or tab close while the form is
  dirty uses the same unsaved-changes guard as the portal (section
  13.6). Using the wizard's own Back/Next buttons is not "leaving."
* **Step 4, Review:** read-only summary of every prior step, a required
  checkbox "I confirm that the information provided is accurate.", a
  note that "You will be able to email supporting documents after you
  submit — the school will follow up with instructions." (document
  upload is not yet available in the application itself), and the
  submit button. State plainly that the application cannot be edited
  after submission.
* **On submit:** `POST` to `/api/v1/admissions` with the merged JSON
  payload. On success, navigate to `/admissions/apply/confirmation`
  with the returned application ID. On error, use the same status-code
  handling as the portal document section 20.3, minus the 401 case
  (there is no session here).

### 6.5 Document upload — deferred to Phase 2

`POST /api/v1/admissions` currently accepts JSON only; no multipart
handling exists. Do not build a file upload step against this endpoint.
When the backend adds multipart support (or a separate document-upload
endpoint keyed to an existing application), add Step 5 (Documents) back
into the wizard using the shared `FileField` component (portal document
section 13.8), and update the progress indicator and step count in this
section accordingly.

## 7. Application status lookup — out of scope for MVP

Cut from MVP. No public lookup endpoint exists or is planned before
Phase 2. Applicants are told on the confirmation page to watch their
email for status updates (section 8). Do not build a status page,
a status route, or any UI referencing "check your application status"
anywhere on the public site for MVP.

When Phase 2 adds a public lookup endpoint, this section will define:
a lookup form (application ID and email), a found/not-found result
using `StatusBadge`, and the same generic not-found message regardless
of which field mismatched (enumeration protection). Revisit whether the
lookup accepts the raw UUID or a shorter reference number at that time.

## 8. Confirmation page

* Success icon (`CircleCheck`, `size-10`, success color), "Application
  submitted."
* The application ID, returned by the backend as a UUID (for example
  `550e8400-e29b-41d4-a716-446655440000`), displayed in full,
  `font-mono`, never truncated or reformatted, with a "Copy" button
  (`Copy` icon, `size-4`, toast "Copied to clipboard." on click).
  Label it "Application reference" above the value.
* "You'll receive a confirmation and status updates at the email
  address you provided." — include this line only once SMTP delivery
  for admissions is confirmed wired on the backend. This is still an
  open question as of this writing; until confirmed, omit the line
  entirely rather than promise an email that may not arrive.
* No status lookup link or mention (section 7 is out of scope for MVP).
* One CTA back to the homepage.

## 9. SEO and metadata

* Every public route sets `title` and `description` via the Next.js
  metadata API.
* Open Graph image: school logo or a hero photograph.
* Structured data is out of scope for MVP.

## 10. Performance

Same budgets as the portal document section 24, with one adjustment: no
bundled raster image over 200 KB (looser than the portal's 100 KB, since
this site is necessarily more image-heavy). Serve all images through
Cloudinary transformations, not raw uploads.

## 11. Accessibility

Same standard as the portal (WCAG 2.2 AA, section 17). The added
requirement is P6: text over a photograph must pass 4.5 to 1 against the
busiest part of the image beneath it, verified with the scrim in place,
not the raw photo.

## 12. Terminology

* Flowing marketing copy (Home, About) may say "parents and guardians"
  naturally.
* Any form field label, step title, or system-generated status text
  (the wizard, the status page) uses "Guardian," matching the portal's
  section 21.2, since this data flows into the same system.

## 13. Testing and definition of done

Same shape as the portal document section 25.3, adapted: no auth-state
tests are needed here. The wizard requires Playwright coverage of each
step transition, per-step validation, the final submit, and the
draft-restore prompt on reload.

## 14. Enforcement

The same ESLint fragment defined in the portal document section 26.1
(T1/T2/T4/T7/T8/D6/X3/X8-equivalent selectors) runs across the whole
repository, including `(public)`. No separate lint configuration is
needed or should be created.