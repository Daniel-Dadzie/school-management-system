# CarePoint School Management System

# Frontend Design System, Version 2.0

**Document:** `docs/frontend-design-system.md`
**Applies to:** `apps/web/src/app/(auth)/**` and `apps/web/src/app/(portal)/**`
(the authenticated school management portal). For the public website and
public admissions flow, see `docs/frontend-design-system-public.md`. Tokens,
typography, spacing, icons, motion, and accessibility rules in sections 3,
5, 6, 15, 17, and 18 are shared by both surfaces; the public document
extends them rather than redefining them.
**Status:** Active
**Audience:** Engineers and AI coding agents
**Purpose:** The single source of truth for frontend visual design, UX, layout, interaction, accessibility, and component standards.

## 0. How to use this document

### 0.1 Rule language

This document uses three words with fixed meanings.

* **MUST** and **MUST NOT** are mandatory. A change that breaks one is not complete.
* **MAY** is explicitly optional. No approval is needed.
* There is no "should" in this document. If a rule has an exception, the exception is written next to the rule.

Every rule in section 1 has a verification method:

| Code | Meaning |
| --- | --- |
| LINT | The `lint` or `typecheck` script fails when the rule is broken. |
| UNIT | A Vitest test covers the rule. |
| E2E | A Playwright test covers the rule. |
| AXE | The axe scan inside a Playwright test covers the rule. |
| REVIEW | No tool checks it. The author MUST state in the change summary that the rule was checked, and a reviewer confirms it. |

### 0.2 Order of precedence

When two sources disagree, the lower number wins.

1. Security rules (section 1, IDs starting with X) and section 20.3.
2. Accessibility rules (section 1, IDs starting with A) and section 17.
3. This document.
4. The reference implementations listed in the pattern registry (section 27).
5. Existing shared components in `components/shared`.
6. shadcn/ui components in `components/ui`.
7. The requirements of the feature being built.

If a reference implementation breaks a rule of higher precedence, follow the higher rule and add a note in the registry row.

### 0.3 Conflicts and missing information

* If two rules conflict, apply the more restrictive one and list the conflict in the change summary.
* The frontend MUST NOT invent endpoints, permission keys, error codes, or enum values. If the backend contract does not define one, build the rest of the change, leave that part out, and list it under "Missing contract items" in the change summary.
* An exception to any rule needs a decision record at `docs/decisions/NNNN-short-title.md` containing: the rule ID, the reason, the scope, and the date. A rule with a decision record is exempt only inside that scope.

### 0.4 Change summary

Every change MUST end with a summary containing: files changed, REVIEW rules checked, conflicts found, missing contract items, and the results of the scripts in section 25.3.

## 1. Hard rules

### 1.1 Tokens and styling

| ID | Rule | Verified by |
| --- | --- | --- |
| T1 | Components MUST NOT contain color literals (hex, rgb, hsl, oklch, or CSS color names). Color values exist only in the files listed in section 2.3. | LINT |
| T2 | Components MUST NOT use Tailwind default palette classes such as `bg-blue-500`. Use semantic token classes only. | LINT |
| T3 | Components MUST NOT use Tailwind arbitrary values (square bracket syntax) except `grid-cols-[...]`, `grid-rows-[...]`, and Radix variables such as `w-[var(--radix-popover-trigger-width)]`. | LINT |
| T4 | Text color classes MUST NOT use opacity modifiers such as `text-foreground/70`, because contrast cannot be verified. | LINT |
| T5 | Status colors MUST come from the status tokens in section 3.4 through `StatusBadge`, `StatusAlert`, or `StatusIcon`. | REVIEW |
| T6 | The only font is Inter, in weights 400, 500, and 600. | REVIEW |
| T7 | Gradients, backdrop blur, glassmorphism, neumorphism, and custom shadows MUST NOT be used. Allowed shadows are in section 6.3. | LINT |
| T8 | The `dark:` variant MUST NOT be used. Dark mode is out of scope for version 2.0. | LINT |
| T9 | Icons MUST come from `lucide-react`, at the sizes in section 15. | LINT |

### 1.2 Structure

| ID | Rule | Verified by |
| --- | --- | --- |
| S1 | Every routed page MUST render `PageContainer` and `PageHeader` (section 8.1). | REVIEW |
| S2 | A UI pattern used in three or more places MUST be extracted to `components/shared`. A pattern used in fewer than three places MUST NOT be extracted. | REVIEW |
| S3 | Files in `components/ui` (shadcn primitives) MUST NOT be edited except to apply theme tokens and to remove classes that break sections 5, 6, or 18 (for example the default `shadow-sm`). Variants and behavior go in `components/shared` wrappers. | REVIEW |
| S4 | A new runtime dependency MUST have a decision record. Approved dependencies are listed in section 2.1. | REVIEW |
| S5 | A feature folder MUST NOT import from another feature folder. Shared code lives in `components/shared`, `hooks`, or `lib`. | LINT |
| S6 | Search text, filters, sort, page, and page size on list pages MUST live in the URL (section 19.4). | E2E |

### 1.3 Data

| ID | Rule | Verified by |
| --- | --- | --- |
| D1 | Server data MUST be read and written through TanStack Query hooks. `fetch` and the API client MUST NOT be called from components or from `useEffect`. | LINT |
| D2 | Zustand MUST NOT hold server data. Only the stores in section 19.2 exist. | REVIEW |
| D3 | Every API response MUST be parsed with a Zod schema inside `lib/api` or the feature's `api.ts`. | UNIT |
| D4 | Every mutation hook MUST declare the query keys it invalidates. | UNIT |
| D5 | Money values MUST be handled as decimal strings. The frontend MUST NOT add, subtract, or multiply money values. Totals come from the backend. | REVIEW |
| D6 | Dates, times, numbers, and money MUST be formatted only with the functions in `lib/format` (section 21.3). | LINT |
| D7 | Users MUST NOT type database IDs. Related records are chosen with `EntityCombobox` or `Select` (section 13.7). | REVIEW |
| D8 | A list that can exceed 50 records in production MUST use server side pagination, sorting, and filtering (section 10.1). | REVIEW |
| D9 | The frontend MUST NOT invent endpoints, permission keys, error codes, or enum values (section 0.3). | REVIEW |

### 1.4 UX

| ID | Rule | Verified by |
| --- | --- | --- |
| U1 | Every data view MUST implement the six states in section 12: loading, empty, filtered empty, error, forbidden, populated. | UNIT |
| U2 | While a mutation is pending, its button MUST be disabled, show a spinner, and use the progressive label from section 13.5. | UNIT |
| U3 | Edit forms MUST keep submit disabled until a value differs from the loaded value. Create forms MUST NOT. | UNIT |
| U4 | Every destructive action MUST open `ConfirmDialog` at the severity level defined in section 11. | E2E |
| U5 | Toasts MUST use the templates in section 14 and MUST NOT render text taken from an API response. | UNIT |
| U6 | A page header MUST contain at most one primary button. A dialog footer MUST contain at most one primary button. | REVIEW |
| U7 | Validation messages MUST use the templates in section 13.3. | UNIT |
| U8 | A form with unsaved changes MUST block in app navigation and tab close (section 13.6). | E2E |
| U9 | UI text MUST use sentence case, MUST NOT use exclamation marks, and MUST use the terms in section 21.2. | REVIEW |
| U10 | Every `DataTable` MUST set `mobilePattern` to `"cards"` or `"scroll"`. There is no default. | LINT |

### 1.5 Accessibility

| ID | Rule | Verified by |
| --- | --- | --- |
| A1 | Every page MUST meet WCAG 2.2 level AA. The axe scan MUST report zero serious or critical violations. | AXE |
| A2 | Text contrast MUST be at least 4.5 to 1. Text of 24px or larger, or bold text of 18.66px or larger, MUST be at least 3 to 1. Icons and control boundaries MUST be at least 3 to 1. | UNIT |
| A3 | Keyboard focus MUST be visible using the style in section 17.2. Focus outlines MUST NOT be removed. | REVIEW |
| A4 | Every icon only control MUST have an accessible name and a Tooltip with the same text. | AXE |
| A5 | Every form control MUST have a visible label linked with `htmlFor`. Placeholder text MUST NOT be the label. | AXE |
| A6 | Status MUST NOT be communicated by color alone. Every status renders an icon and a text label. | REVIEW |
| A7 | Interactive targets MUST be at least 24 by 24 CSS pixels, and at least 44 by 44 CSS pixels below 768px width. | AXE |
| A8 | The global reduced motion rule in section 18.3 MUST be present in `theme/theme.css`. | REVIEW |
| A9 | Every dialog and sheet MUST have a title and a description. | AXE |
| A10 | Every page MUST have exactly one `h1` and MUST NOT skip heading levels. | AXE |

### 1.6 Security

| ID | Rule | Verified by |
| --- | --- | --- |
| X1 | Access tokens and refresh tokens MUST NOT be stored in `localStorage`, `sessionStorage`, or IndexedDB. | REVIEW |
| X2 | Secrets MUST NOT appear in client code or in environment variables exposed to the browser. | REVIEW |
| X3 | `dangerouslySetInnerHTML` MUST NOT be used. | LINT |
| X4 | Database identifiers MUST NOT be displayed. Show business identifiers (admission number, staff number, invoice number, receipt number). | REVIEW |
| X5 | Personal data MUST NOT be sent to console logs, analytics, or error reports. | REVIEW |
| X6 | UI permission checks are experience only. Every request MUST handle 401 and 403 responses as defined in section 20.3. | E2E |
| X7 | Files under `theme/` MUST NOT import from `features/auth` or `lib/permissions`. | LINT |
| X8 | External links MUST use `rel="noopener noreferrer"`. | LINT |

## 2. Stack, structure, and tooling

### 2.1 Approved stack

| Area | Technology |
| --- | --- |
| Language | TypeScript with `strict` set to true |
| UI | React, Tailwind CSS, shadcn/ui on Radix primitives |
| Server state | TanStack Query |
| Tables | `@tanstack/react-table` (headless, used by `DataTable`) |
| Client state | Zustand |
| Forms | React Hook Form with Zod |
| Icons | `lucide-react` |
| Toasts | `sonner` (the shadcn toast component) |
| Date picker | `react-day-picker` (the shadcn Calendar component) |
| Font | Inter, latin subset, self hosted through `@fontsource-variable/inter` |
| Backend | Spring Boot API, JSON over HTTPS |
| Error monitoring | Sentry (`@sentry/nextjs`) |

Any dependency not in this table needs a decision record (S4).

Supported browsers: the latest two major versions of Chrome, Edge, Firefox, and Safari on desktop, plus Chrome on Android and Safari on iOS 16.4 or newer.

### 2.2 Directory layout

```text
apps/web/src/
  theme/
    defaults.ts        default brand colors and fixed tokens
    derive.ts          color derivation and validation (Appendix B)
    provider.tsx       ThemeProvider
    theme.css          CSS variables and the reduced motion rule
  components/
    ui/                shadcn primitives
    shared/            PageContainer, PageHeader, DataTable, ConfirmDialog, StatusBadge, EmptyState, ErrorState, and the rest of section 2.6
  features/
    <feature>/         api.ts, hooks.ts, schemas.ts, components/, pages/
  hooks/
  lib/
    api/               client.ts, errors.ts, errorMessages.ts, pagination.ts, branding.ts
    format/            index.ts
    permissions.ts
    validation/        messages.ts
  navigation.ts        navigation configuration (section 7.3)
```

### 2.3 Files that may contain color values

Only these files may contain color literals: `theme/defaults.ts`, `theme/derive.ts`, `theme/theme.css`, and test files. The lint override for T1 applies to these paths only.

