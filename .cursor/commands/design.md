# Design intake

UI and visual design workflow — brief, design plan, optional implement.

## Prerequisites

- Brief fields from project-intake or explicit user answers
- If no brief exists, run `/intake` or merge design fields into brief first

## Workflow

1. Read `.cursor/skills/design-intake/SKILL.md` and follow its flow
2. Launch **`repo-explorer`** subagent to find existing theme/token patterns
3. AskQuestion (one round) for missing design fields
4. Save or update `.cursor/plans/_briefs/{slug}.brief.md`
5. Create `.cursor/plans/design-{slug}.plan.md`
6. Launch **`plan-reviewer`** subagent before presenting design plan

## Subagents

| When | Subagent |
|------|----------|
| Before design plan | `repo-explorer` |
| Before presenting plan | `plan-reviewer` |

## Stop rules

- Do not apply to pure backend or test-only work
- Get plan approval before implement unless scope is `implement-fast`
