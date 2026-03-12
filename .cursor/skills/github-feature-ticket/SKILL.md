---
name: github-feature-ticket
description: Collects a feature or task request from the user and creates a GitHub issue (and optionally adds it to the workspace GitHub Project board). Use when the user wants to add a feature ticket, create a feature request, add a task, or log a new task or feature in GitHub. Supports type Task or Feature via the github-create-ticket command.
---

# Create ticket (Task or Feature) in GitHub

Collect details from the user and create one new GitHub issue using **issue_write** (GitHub MCP, server: `user-github`). Supports **type**: **Task** or **Feature**. When `.cursor/github-project.json` exists, add the new issue to that project board using `scripts/github-project-tickets.js add-issue`.

## Terminology

| Term | Definition |
|------|-------------|
| **Ticket type** | Either **Task** or **Feature**. Set via the issue **Type** field (issue_write **type** parameter), not Labels. |
| **Target repository** | The GitHub repo where the issue will be created (owner/repo, e.g. `Buyninja/buynin-cms`). |
| **Project board** | The GitHub Projects v2 board identified by `.cursor/github-project.json` (org + project number); the script adds the new issue to this board when the file exists. |

## Prerequisite

- GitHub MCP (server: `user-github`) must be connected. Call **get_me**; if it fails, tell the user to run the Connect command or sign in to GitHub in Cursor. See `docs/github-mcp-workflow.md`.

## Workflow

### 1. Trigger and auth

- [ ] User said they want to create a ticket in GitHub, add a feature/task, or used the **GitHub create ticket** command.
- [ ] Call **get_me** (server: `user-github`, no arguments). If it fails, tell the user: "GitHub doesn't appear to be connected. Please run the Connect command or sign in to GitHub in Cursor." Stop.

### 2. Resolve ticket type (Task or Feature)

- [ ] If the user already specified **Task** or **Feature** in their message or command, use that.
- [ ] If not specified: ask **once** using **option-style prompt** (see below). Normalize the reply to exactly **Task** or **Feature**; treat "1" or "Task" as Task, "2" or "Feature" as Feature. If unclear, ask once more or default to **Task**.

**Option-style prompt for ticket type:**  
"Should this be a **Task** or a **Feature**?  
- **1** — **Task** (single item or checklist)  
- **2** — **Feature** (scope, acceptance criteria, technical approach)  

Reply with **1**, **2**, or type Task/Feature."

### 3. Resolve target repository

- [ ] If the user already provided **owner/repo** or a GitHub repo URL in their message, parse it to `owner` and `repo` (e.g. `https://github.com/Buyninja/buynin-cms` → owner `Buyninja`, repo `buynin-cms`).
- [ ] If not provided:
  - **Suggested repo:** Try to get a suggested repo from the **current workspace** (e.g. run `git remote get-url origin` in the workspace root and parse to owner/repo if it is a GitHub URL). Do **not** hardcode or guess; only use workspace context. If `.cursor/github-project.json` has an optional **defaultRepo** (owner/repo), you may use that as the suggested repo when present.
  - **Ask** using an **option-style prompt** (see below). Accept **"1"** as choosing the suggested repo (if you have one), **"2"** or "other" as "user will type their own", or the user may type owner/repo or URL directly.
- [ ] If the user does not provide a repo (e.g. replied "2" but didn’t type a repo), ask once more for owner/repo or URL; if still missing, stop. Do not use a hardcoded repo.

**Option-style prompt when you have a suggested repo:**  
"Which repository should this issue go to?  
- **1** — **&lt;owner/repo&gt;** (this workspace)  
- **2** — **Other** — type owner/repo or paste the repo URL  

Reply with **1**, **2**, or type owner/repo / URL directly."

**Option-style prompt when you have no suggested repo:**  
"Which repository should this issue go to? Give **owner/repo** (e.g. `Buyninja/buynin-cms`) or the repo URL."

**Note:** Cursor chat does not support true clickable buttons. Presenting numbered options and "Reply with **1** or **2**" lets users answer with a single character instead of typing the full value.

### 4a. Collect details — Feature

Collect enough detail so the issue body matches the structure of plan files in `docs/plans/` (Scope, Acceptance criteria, Technical approach, Task list).

- [ ] **Title** (required). If missing, ask once: "What's a short title for this feature?" If the user pastes a long description, use the first line or a summary as the title and the rest as the body.
- [ ] **Scope:** What is in scope and out of scope (e.g. "In: X, Y. Out: Z."). If missing, ask once; otherwise omit or use empty.
- [ ] **Acceptance criteria:** Testable conditions (e.g. AC1: ..., AC2: ...). If missing, ask once; otherwise omit.
- [ ] **Technical approach:** Numbered steps or key files/APIs. If missing, ask once; otherwise omit.
- [ ] **Task list:** Ordered implementation steps. If missing, ask once; otherwise omit.
- [ ] **Labels:** Only user-provided labels (e.g. `enhancement`). Do **not** add `feature` to Labels—the ticket type goes in the **Type** field. If the user provides no labels, omit or use an empty array.
- Do not block on optional fields; use empty string or omit if the user does not provide them.

