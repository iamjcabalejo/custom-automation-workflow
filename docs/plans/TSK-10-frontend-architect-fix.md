# TSK-10: Fix Frontend Architect skill behavior

## Scope

- **In:** Update `.cursor/skills/frontend-architect/SKILL.md` so it works as a reliable frontend skill entry point for implement-ticket and general frontend tasks, with clear usage triggers and references to supporting skills.
- **Out:** Changes to backend skills, command routing logic, MCP tooling, or non-skill runtime code.

## Acceptance criteria

| ID | Criterion |
|----|-----------|
| AC1 | `.cursor/skills/frontend-architect/SKILL.md` has valid, clear metadata and task routing guidance for frontend work. |
| AC2 | The skill explicitly tells the agent to load additional relevant frontend skills (a11y, performance, refactor, review, E2E) based on task context. |
| AC3 | The skill clearly explains frontend vs backend boundaries and keeps implement-ticket alignment. |
| AC4 | The updated skill is concise, actionable, and self-consistent (no ambiguous or conflicting instructions). |

## Technical approach

1. Replace the current content with a "frontend skillset" style structure:
   - clear purpose and entry-point behavior,
   - skill matrix for sub-skills to load by context,
   - explicit usage steps.
2. Preserve project-specific integration:
   - reference `.cursor/skills/implement-ticket/SKILL.md`,
   - reference project rules such as `core-standards.mdc` and `compounding-dev-cycle.mdc`.
3. Keep boundaries explicit so backend/server concerns route to backend-architect guidance.

## Task list

1. Create this plan at `docs/plans/TSK-10-frontend-architect-fix.md`.
2. Update `.cursor/skills/frontend-architect/SKILL.md` to the new structure and guidance.
3. Add implementation notes for AC mapping.
4. Perform review/test pass with backend-reviewer + frontend-reviewer criteria and record rework status.
