---
name: github-bug-report
description: Collects a detailed bug report from the user and creates a GitHub issue (and optionally adds it to the workspace GitHub Project board). Use when the user wants to report a bug, file a bug, or add a bug to GitHub.
---

# Bug report to GitHub

Collect bug details from the user and create one new GitHub issue using **issue_write** (GitHub MCP, server: `user-github`). When `.cursor/github-project.json` exists, add the new issue to that project board using `scripts/github-project-tickets.js add-issue`.

## Terminology

| Term | Definition |
|------|-------------|
| **Target repository** | The GitHub repo where the issue will be created (owner/repo, e.g. `Buyninja/buynin-cms`). |
| **Project board** | The GitHub Projects v2 board identified by `.cursor/github-project.json` (org + project number); the script adds the new issue to this board when the file exists. |
| **Affected files** | Exact file or directory paths in the workspace related to the bug (e.g. `.cursor/commands/feature-ticket.md`). |
| **Issue Type** | Set to **Bug** via **issue_write** `type` parameter (GitHub issue Type field). Use **list_issue_types** (owner) to confirm valid values if the repo has issue types. |

## Prerequisite

- GitHub MCP (server: `user-github`) must be connected. Call **get_me**; if it fails, tell the user to run the Connect command or sign in to GitHub in Cursor. See `docs/github-mcp-workflow.md`.

## Workflow

### 1. Trigger and auth

- [ ] User said they want to "report a bug (in GitHub)", "file a bug in GitHub", "add a bug to GitHub", or used a GitHub bug-report command.
- [ ] Call **get_me** (server: `user-github`, no arguments). If it fails, tell the user: "GitHub doesn't appear to be connected. Please run the Connect command or sign in to GitHub in Cursor." Stop.

### 2. Resolve target repository

- [ ] If the user already provided **owner/repo** or a GitHub repo URL in their message, parse it to `owner` and `repo`.
- [ ] If not provided:
  - **Suggested repo:** Try to get a suggested repo from the **current workspace** (e.g. run `git remote get-url origin` in the workspace root and parse to owner/repo if it is a GitHub URL). Do **not** hardcode or guess; only use workspace context. If `.cursor/github-project.json` has an optional **defaultRepo** (owner/repo), you may use that as the suggested repo when present.
  - **Ask** using an **option-style prompt** (see below). Accept **"1"** as choosing the suggested repo (if you have one), **"2"** or "other" as "user will type their own", or the user may type owner/repo or URL directly.
- [ ] If the user does not provide a repo (e.g. replied "2" but didn’t type a repo), ask once more for owner/repo or URL; if still missing, stop.

**Option-style prompt when you have a suggested repo:**  
"Which repository should this bug issue go to?  
- **1** — **&lt;owner/repo&gt;** (this workspace)  
- **2** — **Other** — type owner/repo or paste the repo URL  

Reply with **1**, **2**, or type owner/repo / URL directly."

**Option-style prompt when you have no suggested repo:**  
"Which repository should this bug issue go to? Give **owner/repo** (e.g. `Buyninja/buynin-cms`) or the repo URL."

### 3. Collect bug details

Only **Title** is required. For code-related bugs, ask once for affected files if not provided; do not block on other optional fields.

| Field | Required | Guidance |
|-------|----------|----------|
| **Title** | Yes | Short summary (e.g. "Feature-ticket command does not create page"). If the user pastes a long block, use the first line as title and the rest as description. |
| **Description** | No | What is broken; current behavior in plain language. |
| **Steps to reproduce** | No | Numbered list: exact actions to trigger the bug. |
| **Expected behavior** | No | What should happen. |
| **Actual behavior** | No | What actually happens (errors, wrong result). |
| **Affected files** | When code-related | Exact paths (e.g. `.cursor/commands/feature-ticket.md`). One path per line. Infer from context (e.g. "the feature-ticket command" → command + skill paths) if the user does not list them. |
| **Environment** | No | OS, browser, runtime, or tool versions if relevant. |
| **Severity** | No | e.g. Critical, High, Medium, Low—only if the user provides it. |
| **Labels** | No | Use at least `bug`; add user-provided labels (e.g. `bug`, `priority: high`). |

