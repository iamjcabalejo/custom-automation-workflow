---
name: implement-ticket
description: Implements a single Notion ticket (bug or feature) end-to-end: fetch ticket, plan, code, review. Use when the user runs the implement-ticket command or asks to implement a ticket by No. ID, page URL, or page ID.
---

# Implement ticket

Implement one Notion ticket (bug or feature) from specification to production-ready code. Input: **No. ID** (e.g. TSK-1), **page URL**, or **page ID**. Follow Plan → Code → Review/Test per the compounding development cycle; apply backend and frontend architect skills for implementation and backend/frontend reviewer skills for review.

## Terminology

| Term | Definition |
|------|-------------|
| **Ticket** | A Notion page (task/bug/feature) with title, description, acceptance criteria, and properties. |
| **No. ID** | Task identifier property (e.g. TSK-1). Resolve via notion-task-by-no-id when that is the only input. |
| **Plan** | Single written artifact: scope, acceptance criteria, technical approach, task list. |
| **Production ready** | All acceptance criteria covered, no Critical rework items, gates from Review/Test passed. |

## Prerequisites

- [ ] Notion MCP authenticated. Call `mcp_auth` for server `plugin-notion-workspace-notion` before any Notion tool use when the server requires authentication. See `docs/notion-mcp-workflow.md`.
- [ ] Load and apply **backend-architect** and **frontend-architect** for the Code phase; **backend-reviewer** and **frontend-reviewer** for the Review phase. Read each from the agent skills list when entering that phase.

## Coding rules (apply in Code and Review)

- **Type safety:** Explicit types over `any`; use `unknown` and narrow. Avoid `as` unless necessary.
- **Errors:** Handle explicitly; never empty catch. Log with context before rethrowing.
- **Functions:** Single concern; ~30 lines max; early returns and guard clauses.
- **Naming:** Meaningful names; booleans like `isLoading`, `hasError`; verbs for functions (`fetchUser`, `validateInput`).
- **General:** `const` over `let`; no magic numbers/strings; comment why, not what.
- **Security:** Validate at boundaries; parameterized queries; no secrets in logs; least privilege.
- **Resilience:** Timeouts, retries with backoff, idempotency where appropriate.

Follow project rules: `core-standards.mdc`, `compounding-dev-cycle.mdc`, and domain rules (e.g. `api-routes.mdc`) when in scope.

## Workflow

### 1. Resolve ticket input

- [ ] If user did not specify a ticket → ask: “Which ticket? Provide the task ID (e.g. TSK-1) or the Notion page link.” Then stop.
- [ ] Otherwise follow `.cursor/skills/notion-task-by-no-id/SKILL.md` to fetch full ticket details (page URL, page ID, or No. ID).
- [ ] If fetch fails → report and suggest checking URL/ID and Notion auth; stop.
- [ ] Extract from ticket: title, description, acceptance criteria (or equivalent), type (bug vs feature), status, assignee, due date. Present a short summary to the user.

### 2. Optional: Update Notion status

- [ ] If the ticket has a Status (or equivalent) property and the workspace expects it → set status to “In progress” (or equivalent) via Notion MCP page update if available.
- [ ] If an “Agent status” or similar field exists → set a brief note (e.g. “Planning…”). Skip if no such property or tool.

### 3. Plan (ASK then PLAN)

- [ ] **ASK:** If scope or acceptance criteria are unclear from the ticket, ask clarifying questions until they are unambiguous. Exit ASK when scope and AC are clear.
- [ ] **PLAN:** Author a single plan artifact. Include:
  - **Scope:** In/out; dependencies and boundaries.
  - **Acceptance criteria:** Testable conditions (Given/When/Then or checklist).
  - **Technical approach:** Key components, APIs, data shapes; references to project rules.
  - **Task list:** Ordered implementation steps; optional file/area mapping.
