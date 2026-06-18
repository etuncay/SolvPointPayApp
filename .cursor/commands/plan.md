# Create implementation plan

Write an implementation plan from an approved brief.

## Prerequisites

- Approved brief at `.cursor/plans/_briefs/{slug}.brief.md`
- If missing, run `/intake` or project-intake skill first

## Workflow

1. Read `.cursor/skills/implementation-plan/SKILL.md` and follow its flow
2. Launch **`repo-explorer`** subagent in parallel before gap analysis (Step 3)
3. Merge explorer gap table into the plan
4. Write plan to `.cursor/plans/features/{slug}.plan.md` using feature-plan template
5. Launch **`plan-reviewer`** subagent before presenting plan to user
6. Fix critical issues from reviewer report
7. Report plan path and todo summary in English

## Subagents

| When | Subagent |
|------|----------|
| Before gap analysis | `repo-explorer` |
| Before presenting to user | `plan-reviewer` |

## Stop rules

- Do not write application code unless user also requests implement
- Do not present plan with unresolved critical reviewer issues
