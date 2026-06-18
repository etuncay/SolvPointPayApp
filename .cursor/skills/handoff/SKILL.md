---
name: handoff
description: "Compact the current conversation into a handoff document so a fresh agent can continue. Writes a 5-section markdown doc to the OS temp dir (or a path the user gives), redacts secrets/PII, references existing artifacts instead of duplicating them, and suggests 3-5 skills for the next session. Use when the user says 'hand this off', 'handoff doc', 'summarize this for a new session', 'compact this conversation', 'I'm ending this session', 'pick this up later', or signals switching machines / stopping mid-task."
license: MIT
---

# Handoff

**Output locale:** [output-locale.md](../../plans/_shared/output-locale.md) — body → `locale.chat`; paths English.

Compact conversation for next session. **Reference artifacts — do not duplicate.** Redact secrets.

## When to use

Explicit: "hand this off", "handoff doc", "pick this up later", "ending session".

Implicit: user stops mid-task — **propose first**, never write silently.

## Output path

Default: `mktemp -t handoff-XXXXXX.md`. User path overrides. Edit latest file in place when continuing.

## Five sections (exact headers)

1. **Goal of next session**
2. **State of play** — done / in flight / blocked; link artifacts
3. **Open decisions** — what next agent must decide
4. **Skills to use** — 3–5 kit skills with one-line why each
5. **Artifacts** — paths to briefs, plans, branches, PRs, commits

## Checklist

Per topic: include in State / log as Open decision / drop with reason. Pick skills from this kit only.

## Anti-patterns

No pasted diffs, plans, or commit bodies — link paths/hashes. Max 5 skills. Compress, don't narrate every message.

## Redaction

Remove API keys, JWTs, passwords, connection strings, private keys, `.env` secrets, PII, tokenized URLs.

## Subagent delegation

- **On invoke:** Launch `artifact-collector` in parallel; merge paths into sections 2 and 5 (no full file paste).
