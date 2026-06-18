# Onboard

Generate codebase onboarding documentation for engineers or contractors.

## Prerequisites

- Repository checked out locally

## Workflow

1. Read `.cursor/skills/codebase-onboarding/SKILL.md` and follow its workflow
2. Launch **`repo-explorer`** and **`command-validator`** subagents in parallel
3. Merge structure, stack, and validated commands into onboarding doc
4. Use the skill document template (What it does → Troubleshooting)
5. Validate all setup commands are copy-pasteable

## Subagents

| When | Subagent |
|------|----------|
| Before drafting doc | `repo-explorer`, `command-validator` |

## Stop rules

- Do not invent install/dev/test/build commands — use validator output only
- Match audience depth (junior / senior / contractor) to user request
