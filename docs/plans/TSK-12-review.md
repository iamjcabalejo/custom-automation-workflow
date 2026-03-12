# TSK-12 Review

## Review summary

- **Alignment with plan:** The implementation follows `docs/plans/TSK-12-add-commands-for-github.md`: (1) command and skill added, (2) workflow uses only existing GitHub MCP tools (`get_me`, `list_branches`, `get_file_contents`), (3) skill references tool descriptors under `mcps/user-github/tools/`, (4) workflow doc added. Scope (in/out) and AC are respected.
- **Standards:** Skill and command are markdown; naming is consistent (github-commands-workflow, github.md). Single source of truth is the skill; command delegates to it. No secrets, no hardcoded IDs.
- **Security:** No credentials in repo. Workflow instructs agent to validate repo input (parse owner/repo) and not to claim access on API failure.
- **Test status:** No automated tests for this ticket (workflow is agent guidance). Manual validation: run the GitHub command, confirm get_me runs first, then prompt for repo, then verify access via list_branches or get_file_contents.

## Acceptance criteria coverage

| ID | Criterion | Covered by |
|----|-----------|------------|
| AC1 | Agent asks and ensures GitHub account is logged in before proceeding. | Skill step 1: get_me; on failure, prompt to connect and stop. |
| AC2 | Agent asks the user for the specific repository to access. | Skill step 2: prompt for owner/repo or URL; parse. |
| AC3 | Agent confirms that it can access the specified repository. | Skill step 3: list_branches or get_file_contents; success = confirm, failure = do not claim access. |

## Rework list

| # | File / area | Required change | Severity |
|---|-------------|-----------------|----------|
| — | — | No Critical or Suggestion items. | — |

**Gates:** All AC covered; no project-rule violations; no high-severity issues.

**Verdict:** Production ready.