- [ ] If title is missing: ask once "What's a short title for this bug?" If still missing, use placeholder "Bug report (no title)" and continue.
- [ ] When the bug clearly involves code or a command: if affected files were not given, ask once or infer from context and list those paths in the body.

### 4. Build issue body (Markdown)

- [ ] Build the **body** in Markdown. Use this structure; omit a section only if the corresponding field is empty:
  - **## Description** — &lt;description&gt;
  - **## Steps to reproduce** — Numbered list.
  - **## Expected behavior** — &lt;expected&gt;
  - **## Actual behavior** — &lt;actual&gt;
  - **## Affected files** — One path per line (code block or list).
  - **## Environment** — &lt;environment&gt;
  - **## Severity** — &lt;severity&gt; (only if provided)
- [ ] Do not include the issue title inside the body.

### 5. Create the issue

- [ ] Call **issue_write** (server: `user-github`) with:
  - **method:** `create`
  - **owner:** resolved owner
  - **repo:** resolved repo
  - **title:** the bug title
  - **body:** the Markdown body from step 4
  - **type:** `"Bug"` (sets the issue **Type** field in GitHub when the repo has issue types; optionally call **list_issue_types** (owner) first to confirm "Bug" is a valid value)
  - **labels:** array including `"bug"` and any user-provided labels (e.g. `["bug", "priority: high"]`)
- [ ] If the call fails: surface the error to the user; suggest checking repo access and GitHub connection. Stop.
- [ ] From the response, obtain the new **issue number** (and issue URL if returned). Confirm to the user with the issue link.

### 6. Add to project board (optional)

- [ ] If **`.cursor/github-project.json`** exists in the workspace (or in a parent directory): run the project tickets script to add the new issue to the board:
  - Command: `node scripts/github-project-tickets.js add-issue --repo <owner/repo> --issue <issue_number>`
  - The script reads org and project from `.cursor/github-project.json`.
- [ ] If the script is not in the current workspace, use the absolute path to `scripts/github-project-tickets.js`.
- [ ] If the script fails: inform the user the issue was created but could not be added to the project board.
- [ ] If `.cursor/github-project.json` does not exist: skip this step.

### 7. Confirm

- [ ] Tell the user: "Created bug issue #&lt;number&gt; in **owner/repo**: &lt;issue URL&gt;." If added to project board: "Added to GitHub Project board (**org**/project #**N**)."

## Update existing bug issue

- [ ] If the user wants to **update** an existing issue: ask for **owner/repo** and **issue number**. Call **issue_write** with **method:** `update`, **issue_number**, **owner**, **repo**, and only the fields to change (**title**, **body**, **labels**, **state**, **state_reason**, **assignees**, etc.).

## Tool usage

- **get_me** — server `user-github`, no arguments.
- **list_issue_types** — server `user-github`; required: `owner`. Call to get valid **Type** values (e.g. "Bug", "Task", "Feature") for the org; use `"Bug"` in **issue_write** `type` when supported.
- **issue_write** — server `user-github`; required: `method`, `owner`, `repo`; for create: `title`; optional: `body`, `labels`, **`type`** (use `"Bug"` for bug reports—sets the issue **Type** field), `assignees`, `milestone`, `state`, `state_reason`. See `mcps/user-github/tools/issue_write.json`.

## Failure handling

| Situation | Action |
|-----------|--------|
| **get_me** fails | Stop. Ask user to run Connect or sign in to GitHub. |
| No repository provided | Ask once for owner/repo or URL; if still missing, stop. |
| **issue_write** fails | Surface error; suggest checking repo access and auth. |
| Project script fails | Confirm issue created; tell user they can add the issue to the project manually. |

## References

- Command: `.cursor/commands/github-bug-report.md`
- GitHub MCP: `docs/github-mcp-workflow.md`
- Project board script: `docs/github-project-tickets.md`
- Tool descriptor: `mcps/user-github/tools/issue_write.json`
