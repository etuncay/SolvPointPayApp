---
name: project-intake
description: >-
  Generic requirement gathering before plan or greenfield work. Load config defaults,
  infer repo+prompt, AskQuestion for missing required fields, save brief.
---

# Project intake (generic)

Apply when starting work **without** an approved brief in `.cursor/plans/_briefs/`. If hook routed `[route:prompt-refinement]` first, run [prompt-refinement](../prompt-refinement/SKILL.md) and get approval before this skill.

**Config:** [project.defaults.yaml](../../config/project.defaults.yaml)  
**Field catalog:** [project.intake-fields.yaml](../../config/project.intake-fields.yaml)  
**Option IDs:** [intake-canonical-options.md](../../plans/_shared/intake-canonical-options.md)

## Triggers

Hook `INTAKE` message, greenfield/plan/design/scaffold — **not** implement-plan, scoped fix, or `skip intake`.

## Flow

```text
1. Load project.defaults.yaml → locale + defaults
2. Load project.intake-fields.yaml → AskQuestion rounds + required_when
3. Infer: prompt > repo_signals > config defaults
4. AskQuestion — missing fields only (batch per round, max intake.max_ask_rounds)
5. Save .cursor/plans/_briefs/{slug}.brief.md
6. Route: design-intake | implementation-plan | module-scaffolder
7. Create plan if deliverable requires it
```

## Step 1 — Config keys

| Path | Use |
|------|-----|
| `locale.*` | Chat, plan, AskQuestion label language |
| `architecture.*` / `defaults.*` | Pre-fill brief fields |
| `intake.required_before_plan` / `required_before_code` | Blockers before plan/code |
| `repo_signals` | Repo inference |
| `fields[]` in intake-fields | Round + conditional AskQuestion |

## Step 2 — AskQuestion

- Tool: `AskQuestion` only; labels from `locale.ask_question_labels`
- Skip fields already set; use `fields[].required_when` for conditionals
- Rounds defined in `project.intake-fields.yaml` (round 1/2/3)

## Step 3 — Save brief & route

Template: [project-brief.template.md](../../plans/_templates/project-brief.template.md)  
Source column: `prompt` | `inferred` | `config` | `user-mc`

| work_type | Next skill |
|-----------|------------|
| design-only | design-intake |
| plan / greenfield / new-feature | implementation-plan |
| scaffold | module-scaffolder |

Do not write code before `required_before_code` fields are set.
