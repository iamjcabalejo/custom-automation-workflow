# Report a bug and create a GitHub issue

Collect a bug report from the user and create a new GitHub issue in the chosen repository. Optionally add the issue to the workspace GitHub Project board when `.cursor/github-project.json` is set (via the Connect command). The issue body includes description, steps to reproduce, expected vs actual behavior, affected files, and environment.

## What to do

**Follow the workflow in `.cursor/skills/github-bug-report/SKILL.md`.** That skill is the single source of truth for:

- Ensuring GitHub MCP is connected (**get_me**, server: `user-github`)
- Resolving the target repository (ask for **owner/repo** or URL; use workspace default if configured)
- Collecting bug details (title required; description, steps to reproduce, expected/actual behavior, affected files, environment, severity optional)
- Creating the issue with **issue_write** (method: `create`, labels e.g. `bug`)
- Adding the new issue to the GitHub Project board when `.cursor/github-project.json` exists (run `scripts/github-project-tickets.js add-issue` with the created issue number)

Use only GitHub MCP tools for issue creation; use the project tickets script for adding to the project board. If GitHub is not connected, direct the user to run the Connect command or sign in to GitHub in Cursor.

**References:** `docs/github-mcp-workflow.md`, `docs/github-project-tickets.md`, `.cursor/skills/ensure-notion-github-connected/SKILL.md`
