# Implement a specified ticket

Implement a single Notion ticket (bug or feature) end-to-end: fetch the ticket, plan, code, and review. The user specifies the ticket by **No. ID** (e.g. TSK-1), **Notion page URL**, or **page ID**.

## What to do

**Follow the workflow in `.cursor/skills/implement-ticket/SKILL.md`.** That skill is the single source of truth for:

- Authenticating with Notion MCP when required
- Resolving and fetching the ticket (page URL, page ID, or No. ID) via the **notion-task-by-no-id** skill
- Running Plan → Code → Review/Test per the compounding development cycle
- Applying **backend-architect** and **frontend-architect** during implementation; **backend-reviewer** and **frontend-reviewer** during review
- Coding rules and handoff discipline (implementation notes, rework list, production-ready gate)
- Optional Notion status updates (e.g. In progress / Done)

Ask the user which ticket to implement if they have not provided one (e.g. “Implement TSK-1” or “Implement this ticket: [URL]”).

**References:** `docs/notion-mcp-workflow.md`, `docs/notion-mcp-tools.md`, `.cursor/rules/implement-ticket.mdc`, `.cursor/rules/compounding-dev-cycle.mdc`
