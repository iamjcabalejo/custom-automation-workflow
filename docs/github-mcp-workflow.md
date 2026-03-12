# GitHub MCP workflow

This project can use the **GitHub MCP** (server: `user-github`) to ensure you’re logged in and to verify access to a repository. Use this workflow when you run the **GitHub** command or ask the agent to connect to or check access to a GitHub repo.

To ensure **both Notion and GitHub** are connected in one go (and optionally set the **GitHub Project board** for tickets), use the **Connect** command (`/connect`). See `docs/notion-mcp-workflow.md` and `.cursor/skills/ensure-notion-github-connected/SKILL.md`. When you run Connect and GitHub is connected, the agent will ask which GitHub Project board to use and save it to `.cursor/github-project.json` so the project tickets script and other flows use it by default; see `docs/github-project-tickets.md`.

## One-time setup

1. **Enable the GitHub integration in Cursor**  
   Ensure the GitHub MCP server is enabled for this project (e.g. in Cursor MCP or integration settings). The server identifier is `user-github`.

2. **Sign in to GitHub**  
   Connect your GitHub account in Cursor so that the MCP can act on your behalf. If you’re not sure, run the **GitHub** command or ask: “Check if I’m logged in to GitHub.” The agent will call `get_me`; if it fails, you’ll be prompted to connect or sign in.

3. **Repository access**  
   The agent can only access repositories your GitHub account can read. For private repos, your connected account must have access.

## GitHub command workflow

When you run the **GitHub** command (or ask to verify GitHub / repo access), the agent follows `.cursor/skills/github-commands-workflow/SKILL.md`:

1. **Ensure logged in** — Call **get_me** (GitHub MCP). If it fails, the agent asks you to connect or sign in to GitHub and stops.
2. **Ask for repository** — The agent asks for the repo as `owner/repo` or a GitHub URL (e.g. `https://github.com/owner/repo`), then parses it into owner and repo.
3. **Confirm access** — The agent calls **list_branches** or **get_file_contents** with that owner and repo. If the call succeeds, it confirms that the repository is accessible; if it fails, it does not claim access and asks you to check the repo and permissions.

## Tools used (read the docs)

All tools are from the **user-github** MCP server. Tool schemas and parameters are in `mcps/user-github/tools/`. The agent should read the relevant JSON descriptor before calling a tool.

| Tool | Purpose |
|------|---------|
| **get_me** | Get the authenticated user. Use first to ensure GitHub is connected. No arguments. |
| **list_branches** | List branches in a repo. Required: `owner`, `repo`. Use to verify read access. |
| **get_file_contents** | Get file or directory contents. Required: `owner`, `repo`. Optional: `path` (default `"/"`). Use to verify read access. |

Other tools (e.g. `search_repositories`, `list_issues`, `create_pull_request`) are available for other flows; this workflow uses only the tools above for login check and repo access confirmation.

## Quick reference

| Goal | Action |
|------|--------|
| Check Notion and GitHub | Use the **Connect** command (`/connect`) to ensure both are connected; see `docs/notion-mcp-workflow.md`. |
| Run the GitHub workflow | Use the **GitHub** command or ask: “Check GitHub login and verify repo access.” |
| See if I’m logged in | The agent calls **get_me**; if it succeeds, you’re connected. |
| Verify repo access | After providing `owner/repo` or a URL, the agent calls **list_branches** or **get_file_contents** and confirms or reports failure. |
| Login fails or no access | Connect/sign in to GitHub in Cursor; for private repos, ensure your account has access. |
| Set default GitHub project board | Run **Connect**; when GitHub is connected, provide the project URL or org + number. Saved to `.cursor/github-project.json`. |
| Create a ticket (Task or Feature) in GitHub | Use the **GitHub create ticket** command or `.cursor/commands/github-create-ticket.md`; follows `.cursor/skills/github-feature-ticket/SKILL.md`. User can specify type **Task** or **Feature**. |
| Report a bug in GitHub | Use the **GitHub bug report** command or `.cursor/commands/github-bug-report.md`; follows `.cursor/skills/github-bug-report/SKILL.md`. |

## Technical details

- **MCP server:** `user-github` (server name: github).
- **Auth check:** There is no separate “auth tool”; the agent uses **get_me** to confirm the user is authenticated. If **get_me** fails, the user must connect or sign in via Cursor’s GitHub integration.
- **Repository format:** The skill accepts `owner/repo` or URLs like `https://github.com/owner/repo` (and `github.com/owner/repo`). The agent parses these to `owner` and `repo` for the API calls.

## References

- Skill: `.cursor/skills/github-commands-workflow/SKILL.md`
- Command: `.cursor/commands/github.md`
- Plan: `docs/plans/TSK-12-add-commands-for-github.md`
- Tool descriptors: `mcps/user-github/tools/*.json`
