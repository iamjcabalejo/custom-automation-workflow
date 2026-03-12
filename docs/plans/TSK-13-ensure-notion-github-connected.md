# TSK-13: Command — ensure Notion and GitHub connected (login both if needed)

## Scope

- **In:** Single command that checks Notion MCP and GitHub MCP connection state; if either is not connected, guides user to log in to both as needed.
- **Out:** Changing MCP server code; implementing features beyond connection check; other standalone commands.

## Acceptance criteria

| ID | Criterion |
|----|-----------|
| AC1 | When invoked, command checks whether Notion MCP is connected (e.g. via auth or lightweight fetch). |
| AC2 | Command checks whether GitHub MCP is connected (e.g. via get_me). |
| AC3 | If Notion is not connected, user is prompted/guided to log in to Notion (OAuth or Cursor integration). |
| AC4 | If GitHub is not connected, user is prompted/guided to log in to GitHub. |
| AC5 | When both are connected, user sees a clear confirmation. |

## Technical approach

1. **Notion (user-notion):** Use a lightweight check: call **notion-search** with query `"Task Tracker"` and `query_type` `"internal"` (or **notion-fetch** on a known database ID). If the call fails with an auth/connection error, tell the user to authenticate with Notion (e.g. “Authenticate Notion MCP” or “Connect this project to Notion”) and do not claim Notion is connected. On success, Notion is considered connected.
2. **GitHub (user-github):** Call **get_me**. If it fails (e.g. not authenticated), prompt the user to connect or sign in to GitHub in Cursor. On success, GitHub is considered connected.
3. **Command:** Add `.cursor/commands/connect.md` that instructs the agent to run the ensure-Notion-and-GitHub-connected workflow (follow the skill).
4. **Skill:** Add `.cursor/skills/ensure-notion-github-connected/SKILL.md` as the single source of truth: (1) ensure Notion connected (lightweight check; on failure, guide user to Notion auth), (2) ensure GitHub connected (get_me; on failure, guide user to GitHub), (3) confirm to user when both are connected. Reference MCP tool descriptors under `mcps/user-notion/tools/` and `mcps/user-github/tools/`.
5. **Docs:** Update `docs/notion-mcp-workflow.md` and `docs/github-mcp-workflow.md` to mention the **Connect** command and cross-link to each other and to the skill.

## Task list

1. Add `.cursor/commands/connect.md` that invokes the ensure-Notion-and-GitHub-connected workflow.
2. Add `.cursor/skills/ensure-notion-github-connected/SKILL.md` with the dual-auth workflow; reference MCP tool schemas.
3. Update `docs/notion-mcp-workflow.md` and `docs/github-mcp-workflow.md` to mention the connect command and cross-link.
4. Implementation notes; run Review (rework list, severity); set Notion status to Done when gates pass.

## References

- Notion ticket: [TSK-13 Command: ensure Notion and GitHub connected](https://www.notion.so/321f668f6961816e9c4ee28055ba7222)
- `docs/notion-mcp-workflow.md`, `docs/github-mcp-workflow.md`
- `mcps/user-notion/tools/`, `mcps/user-github/tools/`
- Pattern: TSK-12 (GitHub-only command), `.cursor/skills/github-commands-workflow/SKILL.md`
