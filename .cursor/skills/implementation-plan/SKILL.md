---
name: implementation-plan
description: >-
  Write stack-agnostic implementation plans from brief + specs into .cursor/plans/.
  Triggers: plan, create plan, implementation plan. Not for implement the plan.
---

# Implementation plan authoring

Produce plan files only — no application code unless user also requests implement.

**Output locale:** [output-locale.md](../../plans/_shared/output-locale.md) — plan **English**; code refs **English**.

## Triggers

- plan, create plan, implementation plan, write plan
- brief.deliverable ∈ plan-only, plan-then-code
- **Not:** implement the plan, execute plan

## Prerequisites

1. Approved brief at `.cursor/plans/_briefs/{slug}.brief.md` — if missing, run [project-intake](../project-intake/SKILL.md) first
2. Read specs if user attached `docs/` or `@file`

## Flow

1. Read brief — all stack/scope/data decisions come from brief, not assumptions
2. Screen/feature inventory from spec or user prompt
3. Gap analysis vs existing codebase (Complete / Missing / Partial)
4. Write plan from [feature-plan.template.md](../../plans/_templates/feature-plan.template.md)
5. **UI section** — conditional on brief:
   - `shadcn-radix` + `tailwind` → page tree + shadcn components
   - `bootstrap` → Bootstrap layout mapping
   - `vanilla-js-no-framework` → HTML/CSS/JS file tree
6. **Data section** — per brief.data_source
7. **Todos** — 6–9 items; start `status: pending`
8. Save path:
   - Feature: `.cursor/plans/features/{slug}.plan.md`
   - Design-only: `.cursor/plans/design-{slug}.plan.md`
9. Report path + todo summary in **English**

## Todo order

1. brief
2. scaffold
3. ui-shell (cancel if no UI)
4. data-layer
5. feature-core
6. i18n (cancel if defer)
7. verify (+ browser scenarios if brief.verification = browser-mcp)

## Plan vs implement

| Mode | Plan file |
|------|-----------|
| Create | New or overwrite; English body |
| Implement | Read-only body; only todos[].status |

Do not assume monorepo layout, product-specific UI DSL, or fixed app folder names unless brief and repo confirm them.

## Subagent delegation

- **Before Step 3 (gap analysis):** Launch `repo-explorer` in parallel; merge its gap table into the plan.
- **Before Step 9 (present to user):** Launch `plan-reviewer`; fix critical issues before sharing the plan.
