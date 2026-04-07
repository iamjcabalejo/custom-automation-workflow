---
name: frontend-architect-skillset
description: Frontend skillset entry point for UI and client-side work. Use when implementing or reviewing components, pages, styling, state, accessibility, or frontend testability.
---

# Frontend Skillset

Use this as the **entry point** for frontend tickets and frontend sections of full-stack tickets. Then load the specific skills below that match the task context.

## When to use

- UI, pages, components, client state, styling, accessibility, or client-side behavior.
- Frontend parts of implement-ticket work in `.cursor/skills/implement-ticket/SKILL.md`.
- Review/Test of frontend changes (correctness, accessibility, performance, testability).

Use `backend-architect` for API/server/database work.

## Frontend vs backend boundary

| Area | Frontend skillset | Backend architect |
|------|--------------------|-------------------|
| UI, pages, components | Yes | No |
| Client state and forms | Yes | No |
| Styling and design-system usage | Yes | No |
| Accessibility and keyboard UX | Yes | No |
| API routes and server handlers | No | Yes |
| Database queries and migrations | No | Yes |
| Auth/session server-side | No | Yes |
| Background jobs and queues | No | Yes |
| Full-stack ticket | Apply both (split by layer) | Apply both (split by layer) |

## Skills to load by context

| Skill | Path | Load when |
|-------|------|-----------|
| `accessibility-checklist` | `~/.codex/skills/accessibility-checklist/SKILL.md` | Building/reviewing interactive UI, forms, keyboard flow, or semantic structure |
| `performance-profiling` | `~/.codex/skills/performance-profiling/SKILL.md` | Investigating render cost, bundle size, or responsiveness regressions |
| `refactoring-checklist` | `~/.codex/skills/refactoring-checklist/SKILL.md` | Restructuring components/hooks while preserving behavior |
| `e2e-playwright` | `~/.codex/skills/e2e-playwright/SKILL.md` | Creating or reviewing browser-level flows and selectors |
| `code-review` | `~/.codex/skills/code-review/SKILL.md` | Performing focused frontend review and rework recommendations |

## Operating guidance

1. Read this file first.
2. Identify which task areas are in scope (UI, state, a11y, perf, tests, review).
3. Load only the matching skills from the table above.
4. Follow project rules: `core-standards.mdc` and `compounding-dev-cycle.mdc`.
5. For implement-ticket flow, keep scope aligned with the plan and acceptance criteria.

## Frontend implementation standards

- Keep components focused; extract hooks/helpers when logic becomes hard to follow.
- Handle loading, empty, and error states explicitly in user-visible flows.
- Prefer semantic HTML and keyboard-accessible controls before custom ARIA patterns.
- Avoid unnecessary dependencies; prefer framework/platform primitives first.
- Keep type boundaries explicit; avoid `any` for props or cross-layer contracts.

## References

- `.cursor/skills/implement-ticket/SKILL.md`
- `.cursor/rules/compounding-dev-cycle.mdc`
- `.cursor/rules/core-standards.mdc`