### 2.4 Required scripts

`apps/web/package.json` MUST define these scripts. Use the package manager already used by the repository.

| Script | Purpose |
| --- | --- |
| `lint` | ESLint with the configuration in section 26 |
| `typecheck` | TypeScript compile with no emit |
| `test` | Vitest |
| `test:e2e` | Playwright, including axe and Lighthouse budgets |
| `build` | Production build |

### 2.5 Required development tooling

The following development dependencies are approved by this document: `eslint`, `typescript-eslint`, `eslint-plugin-react`, `eslint-plugin-react-hooks`, `eslint-plugin-jsx-a11y`, `eslint-plugin-import`, `vitest`, `@testing-library/react`, `@testing-library/user-event`, `@playwright/test`, `@axe-core/playwright`, and `@lhci/cli`.

### 2.6 Shared component catalog

Every component below lives in `components/shared`. Pages MUST use these and MUST NOT rebuild them.

| Component | Purpose | Defined in |
| --- | --- | --- |
| `PageContainer` | Page width and padding | 7.4 |
| `PageHeader` | Title, breadcrumbs, and page actions | 8.1 |
| `Button` | Variants and responsive sizes | 8.2, 8.3 |
| `MetricCard` | Dashboard metric | 9.2 |
| `DataTable` | Table with toolbar, sorting, pagination, and selection | 10 |
| `RecordCard` | Mobile card for one table row | 10.10 |
| `TruncatedText` | Truncated text with a Tooltip | 10.9 |
| `ConfirmDialog` | Confirmation for destructive and important actions | 11 |
| `EmptyState`, `ErrorState`, `ForbiddenState`, `NotFoundState` | Interface states | 12 |
| `TableSkeleton`, `CardSkeleton`, `FormSkeleton` | Loading states | 12 |
| `OfflineBanner` | Offline notice | 12 |
| `TextField`, `TextareaField`, `SelectField`, `DateField`, `NumberField`, `CheckboxField`, `RadioGroupField`, `SwitchField`, `FileField` | Form fields | 13.2 |
| `EntityCombobox` | Selecting related records | 13.7 |
| `FormSection`, `FormAlert`, `ErrorSummary` | Form structure and errors | 13 |
| `StatusBadge`, `StatusAlert`, `StatusIcon` | Status display | 15.3 |
| `Can` | Permission gate | 22.1 |
| `ChildSwitcher` | Guardian child selector | 22.3 |
| `LogoFallback` | Logo placeholder | 4.9 |
| `ErrorBoundary` | Catches render crashes and reports them | 12.7 |

## 3. Design tokens

### 3.1 Token layers

1. **Brand inputs.** Two values an administrator can change: primary color and accent color (section 4).
2. **Derived tokens.** Computed from the brand inputs by `theme/derive.ts`. Nobody sets them by hand.
3. **Neutral tokens.** Fixed. Not configurable.
4. **Status tokens.** Fixed. Not configurable.

Every token is exposed as a CSS variable and as a Tailwind color with the same name. For example, the token `muted-foreground` is the variable `--muted-foreground` and the class `text-muted-foreground`.

### 3.2 Brand and derived tokens

| Token | Source | Default value | Used for |
| --- | --- | --- | --- |
| `primary` | Administrator setting | `#1B3A6B` | Primary buttons, sidebar background, checked controls, progress bars |
| `primary-foreground` | Derived | `#FFFFFF` | Text and icons on `primary` |
| `primary-hover` | Derived | `#16315C` | Hover and pressed state of `primary` |
| `brand-accent` | Administrator setting | `#2E5FA3` | Text links, active tab indicator, selected indicators |
| `brand-accent-foreground` | Derived | `#FFFFFF` | Text and icons on `brand-accent` |
| `brand-accent-hover` | Derived | `#27528D` | Hover state of `brand-accent` |
| `accent` | Derived | `#E9EEF6` | The shadcn hover and selected surface: menu item highlight, ghost button hover, selected table row |
| `accent-foreground` | Fixed | `#0F172A` | Text on `accent` |
| `ring` | Equal to `primary` | `#1B3A6B` | Focus ring |
| `sidebar` | Equal to `primary` | `#1B3A6B` | Sidebar background |
| `sidebar-foreground` | Equal to `primary-foreground` | `#FFFFFF` | Sidebar text and icons |
| `sidebar-accent` | Equal to `primary-hover` | `#16315C` | Sidebar hover and active item background |

Important: in shadcn, the token named `accent` is a neutral hover surface. It is not the brand accent. The brand accent is `brand-accent`. Never map the brand accent color to `accent`.

### 3.3 Neutral tokens

| Token | Value | Used for | Contrast checked against |
| --- | --- | --- | --- |
| `background` | `#F8FAFC` | Application background | |
| `foreground` | `#0F172A` | Main text | 17.06 to 1 on background |
| `card` | `#FFFFFF` | Cards, panels, dialogs, popovers, form surfaces | |
| `card-foreground` | `#0F172A` | Text on card | 17.85 to 1 |
| `popover` | `#FFFFFF` | Popovers, menus, tooltips | |
| `popover-foreground` | `#0F172A` | Text on popover | 17.85 to 1 |
| `secondary` | `#F1F5F9` | Secondary button background, subtle panels | |
| `secondary-foreground` | `#0F172A` | Text on secondary | 16.30 to 1 |
| `muted` | `#F1F5F9` | Muted surfaces | |
| `muted-foreground` | `#475569` | All secondary and supporting text | 7.24 on background, 7.58 on card, 6.92 on muted |
| `subtle` | `#64748B` | Icons and decorative glyphs only. Never text. | 4.76 on card |
| `border` | `#E2E8F0` | Dividers, card edges, table row lines | Decorative only |
| `input` | `#64748B` | Border of input, select, textarea, checkbox, and radio controls | 4.76 on card, 4.55 on background |
| `destructive` | `#DC2626` | Fill of the destructive button | 4.83 with white text |
| `destructive-foreground` | `#FFFFFF` | Text on destructive | |

Migration from version 1.0: `text-primary` became `foreground`. `text-secondary` became `muted-foreground`. `text-muted` (`#64748B`) became `subtle` and MUST NOT be used for text, because it measures 4.34 to 1 on the `muted` surface.

### 3.4 Status tokens

Each status has four tokens: `solid`, `text`, `tint`, and `border`. Tailwind class names use the pattern `bg-success`, `text-success-text`, `bg-success-tint`, `border-success-border`. The same pattern applies to `warning`, `error`, `info`, and `neutral`.

| Status | `solid` | `text` | `tint` | `border` | `text` on `tint` |
| --- | --- | --- | --- | --- | --- |
| success | `#16A34A` | `#166534` | `#F0FDF4` | `#BBF7D0` | 6.81 to 1 |
| warning | `#D97706` | `#92400E` | `#FFFBEB` | `#FDE68A` | 6.84 to 1 |
| error | `#DC2626` | `#B91C1C` | `#FEF2F2` | `#FECACA` | 5.91 to 1 |
| info | `#2563EB` | `#1D4ED8` | `#EFF6FF` | `#BFDBFE` | 6.16 to 1 |
| neutral | `#64748B` | `#334155` | `#F1F5F9` | `#CBD5E1` | 9.45 to 1 |

Rules for status tokens:

* `solid` is for icons of 16px or larger, progress bars, and dots. It measures at least 3 to 1 against `card` and `background`.
* `solid` of `success` and `warning` MUST NOT carry text. White text on them measures 3.30 and 3.19 to 1, which fails.
* White text on `solid` is allowed only for `error` (4.83 to 1) and `info` (5.17 to 1).
* Status text MUST use the `text` token, never `solid`.
* Brand settings MUST NOT change status tokens.
* Brand colors MUST NOT be used to show status.

### 3.5 Reference CSS

`theme/theme.css` defines the defaults. `ThemeProvider` overwrites only the brand and derived variables at runtime.

```css
:root {
  --background: #F8FAFC;
  --foreground: #0F172A;
  --card: #FFFFFF;
  --card-foreground: #0F172A;
  --popover: #FFFFFF;
  --popover-foreground: #0F172A;
  --secondary: #F1F5F9;
  --secondary-foreground: #0F172A;
  --muted: #F1F5F9;
  --muted-foreground: #475569;
  --subtle: #64748B;
  --border: #E2E8F0;
  --input: #64748B;
  --destructive: #DC2626;
  --destructive-foreground: #FFFFFF;

  --primary: #1B3A6B;
  --primary-foreground: #FFFFFF;
  --primary-hover: #16315C;
  --brand-accent: #2E5FA3;
  --brand-accent-foreground: #FFFFFF;
  --brand-accent-hover: #27528D;
  --accent: #E9EEF6;
  --accent-foreground: #0F172A;
  --ring: #1B3A6B;
  --sidebar: #1B3A6B;
  --sidebar-foreground: #FFFFFF;
  --sidebar-accent: #16315C;

  --success: #16A34A;  --success-text: #166534;  --success-tint: #F0FDF4;  --success-border: #BBF7D0;
  --warning: #D97706;  --warning-text: #92400E;  --warning-tint: #FFFBEB;  --warning-border: #FDE68A;
  --error: #DC2626;    --error-text: #B91C1C;    --error-tint: #FEF2F2;    --error-border: #FECACA;
  --info: #2563EB;     --info-text: #1D4ED8;     --info-tint: #EFF6FF;     --info-border: #BFDBFE;
  --neutral: #64748B;  --neutral-text: #334155;  --neutral-tint: #F1F5F9;  --neutral-border: #CBD5E1;

  --radius: 0.5rem;
}
```

## 4. Runtime school branding

### 4.1 What administrators can configure

Exactly three settings, plus reset:

1. School logo.
2. Primary color.
3. Accent color.
4. Reset to default theme.

Fonts, radius, spacing, neutral colors, and status colors are not configurable.

### 4.2 Derivation

`theme/derive.ts` is the only place colors are derived. `ThemeProvider`, the settings preview, and the unit tests all call it. All math uses the OKLab color space, and all outputs are uppercase six digit hex.

| Output | Formula |
| --- | --- |
| `primary-hover` | Multiply OKLab L, a, and b of `primary` by 0.9 |
| `brand-accent-hover` | Multiply OKLab L, a, and b of `brand-accent` by 0.9 |
| `accent` | Mix 10 percent of `brand-accent` with 90 percent white in OKLab: L = 0.1 x L + 0.9, a = 0.1 x a, b = 0.1 x b |
| `primary-foreground` | Whichever of `#FFFFFF` and `#0F172A` has the higher WCAG contrast with `primary` |
| `brand-accent-foreground` | Same rule, applied to `brand-accent` |
| `ring`, `sidebar` | Equal to `primary` |
| `sidebar-foreground` | Equal to `primary-foreground` |
| `sidebar-accent` | Equal to `primary-hover` |

Appendix B contains the reference implementation.

### 4.3 Validation

Apply these checks in order to both the primary color and the accent color. Stop at the first failure and return its error code. The backend MUST enforce the same rules. Frontend validation is a convenience and never the authority.

| Order | Check | Error code |
| --- | --- | --- |
| V1 | The value is exactly `#` followed by six hex digits. Reject three digit hex, eight digit hex, `rgb()`, `hsl()`, and color names. Normalize to uppercase. | `BRAND_COLOR_FORMAT` |
| V2 | Contrast between the color and the page background `#F8FAFC` is at least 4.5 to 1. | `BRAND_COLOR_CONTRAST` |
| V3 | Contrast between the derived foreground and the color, and between the same foreground and the hover color, is at least 4.5 to 1 in both cases. | `BRAND_COLOR_FOREGROUND_CONTRAST` |
| V4 | The OKLab Euclidean distance between the color and each of the four status `solid` colors (success, warning, error, info) is at least 0.05. | `BRAND_COLOR_STATUS_CONFLICT` |

