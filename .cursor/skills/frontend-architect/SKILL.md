---
name: frontend-architect
description: Guides frontend implementation and review for UI, components, state, styling, and accessibility. Apply during implement-ticket Code phase for frontend-focused tickets; use with backend-architect when a ticket spans both.
---

# Frontend Architect

Use this skill when implementing or reviewing **frontend** work: UI, components, client state, styling, and accessibility. For API/server/database work, use **backend-architect** instead. For full-ticket flow, follow `.cursor/skills/implement-ticket/SKILL.md` and load both architect skills in the Code phase; match work to frontend vs backend and apply the corresponding guidance.

## When to use Frontend vs Backend Architect

| Area | Use this skill (Frontend Architect) | Use Backend Architect |
|------|--------------------------------------|------------------------|
| UI, pages, views | ✓ | — |
| Components (React, Vue, etc.) | ✓ | — |
| Client state (React state, context, stores) | ✓ | — |
| Styling (CSS, Tailwind, design tokens) | ✓ | — |
| Accessibility (a11y), keyboard, screen readers | ✓ | — |
| Client-side validation, forms | ✓ | — |
| API routes, server handlers | — | ✓ |
| Database queries, migrations | — | ✓ |
| Auth/session server-side | — | ✓ |
| Background jobs, queues | — | ✓ |
| Full-stack ticket | Apply both; frontend for UI/client, backend for API/DB. | Apply both. |

When in doubt: if the change is visible in the browser or affects how users interact with the app, treat it as frontend. If it affects servers, databases, or internal APIs, treat it as backend.

## Scope and responsibilities

- **Component structure:** Prefer small, single-purpose components; composition over large monoliths. Keep components under ~30 lines of JSX where practical; extract subcomponents or hooks when logic grows.
- **State management:** Keep state close to where it’s used; lift only when needed. Prefer explicit state over implicit (no magic globals). Document non-obvious state flows.
- **Styling:** Follow project conventions (e.g. Tailwind, CSS modules, design system). Avoid inline styles for layout/theme; use design tokens or shared variables. Prefer responsive and accessible defaults.
- **Accessibility:** Semantic HTML; ARIA only when necessary. Keyboard navigable; focus order and visible focus. Sufficient color contrast and non-color cues. Label form controls; provide alt text for meaningful images.
- **Types and validation:** Use strict TypeScript; no `any` for public props or API boundaries. Validate user input at the boundary (forms, URL params); sanitize before render when needed.
- **Security:** No secrets in client bundle. Validate/sanitize output that re-renders user content. Prefer parameterized API calls; avoid building HTML/SQL from user input.
- **Performance:** Lazy-load heavy UI when appropriate; avoid unnecessary re-renders. Prefer stable keys and memoization only where profiling shows benefit.

## Coding rules (frontend)

- **Naming:** Components PascalCase; hooks and functions camelCase; booleans `isLoading`, `hasError`; event handlers `handle*` or `on*`.
- **Errors:** Handle loading and error states in UI; never leave empty catch or unhandled rejections. Show user-facing messages where appropriate.
- **Files:** One main component per file; colocate tests or place in `__tests__` per project convention.
- **Dependencies:** Prefer platform and framework primitives; add libraries only when they clearly reduce complexity or match project standards.

## References

- Implement-ticket: `.cursor/skills/implement-ticket/SKILL.md`
- Project General Rules and `core-standards.mdc` (when present)
