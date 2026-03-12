# Notion MCP tools reference

Canonical list of tools exposed by the Notion MCP server. Use these **exact tool names** when calling the MCP (server: `plugin-notion-workspace-notion`). Source: [Notion – MCP supported tools](https://developers.notion.com/docs/mcp-supported-tools).

## Fetching ticket/page content (use this for ticket details)

| Tool | Purpose |
|------|--------|
| **notion-fetch** | **Retrieves content from a Notion page, database, or data source by its URL or ID.** Use this to get full details for a ticket when the user provides a Notion link (e.g. `https://www.notion.so/ticketboat/BUG-Shadows-...-2fce1bbb9a0e80faafcadea38000502c`) or a page ID. Pass the URL or ID as required by the tool. |

Example: user shares `https://www.notion.so/ticketboat/BUG-Shadows-Order-Tracking-Report-Buyer-View-2fce1bbb9a0e80faafcadea38000502c?...` → call **notion-fetch** with that URL to get the page content and properties.

## Search and query

| Tool | Purpose |
|------|--------|
| **notion-search** | Search across the Notion workspace (and connected tools with Notion AI). Use to find tickets by title, ID text, or keyword. |
| **notion-query-data-sources** | Query across multiple data sources with filters, grouping, summaries (Enterprise + Notion AI). |
| **notion-query-database-view** | Query a database using a view’s filters/sorts (Business+ with Notion AI). |

## Create and update

| Tool | Purpose |
|------|--------|
| **notion-create-pages** | Create one or more pages with properties and content; supports database templates. |
| **notion-update-page** | Update a page’s properties or content; supports applying templates. |
| **notion-move-pages** | Move pages or databases to a new parent. |
| **notion-duplicate-page** | Duplicate a page (async). |
| **notion-create-database** | Create a new database with properties. |
| **notion-update-data-source** | Update a data source’s properties, name, description. |

## Comments and people

| Tool | Purpose |
|------|--------|
| **notion-create-comment** | Add a comment to a page or block. |
| **notion-get-comments** | List all comments/discussions on a page. |
| **notion-get-teams** | List teams (teamspaces) in the workspace. |
| **notion-get-users** | List all users in the workspace. |
| **notion-get-user** | Get a user by ID. |
| **notion-get-self** | Get the current bot/connection and workspace info. |

## Naming note

Some clients (e.g. OpenAI) may show **fetch** and **search** without the `notion-` prefix. In Cursor, use the names as listed above when invoking the Notion MCP.

## Rate limits

- Overall: ~180 requests/min (3/sec) average.
- Search: 30 requests/min.

See [Notion MCP supported tools](https://developers.notion.com/docs/mcp-supported-tools) for details.
