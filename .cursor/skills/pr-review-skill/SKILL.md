---
name: pr-review
description: Reviews a specified pull request and posts line-level comments to the PR. Produces a draft .md for user edit, then posts comments via GitHub MCP. Does not modify any project source files and does not merge the PR. Use when the user runs /pr-review or asks to review a PR by number.
---

# PR Review Workflow

Review a pull request by number: produce a draft review file, let the user edit it, then post comments to the PR. **Do not change any project source files.** Only create the draft review file and add comments on the PR via GitHub. **Do not merge the pull request**—review and comments only; never call merge or approve-and-merge.

## Scope and constraints

- **Input:** Repository: **owner/repo** or GitHub repo URL (ask if not provided). PR number (e.g. `42`); ask if not provided.
- **Output:** One draft Markdown file (Phase 1); after user confirmation, comments on the PR (Phase 3).
- **No edits** to application or config files. No code changes. Comments only.
- **No merge:** Do not merge the PR. Do not call GitHub merge, squash and merge, or approve-and-merge tools.

---

## Phase 1 — Create draft review

1. **Ensure GitHub is connected**
   - Call **get_me** (GitHub MCP, server: `user-github`). If it fails, ask the user to connect or sign in to GitHub and stop.

2. **Resolve repository and PR**
   - **Repository first:** Ask the user which repository contains the PR: “Which repository? Please give **owner/repo** (e.g. `myorg/myapp`) or the full GitHub repo URL.” Use current workspace repo only if there is exactly one GitHub repo and the user did not specify another. Otherwise, require an explicit **owner/repo** or URL; parse to `owner` and `repo`.
   - **PR number:** If the user provided a PR number (e.g. from `/pr-review 42`), use it. If not, ask: “Which PR number should I review?”
   - Confirm back to the user: “Reviewing PR #&lt;number&gt; in **owner/repo**” (e.g. "Reviewing PR #42 in **myorg/myapp**") so the target is unambiguous.

3. **Get the list of changed files first (required before any review)**
   - Use GitHub MCP to **list the files changed in the PR** (e.g. list pull request files). Obtain the full list of file paths (relative to repo root) that are changed in this PR.
   - **This list is the only scope for the review.** Do not fetch diff or file contents for any path not in this list. Do not add comments for any file not in this list.
   - Fetch the diff or file contents **only for these changed files** (e.g. get file contents at the PR head ref, or get the PR diff and restrict to these paths). Do **not** use a local git diff as the scope—it may include files not in the PR or a different commit set.

4. **Load reviewer skills and perform code review (changed files only)**
   - **Load skills first:** Read and apply the project's reviewer skills from this repo:
     - **Backend:** `.cursor/skills/backend-reviewer/SKILL.md` — use for API routes, server logic, database access, backend services, and any file that is clearly server-side or backend.
     - **Frontend:** `.cursor/skills/frontend-reviewer/SKILL.md` — use for UI components, pages, client-side logic, styling, and any file that is clearly frontend (e.g. React/Vue components, client hooks, frontend utils).
   - **Review only the changed files** from step 3. Classify each as backend, frontend, or shared. For each file, apply the matching reviewer's criteria and checklists. For each finding, record: **file path** (must be one of the paths from the changed-files list), **line number** (in the diff or file), **severity** (Critical | Suggestion | Nice to have), **comment body** (short, actionable; suggest fix when possible).
   - **Do not add comments for files outside the changed-files list.** Only use file paths and line numbers that exist in the PR diff for that file, so Phase 3 comment posting succeeds.

5. **Write the draft review file**
   - Create exactly **one** file, e.g. `docs/pr-reviews/PR-<number>-review.md` (create `docs/pr-reviews/` if needed).
   - Use the template below. **Include the full list of changed files** in the "Files changed" section. Write **one comment block per finding**; every comment's **File** must be one of the paths in that list.
   - After writing, tell the user the file path and that Phase 2 is next.

### Draft review file template

Use this structure so comments can be parsed for Phase 3. **Include the "Files changed" section** with the exact list from the PR; only add comments for files in that list. Each comment block has: file, line, severity, body.

