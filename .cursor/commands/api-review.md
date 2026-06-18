# API review

Review REST/OpenAPI design for consistency, breaking changes, and security.

## Prerequisites

- OpenAPI spec or API endpoint changes in scope
- For breaking-change diff: baseline spec path or git ref if available

## Workflow

1. Read `.cursor/skills/api-design-reviewer/SKILL.md` and follow review checklist
2. Launch **`openapi-linter`** subagent for spectral lint and oasdiff breaking detection
3. Produce design scorecard (consistency, documentation, security, usability, performance)
4. Flag breaking vs safe changes per skill table
5. List anti-patterns and actionable fixes

## Subagents

| When | Subagent |
|------|----------|
| Before design review | `openapi-linter` |

## Stop rules

- Fail published API reviews on breaking changes without version bump recommendation
- Do not invent endpoints not present in spec or diff
