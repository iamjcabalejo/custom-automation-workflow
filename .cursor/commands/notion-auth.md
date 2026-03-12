# Connect / authenticate to Notion MCP

Run the Notion MCP authentication flow so the current user can use Notion from this project (tickets, databases, search).

## What to do

1. **Call the Notion MCP auth tool** so the user can complete OAuth if needed:
   - **Server:** `plugin-notion-workspace-notion`
   - **Tool:** `mcp_auth`
   - **Arguments:** `{}`
   - Use the MCP tool-calling interface (e.g. `call_mcp_tool`) with the above.

2. **Tell the user:** If a browser window or Cursor prompt appears, sign in to Notion and approve access. Once done, they can use Notion from chat (e.g. query tickets, search).

3. **If auth is already valid:** Briefly confirm that Notion is connected and they can ask to query tickets or search Notion.

**Reference:** Full setup and troubleshooting in `docs/notion-mcp-workflow.md`.
