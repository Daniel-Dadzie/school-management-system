# CarePoint public site rules for agents

**Applies to:** `apps/web/src/app/(public)/**`
**This file governs `(public)` only.** For `(auth)` or `(portal)`, load
`docs/frontend-agent-rules.md` and `docs/frontend-design-system.md`
instead.

**Load this file for every public-site task.** Load
`docs/frontend-design-system-public.md` in full whenever you create or
change UI. Tokens, typography, spacing, icons, motion, and accessibility
rules are defined once in `docs/frontend-design-system.md` and apply here
unmodified — read that document's sections 3, 5, 6, 15, 17, 18, 21 if you
need the specifics.

## Always true

* No gradients, blur, glassmorphism, or glow — anywhere, including the
  hero. Same rule as the portal, same lint enforcement. (P1)
* Color tokens only, from the same brand system as the portal (fetched
  from the public branding endpoint). Never a new palette. (P2)
* Never call an authenticated endpoint or touch an auth token. (P3)
* Every route has a title and description via the metadata API. (P4)
* Text over a photo needs a flat scrim, not a gradient, and must still
  hit 4.5 to 1 contrast. (P6)
* Marketing pages (home, about, academics, contact, admissions info) are
  server rendered, not client components. (P8)
* The wizard and status lookup pages show a minimal header only — no
  full nav, no footer. (P9)
* The application wizard is one React Hook Form instance across all
  five steps, not five separate forms or a client store. Draft values
  (not files) autosave to `localStorage` and clear on successful
  submit. (P7, section 6)
* Reuse the portal's shared field components, `StatusBadge`,
  `ErrorState`, `lib/format`, and `lib/validation/messages.ts`. Don't
  rebuild them inside `components/public`.
* The application wizard is four steps for MVP — Student, Academic,
Guardian, Review. Do not build a Documents upload step; the backend
endpoint only accepts JSON right now (section 6.5). Do not build the
status lookup page — it's cut for MVP(section 7).
* Terminology: "Guardian" in any form label or system text. "Parent or
  guardian" is fine in flowing marketing prose only.

## Never without asking

* Add a new dependency (captcha, analytics, a UI library) — this needs
  the same decision-record process as the portal (portal document
  section 0.3 / S4).
* Edit `theme/`, `components/ui`, or `components/shared` — request the
  change from whoever owns the portal side instead.
* Build the status lookup page before its backend endpoint is confirmed
  to exist.

## Before you finish

Run `lint`, `typecheck`, `test`, `test:e2e`, `build` — same scripts as
the portal, one repo. For the wizard specifically, verify: the draft
restore prompt on reload, each step's validation, the final submit, and
that no horizontal overflow appears at 320, 375, 768, 1024, 1280, and
1440 pixels.