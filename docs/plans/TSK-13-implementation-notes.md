# TSK-13 Implementation notes

## Done

- **AC1, AC3:** Command and skill run a lightweight Notion check via **notion-search** (query `"Task Tracker"`, `query_type` `"internal"`). On failure, user is guided to authenticate with Notion; no claim of connection.
- **AC2, AC4:** Command and skill call GitHub MCP **get_me**. On failure, user is guided to connect/sign in to GitHub in Cursor.
- **AC5:** When both checks succeed, the skill instructs the agent to show a clear confirmation (e.g. "Notion and GitHub are both connected.").
- **Deliverables:** `.cursor/commands/connect.md`, `.cursor/skills/ensure-notion-github-connected/SKILL.md`, updates to `docs/notion-mcp-workflow.md` and `docs/github-mcp-workflow.md`, plan at `docs/plans/TSK-13-ensure-notion-github-connected.md`.

## Deferred

- None.

## Assumptions

- Notion MCP is exposed as `user-notion` in this environment; the skill uses **notion-search** as the connection check (no separate `mcp_auth` call for `user-notion` in the skill text; if the server requires auth, the failed call leads to guiding the user).
- GitHub MCP remains `user-github`; **get_me** with no arguments is the auth check.
- Cursor command name is assumed to be **Connect** (e.g. `/connect`); actual command trigger depends on Cursor’s command registration.

## Env/config

- No new env vars or config. Notion and GitHub MCP servers must be enabled in Cursor (existing setup).
