---
name: feature-ticket-to-notion
description: Collects a feature request from the user and creates a corresponding Notion page (task or feature row) in the target database. Use when the user wants to add a feature ticket, create a feature request, or log a new feature in Notion.
---

# Feature ticket to Notion

Collect feature details from the user and create one new page in a Notion database using **notion-fetch** and **notion-create-pages**. Optionally use **notion-search** to find a dedicated Features database and **notion-create-comment** to mark the page as AI-created.

## Terminology

| Term | Definition |
|------|-------------|
| **Target database** | The Notion database where the feature page will be created (Tasks database by default, or a dedicated Features database). |
| **Page** | A Notion page (here, a single feature/task row in the target database). |
| **Data source** | A collection under a database; when a database has multiple data sources, use its `data_source_id` as parent for **notion-create-pages**, not `database_id`. |
| **Schema** | Property names and types returned by **notion-fetch** for the target database; required to build valid **notion-create-pages** properties. |

## Prerequisite

- Notion MCP must be authenticated. Call `mcp_auth` for server `plugin-notion-workspace-notion` before any Notion tool use when the server reports that it needs authentication. See `docs/notion-mcp-workflow.md`.

## Workflow

### 1. Trigger and auth

- [ ] User said they want to "add a feature", "create a feature ticket", "log a new feature", or used a `/feature-ticket` command.
- [ ] If Notion MCP needs authentication, call `mcp_auth` for server `plugin-notion-workspace-notion` and wait for the user to complete sign-in. Then continue.

### 2. Resolve target database

- [ ] If the user indicated they have a dedicated "Features" database (or the skill is configured to prefer one): call **notion-search** with query `"Features"`; from the results, take the first **database** or page URL or ID. If no result, continue with the default below.
- [ ] Else: use the default **Tasks database** URL from `docs/notion-tickets-setup.md` (e.g. `https://www.notion.so/ticketboat/120e1bbb9a0e81bfa564e62b7f26200e`). Note: this URL is workspace-specific; if fetch fails, use fallback below.
- [ ] Call **notion-fetch** with the chosen database URL or ID.
- [ ] **Fallback when fetch fails (404, object_not_found, or auth error):** Call **notion-search** with query `"Task Tracker"`; if no result, try `"Tasks"`. From the results, take the first **page** or database **url** or **id**. Call **notion-fetch** with that URL or ID. If this fetch also fails, state that the database could not be loaded; suggest running Notion MCP auth and checking the database URL. Stop.
- [ ] From the **successful** fetch result: note the **schema** (property names and types from `<sqlite-table>` or `<data-source-state>`), the **title property name**, and any **templates**. For **parent:** if the response contains `<data-source url="collection://...">`, extract the **data_source_id** (the UUID without the `collection://` prefix) and use it for **notion-create-pages** parent. If there are multiple data sources, use the first (or the one matching the database title). Only when the fetch result is a database page and contains **no** data-source URL use **database_id** (the fetched page ID). Never use a hardcoded database_id that was not successfully fetched in this run.

### 3. Collect feature details (plan-level)

Collect enough detail so the Notion page matches the structure and depth of a plan in `docs/plans/` (e.g. `docs/plans/TSK-4-feature-ticket-create-fix.md`).

- [ ] **Title/summary** (required). If missing, ask once: "What's a short title for this feature?" Allow free-form paste; if the user pastes a long description, use the first line or a summary as the title and the rest as description.
- [ ] **Scope:** What is in scope and out of scope (bullets: "In:", "Out:"). If the user does not provide this, ask: "What's in scope and out of scope? (e.g. In: X, Y. Out: Z.)"
- [ ] **Acceptance criteria:** Testable conditions. Prefer a table: each row has an ID (e.g. AC1, AC2) and Criterion. If the user gives a list, convert to a two-column table (ID | Criterion). If missing, ask: "What are the acceptance criteria? (e.g. AC1: ..., AC2: ...)"
- [ ] **Technical approach:** Numbered steps describing how to implement (and optionally key files/APIs). If missing, ask: "Any technical approach or implementation steps?"
- [ ] **Task list:** Ordered implementation steps (numbered list). If missing, ask: "What's the task list? (numbered steps.)"
- [ ] **Root cause** (optional): For bugs or when relevant; short numbered list. Omit if not provided.
- [ ] **References** (optional): Links or doc names (e.g. `docs/notion-mcp-tools.md`, ticket IDs). Omit if not provided.
- [ ] **Priority** (optional): If the schema has Priority, collect it; otherwise omit.
- [ ] Do not block on optional fields; use empty string or omit if the user does not provide them. Prefer one round of questions to gather Scope, AC, Technical approach, and Task list so the ticket is as detailed as a saved plan file.

### 4. Build page content and properties

- [ ] **Content (Notion Markdown):** Build the page body to mirror the structure of plan files in `docs/plans/` (e.g. `docs/plans/TSK-4-feature-ticket-create-fix.md`). Do not include the page title in content. Use this structure, in order; omit a section only if the user provided no content for it:
  - **## Scope** — Bullet list with **In:** and **Out:** (what is in scope and out of scope).
  - **## Root cause** — (Optional.) Numbered list; include only when provided (e.g. for bugs).
  - **## Acceptance criteria** — Markdown table with columns `| ID | Criterion |`. One row per criterion (e.g. AC1, AC2).
  - **## Technical approach** — Numbered steps; sub-bullets allowed. Describe how to implement and key files/APIs.
  - **## Task list** — Numbered list of implementation steps.
  - **## References** — Bullet list of links or doc names (e.g. `docs/notion-mcp-tools.md`, ticket IDs).
  Use Notion-flavored Markdown; for the full spec, fetch the MCP resource `notion://docs/enhanced-markdown-spec` when in doubt. Tables are supported.