V3 cannot fail after V2 passes, because V2 forces the color to be dark enough for white text. It stays in place as a guard in case the neutral palette changes.

### 4.4 Suggested color

When a color fails V2, V3, or V4, the settings form offers a "Use suggested color" button. The suggestion is computed like this: lower the OKLab L of the rejected color by 0.01, keep a and b, convert to hex, and run V1 to V4. Repeat up to 40 times and return the first color that passes. If none passes, show no suggestion. The suggestion is never applied automatically.

### 4.5 Test fixtures

`theme/derive.test.ts` MUST assert these results.

| Input | Expected result | Suggestion |
| --- | --- | --- |
| `#1B3A6B` | Valid. Foreground `#FFFFFF`, hover `#16315C`. | |
| `#2E5FA3` | Valid. Foreground `#FFFFFF`, hover `#27528D`, accent tint `#E9EEF6`. | |
| `#0F766E` | Valid | |
| `#7C3AED` | Valid | |
| `#B91C1C` | Valid (distance to error is 0.076) | |
| `#16A34A` | Invalid, `BRAND_COLOR_CONTRAST` (3.15 to 1) | `#00842B` |
| `#F59E0B` | Invalid, `BRAND_COLOR_CONTRAST` (2.05 to 1) | `#AF5D00` |
| `#2563EB` | Invalid, `BRAND_COLOR_STATUS_CONFLICT` (distance 0.0) | `#1652DA` |
| `#FFF` | Invalid, `BRAND_COLOR_FORMAT` | |
| `rgb(0,0,0)` | Invalid, `BRAND_COLOR_FORMAT` | |

### 4.6 API contract

The frontend expects the following. The backend contract is authoritative. If it differs, change only `lib/api/branding.ts`.

| Method and path | Access | Body or response |
| --- | --- | --- |
| `GET /api/v1/branding` | Public, no sign in | Response: `{ schoolName, logoUrl, primaryColor, accentColor, updatedAt }`. `logoUrl` is a string or null. |
| `PUT /api/v1/settings/branding` | Requires the branding management permission | Body: `{ primaryColor, accentColor }` |
| `POST /api/v1/settings/branding/logo` | Requires the branding management permission | Multipart field named `file`. Response is the updated branding. |
| `DELETE /api/v1/settings/branding/logo` | Requires the branding management permission | Removes the logo |
| `POST /api/v1/settings/branding/reset` | Requires the branding management permission | Resets colors and logo to defaults |

The permission key constant lives in `lib/permissions.ts` and is copied from the backend contract (D9).

### 4.7 Loading and first paint

The backend is the authority. The browser cache exists only to avoid a flash of default colors.

1. The default theme is built into `theme/theme.css`.
2. Before React mounts, a small inline script reads `carepoint.branding.v1` from `localStorage`. It applies the stored colors only if they pass V1. If the entry is missing or invalid, defaults stay. The script MUST be allowed by the site's Content Security Policy through a nonce or hash. If the app is server rendered, the server layout MAY inject the variables instead of using the inline script.
3. `ThemeProvider` loads `GET /api/v1/branding` with the query key `["branding"]`, `staleTime` of 5 minutes, and `refetchOnWindowFocus` set to true. On success it runs `derive`, writes the CSS variables, and rewrites the cache entry.
4. If the request fails, keep the cached or default theme and show no error.
5. The cache MUST NOT be read for anything other than step 2.

### 4.8 Settings screen

Page: Settings, School branding. It requires the branding management permission. Users without it see `ForbiddenState`.

* Layout: form on the left and live preview on the right at 1024px and wider. Stacked below 1024px, preview first.
* Fields: Primary color, Accent color, Logo. Each color field has a text input for the hex value and a native color input kept in sync.
* Validation runs on every change, debounced by 200 ms, using V1 to V4.
* Preview: a panel with CSS variables scoped to the panel only. Unsaved changes MUST NOT change the rest of the app. The preview shows a sample header, a sample sidebar with one active item, a primary button, an outline button, a text link, a focus ring sample, one badge for each of the four statuses, and a table row in the selected state.
* Buttons: "Save changes" (primary). It is disabled until the form is valid and different from saved values. While pending it reads "Saving...". "Reset to default" (outline) opens `ConfirmDialog` at level 1 with the title "Reset school branding?", the body "The logo and colors return to the CarePoint default theme. You can set your own branding again at any time.", and the confirm label "Reset branding".
* Success toasts: "School branding saved." and "School branding reset to default."

Error messages:

| Code | Message |
| --- | --- |
| `BRAND_COLOR_FORMAT` | Enter a color as # followed by 6 letters or numbers, for example #1B3A6B. |
| `BRAND_COLOR_CONTRAST` | This color is too light to read on the page background. Choose a darker color. |
| `BRAND_COLOR_FOREGROUND_CONTRAST` | Text on buttons in this color would be hard to read. Choose a different color. |
| `BRAND_COLOR_STATUS_CONFLICT` | This color is too close to a status color. Choose a different color. |

### 4.9 Logo

* Accepted types: PNG, JPEG, WebP. SVG is not accepted.
* Maximum size: 1 MB. Width and height must each be between 128 and 2048 pixels.
* The frontend checks type, size, and dimensions before upload. The backend checks again and re encodes the file.
* Display height: 32px (`h-8`) in the header and sidebar, 40px (`h-10`) on the sign in page. Use `object-contain` and set `width` and `height` attributes to avoid layout shift.
* Alt text: `{schoolName} logo`.
* If the image fails to load, render `LogoFallback`: a square with the school's initials on `bg-primary text-primary-foreground`.
* The logo appears in the sidebar header (with the school name when expanded, alone when collapsed), on the sign in page, on printed report cards and PDFs, and in emails. The last two are produced by the backend.

### 4.10 Security boundary

Branding is presentation only. It MUST NOT change roles, permissions, authorization, academic rules, grading rules, payment rules, promotion rules, audit requirements, API security, database security, or business logic. Rule X7 enforces this by forbidding imports from auth and permission modules inside `theme/`.

### 4.11 Multi school future

The current release has one school. Keep one branding record. Do not add tenant identifiers to the branding endpoints or types. If the product later becomes multi school, the tenant will be resolved from the host name and the response shape stays the same.

## 5. Typography

Use Inter. Load only the latin subset with `font-display: swap`. The fallback stack is `ui-sans-serif, system-ui, sans-serif`. Allowed weights are 400 (`font-normal`), 500 (`font-medium`), and 600 (`font-semibold`).

| Element | Classes | Size and line height |
| --- | --- | --- |
| Page title | `text-2xl font-semibold tracking-tight` | 24px, 32px |
| Section heading | `text-lg font-semibold` | 18px, 28px |
| Card title | `text-base font-semibold` | 16px, 24px |
| Body text | `text-sm` | 14px, 20px |
| Long reading text (help, descriptions over two lines) | `text-base` | 16px, 24px |
| Table cell | `text-sm` | 14px, 20px |
| Table header | `text-xs font-medium text-muted-foreground` | 12px, 16px |
| Form label | `text-sm font-medium` | 14px, 20px |
| Button text | `text-sm font-medium` | 14px, 20px |
| Supporting text | `text-sm text-muted-foreground` | 14px, 20px |
| Caption, timestamp, badge text | `text-xs` | 12px, 16px |
| Dashboard metric value | `text-3xl font-semibold tabular-nums` | 30px, 36px |

Rules:

* No text is smaller than 12px.
* Numbers in tables and metrics use `tabular-nums`.
* Prose blocks longer than two lines use `max-w-prose`.
* Text inputs use `text-base` below 768px and `text-sm` from 768px, so iOS does not zoom on focus.

## 6. Spacing, radius, and elevation

### 6.1 Spacing

Spacing steps MUST come from this list: 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 6, 8, 12, 16 (Tailwind scale).

| Context | Classes |
| --- | --- |
| Page padding | `p-4 md:p-6` |
| Between page sections | `space-y-6` |
| Between form fields | `space-y-4` |
| Label to control | `space-y-2` |
| Between form sections | `space-y-6` |
| Card padding | `p-4 md:p-6` |
| Card header internal gap | `space-y-1.5` |
| Dialog padding | `p-6` |
| Dialog content gap | `gap-4` |
| Dialog footer gap | `gap-2` |
| Toolbar gap | `gap-2` |
| Toolbar to table | `mb-4` |
| Table cell (from 768px) | `px-3 py-2.5` (row height 40px) |
| Table cell (below 768px) | `px-3 py-3.5` (row height 48px) |
| Navigation item | `h-10 px-3 gap-3` |
| Icon to text | `gap-2` |
| Grid of cards | `gap-4` |

### 6.2 Border radius

The base `--radius` is 0.5rem.

| Element | Class |
| --- | --- |
| Inputs, selects, textareas, buttons | `rounded-md` |
| Cards, dialogs, sheets | `rounded-lg` |
| Popovers, menus, tooltips | `rounded-md` |
| Badges, avatars | `rounded-full` |
| Skeletons | `rounded-md` |

Nothing may use a radius larger than `rounded-lg`, except `rounded-full`.

### 6.3 Elevation

| Element | Style |
| --- | --- |
| Page and cards | Border only. No shadow. |
| Sticky header | `border-b` only. No shadow. |
| Dropdown, popover, tooltip | `shadow-md` |
| Dialog, sheet, toast | `shadow-lg` |
| Overlay behind dialogs | `bg-black/50`, no blur |

## 7. Application shell and layout

### 7.1 Shell

```text
┌───────────────────────────────────────────────┐
│ Header (h-14, sticky top-0)                   │
├──────────────┬────────────────────────────────┤
│ Sidebar      │ Main content                   │
│ w-64 / w-16  │ PageContainer                  │
└──────────────┴────────────────────────────────┘
```

* From 1024px: persistent sidebar, 256px wide (`w-64`), collapsible to 64px (`w-16`).
* Below 1024px: no sidebar. A menu button in the header opens a `Sheet` drawer from the left, 288px wide (`w-72`). The drawer closes on route change.
* The header is sticky and 56px high (`h-14`).
* The main area scrolls. The header and sidebar do not.
* The first focusable element on every page is a "Skip to main content" link that targets the `main` element.

### 7.2 Header contents

Left to right:

1. Menu button (below 1024px only), icon `Menu`, label "Open navigation".
2. Breadcrumbs from 768px. Below 768px show only the current page title.
3. Space filler.
4. `ChildSwitcher` for guardians with two or more children (section 22.3).
5. Notifications button: icon `Bell`, with an unread count badge when the count is above 0. Accessible name: "Notifications, {n} unread", or "Notifications" when zero.
6. User menu: avatar with initials, plus the full name from 768px. Menu items: "Profile", "Sign out".

### 7.3 Sidebar and navigation configuration

* All navigation lives in `navigation.ts` as groups of items. Each item has `label`, `icon`, `href`, and `permission`.
* The sidebar renders only items whose permission the user holds. A group with no visible items is not rendered.
* The active item is the one whose `href` is the longest prefix of the current path. It has `aria-current="page"`, the `sidebar-accent` background, `font-semibold`, and a 4px left border in `sidebar-foreground` (`border-l-4`). Hover uses `sidebar-accent`.
* Collapsed state shows icons only. Each icon has a Tooltip on the right with the label. Group labels are replaced by a divider.
* Collapsed state is stored in `uiPreferences` (section 19.2). On a first visit it is expanded from 1280px and collapsed from 1024px to 1279px.
* Group labels use `text-xs font-medium` in `sidebar-foreground`. No opacity modifiers.
* Focus ring inside the sidebar uses `focus-visible:ring-sidebar-foreground` (section 17.2).

