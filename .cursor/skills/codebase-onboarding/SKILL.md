---
name: "codebase-onboarding"
description: "Analyze a codebase and generate onboarding documentation for engineers, tech leads, and contractors. Fast fact-gathering and repeatable onboarding outputs. Use when onboarding a new engineer, writing architecture-overview docs for a new project, or producing tech-lead briefings for unfamiliar repos."
---

# Codebase Onboarding

Analyze repo; produce onboarding doc for engineers, tech leads, or contractors.

## When to use

New team member, stale docs after refactor, internal handoff, standardized service onboarding.

## Workflow

1. **Structure** — top-level dirs, entry points (`package.json`, `*.csproj`, `go.mod`, `pyproject.toml`)
2. **Stack** — languages, frameworks, package managers from manifests/lockfiles
3. **Commands** — real `install` / `dev` / `test` / `build` from scripts, Makefile, CI
4. **Config** — `.env.example`, infra manifests
5. **Draft doc** from template below; validate commands are copy-pasteable

## Document template

```markdown
# <Project> — Onboarding
## 1. What it does
## 2. Stack & architecture
## 3. Repo map (dirs → responsibility)
## 4. Local setup (prereqs → install → env → run)
## 5. Common tasks (test, feature, migration)
## 6. Key decisions & gotchas
## 7. Troubleshooting
```

**Audience depth:** Junior → setup + guardrails · Senior → architecture + ops · Contractor → scope + integration boundaries.

## Pitfalls

Unvalidated setup commands; architecture overload for contractors; missing troubleshooting; docs drift from repo.

Update onboarding in the same PR as behavior changes.

## Subagent delegation

- **Before Step 5 (draft doc):** Launch `repo-explorer` and `command-validator` in parallel; use validated commands only.
