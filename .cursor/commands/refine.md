# Refine prompt

Clarify and expand the user's prompt before intake or planning.

## Prerequisites

- None — works on the current prompt in chat

## Workflow

1. Read `.cursor/skills/prompt-refinement/SKILL.md` and follow its flow
2. Read hook context if present (`[Intent:…]`, `[after-refine:…]`)
3. Infer goal, scope, constraints, verification from prompt + repo signals
4. AskQuestion only for blocking ambiguities (max 1 round)
5. Present refined prompt template in `locale.chat` from `.cursor/config/project.defaults.yaml`
6. **Wait for explicit user approval** — do not write code, brief, or plan yet
7. On approval, proceed to skill in `[after-refine:…]` tag or infer from intent

## Subagents

None.

## Stop rules

- Do not skip approval
- Do not write brief or plan in this command
- Respect `skip refinement` if user adds it after starting