```markdown
# PR #<number> — Review draft

**Repo:** owner/repo  
**PR:** <number>  
**Do not modify project source files.** Edit this file to add/remove/change comments, then ask the agent to post the review.

---

## Files changed (review scope)

Only comments for these files will be posted. Do not add comments for other files.

- path/from/repo/root/file1.ext
- path/from/repo/root/file2.ext

---

## Comments

<!-- One block per comment. Keep the "Comment" block format for parsing. Every File must be in the Files changed list above. -->

### Comment 1
- **File:** path/from/repo/root/file.ext
- **Line:** <line number>
- **Severity:** Critical | Suggestion | Nice to have
- **Body:** Short actionable comment. Suggest fix if applicable.

### Comment 2
- **File:** ...
- **Line:** ...
- **Severity:** ...
- **Body:** ...

---

## Summary (optional)
- Critical: N | Suggestion: N | Nice to have: N
```

---

## Phase 2 — User reviews and edits

1. **Prompt the user**
   - Tell the user: “I created a draft review at `<path>`. Please open it, review the comments, and add, remove, or edit any you want. When you’re done, reply **post review** (or confirm you want to post) and I’ll add these comments to the PR.”

2. **Wait for confirmation**
   - Do not post comments until the user explicitly confirms (e.g. “post review”, “post comments”, “add them to the PR”, “yes post”).
   - If the user edits the file and then confirms, re-read the draft file and use the updated comments for Phase 3.

---

## Phase 3 — Post comments to the PR

1. **Parse the draft file**
   - Read the draft review file. If it contains a **"Files changed (review scope)"** section (list of paths under ), use it as the allowlist: only post comments whose **File** is in that list. Skip or drop comments for files not in the list so posting does not fail.
   - Parse each “Comment N” block: **File**, **Line**, **Severity**, **Body**. Skip blocks that are invalid or empty. If an allowlist exists, skip comments whose path is not in the allowlist.

2. **Post comments (choose one; prefer script to avoid manual payload files)**
   - **Option A — Script (recommended, no manual payload):** Run the project script with the **absolute path** to the draft review file. The script parses the draft, fetches the PR head commit from GitHub, and POSTs each comment. No `*-payload.json` or manual JSON is needed.
     - From the **cursor-notion-implementation** repo:  
       `node scripts/post-pr-review-comments.js <absolute-path-to-draft-review.md>`
     - Example (draft in another repo):  
       `node /path/to/cursor-notion-implementation/scripts/post-pr-review-comments.js /path/to/other-repo/docs/pr-reviews/PR-12-review.md`
     - The script reads the GitHub token from Cursor MCP config (`~/.cursor/mcp.json`). Require that GitHub MCP is already connected (user must be logged in).
     - If the script fails (e.g. token missing, PR not found), tell the user to check GitHub connection and path to the draft file. See `docs/post-pr-review-comments.md` for details.
   - **Option B — GitHub MCP:** Use the GitHub MCP to create a **pull request review comment** (or equivalent) for each parsed comment: `path`, `line` (and `side` if required), comment text = **Severity** + **Body** (e.g. "**[Severity]** Body"). If the MCP uses a single "create review" with multiple comments, submit one review containing all parsed comments at their correct file/line.
   - If a comment fails (e.g. path or line could not be resolved), log the error and continue with the rest; report failures to the user.

3. **Confirm**
   - Tell the user how many comments were posted and that the PR was not modified (comments only). If any failed, list them.

---

## Tool reference (GitHub MCP)

| Purpose              | Use GitHub MCP (server: `user-github`). Check available tools for:        |
|----------------------|----------------------------------------------------------------------------|
| Auth                 | **get_me** — confirm user is logged in.                                    |
| PR details           | Get pull request by owner, repo, pull number.                              |
| Changed files / diff | List PR files or get diff/contents for the PR ref.                         |
| Post comments        | Create pull request review comment(s) or submit review with comments. **Or** run `scripts/post-pr-review-comments.js <path-to-draft-review.md>` to post from draft file (no manual payload). |
| **Do not use**       | Any merge, squash and merge, or approve-and-merge tool. This workflow only adds comments. |

Use the tool names and parameters provided by the MCP. If a tool is missing (e.g. no “create review comment”), tell the user which capability is required and do not claim success.

---

## Checklist (agent)

- [ ] Phase 1: get_me → resolve repo + PR number → **get list of changed files from GitHub first** → fetch diff/contents **only for those files** → load backend-reviewer and frontend-reviewer skills → review **changed files only** → write **one** draft .md with **Files changed** section and comments only for files in that list.
- [ ] Phase 2: Ask user to review/edit draft; wait for explicit “post review” (or equivalent).
- [ ] Phase 3: Parse draft → post each comment to PR at correct file/line; report count and any failures.
- [ ] Never modify project source files; only create the draft file and add PR comments.
- [ ] **Never merge the PR**—do not call merge, squash and merge, or approve-and-merge.