### 7.4 Content width

`PageContainer` applies `mx-auto w-full max-w-7xl`. It accepts `width="wide"`, which removes the maximum width. Only these pages may use `wide`: gradebook, attendance register, timetable, results broadsheet. Adding a page to this list requires a change to this section.

### 7.5 Layering

| Layer | z index |
| --- | --- |
| Sidebar | `z-30` |
| Header | `z-40` |
| Dropdowns, popovers, tooltips, dialogs, sheets, and their overlays | `z-50` |
| Toasts | Set by `sonner`. Do not override. |

## 8. Page structure, buttons, and actions

### 8.1 Page structure

Every routed page renders, in this order:

1. `PageHeader`
2. Optional summary metrics (section 9)
3. Toolbar (search and filters), for list pages
4. Main content: table, cards, or form
5. Pagination footer, for paginated tables

`PageHeader` props:

| Prop | Rule |
| --- | --- |
| `title` | Required. Plain string, at most 60 characters. Renders the page's only `h1`. |
| `breadcrumbs` | Required on every page except the dashboard. |
| `description` | Optional. One sentence, at most 160 characters. |
| `primaryAction` | Zero or one. |
| `secondaryActions` | Zero to three shown as buttons. Any more go in a menu with the label "More actions". |

Layout: below 768px the actions stack under the title and are full width. From 768px the actions sit on the right of the title row.

Destructive actions never appear as header buttons. They live in the "More actions" menu and open `ConfirmDialog`.

### 8.2 Button variants

| Variant | Use for |
| --- | --- |
| `default` | The one primary action of a page header, dialog footer, or form |
| `secondary` | Alternative actions with lower priority |
| `outline` | Neutral actions such as Export, Filters, Cancel |
| `ghost` | Icon buttons, row actions, toolbar buttons |
| `destructive` | The confirm button inside `ConfirmDialog` only |
| `link` | Inline text links |

### 8.3 Button sizes

The shared `Button` applies these responsively. Callers do not pass responsive classes.

| Size | Below 768px | From 768px |
| --- | --- | --- |
| Default | `h-11` (44px) | `h-10` (40px) |
| Small (table rows and toolbars) | `h-11` | `h-8` (32px) |
| Icon | `size-11` | `size-10` |
| Row icon | `size-11` | `size-8` |

### 8.4 Button labels

Labels are a verb plus an object in sentence case: "Add student", "Approve application", "Export results". Exceptions are "Cancel", "Save", "Close", "Next", and "Previous". While pending, the label changes as defined in section 13.5, and a `Loader2` icon (`size-4 animate-spin`) appears left of the label.

### 8.5 Sign in page

The sign in page lives in `app/(auth)/login`. It is publicly reachable and
requires no authentication.

* Layout: centered card, `max-w-sm`, on `background`. School logo above
  the form (section 4.9), `h-10`.
* Fields: Email or username, Password. `PasswordField` adds a show/hide
  toggle (`Eye` / `EyeOff`, `size-4`, ghost button inside the input,
  accessible name "Show password" / "Hide password").
* No "Remember me" control. Session length is a backend decision.
* Submit label "Sign in", pending label "Signing in...".
* On success: redirect by role, to the first navigation item in section
  22.3 for that role.
* On 401: inline `FormAlert`, "Incorrect email or password." Never say
  which field was wrong.
* On 429: the message from section 14.2.
* A same-origin `returnTo` query parameter redirects there after sign in
  instead of the role dashboard (this is what section 20.3's 401 handling
  sets before redirecting to sign in).
* "Forgot password" links to `app/(auth)/forgot-password`. Its screens are
  out of scope until the backend contract for it exists.

## 9. Cards and metrics

### 9.1 Cards

* A card is `bg-card border rounded-lg` with the padding in section 6.1. No shadow.
* Use cards for: metrics, grouped form sections, focused workflow sections, and important status blocks. Filters and tables are not wrapped in cards. The table sits directly on the page background inside its own bordered container (`border rounded-lg bg-card overflow-hidden`).
* A card MUST NOT contain another card. Use a heading and a `Separator` to divide content inside a card.
* Card header: title (`text-base font-semibold`), optional description (`text-sm text-muted-foreground`), optional action aligned right.

| U11 | Badges and pills MUST represent a real status, count, or backend value from StatusBadge (section 15.3). Decorative badges, "New" tags, or achievement-style chips MUST NOT be used. | REVIEW |

### 9.2 MetricCard

| Prop | Rule |
| --- | --- |
| `label` | Required. At most 30 characters. |
| `value` | Required. Already formatted string. |
| `context` | Optional. At most 60 characters, for example "Term 2, 2026". |
| `trend` | Optional. `{ direction: "up" or "down" or "flat", text, sentiment: "good" or "bad" or "neutral" }` |
| `href` | Optional. When set, the whole card is a link to the filtered list and gets `hover:bg-accent`. |

* The trend shows an icon (`TrendingUp`, `TrendingDown`, `Minus`) plus its text, for example "12% from last term". The color comes from `sentiment`, not `direction`: good is `text-success-text`, bad is `text-error-text`, neutral is `text-muted-foreground`. Screen readers hear "Up 12% from last term" through visually hidden text.
* Grid: `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4`. At most four metrics per row and eight per page.
* Loading state: a skeleton with three lines.

## 10. Data tables

### 10.1 Choosing table features

"Records that can exist" means the realistic maximum in production for one school, not the count in development data. Each table's class is recorded in the pattern registry.

| Records that can exist | Search | Sort | Pagination | Data handling |
| --- | --- | --- | --- | --- |
| 1 to 10 | No | No | No | Client |
| 11 to 50 | Yes | Yes | No | Client |
| More than 50 | Yes | Yes | Yes | Server |

For server handled tables: page sizes are 10, 25, 50, and 100. The default is 25. The maximum rendered rows on one page is 100.

### 10.2 Toolbar

* Search input on the left. Placeholder "Search {plural}". It has a visually hidden label with the same text, a `Search` icon, and a clear button when it has text. Search runs after a 300 ms debounce, only when the text is empty or has at least 2 characters.
* Filter controls follow the search input. Show at most four. Additional filters go in a "More filters" popover.
* A "Clear filters" ghost button appears when any filter or search text is active.
* Below the toolbar, a result count in `text-sm text-muted-foreground` with `aria-live="polite"`: "Showing 26 to 50 of 132 students".

### 10.3 Columns

| Content | Alignment | Format |
| --- | --- | --- |
| Names, text, codes | Left | |
| Numbers and counts | Right | `tabular-nums` |
| Money | Right | `tabular-nums`, `formatMoney` |
| Dates | Left | `formatDate` |
| Status | Left | `StatusBadge` |
| Actions | Right, last column | Header text is "Actions" and is visually hidden |

Column order: identity (name, with the business identifier below it in `text-xs text-muted-foreground`), descriptors, status, numbers, dates, actions. Column headers are at most three words in sentence case. Empty values show "Not set" in `text-muted-foreground`. Zero shows "0".

### 10.4 Rows

* Row height: 40px from 768px, 48px below 768px (section 6.1).
* Row divider: `border-b`. No zebra striping.
* Hover: `hover:bg-accent`. Selected row: `bg-accent`.
* Rows are not clickable as a whole. The name cell is a link to the detail page.
* The header row is not sticky.

### 10.5 Sorting

Sortable columns are declared per column. A sortable header is a `button` with an icon (`ArrowUpDown` when not sorted, `ArrowUp`, `ArrowDown`) and `aria-sort` on the `th`. Clicking cycles ascending, descending, then the table's default sort. Only one column sorts at a time. Every table declares a default sort.

### 10.6 Pagination footer

Left: "Rows per page" select. Right: "Page 2 of 6" text with "Previous" and "Next" buttons, disabled at the ends. Changing a filter, search text, or page size resets the page to 1. While the next page loads, the previous rows stay visible (`placeholderData: keepPreviousData`).

### 10.7 Selection and bulk actions

Only tables marked `selectable` in the registry have checkboxes.

* Checkbox column first. The header checkbox selects the rows on the current page and has the label "Select all rows on this page".
* When the total exceeds the page rows, a link button "Select all {total} {plural}" appears. For server handled tables this sends the filter criteria, not a list of IDs.
* When at least one row is selected, a bar appears above the table: "{n} selected", the bulk actions, and "Clear selection".
* A destructive bulk action opens `ConfirmDialog` with the affected count in the body.
* Selection clears after a successful bulk action and when filters change.

### 10.8 Row actions

* One or two actions: show them inline as ghost icon buttons with Tooltips.
* Three or more actions: show the first inline and put the rest in a menu opened by a button with icon `Ellipsis` and accessible name "Actions for {row name}".
* Menu order: view and edit, then state changes (approve, assign), then a separator, then destructive items in `text-destructive`.
* Destructive actions are never inline buttons.

### 10.9 Long content

Text columns use `max-w-xs truncate` inside `TruncatedText`. `TruncatedText` is focusable (`tabIndex={0}`) and shows a Tooltip with the full text on hover and on keyboard focus. Every table with a truncatable column MUST link to a detail view that shows the full text. Identifiers such as UUIDs are never shown (X4).

### 10.10 Mobile pattern

Each `DataTable` sets `mobilePattern`.

* `"cards"`: below 768px the table becomes a list of `RecordCard`. Each card shows the primary text as a link, the secondary text below it, the `StatusBadge` at top right, up to three label and value pairs in `text-sm`, and the actions menu in the footer. Columns declare `mobilePriority` 1 to 3 to choose the pairs. Other columns are hidden.
* `"scroll"`: the table sits in an `overflow-x-auto` container, and the first column is sticky (`sticky left-0 bg-card`). Use this only for gradebook, attendance register, timetable, and results broadsheet.

All other tables use `"cards"`. The page itself MUST NOT scroll horizontally at any width.

### 10.11 Export

Export is a secondary `outline` action in `PageHeader` with icon `Download`. It exports the current search and filters, requires permission, and shows "Exporting..." while pending. On success the toast reads "Export ready." with a "Download" action.

## 11. Destructive actions

### 11.1 Severity levels

| Level | Use when | Requires | Examples |
| --- | --- | --- | --- |
| 1 | The change is reversible | Confirmation dialog | Deactivate user, Reset school branding, Cancel a scheduled operation |
| 2 | The change is irreversible for one record, or changes a student's academic or financial record | Confirmation dialog and a required reason note | Reject application, Withdraw enrollment, Delete a record, Void a payment |
| 3 | The change is irreversible for many records or for structure | Confirmation dialog, reason note, and typed confirmation | Delete an academic year, Run promotions for a class or level, Bulk delete, Delete a class that has enrolled students |

Any destructive action not listed defaults to level 2.

### 11.2 ConfirmDialog anatomy

| Part | Rule |
| --- | --- |
| Title | `{Action} {entity type}?` Example: "Reject application?" |
| Body, paragraph 1 | What will happen, with the entity display name in bold |
| Body, paragraph 2 | The consequences, in one to three short sentences |
| Body, reversibility line | Exactly "This action cannot be undone." or "You can reverse this later from {place}." |
| Reason note (levels 2 and 3) | Textarea labeled "Reason (required)". Minimum 10 and maximum 500 characters. Sent to the backend as `reason` for the audit log. |
| Typed confirmation (level 3) | Input labeled `Type "{name}" to confirm`. For bulk actions the required text is the number of affected records. |
| Footer | "Cancel" (outline) and the confirm button. |
| Confirm button | Variant `destructive`. Label `{Action} {entity type}`. Pending label is the progressive form, for example "Rejecting...". |

