#!/usr/bin/env node
"use strict";

/**
 * Create and update tickets (items) in a GitHub Projects v2 board via GraphQL API.
 * Uses the same GitHub token as Cursor MCP (~/.cursor/mcp.json).
 *
 * Commands:
 *   get-project-id   Resolve project node ID (required for other commands).
 *   list-fields      List project fields (e.g. Status) and their option IDs.
 *   list-items       List project items (issues, draft issues, PRs).
 *   add-draft        Add a draft issue to the project.
 *   add-issue       Add an existing repo issue to the project.
 *   update-field    Update a project item field (Status, text, number, date).
 *
 * Requires: GitHub token with `project` scope in ~/.cursor/mcp.json.
 *
 * Examples:
 *   node github-project-tickets.js get-project-id --org Buyninja --project 2
 *   node github-project-tickets.js list-fields --org Buyninja --project 2
 *   node github-project-tickets.js add-draft --org Buyninja --project 2 --title "New task" --body "Description"
 *   node github-project-tickets.js add-issue --org Buyninja --project 2 --repo Buyninja/buynin-cms --issue 42
 *   Or omit --org/--project when .cursor/github-project.json exists (set via Connect command).
 */

const fs = require("fs");
const path = require("path");
const https = require("https");

const mcpPath =
  process.env.CURSOR_MCP_JSON ||
  path.join(process.env.HOME || process.env.USERPROFILE || "/tmp", ".cursor", "mcp.json");

const GITHUB_PROJECT_CONFIG = ".cursor/github-project.json";

/** Resolve path to .cursor/github-project.json from cwd or parent dirs. */
function findProjectConfigPath() {
  let dir = process.cwd();
  const root = path.parse(dir).root;
  while (dir && dir !== path.dirname(dir)) {
    const candidate = path.join(dir, GITHUB_PROJECT_CONFIG);
    if (fs.existsSync(candidate)) return candidate;
    dir = path.dirname(dir);
    if (dir === root) break;
  }
  return null;
}

/** Read default org and project from .cursor/github-project.json. Returns { org, project } or null. */
function readProjectConfig() {
  const configPath = process.env.CURSOR_GITHUB_PROJECT_JSON || findProjectConfigPath();
  if (!configPath) return null;
  try {
    const raw = fs.readFileSync(configPath, "utf8");
    const data = JSON.parse(raw);
    const org = data.org && String(data.org).trim();
    const project = data.project != null ? Number(data.project) : NaN;
    if (org && !Number.isNaN(project)) return { org, project };
  } catch (_) {
    /* ignore */
  }
  return null;
}

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

function parseArgs() {
  const args = process.argv.slice(2);
  const command = args[0];
  if (!command) {
    console.error("Usage: node github-project-tickets.js <command> [options]");
    console.error("Commands: get-project-id | list-fields | list-items | add-draft | add-issue | update-field");
    process.exit(1);
  }
  const options = {};
  for (let i = 1; i < args.length; i++) {
    if (args[i].startsWith("--") && args[i + 1] !== undefined) {
      const key = args[i].slice(2).replace(/-/g, "_");
      options[key] = args[++i];
    }
  }
  return { command, options };
}

function graphql(token, query, variables = {}) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ query, variables });
    const req = https.request(
      {
        hostname: "api.github.com",
        path: "/graphql",
        method: "POST",
        headers: {
          Accept: "application/vnd.github+json",
          Authorization: "Bearer " + token,
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(body, "utf8"),
          "User-Agent": "github-project-tickets",
        },
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try {
            const json = JSON.parse(data);
            if (json.errors && json.errors.length > 0) {
              reject(new Error(json.errors.map((e) => e.message).join("; ")));
              return;
            }
            if (res.statusCode >= 400) {
              reject(new Error(`HTTP ${res.statusCode}: ${data.slice(0, 300)}`));
              return;
            }
            resolve(json.data);
          } catch (e) {
            reject(new Error("Invalid JSON: " + data.slice(0, 200)));
          }
        });
      }
    );
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

