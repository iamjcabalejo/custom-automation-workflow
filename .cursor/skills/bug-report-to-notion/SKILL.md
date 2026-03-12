---
name: bug-report-to-notion
description: Collects a detailed bug report from the user (including affected files, steps, expected vs actual) and creates a corresponding Notion page in the target database. Use when the user wants to report a bug, file a bug, or add a bug to Notion.
---

# Bug report to Notion

Collect detailed bug details from the user and create one new page in a Notion database using **notion-fetch** and **notion-create-pages**. Optionally use **notion-search** to find the target database and **notion-create-comment** to mark the page as AI-reported.

## Terminology

| Term | Definition |
|------|-------------|
| **Target database** | The Notion database where the bug page will be created; the user specifies the database name (e.g. "Bugs", "Tasks"), and the agent resolves it via search. |
| **Page** | A Notion page (here, a single bug/task row in the target database). |
| **Data source** | A collection under a database; when a database has multiple data sources, use its `data_source_id` as parent for **notion-create-pages**, not `database_id`. |
| **Schema** | Property names and types returned by **notion-fetch** for the target database; required to build valid **notion-create-pages** properties. |
| **Affected files** | Exact file or directory paths in the workspace related to the bug (e.g. `.cursor/commands/feature-ticket.md`). One path per line; use paths as they appear in the project. |

## Prerequisite

- Notion MCP must be authenticated **by the user** (via Cursor: enable Notion plugin and complete sign-in when prompted). The agent has no auth tool; use **notion-search**, **notion-fetch**, and **notion-create-pages** directly. If a tool returns an auth/unauthorized error, tell the user to authenticate in Cursor (e.g. ask "Authenticate Notion MCP" in chat). See `docs/notion-mcp-workflow.md`.

## Workflow

### 1. Trigger

- [ ] User said they want to "report a bug", "file a bug", "add a bug to Notion", or used a `/bug-report` command.
- [ ] Proceed to resolve the target database and create the page. Do **not** call `mcp_auth`—it is not exposed by the Notion MCP server to the agent.

### 2. Resolve target database

- [ ] Ask the user which Notion database the bug should be added to (e.g. "Bugs", "Tasks", "Bug reports") if they have not already specified a database name in their message.
- [ ] Call **notion-search** with `query_type` `"internal"` and **query** equal to the database name the user provided. From the results, take the first **database** URL or ID.
- [ ] If no database is found: tell the user no database matched that name; suggest they check the name or share the database URL. Stop.
- [ ] Call **notion-fetch** with the chosen database URL or ID.
- [ ] If the call fails (auth error, not found): state that the database could not be loaded. Suggest the user authenticate via Cursor (e.g. "Authenticate Notion MCP" in chat or enable the Notion plugin and sign in) and that the database is shared with the integration. Stop.
- [ ] From the fetch result: note the **schema** (property names and types), the **title property name** (the one and only title property in the schema), and any **templates** (e.g. "Bug"). If the response shows multiple `<data-source url="collection://...">` elements, extract the appropriate **data_source_id** (without the `collection://` prefix) for use as parent; otherwise use **database_id** from the database URL/page ID.

### 3. Collect bug details (detailed report)

Collect the following. Only **Title** is required; prompt once for missing Title. For all other fields: if the user did not provide them, ask once for **affected files** when the bug is code-related; do not block on other optional fields. Use empty string or omit when never provided.

| Field | Required | Guidance |
|-------|----------|----------|
| **Title** | Yes | Short summary (e.g. "Feature-ticket command does not create page"). If the user pastes a long block, use the first line or a one-line summary as title and the rest as description. |
| **Description** | No | What is broken; current behavior in plain language. |
| **Steps to reproduce** | No | Numbered list: exact actions to trigger the bug. |
| **Expected behavior** | No | What should happen. |
| **Actual behavior** | No | What actually happens (errors, silence, wrong result). |
| **Affected files** | When code-related | Exact paths in the workspace (e.g. `.cursor/commands/feature-ticket.md`, `.cursor/skills/feature-ticket-to-notion/SKILL.md`). One path per line. Use forward slashes. If the user says "the feature-ticket command" or similar, infer and list the relevant command and skill paths from the project and include them. |
| **Environment** | No | OS, browser, runtime, or tool versions if relevant. |
| **Severity** | No | e.g. Critical, High, Medium, Low—only if the user provides it or the schema supports it. |

- [ ] If title is missing: ask once "What's a short title for this bug?" If still missing, use placeholder "Bug report (no title)" and continue.
- [ ] When the bug clearly involves code or a command (e.g. "feature-ticket command", "bug-report skill"): if affected files were not given, ask once "Which exact files or paths are affected? (e.g. .cursor/commands/feature-ticket.md)" or infer from context (e.g. command + skill) and list those paths. Include inferred paths in the report.

### 4. Build page content and properties

- [ ] **Content (Notion Markdown):** Build a single body using the content template below. Do not include the page title in content. Include a section only when the corresponding field is non-empty. Use Notion-flavored Markdown; for the full spec, fetch the MCP resource `notion://docs/enhanced-markdown-spec` when in doubt.

**Content template** (omit any section whose value is empty):