Behavior:

* Initial focus is on "Cancel".
* The confirm button stays disabled until the reason and typed confirmation are valid.
* While pending, Escape, the overlay, and the Cancel button do nothing.
* On success the dialog closes and a toast appears.
* On error the dialog stays open and shows an inline `Alert` with the mapped message (section 20.3).
* `ConfirmDialog` also supports `variant="default"` for important but not destructive confirmations, such as submitting scores for grading. In that variant the confirm button is a primary button.

## 12. Interface states

Every data view implements all six states. Each state has one shared component.

| State | When | Component | Copy |
| --- | --- | --- | --- |
| Loading | First load, no data yet | Skeleton that matches the layout | None. Sets `aria-busy="true"` on the region. |
| Empty | No records exist at all | `EmptyState` | Title: "No {plural} yet". Description: one sentence on what this list holds and how records appear. Action: "Add {singular}", shown only if the user holds the create permission. |
| Filtered empty | Records exist, but filters or search exclude all | `EmptyState` | Title: "No {plural} match your filters." Description: "Try changing or clearing the filters." Action: "Clear filters". For search text: `No {plural} match "{text}".` |
| Error | The request failed | `ErrorState` | Title: "We could not load {resource}." Description: "Check your connection and try again." For 5xx: "Something went wrong on our side. Try again." Action: "Try again". Footer line "Reference: {traceId}" when a trace ID exists. |
| Forbidden | 403 | `ForbiddenState` | Title: "You do not have access to {resource}." Description: "Ask an administrator if you need access." Action: "Go to dashboard". |
| Not found | 404 | `NotFoundState` | Title: "We could not find that {singular}." Description: "It may have been removed, or the link may be wrong." Action: "Back to {plural}". |
| Populated | Data loaded | The full interface for the user's role | |

Rules:

* Skeletons: tables show 8 skeleton rows with the real column widths. Card lists show 6 skeleton cards. Forms show one skeleton per field. Text uses `Skeleton` at `h-4`.
* On refetch or page change, keep the current data visible and show a `Loader2` (`size-4 animate-spin`) in the toolbar with the hidden text "Updating". Do not show skeletons again.
* Widget level errors (inside a card) use `Alert`, not `ErrorState`.
* Empty and error states are `text-center`, with an icon in a `size-10` icon area (`text-subtle`), the title in `text-base font-semibold`, and the description in `text-sm text-muted-foreground`. Icon for empty is the resource's icon. Icon for error is `CircleAlert`.
* Offline: when the browser is offline (TanStack Query `onlineManager`), show an `Alert` with icon `WifiOff` at the top of the main area: "You are offline. Changes cannot be saved until you reconnect." Mutation buttons are disabled and their Tooltip reads "You are offline." Cached data stays visible.

### 12.7 Unhandled errors

Section 12's states cover data-level failures (a failed request, a 403, a 500). This section covers a component crashing outright.

* A root `ErrorBoundary` wraps the application shell, and one wraps each routed page. A crash inside one page must not blank the entire app; the sidebar and header stay usable.
* The fallback UI reuses `ErrorState` (section 12) with the title "Something went wrong." and the description "Try reloading the page. If this keeps happening, contact support." Action: "Reload page", which calls `window.location.reload()`.
* On catch, the boundary reports to Sentry with the component stack, the route, and the user's role. It MUST NOT include personal data: no student names, guardian names, scores, payment amounts, or any field covered by X5. Use the user's ID only if Sentry's `beforeSend` scrubbing is confirmed to strip it from the payload shown to anyone without access controls; otherwise send the role only.
* The Sentry DSN is a public key and MAY be exposed to the browser. It is not treated as a secret (compare X2).
* A crash during render of a dialog or sheet closes the dialog and shows a toast ("Something went wrong. Try again.") instead of the full-page fallback, so one broken dialog doesn't take down the page behind it.
* `ErrorBoundary` MUST NOT catch errors from event handlers, async code, or server-side rendering; those are handled where they occur (mutation error handling in section 20.3, try/catch around async work). It only catches render-time errors in its subtree.

## 13. Forms

### 13.1 Layout

* One column below 768px. From 768px, forms with more than 6 fields use two columns (`md:grid-cols-2 gap-x-6 gap-y-4`). Long text fields span both columns.
* Label above the control. Help text below the control in `text-sm text-muted-foreground`. Error text below the control, after the help text, in `text-sm text-error-text` with a `CircleAlert` icon (`size-4`).
* Required fields show a red `*` (`text-error-text`, `aria-hidden="true"`). A line "* Required" appears at the top of any form that has required fields. Optional fields have no marker.
* Forms with more than 10 fields are split into `FormSection` groups with an `h2` at `text-lg font-semibold`.
* Controls are 44px high (`h-11`) below 768px and 40px high (`h-10`) from 768px. Borders use `border-input`.

### 13.2 Field components

`TextField`, `TextareaField`, `SelectField`, `EntityCombobox`, `DateField`, `NumberField`, `CheckboxField`, `RadioGroupField`, `SwitchField`, and `FileField` wrap React Hook Form's `FormField`. Pages MUST use these and MUST NOT assemble label, control, and message by hand.

### 13.3 Validation

* React Hook Form options: `mode: "onBlur"` and `reValidateMode: "onChange"`.
* On an invalid submit, focus moves to the first invalid field. Forms with more than 8 fields also show `ErrorSummary` at the top: an `Alert` listing each error as a link to its field.
* A message is one sentence, at most 100 characters, ends with a period, and names the field or states the fix. Placeholders like "Invalid input." are forbidden.
* Zod schemas live in `features/<feature>/schemas.ts`. Messages come from `lib/validation/messages.ts`, which implements these templates:

| Case | Template |
| --- | --- |
| Required text | `{Field} is required.` |
| Required selection | `Select a {field}.` |
| Minimum length | `{Field} must be at least {n} characters.` |
| Maximum length | `{Field} must be {n} characters or fewer.` |
| Email | `Enter a valid email address.` |
| Phone | `Enter a valid phone number.` |
| Number range | `{Field} must be between {min} and {max}.` |
| Date | `Enter a valid date.` |
| Date order | `{Field} must be on or after {other field}.` |
| File | `Upload a {types} file smaller than {size} MB.` |
| Server uniqueness | `{Field} is already in use.` |

`{Field}` is the field's label. `{field}` is the label in lowercase.

### 13.4 Server validation

The backend is authoritative for business rules, authorization, integrity, uniqueness, and state transitions. When a response contains field errors, map each to its field with `setError(field, { type: "server", message })`, where the message comes from `errorMessages` by code (section 20.4). Errors that match no field appear in `FormAlert` at the top of the form.

### 13.5 Submit behavior

* Create forms: submit is enabled. Edit forms: submit is disabled until dirty (U3).
* While pending: the fields are inside a `fieldset` with `disabled`, the submit button is disabled and shows `Loader2` and the progressive label.
* After success: a create form navigates to the new record's detail page (or the list, if there is no detail page) and shows the toast. An edit form stays on the page, calls `reset(newValues)`, and shows the toast.
* Financial mutations (payments, refunds, voids) send an `Idempotency-Key` header. The key is a UUID generated when the user opens the confirm step and reused on retries of the same attempt.

| Action | Pending label |
| --- | --- |
| Save | Saving... |
| Create {thing} | Creating... |
| Update | Updating... |
| Delete | Deleting... |
| Approve | Approving... |
| Reject | Rejecting... |
| Submit | Submitting... |
| Generate | Generating... |
| Export | Exporting... |
| Upload | Uploading... |

### 13.6 Unsaved changes guard

`useUnsavedChangesGuard(isDirty)` registers a `beforeunload` handler and a router navigation blocker while `isDirty` is true. The blocker opens `ConfirmDialog` (`variant="default"`) with the title "Leave this page?", the body "You have unsaved changes. If you leave, they will be lost.", the confirm label "Leave page", and the cancel label "Stay".

### 13.7 Selecting related records

Users never type IDs (D7).

* Use `Select` when the option list is stable and has at most 20 options (academic year, term, class level).
* Use `EntityCombobox` otherwise (student, teacher, class, subject, guardian).
* `EntityCombobox` props: `resource`, `value` (the ID), `onChange`, and `searchFn`. It searches on the server with a 300 ms debounce. With no text it shows the first 20 results. It displays the business name and business identifier, never the database ID. It shows "Searching..." while loading and "No results" when empty.

### 13.8 File fields

`FileField` shows a "Choose file" button, then the file name and size with a remove button. It checks type and size in the browser using the message template above. Uploads larger than 1 MB show a progress bar.

## 14. Toast notifications

Use `sonner`. Position: bottom right. At most 3 visible at once.

| Type | Duration |
| --- | --- |
| Success | 4000 ms |
| Info | 5000 ms |
| Error | Persistent, with a close button |

A toast has at most one action button.

### 14.1 Success templates

`{Name}` is a human readable display name, never an ID. When a batch action has no single name, use the `{Thing}` form.

| Event | Template | Example |
| --- | --- | --- |
| Created | `{Entity type} "{name}" created successfully.` | Assessment "Term 2 Maths Test" created successfully. |
| Updated | `{Entity type} "{name}" updated successfully.` | Class "Basic 5A" updated successfully. |
| Deleted | `{Entity type} "{name}" deleted.` | Subject "French" deleted. |
| Approved | `{Entity type} for {name} approved.` | Application for Kwesi Appiah approved. |
| Rejected | `{Entity type} for {name} rejected.` | Application for Ama Boateng rejected. |
| Deactivated | `{Name} deactivated.` | Kofi Mensah deactivated. |
| Saved | `{Thing} saved successfully.` | Attendance saved successfully. |
| Submitted | `{Thing} submitted successfully.` | Scores submitted successfully. |
| Exported | `Export ready.` | Export ready. |

### 14.2 Error templates

Error toasts never contain text from the API response (U5). Include "Reference: {traceId}" as the description when a trace ID exists.

| Case | Message | Action |
| --- | --- | --- |
| 403 | You do not have permission to {action}. Description: Ask an administrator for access. | None |
| 409 | {Entity type} was changed by someone else. | Reload |
| Offline or network failure | You are offline or the server cannot be reached. | Try again |
| 429 | Too many requests. Try again in a moment. | None |
| 5xx or unknown | Something went wrong. Try again. | None |

Toasts never replace inline validation or page level error states.

## 15. Icons

Use `lucide-react` only (T9). Do not change `strokeWidth`. Icons inherit `currentColor`. Decorative icons have `aria-hidden="true"`. An icon that is the only content of a control gets the control an accessible name (A4).

### 15.1 Sizes

| Context | Class |
| --- | --- |
| Inside buttons, inputs, table cells, alerts | `size-4` |
| Inside badges | `size-3` |
| Navigation items and standalone icon buttons | `size-5` |
| Empty and error states | `size-10` |

### 15.2 Standard icons

One action always uses one icon. Use the name exported by the installed version of `lucide-react`, and use the same name everywhere.

