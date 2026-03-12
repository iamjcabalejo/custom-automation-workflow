# Post PR review comments (no manual payload)

When you run the PR review workflow (Phase 3), you can post comments to the PR **without creating a manual payload file** (e.g. `PR-12-review-payload.json`). Use the script that parses the draft review file and posts comments via the GitHub API.

## How it works

1. **Draft review file** — The PR review skill writes a draft like `docs/pr-reviews/PR-<number>-review.md` with **Repo**, **PR**, a **Files changed (review scope)** section listing only the PR’s changed files, and one **Comment N** block per comment (File, Line, Severity, Body).

2. **Post comments** — Run the script with the **path to that draft file** (absolute or relative). The script:
   - Parses **Repo** and **PR** from the draft
   - If present, parses **Files changed (review scope)** and uses it as an allowlist: **only comments whose File is in that list are posted**. Comments for other paths are skipped so posting does not fail.
   - Parses every **Comment N** block into path, line, severity, body
   - Fetches the PR’s head commit from the GitHub API (for `commit_id`)
   - Reads the GitHub token from Cursor MCP config (`~/.cursor/mcp.json`)
   - POSTs each comment to `POST /repos/:owner/:repo/pulls/:pull_number/comments`

No `*-payload.json` or `post-comment.json` file is required.

## Usage

From the **cursor-notion-implementation** repo (or with an absolute path to the script):

```bash
node scripts/post-pr-review-comments.js <path-to-draft-review.md>
```

**Examples:**

- Draft in the same repo:  
  `node scripts/post-pr-review-comments.js docs/pr-reviews/PR-12-review.md`

- Draft in another repo (e.g. buynin-frontend):  
  `node /path/to/cursor-notion-implementation/scripts/post-pr-review-comments.js /path/to/buynin-frontend/docs/pr-reviews/PR-12-review.md`

## Requirements

- **GitHub token** — The script reads `mcpServers.github.headers.Authorization` from `~/.cursor/mcp.json` (or `CURSOR_MCP_JSON` if set). Ensure GitHub MCP is connected (e.g. run **get_me** in Cursor or use the connect workflow).
- **Draft format** — The draft file must contain:
  - `**Repo:** owner/repo`
  - `**PR:** <number>`
  - **Files changed (review scope)** — A section `## Files changed (review scope)` with a list of paths (one per line, `- path/from/root`). Only comments whose **File** is in this list are posted. If this section is missing, all comments are posted (backward compatible).
  - One or more blocks in the form:
    - `### Comment N`
    - `- **File:** path/from/repo/root`
    - `- **Line:** <number>`
    - `- **Severity:** Critical | Suggestion | Nice to have`
    - `- **Body:** ...`

## When a comment fails

Comments can fail if the **path** or **line** are not in the PR’s changed file list or diff. Phase 1 of the PR review skill restricts comments to changed files/lines to avoid this. If the script reports failures, check that the draft only references files and lines that exist in the PR diff.

## Reference

- PR review workflow: `.cursor/skills/pr-review-skill/SKILL.md`
- Command: `.cursor/commands/pr-review.md`
- GitHub MCP: `docs/github-mcp-workflow.md`
