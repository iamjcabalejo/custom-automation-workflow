# Get ticket details by ID or URL

Fetch and show full details for a single Notion ticket. The user can provide a **Notion page URL**, a **page ID**, or the **No. ID** (task identifier, e.g. **TSK-1**).

## What to do

**Follow the workflow in `.cursor/skills/notion-task-by-no-id/SKILL.md`.** That skill is the single source of truth for:

- Resolving input (page URL, page ID, or No. ID)
- Using **notion-search** when you have only No. ID, then **notion-fetch** for full details
- Using **notion-fetch** directly when you have a page URL or page ID
- Returning full details and handling failures

Ensure Notion MCP is authenticated before any Notion tool use (`mcp_auth` for server `plugin-notion-workspace-notion` when required).

**References:** `docs/notion-tickets-setup.md`, `docs/notion-mcp-tools.md`, `docs/notion-mcp-workflow.md`
