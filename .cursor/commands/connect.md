# Connect: ensure Notion and GitHub are connected

Ensure that both **Notion MCP** and **GitHub MCP** are properly connected. If either is not connected, guide the user to log in to that service. After GitHub is connected, **ask the user to specify the GitHub Project board** for this workspace so tickets and automation use the right board.

## What to do

**Follow the workflow in `.cursor/skills/ensure-notion-github-connected/SKILL.md`.** That skill is the single source of truth for:

1. **Ensure Notion is connected** — Run a lightweight check (e.g. **notion-search** with query `"Task Tracker"` and `query_type` `"internal"`). If it fails with an auth or connection error, tell the user to authenticate with Notion (e.g. “Authenticate Notion MCP” or “Connect this project to Notion”) and do not proceed until Notion is connected.
2. **Ensure GitHub is connected** — Call the GitHub MCP tool **get_me** (server: `user-github`). If it fails, ask the user to connect or sign in to GitHub in Cursor and do not proceed until GitHub is connected.
3. **Ask for GitHub project board** — After GitHub is connected, ask the user which GitHub Project board to use (URL like `https://github.com/orgs/Buyninja/projects/2` or org + project number). Parse and save to **`.cursor/github-project.json`** with `{ "org": "<org>", "project": <number> }`. If the user declines, do not create the file and remind them they can set it later.
4. **Confirm** — When both Notion and GitHub are connected (and project board step is done), show the user a clear confirmation (e.g. "Notion and GitHub are both connected. GitHub project board: **Buyninja**/project #**2**.").

Use **only** existing Notion and GitHub MCP tools for steps 1–2. For step 3, write `.cursor/github-project.json` with the parsed org and project number. Check tool parameters in `mcps/user-notion/tools/` and `mcps/user-github/tools/` and use **call_mcp_tool** with server `user-notion` or `user-github` as appropriate.

**References:** `docs/notion-mcp-workflow.md`, `docs/github-mcp-workflow.md`, `docs/github-project-tickets.md`, `docs/plans/TSK-13-ensure-notion-github-connected.md`
