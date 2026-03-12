# Cursor Notion Implementation

This project wires **Cursor** to **Notion** and **GitHub** via MCP (Model Context Protocol): task tracking in Notion, issues and project boards in GitHub, and a shared development workflow (Plan → Code → Review) with handoff artifacts.

---

## Overview

- **Notion** — Task/ticket database (“Task Tracker”), feature and bug tickets, implement-ticket flow.
- **GitHub** — Issues, GitHub Projects v2 boards, PR reviews; uses both **GitHub MCP tools** and a **GraphQL-based script** for project board operations.
- **Connect** — One command (`/connect`) to ensure Notion and GitHub are connected and to set the default GitHub Project board.

Details: `.cursor/rules/`, `docs/notion-mcp-workflow.md`, `docs/github-mcp-workflow.md`, `docs/github-project-tickets.md`.

---

## GitHub: GraphQL API and MCP Tools

GitHub is used in two complementary ways:

1. **GitHub MCP** (`user-github`) — Issues, PRs, repo access, auth. Used by the agent via MCP tools.
2. **GitHub GraphQL API** — Projects v2 (board items, fields, draft issues). Used by the `github-project-tickets.js` script with the same token as MCP.

### How the GitHub GraphQL API is used

The script `scripts/github-project-tickets.js` talks to **GitHub’s GraphQL API** at `https://api.github.com/graphql` to manage **GitHub Projects v2** (boards). It does **not** use the REST Projects API; Projects v2 are only available via GraphQL.

- **Authentication** — Reads the same token as Cursor’s GitHub MCP from `~/.cursor/mcp.json` (`mcpServers.github.headers.Authorization`), so one token serves both MCP and the script.
- **Endpoint** — Single POST to `https://api.github.com/graphql` with `query` and `variables` in the JSON body; `Accept: application/vnd.github+json` and `Authorization: Bearer <token>`.

**GraphQL operations used:**

| Operation | Purpose |
|-----------|--------|
| **Query: organization → projectV2** | Resolve project node ID from org login + project number (e.g. org `Buyninja`, number `2`). |
| **Query: node (ProjectV2) → fields** | List project fields (e.g. Status) and, for single-select fields, option IDs. |
| **Query: node (ProjectV2) → items** | List project items (draft issues, linked issues, PRs) with field values. |
| **Mutation: addProjectV2ItemById** | Add an existing repo issue to the project by issue node ID. |
| **Mutation: addProjectV2DraftIssue** | Create a draft issue on the project (no repo issue). |
| **Mutation: updateProjectV2ItemFieldValue** | Update a field on a project item (Status, text, number, date). |

The script uses **REST** only for one step: `GET /repos/{owner}/{repo}/issues/{number}` to get an issue’s `node_id` before calling `addProjectV2ItemById`. All other project operations are GraphQL.

See `docs/github-project-tickets.md` and `scripts/github-project-tickets.js` for commands, examples, and option reference.

### How the GitHub MCP tools are used

The **GitHub MCP server** (`user-github`) exposes tools that the agent calls via `call_mcp_tool`. Tool schemas live under `mcps/user-github/tools/*.json`; the agent should read the relevant descriptor before calling a tool.

**Auth and repo access**

| Tool | Purpose |
|------|--------|
| **get_me** | Confirm the user is logged in. No arguments. Used by Connect, GitHub command, and ticket/bug/PR flows. |
| **list_branches** | List branches (`owner`, `repo`). Used to verify repo access. |
| **get_file_contents** | Get file or directory contents. Used to verify repo access. |

**Issues and project board**

| Tool | Purpose |
|------|--------|
| **issue_write** | Create or update an issue (`method`: `create` or `update`; `owner`, `repo`; `title`, `body`, `labels`, `type`, etc.). Used by feature/task and bug-report skills. |
| **list_issue_types** | Get valid issue **Type** values for the org (e.g. Task, Feature, Bug). Used before `issue_write` when setting `type`. |

After creating an issue with **issue_write**, the agent optionally runs the **GraphQL script** to add that issue to the GitHub Project board (when `.cursor/github-project.json` exists):  
`node scripts/github-project-tickets.js add-issue --repo <owner/repo> --issue <number>`.

