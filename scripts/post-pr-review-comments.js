#!/usr/bin/env node
"use strict";

/**
 * Post PR review comments from a draft review .md file.
 * Parses the draft (Repo, PR, Files changed, Comment blocks), fetches the PR head commit from GitHub,
 * and POSTs each comment to the GitHub API. Only comments for files listed in "Files changed (review scope)"
 * are posted, so posting does not fail for paths not in the PR. No manual payload JSON file is required.
 *
 * Usage: node post-pr-review-comments.js <path-to-PR-N-review.md>
 * Example: node post-pr-review-comments.js /path/to/docs/pr-reviews/PR-12-review.md
 *
 * Requires: GitHub token in Cursor MCP config (~/.cursor/mcp.json).
 */

const fs = require("fs");
const path = require("path");
const https = require("https");

const REVIEW_FILE = process.argv[2];
if (!REVIEW_FILE) {
  console.error("Usage: node post-pr-review-comments.js <path-to-PR-N-review.md>");
  process.exit(1);
}

const mcpPath =
  process.env.CURSOR_MCP_JSON ||
  path.join(process.env.HOME || process.env.USERPROFILE || "/tmp", ".cursor", "mcp.json");

function readMcpToken() {
  try {
    const raw = fs.readFileSync(mcpPath, "utf8");
    const mcp = JSON.parse(raw);
    const token = mcp.mcpServers?.github?.headers?.Authorization;
    if (!token) {
      console.error("No GitHub token in mcp.json (mcpServers.github.headers.Authorization)");
      process.exit(1);
    }
    return token.replace(/^token\s+/i, "").replace(/^Bearer\s+/i, "");
  } catch (e) {
    console.error("Failed to read MCP config:", e.message);
    process.exit(1);
  }
}

function parseReviewFile(filePath) {
  const absPath = path.isAbsolute(filePath) ? filePath : path.resolve(process.cwd(), filePath);
  let content;
  try {
    content = fs.readFileSync(absPath, "utf8");
  } catch (e) {
    console.error("Failed to read review file:", e.message);
    process.exit(1);
  }

  const repoMatch = content.match(/\*\*Repo:\*\*\s*([^\s]+)/);
  const prMatch = content.match(/\*\*PR:\*\*\s*(\d+)/);
  if (!repoMatch || !prMatch) {
    console.error("Review file must contain **Repo:** owner/repo and **PR:** <number>");
    process.exit(1);
  }
  const repo = repoMatch[1].trim();
  const prNumber = prMatch[1].trim();
  const [owner, repoName] = repo.split("/");
  if (!owner || !repoName) {
    console.error("Repo must be owner/repo (e.g. Buyninja/buynin-frontend)");
    process.exit(1);
  }

  /** @type {Set<string> | null} If present, only post comments whose path is in this set. */
  let allowedPaths = null;
  const filesChangedSection = content.match(/## Files changed \(review scope\)\s+[\s\S]*?(?=\n---|\n## Comments|$)/i);
  if (filesChangedSection) {
    const list = filesChangedSection[0].match(/^\s*-\s+(.+)$/gm) || [];
    allowedPaths = new Set(list.map((line) => line.replace(/^\s*-\s+/, "").trim()).filter(Boolean));
  }

  const comments = [];
  const blockRegex = /### Comment \d+\s*\n- \*\*File:\*\*\s*(.+?)\s*\n- \*\*Line:\*\*\s*(\d+)\s*\n- \*\*Severity:\*\*\s*(.+?)\s*\n- \*\*Body:\*\*\s*([\s\S]*?)(?=\n### Comment \d+|\n---|\n## Summary|$)/g;
  let m;
  while ((m = blockRegex.exec(content)) !== null) {
    const file = m[1].trim();
    const line = parseInt(m[2], 10);
    const severity = m[3].trim();
    const body = m[4].trim();
    if (!file || Number.isNaN(line)) continue;
    comments.push({
      path: file,
      line,
      body: `**${severity}** ${body}`,
    });
  }

  const filtered = allowedPaths
    ? comments.filter((c) => allowedPaths.has(c.path))
    : comments;
  const skipped = comments.length - filtered.length;
  if (skipped > 0 && allowedPaths) {
    const skippedPaths = comments.filter((c) => !allowedPaths.has(c.path)).map((c) => c.path);
    console.warn(`Skipped ${skipped} comment(s) for files not in "Files changed" list: ${[...new Set(skippedPaths)].join(", ")}`);
  }

  return { owner, repo: repoName, prNumber, comments: filtered, allowedPaths };
}

function get(pathname, token) {
  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: "api.github.com",
        path: pathname,
        method: "GET",
        headers: {
          Accept: "application/vnd.github.v3+json",
          Authorization: "Bearer " + token,
          "User-Agent": "pr-review-post-comments",
        },
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            try {
              resolve(JSON.parse(data));
            } catch {
              resolve(data);
            }
          } else {
            reject(new Error(`GET ${pathname}: ${res.statusCode} ${data.slice(0, 200)}`));
          }
        });
      }
    );
    req.on("error", reject);
    req.end();
  });
}

function postComment(owner, repo, prNumber, token, commitId, comment) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      commit_id: commitId,
      path: comment.path,
      line: comment.line,
      body: comment.body,
      side: "RIGHT",
    });
    const pathname = `/repos/${owner}/${repo}/pulls/${prNumber}/comments`;
    const req = https.request(
      {
        hostname: "api.github.com",
        path: pathname,
        method: "POST",
        headers: {
          Accept: "application/vnd.github.v3+json",
          Authorization: "Bearer " + token,
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(body, "utf8"),
          "User-Agent": "pr-review-post-comments",
        },
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve();
          } else {
            reject(new Error(`${comment.path}:${comment.line} ${res.statusCode} ${data.slice(0, 200)}`));
          }
        });
      }
    );
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

async function main() {
  const token = readMcpToken();
  const { owner, repo, prNumber, comments } = parseReviewFile(REVIEW_FILE);

  if (comments.length === 0) {
    console.log("No comments to post (no valid Comment blocks in scope).");
    return;
  }

  const pr = await get(`/repos/${owner}/${repo}/pulls/${prNumber}`, token);
  const commitId = pr.head?.sha;
  if (!commitId) {
    console.error("Could not get PR head commit from GitHub.");
    process.exit(1);
  }

  console.log(`Posting ${comments.length} comment(s) to ${owner}/${repo} PR #${prNumber} (commit ${commitId.slice(0, 7)})...`);

  let done = 0;
  let failed = 0;
  for (let i = 0; i < comments.length; i++) {
    try {
      await postComment(owner, repo, prNumber, token, commitId, comments[i]);
      done++;
      console.log(`  Posted ${i + 1}/${comments.length} ${comments[i].path}:${comments[i].line}`);
    } catch (err) {
      failed++;
      console.error(`  Failed ${i + 1}/${comments.length} ${comments[i].path}:${comments[i].line} — ${err.message}`);
    }
  }

  console.log("\nDone:", done, "posted,", failed, "failed");
  if (failed > 0) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