- [ ] **Properties:** Build a JSON map from the target database schema **only**. Use the exact property names and value sets from the fetch result (e.g. from `<sqlite-table>` comments or `<data-source-state>` schema):
  - Set the **title property** (exact name from schema, e.g. "Name" or "Task Name") to the feature title.
  - For **Status** (or equivalent): use a value that **exactly** matches one of the schema options (e.g. "Not started", "In progress", "Done" — or "To Do", "Open" if that is what the schema lists). Do not guess; use only values present in the schema.
  - For **Type**, **Category**, or **Lane**: if the schema has "Feature" (or equivalent), set it to that exact string; otherwise use the first available option that fits a feature/task (e.g. "Task").
  - If the schema has Priority and the user provided priority, set it to a valid value from the schema.
  - For date properties use `date:{property}:start`, `date:{property}:end` (optional), `date:{property}:is_datetime` (0 or 1). For checkboxes use `__YES__` or `__NO__`. For numbers use JavaScript numbers. Properties named "id" or "url" (case insensitive) must be prefixed with `userDefined:` (e.g. `userDefined:URL`). Do not set read-only or auto fields (e.g. auto_increment_id) unless the schema allows it.
- [ ] If the fetch result included a "Feature" (or similar) template and it is appropriate: use **template_id** for that template in the page object and do **not** include `content`; still set **properties** to override template defaults. Otherwise: omit `template_id` and include **content** as built above.

### 5. Create the page

- [ ] Call **notion-create-pages** with:
  - **parent:** Use the parent determined in step 2 from the **successful** fetch result. If you have a **data_source_id** (from `collection://...` in the fetch), use `{ "type": "data_source_id", "data_source_id": "<id>" }` (or the exact format required by the MCP tool — e.g. some clients accept `{ "data_source_id": "<id>" }`). Only when the fetch returned a database page and **no** data-source URL use `{ "type": "database_id", "database_id": "<database page ID>" }` with the **fetched** page ID. Never use a hardcoded database_id that was not returned by a successful fetch in this run.
  - **pages:** One object with the chosen `template_id` (optional), **properties** (title + Status + Type etc. from step 4), and **content** (optional, omit when using a template).
- [ ] If the call fails: surface the **exact** error to the user; suggest checking required properties and that Status/Type values match the schema exactly. Stop.
- [ ] From the response, obtain the new **page ID** or **page URL** for confirmation.

### 6. Optional comment

- [ ] Optionally call **notion-create-comment** with the new page's **page_id** and a short **rich_text** message (e.g. `[{ "text": { "content": "Created via Cursor AI agent." } }]`) for traceability.

### 7. Confirm to user

- [ ] Return a short confirmation: feature title, key properties set (e.g. Status, Type), and the **link** to open the new page in Notion (page URL). Stop.

## Failure handling

| Situation | Action |
|-----------|--------|
| **notion-fetch** of default DB fails (404, object_not_found, auth) | Run fallback: **notion-search** "Task Tracker" then "Tasks"; fetch first result. If that also fails, state that the database could not be loaded; suggest Notion MCP auth and checking the database URL. See `docs/notion-mcp-workflow.md`. |
| **notion-create-pages** fails | Surface the **exact** API error. Suggest checking required properties and that Status/Type values match the fetched schema exactly. |
| User never provides a title | After one prompt, use a placeholder title (e.g. "Feature (no title)") and continue so the page is still created. |

## Tool reference

| Tool | When to use |
|------|-------------|
| **notion-fetch** | Required. Fetch the target database URL/ID to get schema, data_source_id (if multiple sources), and templates. Input: database URL or ID. |
| **notion-search** | When user wants a "Features" database: query "Features"; use first result. When default DB fetch fails (404): query "Task Tracker" then "Tasks"; use first result URL/ID for fetch. |
| **notion-create-pages** | Required. Create one page with parent = database or data source; properties (title + Status etc.); content (Notion Markdown) or template_id. |
| **notion-create-comment** | Optional. After creating the page; add a page-level comment (e.g. "Created via Cursor AI agent") with page_id and rich_text. |

MCP server: `plugin-notion-workspace-notion`. Full tool list: `docs/notion-mcp-tools.md`.

## Example

- **Input:** "I want to add a feature. Dark mode for the dashboard. In scope: toggle in header, persist preference. Out of scope: theme API. AC1: Toggle visible in header. AC2: Preference persisted in localStorage. Tasks: 1) Add toggle component, 2) Wire to localStorage, 3) Add tests."
- **Collected:** Title: "Dark mode for the dashboard"; Scope: In: toggle in header, persist preference. Out: theme API. Acceptance criteria: AC1 / AC2 table. Task list: 3 steps. (Technical approach / References omitted.)
- **After notion-fetch:** Schema has title "Name", Status ("Not started", "In progress", "Done"), Type ("Task", "Feature", "Bug").
- **Content (plan-level structure):** Body starts with `## Scope`, then `## Acceptance criteria` (table), then `## Task list` (numbered). Same structure as `docs/plans/*.md`.
- **notion-create-pages:** parent = data_source_id; properties = Name, Status, Type; content = full plan-structured body.
- **Confirm:** "Created feature in Notion: **Dark mode for the dashboard** (Status: Not started, Type: Feature). [Open in Notion](<page URL>)."

## References

- Notion MCP auth and workflow: `docs/notion-mcp-workflow.md`.
- Notion MCP tools: `docs/notion-mcp-tools.md`.
- Tasks database and default URL: `docs/notion-tickets-setup.md`.
