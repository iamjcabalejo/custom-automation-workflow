# Create a ticket in GitHub (Task or Feature)

Collect details from the user and create a new GitHub issue in the chosen repository. The user specifies the **type**: **Task** or **Feature**. Optionally add the issue to the workspace GitHub Project board when `.cursor/github-project.json` is set (via the Connect command).

## What to do

**Follow the workflow in `.cursor/skills/github-feature-ticket/SKILL.md`.** That skill is the single source of truth for:

- Ensuring GitHub MCP is connected (**get_me**, server: `user-github`)
- Resolving the **ticket type**: **Task** or **Feature** (ask if the user did not specify)
- Resolving the target repository (ask for **owner/repo** or URL; use workspace default if configured)
- Collecting details appropriate to the type (Feature: plan-level scope, acceptance criteria, technical approach, task list; Task: title and description, optional checklist)
- Creating the issue with **issue_write** (method: `create`, **type:** `Task` or `Feature` to set the issue **Type** field—not Labels)
- Adding the new issue to the GitHub Project board when `.cursor/github-project.json` exists (run `scripts/github-project-tickets.js add-issue` with the created issue number)

Use only GitHub MCP tools for issue creation; use the project tickets script for adding to the project board. If GitHub is not connected, direct the user to run the Connect command or sign in to GitHub in Cursor.

**References:** `docs/github-mcp-workflow.md`, `docs/github-project-tickets.md`, `.cursor/skills/ensure-notion-github-connected/SKILL.md`
