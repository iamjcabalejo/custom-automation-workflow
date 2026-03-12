# Report a bug and add it to Notion

Collect a bug report from the user and create a new page in a Notion database. **Ask the user which database to use** (e.g. "Bugs", "Tasks", "Bug reports") if they have not already specified it. The user can also provide a title and optional description, steps to reproduce, environment, and severity.

## What to do

**Follow the workflow in `.cursor/skills/bug-report-to-notion/SKILL.md`.** That skill is the single source of truth for:

- Asking the user to specify the target database name, then resolving it via **notion-search**
- Fetching the database schema with **notion-fetch**
- Collecting bug details (title required; description, steps, environment, severity optional)
- Creating the page with **notion-create-pages** (and optionally **notion-create-comment**)
- Confirming with the new page link and key properties

Use only the tools listed in `docs/notion-mcp-tools.md` (**notion-search**, **notion-fetch**, **notion-create-pages**, **notion-create-comment**). If a tool fails with an auth error, tell the user to authenticate in Cursor (e.g. say "Authenticate Notion MCP" in chat or enable the Notion plugin and sign in).

**References:** `docs/notion-mcp-workflow.md`, `docs/notion-mcp-tools.md`, `docs/notion-tickets-setup.md`