| Meaning | Icon |
| --- | --- |
| Add | `Plus` |
| Edit | `Pencil` |
| Delete | `Trash2` |
| View | `Eye` |
| Search | `Search` |
| Filter | `ListFilter` |
| Export, download | `Download` |
| Upload | `Upload` |
| Approve (action) | `Check` |
| Reject (action) | `X` |
| Deactivate | `UserX` |
| Assign | `UserPlus` |
| Generate report | `FileText` |
| More actions | `Ellipsis` |
| Print | `Printer` |
| Settings | `Settings` |
| Notifications | `Bell` |
| Sign out | `LogOut` |
| Open navigation | `Menu` |
| Loading | `Loader2` |
| Sort | `ArrowUpDown`, `ArrowUp`, `ArrowDown` |
| Trend | `TrendingUp`, `TrendingDown`, `Minus` |
| Offline | `WifiOff` |
| Error state | `CircleAlert` |
| Status: success | `CircleCheck` |
| Status: warning | `TriangleAlert` |
| Status: error | `CircleX` |
| Status: info | `Info` |
| Status: neutral | `Circle` |
| Status: pending | `Clock` |

### 15.3 Status badges

`StatusBadge` renders `rounded-full border px-2.5 py-0.5 text-xs font-medium`, an icon (`size-3`), and the label, using the `text`, `tint`, and `border` tokens of the status. Backend values map to badge statuses in `components/shared/status/statusMap.ts`.

### 15.3 Status badges

`StatusBadge` renders `rounded-full border px-2.5 py-0.5 text-xs font-medium`, an icon (`size-3`), and the label, using the `text`, `tint`, and `border` tokens of the status. StatusBadge uses a flat, solid background only. Gradient fills, glows, or soft shadows around the badge text are not permitted (T7). Backend values map to badge statuses in `components/shared/status/statusMap.ts`.

| Backend value | Badge status | Label |
| --- | --- | --- |
| Active, Approved, Paid, Present, Published, Graded | success | Same as value |
| Pending, Late, Partially paid | warning | Same as value |
| Rejected, Overdue, Absent, Failed | error | Same as value |
| Submitted, Excused, Under review | info | Same as value |
| Inactive, Draft, Unpaid, Withdrawn | neutral | Same as value |

`StatusAlert` renders an `Alert` with the status `tint` background, `border-{status}-border`, the status icon and title in the `text` token, and the body in `text-foreground`. `StatusIcon` renders the status icon in the `solid` color at `size-4` or larger.

A new backend status MUST be added to `statusMap.ts` in the same change that first uses it. An unmapped value renders as `neutral` with the value converted to sentence case, and logs a development warning.

## 16. Responsive design

### 16.1 Breakpoints

Use Tailwind's default breakpoints: `sm` 640px, `md` 768px, `lg` 1024px, `xl` 1280px, `2xl` 1536px.

| Range | Name |
| --- | --- |
| 320px to 767px | Mobile |
| 768px to 1023px | Tablet |
| 1024px and wider | Desktop |

Required test widths: 320, 375, 768, 1024, 1280, and 1440 pixels.

### 16.2 Behavior by range

| Element | Mobile | Tablet | Desktop |
| --- | --- | --- | --- |
| Navigation | Drawer | Drawer | Persistent sidebar |
| Page padding | `p-4` | `p-6` | `p-6` |
| Page header actions | Stacked, full width | Row, right aligned | Row, right aligned |
| Metric grid | 1 column | 2 columns | 4 columns |
| Forms with more than 6 fields | 1 column | 2 columns | 2 columns |
| Tables | Per `mobilePattern` | Table | Table |
| Button and input height | 44px | 40px | 40px |
| Row action icon buttons | 44px | 32px | 32px |
| Breadcrumbs | Current title only | Full | Full |

### 16.3 Rules

* At each required width, `document.documentElement.scrollWidth` MUST NOT exceed `window.innerWidth` on every registered page. Tables that scroll do so inside their own container.
* The viewport tag is `width=device-width, initial-scale=1`. It MUST NOT contain `maximum-scale` or `user-scalable=no`.
* Full height layouts use `min-h-dvh`, not `min-h-screen`.
* Content MUST reflow without horizontal scrolling at 320px width and at 200 percent zoom.

## 17. Accessibility

### 17.1 Standard

