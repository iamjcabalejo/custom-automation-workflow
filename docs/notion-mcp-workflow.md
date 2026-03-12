# Notion MCP workflow

This project is connected to Notion via the **Notion MCP** (Cursor plugin). Use this workflow so the current user is authenticated and Notion tools (e.g. tickets database, search) work from Cursor.

## One-time setup

1. **Enable the Notion plugin**  
   Already set in this repo: `.cursor/settings.json` has `plugins.notion-workspace.enabled: true`. If you use Cursor settings UI, ensure the Notion workspace plugin is enabled for this project.

2. **Authenticate the Notion MCP**  
   The MCP server must be authenticated before any Notion tools can be used:
   - **From Cursor:** When you or the AI need Notion (tickets, search, databases), the agent will call the `mcp_auth` tool for the Notion server. You may be prompted to sign in to Notion (OAuth) in the browser. Complete that flow once per workspace/device.
   - **Manual trigger:** You can ask in chat: “Authenticate me with Notion MCP” or “Connect this project to Notion” so the agent runs the auth flow.

3. **Share Notion content with the integration**  
   In Notion, share the pages/databases you want to use (e.g. Tickets) with the same Notion integration that Cursor uses (e.g. “Notion” or “Cursor”). Otherwise the MCP will be authenticated but won’t see those resources.

## Per-session / when things break

- If Notion tools fail or say the server needs authentication, (re-)run auth:
  - Ask: “Authenticate Notion MCP” or “Run Notion MCP auth.”
  - The project rule (`.cursor/rules/notion-mcp-auth.mdc`) tells the agent to call `mcp_auth` for server `plugin-notion-workspace-notion` when a task involves Notion.
- After auth, you can query tickets, search Notion, or use other Notion skills from chat.

## Commands

| Command | Purpose |
|--------|--------|
| **/connect** | Ensure both Notion and GitHub are connected; if not, guide you to log in to either or both. See `docs/github-mcp-workflow.md` and `.cursor/skills/ensure-notion-github-connected/SKILL.md`. |
| **/ticket** &lt;ID&gt; | Get full details for one ticket (e.g. `/ticket TSK-1`). |
| **/my-implementation-tickets** | Interactive: choose pod, list your implementation-lane tickets, pick ticket(s), create a detailed plan. |

## Quick reference

| Goal                         | Action |
|-----------------------------|--------|
| Check Notion and GitHub     | Use the **Connect** command (`/connect`) to ensure both are connected and to log in if needed. |
| First-time connection       | Enable plugin (see above), then trigger auth via chat so you can complete OAuth. |
| Get one ticket by ID        | Use `/ticket TSK-1` (or the ID you need). |
| Use tickets/Notion in chat  | Ensure auth has been done; then ask to “query the tickets database” or “search Notion for …”. |
| Auth expired or not working | Ask: “Authenticate Notion MCP” or “Run Notion MCP auth.” |

## Technical details

- **MCP server:** `plugin-notion-workspace-notion`
- **Auth tool:** `mcp_auth` (no arguments). Called via Cursor’s MCP tool interface.
- **Status:** Cursor checks `mcps/plugin-notion-workspace-notion/STATUS.md`; when it says the server needs authentication, the agent should call `mcp_auth` first when Notion is required for the task.

## Troubleshooting: “I’ve connected but Notion still doesn’t work”

1. **Re-run auth**  
   Ask in chat: “Authenticate Notion MCP” or “Run Notion MCP auth.” Complete the browser sign-in again. Tokens can expire or be for a different workspace.

2. **Share the database with the integration**  
   In Notion, open the **Tickets** database (or the page that contains it). Click **Share** and add the same integration Cursor uses (e.g. “Notion” or “Cursor”). If the database (or its parent) is not shared with that integration, the MCP will be authenticated but will get 404 or “object not found” when accessing it.

3. **Use the correct workspace**  
   The default Tickets URL in this project is for the **ticketboat** workspace. When you sign in via OAuth, use the Notion account that has access to that workspace. If you connected a different workspace, you won’t see ticketboat’s databases.

4. **Plugin enabled**  
   In this project, `.cursor/settings.json` has `plugins.notion-workspace.enabled: true`. If you changed Cursor settings, ensure the Notion workspace plugin is still enabled.
