# TSK-12 Implementation notes

## Done

- **AC1:** Agent asks and ensures GitHub account is logged in before proceeding.
  - Implemented in `.cursor/skills/github-commands-workflow/SKILL.md`: step 1 calls **get_me** (server `user-github`); on failure, user is asked to connect/sign in and workflow stops.
- **AC2:** Agent asks the user for the specific repository to access.
  - Implemented in the skill: step 2 prompts for `owner/repo` or GitHub URL and parses to owner and repo (including `https://github.com/owner/repo` and `github.com/owner/repo`).
- **AC3:** Agent confirms that it can access the specified repository.
  - Implemented in the skill: step 3 calls **list_branches** or **get_file_contents** with parsed owner/repo; on success confirms access; on failure does not claim access and reports clearly.

Additional:

- **Cursor command** `.cursor/commands/github.md` added; it invokes the workflow and points to the skill.
- **Plan** written to `docs/plans/TSK-12-add-commands-for-github.md`.
- **Workflow doc** `docs/github-mcp-workflow.md` added (auth-first pattern, tool usage, references).

## Deferred

- None.

## Assumptions

- GitHub MCP server is available as `user-github` in Cursor; tool names and parameters match the descriptors under `mcps/user-github/tools/`.
- “Logged in” is determined solely by a successful **get_me** call; no separate OAuth step is implemented in this repo.
- Repository input is either `owner/repo` or a GitHub URL; other formats (e.g. Git SSH URLs) are not parsed by the skill.

## Env/config

- No new env vars or config. Requires Cursor with GitHub MCP enabled and user connected to GitHub.