WCAG 2.2 level AA. The axe scan runs with the tags `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, and `wcag22aa`.

### 17.2 Focus

Every focusable element uses:

`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background`

Inside the sidebar, use `focus-visible:ring-sidebar-foreground focus-visible:ring-offset-sidebar`, because the ring color `ring` equals the sidebar background. `outline-none` is allowed only together with these ring classes.

### 17.3 Structure

* Landmarks: `header`, `nav` (labeled "Main navigation"), one `main`, and `aside` only for real complementary content.
* One `h1` per page (from `PageHeader`). Headings do not skip levels.
* The document language is set with `lang="en"`.
* The skip link is the first focusable element (section 7.1).

### 17.4 Tables

Use real `table` markup with `th scope="col"`. Sortable headers are buttons with `aria-sort`. Give each table a caption or `aria-label` that names it, for example "Students".

### 17.5 Forms

* `Label` linked by `htmlFor`.
* Invalid controls set `aria-invalid="true"` and `aria-describedby` pointing to the error and help text.
* Required controls set `aria-required="true"`.

### 17.6 Dialogs and menus

Use the shadcn and Radix components. Dialogs and sheets always render a title and a description (A9). Escape closes them, unless a mutation is pending. Focus returns to the trigger on close.

### 17.7 Live regions

* Toasts: `sonner` announces them.
* Result count text uses `aria-live="polite"` (section 10.2).
* Loading regions set `aria-busy="true"`.

### 17.8 Targets

At least 24 by 24 CSS pixels everywhere, and at least 44 by 44 below 768px (A7). Section 8.3 sets the sizes.

### 17.9 Manual keyboard check

For every new interactive pattern, the author tests and records in the change summary: Tab and Shift Tab order, Enter and Space activation, Escape closing, and arrow keys in menus and radio groups.

## 18. Motion

### 18.1 Allowed motion

| Purpose | Classes | Duration |
| --- | --- | --- |
| Hover and focus color changes | `transition-colors duration-150` | 150 ms |
| Dialog, sheet, popover, dropdown enter and exit | Radix and shadcn defaults, set to 200 ms | 200 ms |
| Sidebar collapse | `transition-all duration-200 ease-out` | 200 ms |
| Skeleton | `animate-pulse` | Continuous |
| Spinner | `animate-spin` | Continuous |

### 18.2 Forbidden motion

No motion longer than 300 ms. No page transitions, parallax, autoplay, or decorative animation.

### 18.3 Reduced motion

`theme/theme.css` contains this rule exactly:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

## 19. State management

### 19.1 TanStack Query

Query keys: `[resource, "list", params]`, `[resource, "detail", id]`, and `["branding"]`. Mutation hooks live in `features/<feature>/hooks.ts`.

| Data | `staleTime` |
| --- | --- |
| Lists and details | 60 seconds |
| Reference data (academic years, terms, classes, subjects, class levels) | 5 minutes |
| Attendance, payments, results in progress, notifications | 0 |
| Branding | 5 minutes |

* Queries retry once on network errors and 5xx responses, and never on 4xx responses. Mutations never retry.
* Queries that back a form with unsaved changes, and the gradebook, set `refetchOnWindowFocus: false`. All other queries use the default (true).
* Every mutation hook declares `invalidates`, an array of query keys. After success it invalidates the list and detail keys of its own resource plus every key in `invalidates`.
* Optimistic updates MUST NOT be used for financial, grading, or approval mutations. They are allowed only for toggles such as marking a notification as read.

### 19.2 Zustand stores

Only these stores exist. A new store needs a decision record.

| Store | Holds | Persistence |
| --- | --- | --- |
| `uiPreferences` | Sidebar collapsed state | `localStorage`, key `carepoint.ui.v1`. No personal data. |
| `gradebookDrafts` | Scores by assessment ID and student ID. IDs only, no names. | `localStorage`, key `carepoint.drafts.v1.{userId}`. Entries expire after 7 days. All entries for the user are deleted on sign out. |
| `selectedChild` | The child a guardian is viewing (student ID) | `sessionStorage` |

On sign out: call `queryClient.clear()`, clear `gradebookDrafts` for the user, and clear `selectedChild`.

### 19.3 Forms

Forms with two or more fields MUST use React Hook Form with Zod. A single field inline edit MAY use local state.

### 19.4 URL state

List pages keep their state in the URL search parameters:

| Parameter | Meaning |
| --- | --- |
| `q` | Search text |
| `sort` | `field,asc` or `field,desc` |
| `page` | Page number, starting at 1 |
| `size` | Page size |
| Filter keys | One parameter per filter, named after the filter |

Parse the parameters with a Zod schema. Invalid or missing values fall back to the defaults without showing an error.

## 20. API integration

### 20.1 Structure

* One client in `lib/api/client.ts`. The base URL comes from a public environment variable named with the framework's public prefix. Credentials handling follows the backend authentication contract.
* Resource functions and Zod schemas live in `features/<feature>/api.ts`. Hooks live in `features/<feature>/hooks.ts`.
* Timeouts: 15 seconds for GET requests and 30 seconds for mutations.
* Queries pass the abort signal to the client so superseded requests are cancelled.
* The frontend MUST NOT connect to the database, hold secrets, or treat frontend authorization as security.

### 20.2 Conventions the frontend expects

The backend contract is authoritative. If it differs, change only the adapter named here.

| Topic | Convention | Adapter |
| --- | --- | --- |
| Pagination request | The UI page is 1 based. The client sends `page` (0 based, equal to UI page minus 1), `size`, and `sort=field,direction`. | `lib/api/pagination.ts` |
| Pagination response | `{ content, page: { number, size, totalElements, totalPages } }`, converted to `{ items, page, size, totalItems, totalPages }` with `page` 1 based | `lib/api/pagination.ts` |
| Money | Decimal strings such as `"1250.50"` | `lib/format` |
| Dates | ISO 8601. Date only values are `YYYY-MM-DD`. Timestamps are UTC with a `Z` suffix. | `lib/format` |
| Errors | RFC 9457 problem details: `{ type, title, status, detail, code, traceId, errors: [{ field, code }] }` | `lib/api/errors.ts` |

The frontend reads only `status`, `code`, `traceId`, and `errors[].field` and `errors[].code`. It never displays `title` or `detail`.

### 20.3 Status handling

| Situation | Behavior |
| --- | --- |
| No response, or timeout | Query: `ErrorState`. Mutation: the offline toast in section 14.2 with "Try again". |
| 400 with `errors` | Map to fields (section 13.4). |
| 400 without `errors` | `FormAlert`: "Check the highlighted fields and try again." |
| 401 | Run `queryClient.clear()` and redirect to the sign in page with `returnTo` set to the current path and search. Concurrent 401 responses trigger one redirect. The sign in page shows a toast: "Your session has expired. Sign in again." |
| 403 | Query: `ForbiddenState`. Mutation: the 403 toast in section 14.2. In both cases refetch the current user's permissions. |
| 404 | Page load: `NotFoundState`. Mutation: toast "{Entity type} no longer exists." and invalidate the list. |
| 409 | Dialog titled "This {entity type} was changed by someone else." with the buttons "Reload latest" and "Cancel". "Reload latest" refetches and resets the form to the server values. The gradebook draft store keeps local scores. |
| 422 | Show `errorMessages[code]` in `FormAlert`, or in a toast when there is no form. Unknown code: "This action is not allowed right now." |
| 429 | Toast from section 14.2. |
| 5xx | `ErrorState` or toast from section 14.2, with the trace ID. |

### 20.4 Error messages

`lib/api/errorMessages.ts` maps backend `code` values to user messages. Every message is one or two sentences and tells the user what happened and what to do next. A code without an entry falls back to the status rows above. Adding a backend code requires adding its entry in the same change.

### 20.5 Response validation

Every response is parsed with Zod (D3). A parse failure is treated as an error with the code `RESPONSE_INVALID` and shows `ErrorState`. The trace of the failure goes to the development console only, without personal data (X5).

## 21. Content and terminology

### 21.1 Writing rules

* Sentence case for all UI text, except proper nouns.
* No exclamation marks. No "Please". No "Oops".
* Present tense, second person ("You do not have access").
* Error text says what happened, then what to do next.
* Numbers are digits.

### 21.2 Terms

| Use | Do not use |
| --- | --- |
| Student | Pupil, learner |
| Guardian | Parent (alone), carer |
| Teacher | Instructor, tutor |
| Class | Grade, room |
| Academic year | School year, session |
| Term | Semester |
| Assessment | Test, exam (except inside an assessment's own name) |
| Score | Mark (for one student's entry on one assessment) |
| Result | Grade, outcome (for the computed outcome) |
| Report card | Report sheet |
| Application | Admission form |
| Fees | Bills |
| Payment | Transaction |
| Sign in, Sign out | Log in, Log out, Login |
| Deactivate | Disable, suspend (for users) |

Build screens in the order backend domains are marked complete in
`docs/DEVELOPMENT_STATUS.md`. As of this writing: sign in and shell, then
admissions review, before attendance, gradebook, results, fees, incidents,
or promotions.

### 21.3 Formats

`lib/format/index.ts` is the only place that formats values. Nothing else may call `toLocaleDateString`, `toLocaleTimeString`, `toLocaleString`, or `Intl` (D6).

| Function | Output | Example |
| --- | --- | --- |
| `formatDate` | Day, short month, year, English (United Kingdom) | 15 Sep 2026 |
| `formatTime` | 24 hour clock | 14:30 |
| `formatDateTime` | Date, then time | 15 Sep 2026, 14:30 |
| `formatRelative` | Only for events within the last 24 hours | 5 minutes ago |
| `formatMoney` | Currency from school configuration | GH₵1,250.50 |
| `formatNumber` | Grouped digits | 1,250 |
| `formatPercent` | One decimal at most | 87.5% |

* Time zone: `Africa/Accra`, read from school configuration when present.
* Currency: `GHS`, read from school configuration when present. Locale for numbers: `en-GH`.
* Person names display as first, middle, last. Sorting uses last name, then first name.
* Empty optional values display "Not set".

## 22. Authorization and role navigation

### 22.1 Permission model

* The current user endpoint returns `permissions`, a list of permission keys. Keys are defined in `lib/permissions.ts` and copied from the backend contract (D9).
* Use `usePermission(key)` and `<Can permission={key}>`. Never compare role names in UI code.
* Route guard: an unauthenticated user is redirected to sign in. An authenticated user without the permission sees `ForbiddenState` inside the page area. There is no redirect.

### 22.2 Hide or disable

| Situation | UI |
| --- | --- |
| The user's permissions never allow the action | Hide the control. |
| The user holds the permission, but the record's state blocks the action, such as published results or a closed term | Show the control disabled. A Tooltip on a focusable wrapper states the reason, for example "Results are published and can no longer be edited." |

Navigation items without permission are hidden (section 7.3). The backend remains the enforcement point (X6).

### 22.3 Navigation order by role

Items appear in this order. The group heading is shown only when the user has more than one role.

| Role | Group | Items in order |
| --- | --- | --- |
| Teacher | Teaching | Dashboard, My classes, Attendance, Assessments, Gradebook, Results |
| Principal or admin | Administration | Dashboard, Students, Teachers, Admissions, Academic structure, Results, Promotions, Reports, Fees and payments, Incidents |
| Guardian | Family | My children, Attendance, Results, Report cards, Fees, Notifications |
| Super admin or IT | System | Users, Roles, System configuration, School branding, Audit logs, Security |

A user with several roles sees the union of items, without duplicates (matched by `href`), ordered by group: System, Administration, Teaching, Family.

Guardians: `ChildSwitcher` appears in the header when the guardian has two or more children. It is a `Select` with the children's names. The choice is stored in `selectedChild`, and every guardian page is scoped to it. With one child, the switcher is hidden. The backend enforces which children a guardian may see.

### 22.4 Dashboards

* **Teacher:** first a "Today's classes" list (period, class, subject, time, and the action "Take attendance"), then "Gradebook items to complete". No administrative links.
* **Principal or admin:** four `MetricCard` items (Students, Teachers, Pending applications, Attendance today), then "Pending applications" (five rows, with Approve and Reject row actions), then "Recent incidents" (five rows).
* **Guardian:** one card per child showing name, class, attendance rate this term, latest result, and outstanding fees.

## 23. Workflows

### 23.1 Reaching primary actions

From the teacher dashboard, "Take attendance" is at most 2 clicks away and "Open gradebook" is at most 3 clicks away. The path is: dashboard, class, subject, assessment, gradebook. Every step offers a direct link to the next, and breadcrumbs show the full path.

### 23.2 Gradebook

* The page uses `width="wide"` and `mobilePattern="scroll"`.
* Columns: Student (sticky), Admission number, Score, Remark (optional, at most 200 characters), and a row status.
* Score inputs use `inputMode="decimal"`, allow up to 2 decimals, and accept values from 0 to the assessment's maximum score. Message: "Score must be between 0 and {max}."
* Enter and the Down arrow move to the same column in the next student's row. The Up arrow moves to the previous row. Tab moves to the next field.
* An "Absent" checkbox per row disables the score input.
* A counter shows "{n} of {total} scores entered".
* Draft: every change writes to `gradebookDrafts` after a 500 ms debounce. The page shows "Draft saved on this device at {time}".
* "Save scores" sends the scores to the server. Pending label: "Saving...". Toast: "Scores saved successfully." The local draft for the assessment is then cleared.
* "Submit for grading" opens `ConfirmDialog` with `variant="default"`: title "Submit scores for grading?", body "You will not be able to edit scores after you submit them.", confirm "Submit scores", pending "Submitting...". The button is disabled, with a Tooltip, when there are unsaved changes ("Save your scores before submitting.") or when a student has neither a score nor an absent mark ("Enter a score or mark absent for every student.").
* The unsaved changes guard (section 13.6) is active while the draft differs from the server values.

### 23.3 Attendance register

* Rows are students. Each row has a segmented control with Present, Absent, Late, and Excused. The default is Present.
* A "Mark all present" outline button sits in the toolbar.
* "Save attendance" saves. Pending label: "Saving...". Toast: "Attendance saved successfully."
* The unsaved changes guard is active while the register differs from the server values.

### 23.4 Application approval

* Approve: `ConfirmDialog` with `variant="default"`. Title "Approve application?". Body "The application for {name} will be marked as approved.". Confirm "Approve application". Pending "Approving...". Toast "Application for {name} approved."
* Reject: level 2 destructive dialog with a required reason (section 11). Title "Reject application?". Confirm "Reject application". Pending "Rejecting...". Toast "Application for {name} rejected."
* Both actions are available as row actions and on the detail page.

## 24. Performance

| Measure | Budget |
| --- | --- |
| JavaScript for the sign in page (gzip) | 150 KB or less |
| JavaScript for the app shell route (gzip) | 250 KB or less |
| JavaScript for each lazy loaded route chunk (gzip) | 100 KB or less |
| Largest Contentful Paint, sign in page and dashboard, Lighthouse mobile profile | 2.5 seconds or less |
| Cumulative Layout Shift | 0.1 or less |
| Interaction to Next Paint | 200 ms or less |

* Every top level route is loaded lazily.
* Only the latin subset of Inter is loaded.
* The logo has `width` and `height` attributes.
* No raster image larger than 100 KB is bundled.
* A page never renders more than 100 table rows at once.

`lighthouserc.json` (fragment) enforces these on the sign in page and the dashboard:

```json
{
  "ci": {
    "assert": {
      "assertions": {
        "largest-contentful-paint": ["error", { "maxNumericValue": 2500 }],
        "cumulative-layout-shift": ["error", { "maxNumericValue": 0.1 }],
        "resource-summary:script:size": ["error", { "maxNumericValue": 256000 }]
      }
    }
  }
}
```

## 25. Testing and definition of done

### 25.1 Required tests by change type

| Change | Required tests |
| --- | --- |
| New shared component | Vitest and Testing Library: renders, every variant, keyboard interaction, accessible name, and each state in section 12 that applies |
| New page | Playwright at widths 375 and 1280: loads, six states with mocked API responses, no horizontal overflow, axe clean |
| New form | Unit test for every Zod rule with its message template. Playwright: an invalid submit focuses the first invalid field, the pending state disables the button, and a server 400 maps to fields. |
| New mutation | Unit test that the declared query keys are invalidated. Playwright: a 403 response shows the toast. |
| Token change | The contrast test (section 25.2) passes. |
| Branding change | The fixtures in section 4.5 pass. |

### 25.2 Contrast test

`theme/contrast.test.ts` asserts every pair below.

| Pair | Minimum |
| --- | --- |
| `foreground` on `background`, `card`, `muted`, `secondary` | 4.5 |
| `muted-foreground` on `background`, `card`, `muted`, `secondary` | 4.5 |
| `primary-foreground` on `primary` and on `primary-hover` | 4.5 |
| `brand-accent-foreground` on `brand-accent` and on `brand-accent-hover` | 4.5 |
| `brand-accent` on `background` and `card` (links) | 4.5 |
| `foreground` on `accent` | 4.5 |
| `destructive-foreground` on `destructive` | 4.5 |
| Each status `text` on its `tint` and on `card` | 4.5 |
| `input` on `card` and `background` | 3.0 |
| `subtle` on `card` | 3.0 |
| `ring` on `background` | 3.0 |
| Each status `solid` on `card` and `background` | 3.0 |

### 25.3 Definition of done

Frontend work is complete only when every item is true and the change summary reports it.

* [ ] `lint` passes with zero errors and zero warnings.
* [ ] `typecheck` passes.
* [ ] `test` passes.
* [ ] `test:e2e` passes. For every new or changed page it includes the axe scan with zero serious or critical violations and the overflow check at all six widths.
* [ ] `build` succeeds and stays inside the budgets in section 24.
* [ ] The Playwright run records zero browser console errors, console warnings, and page errors.
* [ ] Every rule in section 1 with the verification code REVIEW was checked and is listed in the change summary.
* [ ] Every new or changed list has all six interface states, and each mutation has its pending, success, and error behavior.
* [ ] The manual keyboard check (section 17.9) is recorded for every new interactive pattern.
* [ ] Screenshots at the six widths are attached for every new page.
* [ ] The pattern registry (section 27) is updated when a new pattern or table was added.
* [ ] No new runtime dependency exists without a decision record.
* [ ] The change summary lists missing contract items and conflicts (section 0.3).

## 26. Enforcement configuration

### 26.1 ESLint (flat config fragment)

The selectors below implement rules T1 to T4, T7 to T9, D1, D6, X3, and X8. Put the fragment in `eslint.frontend.rules.js` and import it in `eslint.config.js`. Keep the patterns identical to this fragment.

```js
// eslint.config.js (fragment)
const HEX = "(?<![\\w&])#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{4}|[0-9a-fA-F]{3})(?![\\w-])";
const PALETTE = "\\b(?:bg|text|border|ring|fill|stroke|from|to|via|divide|outline|decoration|shadow|accent|caret|placeholder)-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-[0-9]{2,3}\\b";
const TEXT_OPACITY = "\\btext-(?!xs|sm|base|lg|xl|[2-9]xl)[a-z0-9-]+\\/[0-9]+\\b";
const ARBITRARY = "(?<![\\w:!\\[-])(?:[\\w-]+:)*(?!(?:grid-cols|grid-rows|data|aria|group-data|peer-data|has)-\\[)[a-z0-9]+(?:-[a-z0-9]+)*-\\[(?!var\\(--radix)";
const FORBIDDEN_EFFECTS = "\\b(?:bg-gradient-to-\\w+|bg-linear-to-\\w+|backdrop-blur[\\w-]*|shadow-(?:xs|sm|xl|2xl|inner))\\b";

