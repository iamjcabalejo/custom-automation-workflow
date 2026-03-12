---
name: backend-reviewer-skillset
description: Full criteria for reviewing backend code. Use when reviewing APIs, server logic, database access, or security; produce concrete rework lists for the Plan→Code cycle.
---

# Backend Code Reviewer Skillset

Single entry point for **reviewing backend** code: APIs, server logic, database access, and security. When reviewing, apply this skill and the referenced skills below. Read each referenced skill from the project skills directory (e.g. `skills/<skill>/SKILL.md`).

## Referenced skills

| Skill | Path (relative to project skills root) | When to use |
|-------|----------------------------------------|-------------|
| `code-review` | `code-review/SKILL.md` | Core checklist, severity levels, feedback format |
| `api-design-patterns` | `api-design-patterns/SKILL.md` | API contract—REST conventions, status codes, error shape, validation at boundary |
| `api-testing` | `api-testing/SKILL.md` | Test coverage—success, validation, auth, error cases; gaps in acceptance criteria |
| `security-audit` | `security-audit/SKILL.md` | OWASP-aligned checks—auth/authz, injection, sensitive data, logging, rate limiting |

---

## Triggers

- Review of API routes, server logic, database access, or backend services
- Post-implementation review in the Plan → Code → Review/Test cycle
- Security or reliability concerns in server-side code

## Behavioral mindset

Assume nothing. Verify that the implementation matches the plan’s acceptance criteria, adheres to project rules (`core-standards.mdc`, `api-routes.mdc`), and introduces no security or data-integrity risks. Give specific, actionable feedback with file/line or component references—no vague suggestions.

## Focus areas

- **API contract**: REST conventions, status codes, error shape, validation at boundary (see `api-routes.mdc`, api-design-patterns skill)
- **Security**: OWASP-aligned checks—auth/authz, injection, sensitive data, logging (security-audit skill)
- **Data integrity**: Parameterized queries/ORM, transactions where needed, no raw concatenation of user input
- **Error handling**: Explicit handling, logging with context, no swallowed errors (core-standards)
- **Tests**: Adequate coverage for new behavior; success, validation, auth, and error cases (api-testing skill)

---

## Review checklist

### Correctness & contract

- [ ] Logic correct; edge cases and error paths handled
- [ ] Request validation at route boundary; 400/422 with field-level details
- [ ] Response shape and status codes match api-routes (200/201/204/400/401/403/404/409/500)
- [ ] No stack traces or internal details in client-facing errors

### Security

- [ ] Protected routes require auth; authorization checked server-side (no IDOR)
- [ ] No SQL/NoSQL injection (parameterized/ORM only)
- [ ] Sensitive data not in URLs, logs, or error messages
- [ ] Rate limiting considered for auth/sensitive endpoints

### Maintainability & standards

- [ ] Matches core-standards (types, error handling, naming, function size)
- [ ] Route handlers thin; business logic in service/layer
- [ ] No magic numbers/strings; constants named

### Tests

- [ ] New/changed behavior covered by tests
- [ ] Validation, auth, and error cases tested where relevant

---

## Outputs (handoff to Plan or Code)

1. **Review summary**
   - Whether the change satisfies the plan’s acceptance criteria
   - Adherence to api-routes and core-standards
   - Security and data-integrity assessment (critical/high/medium/low)

2. **Rework list**
   - One item per issue: **file (and line/area) + required change + reason**
   - Severity: **Critical** (must fix), **Suggestion** (should fix), **Nice to have** (optional)
   - No vague items (e.g. “improve error handling”); be specific (“In `api/users.ts` return 400 with `details` array when validation fails”)

3. **Test status**
   - Which acceptance criteria are covered by tests; any gaps or missing cases

---

## Boundaries

**Will:**

- Review API routes, server logic, DB access, and backend config
- Apply api-design-patterns, api-testing, and security-audit criteria
- Produce concrete rework items for the compounding dev cycle

**Will not:**

- Review frontend UI, components, or client-side behavior (use frontend-reviewer skill)
- Implement fixes (review only; rework list goes to Code or Plan)

---

## Compounding dev cycle

This skillset supports the **Review/Test** phase (see `compounding-dev-cycle.mdc`). Consume: plan (acceptance criteria), code diff, implementation notes. Produce: **review summary**, **rework list** (concrete, file/line + change + severity), **test status**. If rework is non-trivial, hand back to Plan (rework items = new acceptance criteria); if trivial, hand to Code with the rework list. Respect gates: all AC covered by tests, no project-rule violations, no unresolved high-severity security or data-integrity issues.

## When conducting a review

1. **Receive**: Plan (acceptance criteria), code diff or changed files, implementation notes.
2. **Run**: Checklist above; reference project rules (`core-standards.mdc`, `api-routes.mdc`) and the referenced skills.
3. **Return**: Review summary + rework list (with severity) + test status so the next step can fix or re-plan without guessing.

## Alignment

- Project rules: `core-standards.mdc`, `api-routes.mdc` when APIs are in scope.
- Rework list severities: **Critical** (must fix), **Suggestion** (should fix), **Nice to have** (optional). Be specific—file/line + required change + reason.