function restGet(token, pathname) {
  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: "api.github.com",
        path: pathname,
        method: "GET",
        headers: {
          Accept: "application/vnd.github+json",
          Authorization: "Bearer " + token,
          "User-Agent": "github-project-tickets",
        },
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try {
            const json = JSON.parse(data);
            if (res.statusCode >= 400) {
              reject(new Error(`GET ${pathname}: ${res.statusCode} ${json.message || data.slice(0, 200)}`));
              return;
            }
            resolve(json);
          } catch {
            reject(new Error("Invalid JSON: " + data.slice(0, 200)));
          }
        });
      }
    );
    req.on("error", reject);
    req.end();
  });
}

async function getProjectId(token, org, projectNumber) {
  const data = await graphql(token, `
    query($org: String!, $number: Int!) {
      organization(login: $org) {
        projectV2(number: $number) {
          id
          title
        }
      }
    }
  `, { org, number: parseInt(projectNumber, 10) });
  const project = data?.organization?.projectV2;
  if (!project?.id) {
    throw new Error("Project not found. Check org and project number.");
  }
  return project;
}

async function listFields(token, projectId) {
  const data = await graphql(token, `
    query($id: ID!) {
      node(id: $id) {
        ... on ProjectV2 {
          fields(first: 30) {
            nodes {
              ... on ProjectV2FieldCommon { id name }
              ... on ProjectV2SingleSelectField {
                options { id name }
              }
            }
          }
        }
      }
    }
  `, { id: projectId });
  const fields = data?.node?.fields?.nodes ?? [];
  return fields;
}

async function listItems(token, projectId, first = 20) {
  const data = await graphql(token, `
    query($id: ID!, $first: Int!) {
      node(id: $id) {
        ... on ProjectV2 {
          items(first: $first) {
            nodes {
              id
              content {
                ... on DraftIssue { title body }
                ... on Issue { number title url }
                ... on PullRequest { number title url }
              }
              fieldValues(first: 15) {
                nodes {
                  ... on ProjectV2ItemFieldSingleSelectValue { name field { ... on ProjectV2FieldCommon { name } } }
                  ... on ProjectV2ItemFieldTextValue { text field { ... on ProjectV2FieldCommon { name } } }
                  ... on ProjectV2ItemFieldNumberValue { number field { ... on ProjectV2FieldCommon { name } } }
                  ... on ProjectV2ItemFieldDateValue { date field { ... on ProjectV2FieldCommon { name } } }
                }
              }
            }
          }
        }
      }
    }
  `, { id: projectId, first });
  const items = data?.node?.items?.nodes ?? [];
  return items;
}

async function getIssueNodeId(token, owner, repo, issueNumber) {
  const issue = await restGet(token, `/repos/${owner}/${repo}/issues/${issueNumber}`);
  if (!issue.node_id) {
    throw new Error("Issue not found or no node_id in response.");
  }
  return issue.node_id;
}

async function addProjectV2ItemById(token, projectId, contentId) {
  const data = await graphql(token, `
    mutation($input: AddProjectV2ItemByIdInput!) {
      addProjectV2ItemById(input: $input) {
        item { id }
      }
    }
  `, { input: { projectId, contentId } });
  return data?.addProjectV2ItemById?.item?.id;
}

async function addProjectV2DraftIssue(token, projectId, title, body) {
  const data = await graphql(token, `
    mutation($input: AddProjectV2DraftIssueInput!) {
      addProjectV2DraftIssue(input: $input) {
        projectItem { id }
      }
    }
  `, { input: { projectId, title, body: body || "" } });
  return data?.addProjectV2DraftIssue?.projectItem?.id;
}

async function updateProjectV2ItemFieldValue(token, projectId, itemId, fieldId, value) {
  await graphql(token, `
    mutation($input: UpdateProjectV2ItemFieldValueInput!) {
      updateProjectV2ItemFieldValue(input: $input) {
        projectV2Item { id }
      }
    }
  `, { input: { projectId, itemId, fieldId, value } });
}

