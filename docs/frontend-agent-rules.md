# CarePoint frontend rules for agents

**Applies to:** `apps/web`
**Load this file for every frontend task.** Load `docs/frontend-design-system.md` in full whenever you create or change UI. Rule IDs below (T1, D5, and so on) refer to section 1 of that document.

**This file governs `(auth)` and `(portal)` only.** For `(public)`, load
`docs/frontend-agent-rules-public.md` and
`docs/frontend-design-system-public.md` instead.

## Before you write code

1. Find the pattern you need in the pattern registry (section 27). If a reference implementation exists, copy its structure.
2. Find the components you need in the shared component catalog (section 2.6). Use them. Do not rebuild them.
3. Find the tokens you need in section 3. Use token classes only.
4. If the backend contract does not define an endpoint, permission key, error code, or enum value you need, do not invent it. Build the rest and report it.
5. Check `docs/DEVELOPMENT_STATUS.md`. If the backend domain for this
screen is listed NOT STARTED, stop and flag it rather than building
against a guessed contract.

## Always true

* Colors: token classes only. No hex, rgb, hsl, oklch, or Tailwind palette classes. No opacity modifiers on text colors. No `dark:` variants. (T1, T2, T4, T8)
* Spacing, radius, and shadows come from the tables in section 6. No arbitrary Tailwind values. No gradients or blur. (T3, T7)
* Icons: `lucide-react` only, using the icon named for the action in section 15.2. (T9)
* Every routed page uses `PageContainer` and `PageHeader`. One primary button per page header and per dialog footer. (S1, U6)
* Server data goes through TanStack Query hooks. Never call `fetch` from a component. Every mutation hook declares the query keys it invalidates. (D1, D4)
* Every API response is parsed with Zod. Money is a decimal string and is never calculated on the frontend. Dates and numbers are formatted only through `lib/format`. (D3, D5, D6)
* Lists that can exceed 50 records use server side pagination, sorting, and filtering. List state lives in the URL. (D8, S6)
* Every `DataTable` sets `mobilePattern`. (U10)
* Every data view has six states: loading, empty, filtered empty, error, forbidden, populated. (U1)
* Every mutation button is disabled while pending and shows the progressive label ("Saving...", "Approving..."). Edit forms keep submit disabled until a value changes. (U2, U3)
* Every destructive action opens `ConfirmDialog` at the level defined in section 11. Unlisted destructive actions are level 2. (U4)
* Toast text and validation text use the templates in sections 13.3 and 14. Never show text from an API response. (U5, U7)
* Users never type IDs. Use `Select` or `EntityCombobox`. Never display database IDs. (D7, X4)
* Every control has a visible label and an accessible name. Status is always icon plus text. Focus ring follows section 17.2. (A4, A5, A6, A3)
* Never store tokens in web storage. Never use `dangerouslySetInnerHTML`. (X1, X3)
* UI permission checks are experience only. Handle 401 and 403 as defined in section 20.3. (X6)
* Hide a control when the role never has the permission. Disable it with a reason Tooltip when only the record state blocks it. (section 22.2).
* `StatusBadge` is flat color only. No gradients, glows, or soft shadows on badges. (T7, 15.3)
* Every routed page is wrapped in `ErrorBoundary`. A crash shows `ErrorState` with a reload action, not a blank screen. Sentry reports never include personal data. (section 12.7)


## Never without a decision record

* Add a runtime dependency. (S4)
* Add a Zustand store. (D2)
* Edit files in `components/ui` beyond applying tokens. (S3)
* Add a page to the `wide` width list. (section 7.4)
* Break any rule in section 1. (section 0.3)

## If rules conflict

Apply the more restrictive rule and list the conflict in your change summary. Precedence: security rules, accessibility rules, the design system, the pattern registry, shared components, shadcn, the feature request. (section 0.2)

## Before you finish

Run `lint`, `typecheck`, `test`, `test:e2e`, and `build`. All must pass. For every new or changed page, the Playwright run must show zero serious axe violations, no horizontal overflow at 320, 375, 768, 1024, 1280, and 1440 pixels, and zero console errors or warnings.

Then write the change summary with these parts:

1. Files changed.
2. REVIEW rules you checked, by ID.
3. Conflicts found.
4. Missing contract items.
5. Script results.
6. Registry rows updated.
7. For new interactive patterns, the manual keyboard check result.