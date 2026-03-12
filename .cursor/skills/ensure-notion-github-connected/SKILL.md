---
name: ensure-notion-github-connected
description: Ensures both Notion MCP and GitHub MCP are connected; if either is not, guides the user to log in. Use when the user runs the connect command or asks to ensure Notion and GitHub are connected.
---

# Ensure Notion and GitHub connected

Run a two-phase workflow: (1) ensure **Notion MCP** (server: `user-notion`) is connected, (2) ensure **GitHub MCP** (server: `user-github`) is connected. If either check fails, guide the user to log in to that service. When both succeed, confirm to the user. Use **only** existing Notion and GitHub MCP tools; read tool schemas from `mcps/user-notion/tools/` and `mcps/user-github/tools/` when needed.

## Terminology

| Term | Definition |
|------|-------------|
| **Notion MCP** | MCP server `user-notion`; tools include `notion-search`, `notion-fetch`, etc. |
| **GitHub MCP** | MCP server `user-github`; tools include `get_me`, `list_branches`, etc. |

## Prerequisites

- Notion and GitHub integrations must be available in Cursor. If tools return auth/connection errors, direct the user to connect or sign in to the corresponding service (Notion or GitHub) in Cursor.

## Workflow

### 1. Ensure Notion is connected (AC1, AC3)

- [ ] Run a **lightweight Notion check** by calling **notion-search** (server: `user-notion`) with:
  - `query`: `"Task Tracker"` (or another minimal workspace query)
  - `query_type`: `"internal"`
- [ ] If the call **succeeds** → Notion is connected; proceed to step 2.
- [ ] If the call **fails** (e.g. auth error, connection error, server not found) → do **not** claim Notion is connected. Tell the user: "Notion doesn’t appear to be connected. Please authenticate with Notion (e.g. ask: ‘Authenticate Notion MCP’ or ‘Connect this project to Notion’) and try again." Stop. Do not proceed to GitHub until the user has connected Notion and re-runs the command if desired.

**Tool reference:** **notion-search** — required: `query`; for workspace search use `query_type`: `"internal"`. See `mcps/user-notion/tools/notion-search.json`.

### 2. Ensure GitHub is connected (AC2, AC4)

- [ ] Call **get_me** (server: `user-github`, no arguments). This returns the authenticated GitHub user.
- [ ] If the call **succeeds** → GitHub is connected; proceed to step 3.
- [ ] If the call **fails** (e.g. not authenticated, connection error) → do **not** claim GitHub is connected. Tell the user: "GitHub doesn’t appear to be connected or you’re not signed in. Please connect GitHub in Cursor (e.g. enable the GitHub integration and sign in), then try again." Stop.

**Tool reference:** **get_me** — no parameters. See `mcps/user-github/tools/get_me.json`.

### 3. Ask for and save GitHub project board (AC6)

After GitHub is connected, make the project board **dynamic** by asking the user to specify which GitHub Project board to use for tickets and automation.

- [ ] **Ask** the user: "Which GitHub Project board should this workspace use? Provide either (a) the project URL (e.g. `https://github.com/orgs/Buyninja/projects/2`) or (b) the org name and project number (e.g. org: **Buyninja**, project: **2**)."
- [ ] **Parse** the user’s answer:
  - If they provide a URL: extract **org** from `/orgs/<org>/projects/` and **project** from `/projects/<number>` (e.g. `https://github.com/orgs/Buyninja/projects/2/views/1` → org `Buyninja`, project `2`).
  - If they provide org and number separately, use those.
- [ ] **Write** the resolved values to the project config file **`.cursor/github-project.json`** in the workspace root, with this shape:
  ```json
  { "org": "<org>", "project": <number> }
  ```
  Use the **write** tool (or equivalent) to create or overwrite this file. The project number must be a JSON number (e.g. `2`), not a string.
- [ ] **Confirm** to the user: "GitHub project board set to **&lt;org&gt;/project #&lt;number&gt;** (saved to `.cursor/github-project.json`). The project tickets script and other flows will use this board by default."
- [ ] If the user **declines** or does not provide a board: say "You can set the project board later by running Connect again and specifying it, or by creating `.cursor/github-project.json` with `{\"org\": \"YourOrg\", \"project\": 2}`." Do not create the file. Proceed to step 4.

### 4. Confirm both connected (AC5)

- [ ] When both step 1 and step 2 have succeeded, and step 3 is done (board set or declined), tell the user clearly: "Notion and GitHub are both connected." If a project board was set, add: "GitHub project board: **&lt;org&gt;/project #&lt;number&gt;**." Optionally summarize (e.g. "Notion: search succeeded. GitHub: you are logged in as &lt;login&gt;."). Stop.

## Tool usage

Use **call_mcp_tool** with:

- **Notion:** server `user-notion`, toolName e.g. `notion-search`; arguments as in `mcps/user-notion/tools/notion-search.json` (e.g. `query`, `query_type`).
- **GitHub:** server `user-github`, toolName `get_me`; no arguments.

Read the tool schema before calling if unsure of parameters.

## Failure handling

| Situation | Action |
|-----------|--------|
| **notion-search** fails | Do not proceed. Ask user to authenticate with Notion MCP and try again. |
| **get_me** fails | Do not proceed. Ask user to connect/sign in to GitHub in Cursor. |
| User provides project board | Parse org + project number; write `.cursor/github-project.json`; confirm. |
| User declines project board | Do not create the file; remind them they can set it later. |
| User re-runs after fixing one service | Run the full workflow again (Notion first, then GitHub, then confirm). |

## References

- Plan: `docs/plans/TSK-13-ensure-notion-github-connected.md`
- Workflow docs: `docs/notion-mcp-workflow.md`, `docs/github-mcp-workflow.md`
- Command: `.cursor/commands/connect.md`
- GitHub project config: `.cursor/github-project.json` (created when user specifies board); see `docs/github-project-tickets.md`
- Notion MCP tools: `mcps/user-notion/tools/`
- GitHub MCP tools: `mcps/user-github/tools/`
- Pattern: `.cursor/skills/github-commands-workflow/SKILL.md` (GitHub-only flow)