async function main() {
  const { command, options } = parseArgs();
  let org = options.org;
  let projectNum = options.project;
  if ((!org || !projectNum) && (command === "get-project-id" || command === "list-fields" || command === "list-items" || command === "add-draft" || command === "add-issue" || command === "update-field")) {
    const config = readProjectConfig();
    if (config) {
      org = org || config.org;
      projectNum = projectNum || String(config.project);
    }
  }
  const token = readMcpToken();

  const requireProject = () => {
    if (!org || !projectNum) {
      console.error("Required: --org <org> --project <number> (e.g. --org Buyninja --project 2)");
      console.error("Or set .cursor/github-project.json (run the Connect command and specify the project board).");
      process.exit(1);
    }
  };

  switch (command) {
    case "get-project-id": {
      requireProject();
      const project = await getProjectId(token, org, projectNum);
      console.log("Project ID:", project.id);
      console.log("Title:", project.title);
      break;
    }

    case "list-fields": {
      requireProject();
      const proj = await getProjectId(token, org, projectNum);
      const fields = await listFields(token, proj.id);
      console.log("Fields for project:", proj.title);
      for (const f of fields) {
        const opts = f.options ? ` [options: ${f.options.map((o) => `${o.name}=${o.id}`).join(", ")}]` : "";
        console.log(`  ${f.name}: ${f.id}${opts}`);
      }
      break;
    }

    case "list-items": {
      requireProject();
      const projForItems = await getProjectId(token, org, projectNum);
      const first = parseInt(options.first || "20", 10);
      const items = await listItems(token, projForItems.id, first);
      console.log("Items (first " + first + "):");
      for (const item of items) {
        const content = item.content;
        const label = content?.title ?? content?.number ?? item.id;
        const type = content?.body !== undefined ? "DraftIssue" : content?.number ? "Issue/PR" : "Item";
        console.log(`  ${item.id}  ${type}: ${label}`);
      }
      break;
    }

    case "add-draft": {
      requireProject();
      const title = options.title;
      if (!title) {
        console.error("Required: --title \"Your title\"");
        process.exit(1);
      }
      const projDraft = await getProjectId(token, org, projectNum);
      const itemId = await addProjectV2DraftIssue(token, projDraft.id, title, options.body || "");
      console.log("Created draft issue. Project item ID:", itemId);
      break;
    }

    case "add-issue": {
      requireProject();
      const repo = options.repo; // owner/repo
      const issueNum = options.issue;
      if (!repo || !issueNum) {
        console.error("Required: --repo owner/repo --issue <number>");
        process.exit(1);
      }
      const [owner, repoName] = repo.split("/");
      if (!owner || !repoName) {
        console.error("--repo must be owner/repo (e.g. Buyninja/buynin-cms)");
        process.exit(1);
      }
      const projIssue = await getProjectId(token, org, projectNum);
      const contentId = await getIssueNodeId(token, owner, repoName, issueNum);
      const newItemId = await addProjectV2ItemById(token, projIssue.id, contentId);
      console.log("Added issue to project. Project item ID:", newItemId);
      break;
    }

    case "update-field": {
      requireProject();
      const itemId = options.item_id;
      const fieldId = options.field_id;
      const singleSelectOptionId = options.single_select_option_id;
      const textVal = options.text;
      const numberVal = options.number;
      const dateVal = options.date;

      if (!itemId || !fieldId) {
        console.error("Required: --item-id <id> --field-id <id> and one of: --single-select-option-id, --text, --number, --date");
        process.exit(1);
      }

      let value;
      if (singleSelectOptionId) {
        value = { singleSelectOptionId };
      } else if (textVal !== undefined) {
        value = { text: String(textVal) };
      } else if (numberVal !== undefined) {
        value = { number: parseFloat(numberVal) };
      } else if (dateVal !== undefined) {
        value = { date: dateVal };
      } else {
        console.error("Provide one of: --single-select-option-id <id>, --text \"...\", --number <n>, --date \"YYYY-MM-DD\"");
        process.exit(1);
      }

      const projUpdate = await getProjectId(token, org, projectNum);
      await updateProjectV2ItemFieldValue(token, projUpdate.id, itemId, fieldId, value);
      console.log("Updated field for item", itemId);
      break;
    }

    default: {
      console.error("Unknown command:", command);
      console.error("Commands: get-project-id | list-fields | list-items | add-draft | add-issue | update-field");
      process.exit(1);
    }
  }
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
