# Notion tickets board setup

This project uses Notion for engineering tickets. The agent uses this doc to find and filter tasks correctly.

## Tasks database

There is **one Tasks database**. Tickets do not follow a single rigid schema—properties may vary.

**Resolving the database:** Do not hardcode a database URL or page ID. Instead:

1. **Ask the user** for the name of their Tasks database (e.g. "Task Tracker", "Tasks", "Engineering tickets").
2. Use the Notion MCP **notion-search** tool with that name as the `query` to find the database in the workspace.
3. From the search results, take the matching database (first result, or let the user pick if ambiguous) and use its page URL or page ID for **notion-fetch** and **notion-query-database-view**.

The **feature-ticket** and **bug-report** skills should follow this flow when they need the target database.

### How to get the list of tickets

1. Resolve the Tasks database by name (see above), then **notion-fetch** its URL/ID to get the database schema and/or child pages/rows.
2. If your plan has **notion-query-database-view** (Business+ with Notion AI), call it with the database ID to get the list.
3. **notion-search** can also find tickets by keyword or ID; then use **notion-fetch** on each ticket page URL for full details.

## Resolving “current user”

- The Notion MCP is authenticated as a specific Notion user.
- When a command says “assigned to the current user,” filter tasks where **Assignee** (or equivalent) matches that connected user.
- If the MCP does not expose “current user” directly, ask the user to confirm their name/email as it appears in Notion assignee fields, and filter by that.

## Ticket ID format

- Ticket IDs may look like **TSK-1** (prefix + number) when present; not all tickets may have this property.
- To “get ticket TSK-1: use **notion-search** to find the page, then **notion-fetch** on that page’s URL for full details. Or if the user pastes a ticket page URL, use **notion-fetch** with that URL directly.

## Implementation lane

- If the database has a **Lane** or **Status** (e.g. Implementation), filter by that and by current user for “my implementation tickets.”
- Otherwise, list tickets from the database and let the user pick; then **notion-fetch** each chosen ticket page for details and create a plan.

## How to fetch a ticket’s content

- Use the Notion MCP tool **notion-fetch** with the ticket’s **Notion page URL** or **page ID** to retrieve full page content and properties. Do not rely on search alone for “details”—always call notion-fetch for the specific page.
- If the user only has a ticket ID (e.g. TSK-1), use **notion-search** to find the matching page, then **notion-fetch** on that page’s URL/ID.

Full list of Notion MCP tools: `docs/notion-mcp-tools.md`.

## Commands

- **Get ticket details:** `/ticket <ID or URL>` — fetch and show one ticket (No. ID, page URL, or page ID).
- **Implement a ticket:** `/implement-ticket` — implement a specified ticket end-to-end (plan → code → review); uses backend/frontend architect and reviewer skills. Provide the ticket by No. ID, page URL, or page ID when prompted.
- **Other:** `/bug-report`, `/feature-ticket` to create tickets in Notion; `/my-implementation-tickets` for the interactive implementation-tickets flow (if configured).

## Reference

- Notion MCP auth and tools: `docs/notion-mcp-workflow.md`.
