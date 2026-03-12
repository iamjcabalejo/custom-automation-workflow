# PR Review: review a pull request and post line-level comments

Run a code review for the specified pull request. The agent **first fetches the list of files changed in the PR**, then **reviews only those files** and writes comments **only for those files** so that posting comments does not fail. It produces a draft review in a single `.md` file (including the list of changed files), lets you edit it, then posts the comments to the PR. **No project source files are modified**—only the draft review file is created, and comments are added on the PR via GitHub. **Do not merge the pull request**—this command only reviews and comments.

## Usage

**`/pr-review [pr #]`** — e.g. `/pr-review 42` for PR #42.

The agent will ask for missing information so the PR is unambiguous:
1. **Repository** — "Which repository? Give **owner/repo** (e.g. `myorg/myapp`) or the full GitHub repo URL." Use this to identify where the PR lives.
2. **PR number** — If not provided (e.g. you ran `/pr-review` with no number), the agent will ask: "Which PR number should I review?"

## What to do

**Follow the workflow in `.cursor/skills/pr-review-skill/SKILL.md`.** That skill is the single source of truth for:

1. **Phase 1 — Draft review**
   - **Step 1:** Ensure GitHub is connected (e.g. **get_me**). Ask for repository (**owner/repo** or URL) if not provided, then resolve PR number.
   - **Step 2:** **Fetch the list of files changed in the PR** from GitHub (e.g. list PR files). This list is the **only** scope for the review.
   - **Step 3:** Fetch diff or file contents **only for those changed files**. Do not review or add comments for any other files.
   - **Step 4:** Load and apply the project's **backend-reviewer** and **frontend-reviewer** skills; classify each changed file as backend or frontend and apply the corresponding reviewer's criteria. Perform the review **only on the changed files**.
   - **Step 5:** Write a **single Markdown file** (e.g. `docs/pr-reviews/PR-<number>-review.md`) that **includes the list of changed files** and one entry per comment (file path, line number(s), severity, body). **Only add comments for files in the PR's changed file list** so that posting in Phase 3 succeeds.
2. **Phase 2 — User review** — Ask the user to review and edit the draft file. Tell them they can add, remove, or change comments. When they are done, ask them to confirm (e.g. "Reply **post review** when you want these comments added to the PR").
3. **Phase 3 — Post to PR** — When the user confirms, post each comment from the draft to the specified PR at the correct file and line. Only comments for files listed in the draft's "Files changed" section are posted (the script filters by this list to avoid posting to other files). **Preferred:** run `node scripts/post-pr-review-comments.js <absolute-path-to-draft-review.md>` (script lives in cursor-notion-implementation; pass the path to the draft file, which may be in another repo). Alternatively use GitHub MCP to create pull request review comments. **Never merge the pull request**—do not call any merge or approve-and-merge tool.

Use GitHub MCP tools (server: `user-github`) for PR data and for creating review comments. Check available tools (e.g. get pull request, list PR files, create review/review comment) and call them with the correct parameters.

**References:** `.cursor/skills/pr-review-skill/SKILL.md`, `docs/github-mcp-workflow.md`
