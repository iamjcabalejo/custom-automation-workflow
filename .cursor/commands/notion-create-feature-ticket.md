# Create a feature ticket in Notion

Collect a feature request from the user and create a new page in the Notion Tasks database (or the user’s Features database). The created ticket uses the same structure as plan files in `docs/plans/` (Scope, Acceptance criteria table, Technical approach, Task list, References). Provide a title plus scope, acceptance criteria, technical approach, and task list so the Notion page is as detailed as a saved plan .md file.

## What to do

**Follow the workflow in `.cursor/skills/feature-ticket-to-notion/SKILL.md`.** That skill is the single source of truth for:

- Authenticating with Notion MCP when required
- Resolving the target database (default Tasks DB or dedicated Features DB via search)
- Fetching the database schema with **notion-fetch**
- Collecting plan-level details (title required; scope, acceptance criteria table, technical approach, task list, optional root cause and references)
- Resolving the target database (with fallback via **notion-search** if the default database is not found)
- Creating the page with **notion-create-pages** using the **fetched** schema and parent (data_source_id or database_id from fetch)
- Confirming with the new page link and key properties

Ensure Notion MCP is authenticated before any Notion tool use (`mcp_auth` for server `plugin-notion-workspace-notion` when required).

**References:** `docs/notion-mcp-workflow.md`, `docs/notion-mcp-tools.md`, `docs/notion-tickets-setup.md`
