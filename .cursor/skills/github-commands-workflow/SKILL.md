---
name: github-commands-workflow
description: Runs the GitHub commands workflow: ensure GitHub is logged in, ask for repository, verify access. Use when the user runs the github command or asks to connect to or verify access to a GitHub repository.
---

# GitHub commands workflow

Run a three-step workflow using the **GitHub MCP** (server: `user-github`): (1) ensure the GitHub account is logged in, (2) ask the user for the specific repository to access, (3) confirm that the agent can access that repository. Use **only** existing GitHub MCP tools; read tool schemas from `mcps/user-github/tools/` when needed.

## Terminology

| Term | Definition |
|------|-------------|
| **GitHub MCP** | MCP server `user-github`; tools include `get_me`, `list_branches`, `get_file_contents`, etc. |
| **Owner** | GitHub username or organization that owns the repository. |
| **Repo** | Repository name (e.g. `my-project`). |

## Prerequisite

- GitHub integration must be available in Cursor (GitHub MCP enabled). If tools return auth/connection errors, direct the user to connect or sign in to GitHub in Cursor settings.

## Workflow

### 1. Ensure GitHub account is logged in (AC1)

- [ ] Call **get_me** (server: `user-github`, no arguments). This returns the authenticated GitHub user.
- [ ] If the call **succeeds** → you have a logged-in user; tell the user who is logged in (e.g. username/login from the response) and proceed to step 2.
- [ ] If the call **fails** (e.g. not authenticated, connection error) → do **not** proceed. Tell the user: "GitHub doesn’t appear to be connected or you’re not signed in. Please connect GitHub in Cursor (e.g. enable the GitHub integration and sign in), then try again." Stop.

**Tool reference:** `get_me` — no parameters. See `mcps/user-github/tools/get_me.json`.

### 2. Ask for the repository (AC2)

- [ ] Ask the user: "Which repository do you want to use? You can give `owner/repo` or a GitHub URL (e.g. `https://github.com/owner/repo`)."
- [ ] Parse the user’s input into **owner** and **repo**:
  - **`owner/repo`** (e.g. `facebook/react`) → owner = `facebook`, repo = `react`.
  - **`https://github.com/owner/repo`** or **`https://github.com/owner/repo/`** → owner = `owner`, repo = `repo`. Ignore path segments after the repo (e.g. `/blob/main/...`).
  - **`github.com/owner/repo`** (no scheme) → treat like URL; owner = `owner`, repo = `repo`.
- [ ] If the input cannot be parsed into exactly one owner and one repo, ask once more: "Please provide the repository as `owner/repo` or a full GitHub URL." If still unclear, stop and report what’s missing.

### 3. Confirm repository access (AC3)

- [ ] Verify access by calling one of these GitHub MCP tools with the parsed **owner** and **repo**:
  - **list_branches** — required: `owner`, `repo`. Optional: `perPage` (e.g. `1`). Use to confirm read access.
  - **get_file_contents** — required: `owner`, `repo`. Optional: `path` (default `"/"`). Use to confirm read access to the repo root.
- [ ] If the call **succeeds** → tell the user: "I can access the repository **owner/repo**." Optionally show a short confirmation (e.g. "I listed branches" or "I read the repo root"). Stop.
- [ ] If the call **fails** (e.g. 404, not found, no access) → do **not** claim access. Tell the user: "I couldn’t access that repository (not found or no permission). Please check the owner and repo name and that your GitHub account has access." Stop.

**Tool reference:**

- **list_branches:** `owner` (string), `repo` (string); optional `page`, `perPage`. See `mcps/user-github/tools/list_branches.json`.
- **get_file_contents:** `owner` (string), `repo` (string); optional `path` (default `"/"`), `ref`, `sha`. See `mcps/user-github/tools/get_file_contents.json`.

## Tool usage

Use **call_mcp_tool** with:

- **server:** `user-github`
- **toolName:** `get_me` | `list_branches` | `get_file_contents` | (other tools as needed for this workflow only)
- **arguments:** As defined in the tool’s JSON descriptor under `mcps/user-github/tools/<tool-name>.json`. Always pass required parameters (e.g. `owner` and `repo` for `list_branches` and `get_file_contents`).

Read the tool schema before calling if you are unsure of parameters.

## Failure handling

| Situation | Action |
|-----------|--------|
| **get_me** fails | Do not proceed. Ask user to connect/sign in to GitHub in Cursor. |
| User does not provide a repo | Ask once for `owner/repo` or GitHub URL; if still missing, stop. |
| **list_branches** or **get_file_contents** fails | Do not claim access. Report that the repo was not found or not accessible. |

## References

- Plan: `docs/plans/TSK-12-add-commands-for-github.md`
- Workflow doc: `docs/github-mcp-workflow.md`
- GitHub MCP tool descriptors: `mcps/user-github/tools/`