### 4b. Collect details — Task

- [ ] **Title** (required). If missing, ask once: "What's a short title for this task?"
- [ ] **Description** (optional). Brief description or context.
- [ ] **Checklist** (optional). If the user provides sub-items or steps, format as a Markdown checklist in the body.
- [ ] **Labels:** Only user-provided labels. Do **not** add `task` to Labels—the ticket type goes in the **Type** field. If the user provides no labels, omit or use an empty array.

### 5a. Build issue body — Feature (Markdown)

- [ ] Build the **body** in Markdown. Use this structure; omit a section only if the user provided no content for it:
  - **## Scope** — Bullet list with In: / Out:.
  - **## Acceptance criteria** — List or table (e.g. AC1: ..., AC2: ...).
  - **## Technical approach** — Numbered steps.
  - **## Task list** — Numbered list.
- [ ] Do not include the issue title inside the body.

### 5b. Build issue body — Task (Markdown)

- [ ] Build the **body** in Markdown. Include **Description** if provided; include **## Checklist** with `- [ ]` items if the user gave sub-items or steps. Otherwise a short paragraph is enough.
- [ ] Do not include the issue title inside the body.

### 6. Create the issue

- [ ] Call **issue_write** (server: `user-github`) with:
  - **method:** `create`
  - **owner:** resolved owner
  - **repo:** resolved repo
  - **title:** the title
  - **body:** the Markdown body from step 5a or 5b
  - **type:** `"Task"` or `"Feature"` (the ticket type—sets the issue **Type** field in GitHub, not Labels). If the repo supports issue types, use the exact value; optionally call **list_issue_types** (owner) first to confirm valid values (e.g. "Task", "Feature").
  - **labels:** only user-provided labels (e.g. `["enhancement"]` or `["chore"]`). Do **not** add `"task"` or `"feature"` to labels; omit or use `[]` if the user gave none.
- [ ] If the call fails: surface the error to the user; suggest checking repo access and GitHub connection. Stop.
- [ ] From the response, obtain the new **issue number** (and issue URL if returned). Confirm to the user with the issue link (e.g. `https://github.com/owner/repo/issues/<number>`).

### 7. Add to project board (optional)

- [ ] If **`.cursor/github-project.json`** exists in the workspace (or in a parent directory): run the project tickets script to add the new issue to the board:
  - Command: `node scripts/github-project-tickets.js add-issue --repo <owner/repo> --issue <issue_number>`
  - The script reads org and project from `.cursor/github-project.json`; no need to pass `--org` or `--project` unless overriding.
- [ ] If the script is not in the current workspace, use the absolute path to `scripts/github-project-tickets.js` (e.g. from `cursor-notion-implementation`).
- [ ] If the script fails (e.g. token or project scope): inform the user the issue was created but could not be added to the project board; they can add it manually.
- [ ] If `.cursor/github-project.json` does not exist: skip this step; confirm only the issue creation.

### 8. Confirm

- [ ] Tell the user: "Created [task|feature] issue #&lt;number&gt; in **owner/repo**: &lt;issue URL&gt;." If added to project board: "Added to GitHub Project board (**org**/project #**N**)."

## Update existing issue

- [ ] If the user wants to **update** an existing issue: ask for **owner/repo** and **issue number**. Call **issue_write** with **method:** `update`, **issue_number**, **owner**, **repo**, and only the fields to change (**title**, **body**, **labels**, **state**, **assignees**, etc.). Do not run the project script for updates (the issue is already on the board if it was added at create time).

## Tool usage

- **get_me** — server `user-github`, no arguments.
- **list_issue_types** — server `user-github`; required: `owner`. Call to get valid **Type** values (e.g. "Task", "Feature") for the org; use the matching value in **issue_write** `type`.
- **issue_write** — server `user-github`; required: `method`, `owner`, `repo`; for create: `title`; optional: `body`, `labels`, `assignees`, `milestone`, **`type`** (use for Task/Feature—sets the issue **Type** field, not Labels). See `mcps/user-github/tools/issue_write.json`.

## Failure handling

| Situation | Action |
|-----------|--------|
| **get_me** fails | Stop. Ask user to run Connect or sign in to GitHub. |
| No repository provided | Ask once for owner/repo or URL; if still missing, stop. |
| **issue_write** fails | Surface error; suggest checking repo access and auth. |
| Project script fails | Confirm issue created; tell user they can add the issue to the project manually. |

## References

- Command: `.cursor/commands/github-create-ticket.md`
- GitHub MCP: `docs/github-mcp-workflow.md`
- Project board script: `docs/github-project-tickets.md`
- Tool descriptor: `mcps/user-github/tools/issue_write.json`
