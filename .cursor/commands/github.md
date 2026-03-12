# GitHub: ensure login and verify repository access

Run the GitHub commands workflow: ensure your GitHub account is connected, choose a repository, and confirm the agent can access it.

## What to do

**Follow the workflow in `.cursor/skills/github-commands-workflow/SKILL.md`.** That skill is the single source of truth for:

1. **Ensure GitHub is logged in** — Call the GitHub MCP tool **get_me** (server: `user-github`). If it fails, ask the user to connect or sign in to GitHub in Cursor and stop.
2. **Ask for the repository** — Prompt for the repo as `owner/repo` or a GitHub URL; parse into owner and repo.
3. **Confirm access** — Call **list_branches** or **get_file_contents** with that owner and repo. If the call succeeds, confirm to the user that the repository is accessible; if it fails, do not claim access and ask the user to check the repo and permissions.

Use **only** the existing GitHub MCP tools. Check tool parameters in `mcps/user-github/tools/` (e.g. `get_me.json`, `list_branches.json`, `get_file_contents.json`) and use **call_mcp_tool** with server `user-github`.

**References:** `docs/github-mcp-workflow.md`, `docs/plans/TSK-12-add-commands-for-github.md`
