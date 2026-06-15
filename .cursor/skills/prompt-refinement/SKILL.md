---
name: prompt-refinement
description: >-
  Clarify and expand vague greenfield/plan/design/scaffold prompts before intake or
  planning. Present a structured refined prompt, get user approval, then route to the
  next skill. Triggers via hook [route:prompt-refinement]. Not for fix/refactor/implement-plan.
---

# Prompt refinement

Run **before** [project-intake](../project-intake/SKILL.md) or downstream plan/design skills when the hook routes `[route:prompt-refinement]`.

**Config:** `intake.prompt_refinement` in [project.defaults.yaml](../../config/project.defaults.yaml) (`auto` | `on-request` | `off`).

## Triggers

Hook `PROMPT_REFINE` intent, or user says `prompt geliştir`, `refine prompt`, `netleştir`.

**Skip:** `skip refinement`, `refinement atla`, `implement the plan`, fix/refactor, or prompt already marked refined (`[refined-prompt]` or `## Anladığım hedef` / `## Goal` sections).

## Flow

```text
1. Read original user prompt + hook context ([Intent:…], [after-refine:…])
2. Infer goal, scope, constraints, verification from prompt + repo signals
3. AskQuestion — only for blocking ambiguities (max 1 round)
4. Present refined prompt (template below) in locale.chat language
5. Wait for explicit approval — do NOT write code, brief, or plan yet
6. On approval → proceed to skill in [after-refine:…] tag (or infer from intent)
```

## Refined prompt template

Use `locale.chat` from config for section titles when Turkish; English titles below are acceptable for English chat.

```markdown
## Goal
<one clear sentence>

## Scope
- In: …
- Out: …

## Assumptions
- …

## Verification
- …

## Suggested route
[after-refine:<skill-id>]

[refined-prompt]
```

## Approval signals

Proceed when user says: `onay`, `onayla`, `devam`, `approved`, `looks good`, `tamam`, `ilerle`, or edits the template and resubmits.

If user rejects or edits heavily, revise once, then ask again. After two rounds without approval, ask whether to `skip refinement` and continue with original prompt.

## After approval

| after-refine tag | Next skill |
|------------------|------------|
| `project-intake` | [project-intake](../project-intake/SKILL.md) |
| `implementation-plan` | [implementation-plan](../implementation-plan/SKILL.md) |
| `design-intake` | [design-intake](../design-intake/SKILL.md) |
| `module-scaffolder` | [module-scaffolder](../module-scaffolder/SKILL.md) |

Do not skip intake when brief is required — refinement replaces neither brief nor plan approval.