So: **MCP creates the issue**; **GraphQL script adds it to the project board**, because Projects v2 are only manageable via GraphQL.

**Pull requests and review**

| Tool | Purpose |
|------|--------|
| **pull_request_read** | Get PR details and changed files. |
| **pull_request_review_write** | Post review comments to the PR. |

Used by the PR review skill: agent fetches changed files and PR content via MCP, performs the review, then posts comments with **pull_request_review_write**. No GraphQL involved for PR review.

**Other available tools** (e.g. `search_issues`, `create_pull_request`, `list_commits`, `get_file_contents`) are used by other flows as needed; see `mcps/user-github/tools/`.

### End-to-end flow: ticket creation

1. User runs **GitHub create ticket** or **GitHub bug report**.
2. Agent calls **get_me** (MCP) to ensure GitHub is connected.
3. Agent resolves repo (and for create-ticket: Task vs Feature).
4. Agent calls **issue_write** (MCP) to create the issue in the repo.
5. If `.cursor/github-project.json` exists, agent runs `github-project-tickets.js add-issue` (GraphQL) to add the new issue to the project board.

So **GitHub MCP** handles identity and issue CRUD; **GraphQL script** handles Projects v2 board membership and field updates.

---

## Quick start

1. **Connect** — Run the **Connect** command (`/connect`). The agent will ensure Notion and GitHub are connected and ask for your GitHub Project board; it saves `org` and `project` to `.cursor/github-project.json`.
2. **Notion** — Use **Notion create feature ticket** or **Notion bug report** to add items to the Task Tracker database.
3. **GitHub** — Use **GitHub create ticket** or **GitHub bug report** to create issues (and add them to the project board via the script). Use **PR review** to review a PR and post comments via MCP.

---

## Commands and skills

| Command / Skill | Purpose |
|-----------------|--------|
| **Connect** (`.cursor/commands/connect.md`) | Ensure Notion + GitHub connected; set default GitHub Project board. |
| **GitHub** (`.cursor/commands/github.md`) | Check GitHub login and repo access (get_me, list_branches/get_file_contents). |
| **GitHub create ticket** | Create Task or Feature issue via **issue_write**; add to project board via script. |
| **GitHub bug report** | Create Bug issue via **issue_write**; add to project board via script. |
| **PR review** (`.cursor/skills/pr-review-skill/SKILL.md`) | Review PR and post comments via **pull_request_read** / **pull_request_review_write**. |
| **Notion** | Feature/bug tickets in Task Tracker; implement-ticket; see `docs/notion-tickets-setup.md`. |

---

## Project layout

| Path | Description |
|------|-------------|
| `.cursor/commands/` | Command definitions (connect, github, github-create-ticket, github-bug-report, pr-review, notion-*). |
| `.cursor/skills/` | Workflow skills (ensure-notion-github-connected, github-feature-ticket, github-bug-report, pr-review-skill, bug-report-to-notion, feature-ticket-to-notion, implement-ticket, etc.). |
| `.cursor/rules/` | Rules for Notion ticket DB, MCP auth, compounding dev cycle. |
| `scripts/github-project-tickets.js` | GraphQL script for GitHub Projects v2 (get-project-id, list-fields, list-items, add-draft, add-issue, update-field). |
| `docs/` | Workflows (notion-mcp-workflow, github-mcp-workflow, github-project-tickets), plans, and references. |
| `mcps/user-github/tools/` | GitHub MCP tool descriptors (read before calling tools). |

---

## References

- **GitHub GraphQL (Projects v2):** [Using the API to manage Projects](https://docs.github.com/en/issues/planning-and-tracking-with-projects/automating-your-project/using-the-api-to-manage-projects)
- **Project script and options:** `docs/github-project-tickets.md`
- **GitHub MCP workflow:** `docs/github-mcp-workflow.md`
- **Notion MCP workflow:** `docs/notion-mcp-workflow.md`
- **Default project board:** `.cursor/github-project.json` (see `.cursor/github-project.example.json`)