export const frontendRules = {
  "no-restricted-syntax": ["error",
    { selector: `Literal[value=/${HEX}/]`, message: "T1: color literals belong in theme files only." },
    { selector: `TemplateElement[value.raw=/${HEX}/]`, message: "T1: color literals belong in theme files only." },
    { selector: `Literal[value=/${PALETTE}/]`, message: "T2: use semantic token classes." },
    { selector: `Literal[value=/${TEXT_OPACITY}/]`, message: "T4: no opacity modifiers on text colors." },
    { selector: `Literal[value=/${FORBIDDEN_EFFECTS}/]`, message: "T7: gradients, blur, and extra shadows are not allowed." },
    { selector: "Literal[value=/\\bdark:/]", message: "T8: dark mode is out of scope." },
    { selector: "JSXAttribute[name.name='dangerouslySetInnerHTML']", message: "X3: not allowed." },
    { selector: "MemberExpression[property.name=/^toLocale(Date|Time)?String$/]", message: "D6: use lib/format." },
    { selector: "MemberExpression[object.name='Intl']", message: "D6: use lib/format." },
    { selector: "NewExpression[callee.object.name='Intl']", message: "D6: use lib/format." },
  ],
  "no-restricted-globals": ["error", { name: "fetch", message: "D1: use the API client through TanStack Query hooks." }],
  "no-restricted-imports": ["error", { patterns: [
    "react-icons", "react-icons/*", "@heroicons/*", "@radix-ui/react-icons", "@tabler/icons-react",
    "@mui/icons-material", "@fortawesome/*", "phosphor-react", "@phosphor-icons/*", "react-feather", "feather-icons",
  ] }],
  "react/jsx-no-target-blank": "error",
  "react-hooks/exhaustive-deps": "error",
};
// T3 (ARBITRARY) is added as one more no-restricted-syntax selector, but only for
// src/features/** and src/components/shared/**, never for src/components/ui/**.
// Overrides: turn T1 off in src/theme/** and test files; turn D6 off in src/lib/format/**;
// turn D1 off in src/lib/api/**.
// Also enable the jsx-a11y recommended rule set.
```

Import boundaries (S5 and X7) use `import/no-restricted-paths`:

```js
"import/no-restricted-paths": ["error", { zones: [
  // one zone per feature folder: it may not import from any other feature folder
  { target: "./src/features/students", from: "./src/features", except: ["./students"] },
  // add a zone like the one above whenever a feature folder is created
  { target: "./src/theme", from: ["./src/features/auth", "./src/lib/permissions.ts"] },
] }],
```

A lint disable comment MUST name the rule and give a reason on the same line.

### 26.2 Playwright helpers

```ts
// e2e/support/checks.ts
import AxeBuilder from "@axe-core/playwright";
import { expect, type Page } from "@playwright/test";

export const WIDTHS = [320, 375, 768, 1024, 1280, 1440];

export async function expectNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
}

export async function expectNoSeriousAxeViolations(page: Page) {
  const result = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .analyze();
  const serious = result.violations.filter(
    (v) => v.impact === "serious" || v.impact === "critical",
  );
  expect(serious).toEqual([]);
}

export function trackConsole(page: Page) {
  const problems: string[] = [];
  page.on("console", (m) => {
    if (m.type() === "error" || m.type() === "warning") problems.push(m.text());
  });
  page.on("pageerror", (e) => problems.push(e.message));
  return () => expect(problems).toEqual([]); // call in afterEach
}
```

## 27. Pattern registry

Build screens in the order backend domains are marked complete in
`docs/DEVELOPMENT_STATUS.md`. As of this writing: sign in and shell, then
admissions review, before attendance, gradebook, results, fees, incidents,
or promotions.

The first implementation of a pattern becomes its reference implementation. The author of that change MUST replace "Not built yet" with the file path in the same change.

### 27.1 Page patterns

| Pattern | Reference implementation |
| --- | --- |
| Application shell | Not built yet |
| Dashboard (teacher, admin, guardian) | Not built yet |
| List page, server handled | Not built yet |
| List page, client handled | Not built yet |
| Detail page | Not built yet |
| Create or edit form page | Not built yet |
| Form in a dialog | Not built yet |
| Gradebook grid | Not built yet |
| Attendance register | Not built yet |
| School branding settings | Not built yet |
| Approval row action | Not built yet |

### 27.2 Table classification

This is the initial classification. Change it here first, then in code.

| Table | Records that can exist | `mobilePattern` | `selectable` |
| --- | --- | --- | --- |
| Students | More than 50 | `cards` | Yes |
| Teachers | More than 50 | `cards` | No |
| Applications | More than 50 | `cards` | No |
| Users | More than 50 | `cards` | No |
| Assessments | More than 50 | `cards` | No |
| Attendance records | More than 50 | `cards` | No |
| Payments | More than 50 | `cards` | No |
| Incidents | More than 50 | `cards` | No |
| Audit logs | More than 50 | `cards` | No |
| Classes | 11 to 50 | `cards` | No |
| Subjects | 11 to 50 | `cards` | No |
| Academic years | 1 to 10 | `cards` | No |
| Terms | 1 to 10 | `cards` | No |
| Gradebook | Up to 100 per class | `scroll` | No |
| Attendance register | Up to 100 per class | `scroll` | No |
| Timetable | Up to 50 | `scroll` | No |
| Results broadsheet | Up to 100 per class | `scroll` | No |

## Appendix A. Changes from version 1.0

* Added rule language, rule IDs, and a verification method for every hard rule.
* Changed the precedence order. Security and accessibility now rank above existing code patterns, because existing code can be wrong.
* Replaced every vague quantifier with a threshold, a table, or a decision rule.
* Token model: the token `accent-light` (`#4A90D9`) is removed, because it measures 3.3 to 1 on white. Selected states use `accent` and `brand-accent`. Hover values are derived, not set by hand. `text-muted` (`#64748B`) is now `subtle` and is banned for text (4.34 to 1 on the muted surface). Success and warning gained darker `text` tokens (their `solid` colors measure 3.30 and 3.19 to 1 as text). Input borders use `input` because `border` measures 1.23 to 1.
* Resolved the name collision between the CarePoint brand accent and the shadcn `accent` token (section 3.2). Resolved the collision between `text-primary` as a token and the Tailwind text color utility.
* Branding: specified the derivation formulas, four validation checks with error codes, suggested colors, test fixtures, API contract, first paint procedure, settings screen, and logo rules.
* Added: API conventions, status handling, error message mapping, pagination adapter, money and date rules, idempotency keys, offline behavior, unsaved changes guard, bulk actions, export, table density, mobile table patterns, role navigation order, dashboards, and workflow specifications for the gradebook, attendance, and approvals.
* Added enforcement: ESLint selectors, import boundaries, Playwright helpers, contrast test, performance budgets, and the pattern registry.
* Out of scope in version 2.0: dark mode, charts, print stylesheets (report cards and PDFs are produced by the backend), and languages other than English.

## Appendix B. Reference implementation of color derivation and validation

This is the reference for `theme/derive.ts`. The unit tests in section 4.5 and section 25.2 MUST pass against it.

```ts
export type Rgb = [number, number, number];
export type Oklab = [number, number, number];

const WHITE = "#FFFFFF";
const DARK = "#0F172A";
const BACKGROUND = "#F8FAFC";
export const STATUS_SOLIDS = ["#16A34A", "#D97706", "#DC2626", "#2563EB"] as const;

const hexToRgb = (hex: string): Rgb =>
  [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)) as Rgb;

const rgbToHex = (rgb: Rgb): string =>
  "#" + rgb.map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("").toUpperCase();

const toLinear = (c: number): number => {
  const s = c / 255;
  return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
};

const fromLinear = (c: number): number => {
  const v = Math.max(0, Math.min(1, c));
  return 255 * (v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055);
};

export function luminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map(toLinear);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

export function toOklab(hex: string): Oklab {
  const [r, g, b] = hexToRgb(hex).map(toLinear);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
}

export function fromOklab([L, a, b]: Oklab): string {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return rgbToHex([
    fromLinear(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
    fromLinear(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
    fromLinear(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s),
  ]);
}

export function distance(a: string, b: string): number {
  const [x, y] = [toOklab(a), toOklab(b)];
  return Math.hypot(x[0] - y[0], x[1] - y[1], x[2] - y[2]);
}

export const hover = (hex: string): string => {
  const [L, a, b] = toOklab(hex);
  return fromOklab([L * 0.9, a * 0.9, b * 0.9]);
};

export const tint = (hex: string): string => {
  const [L, a, b] = toOklab(hex);
  return fromOklab([0.1 * L + 0.9, 0.1 * a, 0.1 * b]);
};

export const foregroundFor = (hex: string): string =>
  contrast(hex, WHITE) >= contrast(hex, DARK) ? WHITE : DARK;

export type BrandError =
  | "BRAND_COLOR_FORMAT"
  | "BRAND_COLOR_CONTRAST"
  | "BRAND_COLOR_FOREGROUND_CONTRAST"
  | "BRAND_COLOR_STATUS_CONFLICT";

export type BrandResult = { ok: true; color: string } | { ok: false; error: BrandError };

export function validateBrandColor(input: string): BrandResult {
  if (!/^#[0-9A-Fa-f]{6}$/.test(input)) return { ok: false, error: "BRAND_COLOR_FORMAT" };
  const color = input.toUpperCase();
  if (contrast(color, BACKGROUND) < 4.5) return { ok: false, error: "BRAND_COLOR_CONTRAST" };
  const fg = foregroundFor(color);
  if (contrast(color, fg) < 4.5 || contrast(hover(color), fg) < 4.5) {
    return { ok: false, error: "BRAND_COLOR_FOREGROUND_CONTRAST" };
  }
  if (STATUS_SOLIDS.some((s) => distance(color, s) < 0.05)) {
    return { ok: false, error: "BRAND_COLOR_STATUS_CONFLICT" };
  }
  return { ok: true, color };
}

export function suggestColor(input: string): string | null {
  const [L, a, b] = toOklab(input.toUpperCase());
  for (let n = 1; n <= 40; n++) {
    const candidate = fromOklab([L - 0.01 * n, a, b]);
    if (validateBrandColor(candidate).ok) return candidate;
  }
  return null;
}

export function deriveTheme(primary: string, accent: string): Record<string, string> {
  const primaryHover = hover(primary);
  const primaryForeground = foregroundFor(primary);
  return {
    "--primary": primary,
    "--primary-foreground": primaryForeground,
    "--primary-hover": primaryHover,
    "--brand-accent": accent,
    "--brand-accent-foreground": foregroundFor(accent),
    "--brand-accent-hover": hover(accent),
    "--accent": tint(accent),
    "--ring": primary,
    "--sidebar": primary,
    "--sidebar-foreground": primaryForeground,
    "--sidebar-accent": primaryHover,
  };
}
```

## Appendix C. Decision record template

```text
# Decision NNNN: Short title

Rule ID:
Reason:
Scope (files, pages, or components):
Date:
Approved by:
```