# GitHub Project tickets script

The `github-project-tickets.js` script creates and updates tickets (items) on a **GitHub Projects v2** board using the GraphQL API. It uses the same GitHub token as Cursor MCP (`~/.cursor/mcp.json`).

## Requirements

- **GitHub token** — Read from `mcpServers.github.headers.Authorization` in `~/.cursor/mcp.json` (or `CURSOR_MCP_JSON` env var). Token must have **`project`** scope for create/update; **`read:project`** is enough for get-project-id, list-fields, list-items.
- **Project** — Identify the project by **org** and **project number**. You can pass `--org` and `--project` each run, or set a default: run the **Connect** command (`/connect`); when GitHub is connected, specify the project board (URL or org + number). It is saved to `.cursor/github-project.json` and the script uses it when `--org`/`--project` are omitted. From a URL like `https://github.com/orgs/Buyninja/projects/2/views/1`, org is `Buyninja` and project is `2`.

## Commands

| Command | Description |
|--------|-------------|
| `get-project-id` | Resolve the project’s node ID (useful for debugging or other tools). |
| `list-fields` | List project fields (e.g. Status) and, for single-select fields, their option IDs. |
| `list-items` | List project items (draft issues, linked issues, PRs) with item IDs. |
| `add-draft` | Add a **draft issue** to the project (no repo issue is created). |
| `add-issue` | Add an **existing repository issue** to the project by repo and issue number. |
| `update-field` | Update a field on a project item (e.g. Status, text, number, date). |

All commands that act on a project require either `--org` and `--project` or a default from `.cursor/github-project.json` (set via the Connect command).

## Usage

From the **cursor-notion-implementation** repo (or with the path to the script):

```bash
node scripts/github-project-tickets.js <command> [options]
```

### Examples

**Resolve project ID (e.g. for Buyninja project #2):**
```bash
node scripts/github-project-tickets.js get-project-id --org Buyninja --project 2
```

**List fields and Status options:**
```bash
node scripts/github-project-tickets.js list-fields --org Buyninja --project 2
```

**List items in the project:**
```bash
node scripts/github-project-tickets.js list-items --org Buyninja --project 2 --first 30
```

**Create a draft issue:**
```bash
node scripts/github-project-tickets.js add-draft --org Buyninja --project 2 --title "New task" --body "Optional description"
```

**Add an existing repo issue to the project:**
```bash
node scripts/github-project-tickets.js add-issue --org Buyninja --project 2 --repo Buyninja/buynin-cms --issue 42
```

**Update Status (single-select) on an item:**  
Use the field ID and option ID from `list-fields`:
```bash
node scripts/github-project-tickets.js update-field --org Buyninja --project 2 --item-id PVTI_xxx --field-id PVTSSF_xxx --single-select-option-id abc123
```

**Update a text field:**
```bash
node scripts/github-project-tickets.js update-field --org Buyninja --project 2 --item-id PVTI_xxx --field-id PVTF_xxx --text "New value"
```

**Update a date field:**
```bash
node scripts/github-project-tickets.js update-field --org Buyninja --project 2 --item-id PVTI_xxx --field-id PVTIF_xxx --date "2025-03-15"
```

## Option reference

- **Common:** `--org`, `--project` (required unless `.cursor/github-project.json` exists).
- **list-items:** `--first <n>` (default 20).
- **add-draft:** `--title` (required), `--body` (optional).
- **add-issue:** `--repo owner/repo`, `--issue <number>`.
- **update-field:** `--item-id`, `--field-id`, and one of: `--single-select-option-id`, `--text`, `--number`, `--date`.

## Reference

- Script: `scripts/github-project-tickets.js`
- Default project board: `.cursor/github-project.json` (created when you run the Connect command and specify the board); example: `.cursor/github-project.example.json`
  - Optional **`defaultRepo`**: set to `"owner/repo"` to suggest that repo when creating GitHub issues (e.g. "Reply **1** for owner/repo (this workspace)"); the script does not read this—it is used by the create-ticket and bug-report skills.
- GitHub Projects API: [Using the API to manage Projects](https://docs.github.com/en/issues/planning-and-tracking-with-projects/automating-your-project/using-the-api-to-manage-projects)
- GitHub MCP: `docs/github-mcp-workflow.md`
- Connect command: `.cursor/commands/connect.md`
