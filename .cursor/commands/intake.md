# Start intake

Gather requirements and save an approved project brief.

## Prerequisites

- No approved brief required to start (this command creates one)
- Skip if user explicitly wants `skip intake`

## Workflow

1. Read `.cursor/skills/project-intake/SKILL.md` and follow its flow
2. Load `.cursor/config/project.defaults.yaml` and `.cursor/config/project.intake-fields.yaml`
3. Launch **`repo-explorer`** subagent in parallel during infer step to validate repo signals
4. AskQuestion for missing required fields (max `intake.max_ask_rounds`)
5. Save brief to `.cursor/plans/_briefs/{slug}.brief.md`
6. Launch **`brief-validator`** subagent after saving brief
7. Fix blockers before routing to plan, design, or scaffold skill

## Subagents

| When | Subagent |
|------|----------|
| During infer | `repo-explorer` |
| After brief saved | `brief-validator` |

## Stop rules

- Do not write code before `required_before_code` fields are set
- Do not route to plan if `brief-validator` reports INCOMPLETE for plan blockers
