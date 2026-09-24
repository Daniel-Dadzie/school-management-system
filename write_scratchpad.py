import os

content = \"\"\"# Frontend Audit & Reset Scratchpad

## 1. Structure Verification
- apps/web/app/page.tsx is currently at the root level.
  **Action:** Move to apps/web/app/(public)/page.tsx (**REFACTOR**) to conform strictly to the (public), (auth), (portal) route grouping.

## 2. SHS (Senior High School) References
- Found in apps/web/app/page.tsx (line 222): *"Advanced academic preparation, technical skills development, and guidance for senior secondary progression."*
  **Action:** **REFACTOR** this page to remove references to senior secondary progression. (Note: While "SHS" itself isn't in the codebase, this is the semantic equivalent in the marketing copy that needs removing).

## 3. Hardcoded Colors vs Theme Tokens
- **apps/web/app/(public)/admissions/page.tsx**: Contains extensive hardcoded Tailwind color utilities (bg-gray-50, bg-blue-600, text-red-500, etc.), directly violating rules T1 and T2.
- **apps/web/app/(portal)/settings/page.tsx**: Contains hardcoded hex color literals in the THEME_PRESETS array (violates rule T1). Uses a local preset approach instead of dynamic API-driven theme derivation as described in Section 4.8 of the design system.
- **apps/web/app/globals.css**: Contains an extra set of CSS variables (a dark mode palette). Rule T8 dictates that dark mode is out of scope.

## 4. File-by-File Audit (KEEP, REPLACE, REMOVE, REFACTOR)

| File | Status | Reason |
|------|--------|--------|
| apps/web/app/page.tsx | **REFACTOR** | Contains "senior secondary" reference. Should be moved to (public)/page.tsx for proper route structure. |
| apps/web/app/(public)/admissions/page.tsx | **REPLACE** | Violates public design system. It uses a single large form instead of the multi-step React Hook Form wizard (Rule P7). Uses hardcoded Tailwind colors instead of semantic tokens. Uses custom raw HTML inputs instead of shared components (Field). Also needs to be split/moved to (public)/admissions/apply/page.tsx for the wizard, leaving the root for marketing info. |
| apps/web/app/(portal)/settings/page.tsx | **REPLACE** | Violates T1 (hardcoded hex presets). Implements static theme switching instead of the dynamic custom hex picker and API-driven validation specified in Section 4.8 of the portal design system. Needs to be rewritten to interface with the /api/v1/branding backend endpoints. |
| apps/web/app/globals.css | **REFACTOR** | Needs cleanup to remove dark mode variables and exactly match the reference CSS provided in Section 3.5. |
| apps/web/app/layout.tsx | **KEEP** | Standard Next.js layout, follows standards. |
| apps/web/app/(auth)/* | **KEEP** | Foundation files for authentication. |
| apps/web/components/* | **KEEP** | Shared components generally follow the design system. |
| apps/web/lib/* | **KEEP** | Utilities and API clients. |
\"\"\"

with open(r'C:\Users\dani@\.gemini\antigravity\brain\ddd43653-dd90-484a-a5ed-cb83b5136c72\scratchpad.md', 'w', encoding='utf-8') as f:
    f.write(content)