- [ ] Write the plan to `docs/plans/<ticket-slug>.md` (e.g. from No. ID or title). If the file cannot be written, keep the plan in context and inform the user.
- [ ] Gate: Plan is complete when another agent can implement without guessing. Only then proceed to Code.

### 4. Code (AGENT)

- [ ] Read and apply **backend-architect** and **frontend-architect** from the agent skills list. Match work to backend vs frontend and apply the corresponding skillset.
- [ ] Implement exactly to the plan. Do not expand scope; if the plan is wrong, note it and adjust the plan or hand back to Plan.
- [ ] Add tests for new behavior (unit/integration/API as relevant); follow api-test / E2E patterns where applicable.
- [ ] Produce **implementation notes** using this template:
  - **Done:** What was implemented (map to AC, e.g. AC-1, AC-2).
  - **Deferred:** What was postponed and why.
  - **Assumptions:** Environment, dependencies, behavior.
  - **Env/config:** Required env vars, config changes, setup steps.
- [ ] Hand off to Review/Test: provide plan doc, acceptance criteria, code diff, and implementation notes.

### 5. Review/Test (AGENT, review-only)

- [ ] Run in **Ask mode** (read-only): produce rework list and summary; do not apply changes unless the user explicitly asks.
- [ ] Read and apply **backend-reviewer** and **frontend-reviewer** from the agent skills list. Review backend and frontend areas with the corresponding skillset.
- [ ] Produce:
  - **Review summary:** Alignment with plan; adherence to core-standards and domain rules; security/performance notes.
  - **Test status:** Which AC are covered; failing or missing tests.
  - **Rework list:** Concrete items (file/line or component + required change + **severity**). Severity: **Critical** (must fix before production), **Suggestion**, **Nice to have**.
- [ ] Gates: All AC covered by tests; no project-rule violations; no unresolved high-severity security or data-integrity issues.

### 6. Decide: production ready or rework

- [ ] If no **Critical** rework and gates passed → declare **production ready**. Go to step 7.
- [ ] If **Critical** rework or gates not passed → go to step 6b.

### 6b. Rework cycle

- [ ] **PLAN (brief):** Turn rework into a short plan (scope = fixing issues, AC = each critical item resolved). Write to `docs/plans/<ticket-slug>-rework-N.md` when N ≥ 1. If the file cannot be written, keep in context.
- [ ] **Code (AGENT):** Fix Critical items per rework list.
- [ ] **Review/Test (AGENT, Ask mode):** Re-run review; produce new rework list.
- [ ] Repeat until no Critical issues and gates pass → declare **production ready**. Then go to step 7.

### 7. Optional: Update Notion and close

- [ ] If the ticket has a Status property → set status to “In review” (or equivalent) via Notion MCP if available.
- [ ] If “Agent status” or similar exists → clear or set to “In review”. Add a short comment summarizing the result if the tool supports it.
- [ ] Confirm to the user: ticket implemented, plan and implementation notes location, and Notion link.

## Skill loading summary

| Phase | Skills to load and apply |
|-------|---------------------------|
| Fetch ticket | notion-task-by-no-id |
| Plan | (no extra skills; follow compounding-dev-cycle) |
| Code | backend-architect, frontend-architect |
| Review/Test | backend-reviewer, frontend-reviewer |

Read each skill from the agent skills list at the start of the phase. Paths are provided in the agent skills configuration.

## Bug vs feature

- **Bug:** Use ticket title, description, steps to reproduce, and expected vs actual as acceptance criteria. Plan = minimal scope to fix the bug and add/run relevant tests.
- **Feature:** Use ticket description and acceptance criteria (or requirements) as the contract. Plan = scope, AC, technical approach, and task list as above.

## References

- Ticket resolution: `.cursor/skills/notion-task-by-no-id/SKILL.md`
- Cycle and modes: `.cursor/rules/compounding-dev-cycle.mdc`
- Notion auth and tools: `docs/notion-mcp-workflow.md`, `docs/notion-mcp-tools.md`
- Implement-ticket rule: `.cursor/rules/implement-ticket.mdc`
