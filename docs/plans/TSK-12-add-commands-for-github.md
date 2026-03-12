# TSK-12: Add commands for GitHub

## Scope

- **In:** Add a Cursor command and skill that run a GitHub workflow: (1) ensure GitHub account is logged in via GitHub MCP, (2) ask the user for the specific repository to access, (3) confirm that the agent can access that repository using existing GitHub MCP tools. Use only existing user-github MCP tools (e.g. `get_me`, `list_branches`, `get_file_contents`); follow MCP tool documentation.
- **Out:** Implementing full GitHub API beyond access check; custom scripts or non–GitHub MCP flows; changing GitHub MCP server code.

## Acceptance criteria

| ID | Criterion |
|----|-----------|
| AC1 | Agent asks and ensures GitHub account is logged in before proceeding (using GitHub MCP; e.g. `get_me`). |
| AC2 | Agent asks the user for the specific repository to access. |
| AC3 | Agent confirms that it can access the specified repository (using GitHub MCP; e.g. `list_branches` or `get_file_contents`). |

## Technical approach

1. **GitHub MCP (user-github):** Use existing tools only. No new MCP code.
   - **Auth check:** Call `get_me`. If it fails (e.g. not authenticated), prompt the user to connect/log in to GitHub in Cursor (e.g. enable GitHub integration, sign in). Do not proceed to repo steps until auth succeeds.
   - **Repository input:** Ask user for the repository (e.g. `owner/repo` or `https://github.com/owner/repo`). Parse to `owner` and `repo`; support common URL forms and `owner/repo`.
   - **Access verification:** Call `list_branches` with `owner` and `repo` (e.g. `perPage: 1`) or `get_file_contents` with `owner`, `repo`, and `path: "/"`. On success, confirm to the user that the repository is accessible. On 404/error, report that the repo was not found or not accessible and do not claim access.

2. **Cursor command:** Add a command (e.g. `.cursor/commands/github.md`) that invokes the GitHub workflow. The command text should direct the agent to follow the skill and use the GitHub MCP tools as above.

3. **Skill:** Add a skill (e.g. `.cursor/skills/github-commands-workflow/SKILL.md`) that is the single source of truth for the workflow: (1) ensure login via `get_me`, (2) ask for repo and parse owner/repo, (3) verify access via `list_branches` or `get_file_contents`, (4) confirm to user. Reference GitHub MCP tool descriptors under `mcps/user-github/tools/` for exact parameters and required fields.

4. **Documentation:** Document the workflow in a short doc (e.g. `docs/github-mcp-workflow.md`) and in the command/skill description so future agents and users know the steps and which tools to use.

## Task list

1. Write this plan to `docs/plans/TSK-12-add-commands-for-github.md`.
2. Create `.cursor/skills/github-commands-workflow/SKILL.md` with the workflow (get_me → ask repo → parse → list_branches or get_file_contents → confirm); reference GitHub MCP tool schemas.
3. Create `.cursor/commands/github.md` that invokes the GitHub workflow and points to the skill.
4. Add `docs/github-mcp-workflow.md` with auth-first workflow and tool usage (get_me, list_branches, get_file_contents).
5. Implementation notes; run Review (rework list, severity); set Notion status to Done if gates pass.

## References

- Notion ticket: [TSK-12 Add commands for GitHub](https://www.notion.so/321f668f6961814d8874fbb146a60fec)
- GitHub MCP tools: `mcps/user-github/tools/` (get_me.json, list_branches.json, get_file_contents.json)
- Pattern: `docs/notion-mcp-workflow.md` (auth-first workflow)
