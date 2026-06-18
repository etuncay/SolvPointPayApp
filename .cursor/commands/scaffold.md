# Scaffold module

Create a feature module skeleton from an approved brief.

## Prerequisites

- Approved brief at `.cursor/plans/_briefs/{slug}.brief.md` with stack decisions
- If missing, run `/intake` first

## Workflow

1. Read `.cursor/skills/module-scaffolder/SKILL.md` and follow its flow
2. Launch **`brief-validator`** subagent — abort if plan/code blockers exist
3. Launch **`repo-explorer`** subagent to match existing repo layout before generating paths
4. Confirm module slug (kebab-case, ASCII) with user if unclear
5. Create files per brief stack; wire routes and data layer
6. Report file tree in English

## Subagents

| When | Subagent |
|------|----------|
| Before scaffolding | `brief-validator`, `repo-explorer` |

## Stop rules

- Do not scaffold without brief stack decisions
- Match explorer-suggested paths to repo conventions
- Do not assume monorepo layout unless brief + repo confirm it
