# Handoff

Compact the session into a handoff document for the next agent or machine.

## Prerequisites

- User wants to end session, switch machines, or continue later

## Workflow

1. Read `.cursor/skills/handoff/SKILL.md` and follow its flow
2. Launch **`artifact-collector`** subagent in parallel at start
3. Merge collector output into handoff doc (reference paths — do not paste full diffs)
4. Write 5-section markdown to OS temp dir (`mktemp -t handoff-XXXXXX.md`) or user path
5. Redact secrets and PII
6. Suggest 3–5 kit skills for next session

## Subagents

| When | Subagent |
|------|----------|
| On invoke | `artifact-collector` |

## Stop rules

- Propose handoff first if user stops mid-task implicitly — never write silently
- Max 5 skills in section 4
- No pasted commit bodies or plan content — link paths only