```markdown
## Description
<description>

## Steps to reproduce
<steps to reproduce>

## Expected behavior
<expected behavior>

## Actual behavior
<actual behavior>

## Affected files
<one path per line; use code-style or backticks for paths>

## Environment
<environment>
```

- [ ] **Properties:** Build a JSON map from the target database schema:
  - Set the **title property** (name from schema) to the bug title.
  - If the schema has a Status (or equivalent) property, set it to a valid value (e.g. "To Do", "Open", "Not started") that exists in the schema.
  - If the schema has Severity (or equivalent) and the user provided severity, set it to a valid value.
  - If the schema has Type (or equivalent) and a "Bug" (or equivalent) option exists, set it to that value.
  - For date properties use `date:{property}:start`, `date:{property}:end` (optional), `date:{property}:is_datetime` (0 or 1). For checkboxes use `__YES__` or `__NO__`. For numbers use JavaScript numbers. Properties named "id" or "url" (case insensitive) must be prefixed with `userDefined:` (e.g. `userDefined:URL`).
- [ ] If the fetch result included a "Bug" (or similar) template and it is appropriate: use **template_id** for that template in the page object and do **not** include `content`; still set **properties** to override template defaults. Otherwise: omit `template_id` and include **content** as built above.

### 5. Create the page

- [ ] Call **notion-create-pages** with:
  - **parent:** `{ "type": "data_source_id", "data_source_id": "<id>" }` if the database had multiple data sources; else `{ "type": "database_id", "database_id": "<database page ID>" }`. Use the database page ID from the URL when using `database_id`.
  - **pages:** One object with the chosen `template_id` (optional), **properties**, and **content** (optional, omit when using a template).
- [ ] If the call fails: surface the error to the user and suggest checking required properties and schema (e.g. valid Status values). Stop.
- [ ] From the response, obtain the new **page ID** or **page URL** for confirmation.

### 6. Optional comment

- [ ] Optionally call **notion-create-comment** with the new page's **page_id** and a short **rich_text** message (e.g. `[{ "text": { "content": "Reported via Cursor AI agent." } }]`) for traceability.

### 7. Confirm to user

- [ ] Return a short confirmation: bug title, key properties set (e.g. Status, Type), and the **link** to open the new page in Notion (page URL). Stop.

## Failure handling

| Situation | Action |
|-----------|--------|
| User never specifies a database name | After one prompt ("Which Notion database should this bug be added to?"), stop and wait for the name; do not assume a default. |
| **notion-search** finds no database | Tell the user no database matched that name; suggest they check the name or share the database URL. |
| **notion-fetch** fails (auth, not found) | State that the database could not be loaded. Suggest the user authenticate in Cursor ("Authenticate Notion MCP") and ensure the database is shared with the integration. See `docs/notion-mcp-workflow.md`. |
| **notion-create-pages** fails | Surface the error. Suggest checking required properties and that values (e.g. Status) match the schema. |
| User never provides a title | After one prompt, use a placeholder title (e.g. "Bug report (no title)") and continue so the page is still created. |

## Tool reference

| Tool | When to use |
|------|-------------|
| **notion-fetch** | Required. Fetch the target database URL/ID to get schema, data_source_id (if multiple sources), and templates. Input: database URL or ID. |
| **notion-search** | Required. After the user specifies the database name; query with that name, query_type "internal"; use first database result for fetch. |
| **notion-create-pages** | Required. Create one page with parent = database or data source; properties (title + Status etc.); content (Notion Markdown) or template_id. |
| **notion-create-comment** | Optional. After creating the page; add a page-level comment (e.g. "Reported via Cursor AI agent") with page_id and rich_text. |

MCP server: `plugin-notion-workspace-notion`. Full tool list: `docs/notion-mcp-tools.md`.

## Example (detailed report)

- **Input:** "The feature-ticket command is not working as intended."
- **Collected:** Title: "Feature-ticket command not working as intended"; description: "The feature-ticket command does not create or update Notion pages as expected."; steps: (empty); expected: "Running /feature-ticket and providing a feature title should create a new feature row in the target database."; actual: "Command runs but no page is created or wrong database is used."; affected files: ".cursor/commands/feature-ticket.md\n.cursor/skills/feature-ticket-to-notion/SKILL.md"; environment: (empty); severity: (empty).
- **After notion-fetch:** Schema has title "Name", "Status" (status), "Type" (select with "Bug"). Single data source; use database_id.
- **Content (excerpt):** `## Description\nThe feature-ticket command does not create or update Notion pages as expected.\n\n## Expected behavior\nRunning /feature-ticket and providing a feature title should create a new feature row in the target database.\n\n## Actual behavior\nCommand runs but no page is created or wrong database is used.\n\n## Affected files\n.cursor/commands/feature-ticket.md\n.cursor/skills/feature-ticket-to-notion/SKILL.md`
- **Confirm:** "Created bug in Notion: **Feature-ticket command not working as intended** (Status: Not started, Type: Bug). [Open in Notion](<page URL>)."

## References

- Notion MCP auth and workflow: `docs/notion-mcp-workflow.md`.
- Notion MCP tools: `docs/notion-mcp-tools.md`.
- Tasks database and default URL: `docs/notion-tickets-setup.md`.
