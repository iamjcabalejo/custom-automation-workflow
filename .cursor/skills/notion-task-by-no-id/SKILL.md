---
name: notion-task-by-no-id
description: Retrieves full Notion task (page) content by page URL, page ID, or by task identifier property (No. ID). Use when the user asks for ticket/task details and provides a Notion link, a Notion page ID, or only a task ID such as TSK-1.
---

# Notion task by URL, page ID, or No. ID

Get full details for one Notion task. Input is either a **page URL**, a **page ID**, or a **No. ID** (the task identifier property, e.g. `TSK-1`). Full details = page content and all properties returned by **notion-fetch**.

## Terminology

| Term | Definition |
|------|-------------|
| **Page** | A Notion page (e.g. a task row in a database). |
| **Page URL** | Full Notion URL for the page (e.g. `https://www.notion.so/workspace/Title-2fce1bbb9a0e80faafcadea38000502c`). |
| **Page ID** | Notion’s UUID for the page (often in the URL; 32 hex chars with optional hyphens). |
| **No. ID** | The task identifier property on the page (e.g. `TSK-1`). When the user has only this, the agent must resolve it to a page first. |

## Prerequisite

- Notion MCP must be authenticated. Call `mcp_auth` for server `plugin-notion-workspace-notion` before any Notion tool use when the server reports that it needs authentication. See `docs/notion-mcp-workflow.md`.

## Workflow

### 1. Determine input type

- [ ] User provided a **page URL** → go to step 2a.
- [ ] User provided a **page ID** (UUID) → go to step 2a.
- [ ] User provided only a **No. ID** (e.g. `TSK-1`) → go to step 2b.
- [ ] User provided nothing → ask: “Which task? Provide the task ID (e.g. TSK-1) or the Notion page link.” Then stop.

### 2a. Fetch by URL or page ID

- [ ] Call **notion-fetch** with the page URL or page ID.
- [ ] If the call succeeds → go to step 3.
- [ ] If the call fails (e.g. not found, auth error) → go to step 4 (failure).

### 2b. Resolve No. ID to a page, then fetch

- [ ] Call **notion-search** with query = the exact No. ID string (e.g. `TSK-1`). Do not add extra words.
- [ ] From the search result, take the **page URL** or **page ID** of the matching page. If multiple matches, use the first; if the result set is empty, go to step 4 (failure).
- [ ] Call **notion-fetch** with that page URL or page ID.
- [ ] If the call succeeds → go to step 3.
- [ ] If the call fails → go to step 4 (failure).

### 3. Return full details

- [ ] Use the **notion-fetch** response only. Do not mix with search result content.
- [ ] Present in a clear, readable format:
  - Title; No. ID (if present in properties); Status; Assignee.
  - Description or body content (summary or key points).
  - Due date, project, and other useful properties.
  - Link to open the page in Notion (page URL).
- [ ] Stop.

### 4. Failure handling

- [ ] State that the task could not be found or fetched.
- [ ] Suggest: check the URL/ID or No. ID, and run Notion MCP auth if needed (see `docs/notion-mcp-workflow.md`).
- [ ] Stop.

## Tool reference

| Tool | When to use |
|------|--------------|
| **notion-fetch** | Always used to obtain full details. Input: page URL or page ID. |
| **notion-search** | Only when input is No. ID. Input: query string = No. ID. Use the returned page URL or page ID for **notion-fetch**. |

MCP server: `plugin-notion-workspace-notion`. Full tool list: `docs/notion-mcp-tools.md`.

## Example (No. ID only)

- Input: “Get me TSK-1.”
- Step 1: Input is No. ID → 2b.
- Step 2b: Call notion-search with query `TSK-1`; from result get page URL or page ID; call notion-fetch with that.
- Step 3: Format and return full details from notion-fetch response.

## Example (page URL)

- Input: user pastes `https://www.notion.so/ticketboat/BUG-Shadows-...-2fce1bbb9a0e80faafcadea38000502c`.
- Step 1: Input is page URL → 2a.
- Step 2a: Call notion-fetch with that URL.
- Step 3: Format and return full details from notion-fetch response.
