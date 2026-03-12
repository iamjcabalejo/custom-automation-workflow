# TSK-9: Add Frontend Architect agent

## Scope

- **In:** Define and add a Frontend Architect agent (skill or rule) that guides frontend implementation and review (UI, components, state, styling, a11y). Align with existing Backend Architect where the project uses both. Skill discoverable in `.cursor/skills` or `.cursor/rules`; invokable from implement-ticket; docs on when to use Frontend vs Backend Architect.
- **Out:** Modifying or replacing the existing Backend Architect agent; backend-only implementation; non-Cursor tooling.

## Acceptance criteria

| ID | Criterion |
|----|-----------|
| AC1 | A Frontend Architect agent is defined and discoverable (e.g. skill or rule in `.cursor/skills` or `.cursor/rules`). |
| AC2 | The agent provides clear frontend guidance (component structure, state management, styling, accessibility) consistent with project standards. |
| AC3 | The agent can be invoked from implement-ticket or equivalent flow when the ticket is frontend-focused. |
| AC4 | Documentation or in-skill description explains when to use Frontend vs Backend Architect. |

## Technical approach

1. **Add Frontend Architect skill** at `.cursor/skills/frontend-architect/SKILL.md` with:
   - Scope and responsibilities (UI, components, state, styling, a11y).
   - Guidance aligned with General Rules (TypeScript, validation, security, no magic strings).
   - Section "When to use Frontend vs Backend Architect" (AC4).
2. **Reuse implement-ticket patterns:** implement-ticket skill and `.cursor/rules/implement-ticket.mdc` already reference loading `frontend-architect` during the Code phase; creating the skill file makes it loadable. No change to implement-ticket flow required beyond the skill existing.
3. **Optional:** Reference project frontend stack in the skill (e.g. React/Next, TypeScript, styling) where the repo has a frontend; keep skill generic enough for repos without a frontend.
4. **No new tests** for this ticket (skill is documentation/guidance); "Test with a sample frontend ticket" is manual validation.

## Task list

1. Write plan to `docs/plans/TSK-9-add-frontend-architect-agent.md`.
2. Create `.cursor/skills/frontend-architect/SKILL.md` with scope, frontend guidance, and "When to use Frontend vs Backend Architect".
3. Confirm implement-ticket references (skill + rule) already point to `frontend-architect`; no code change needed for invocation.
4. Add implementation notes; run Review (rework list, severity); set Notion status to Done if gates pass.

## References

- Notion ticket: [TSK-9 Add Frontend Architect agent](https://www.notion.so/318f668f69618192a77ff565be1b2d6b)
- `.cursor/skills/implement-ticket/SKILL.md`, `.cursor/rules/implement-ticket.mdc`
