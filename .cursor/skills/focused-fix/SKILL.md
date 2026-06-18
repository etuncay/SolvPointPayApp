---
name: "focused-fix"
description: "Use when the user asks to fix, debug, or make a specific feature/module/area work end-to-end. Triggers: 'make X work', 'fix the Y feature', 'the Z module is broken', 'focus on [area]'. Not for quick single-bug fixes — this is for systematic deep-dive repair across all files and dependencies."
---

# Focused Fix — Deep-Dive Feature Repair

**Output locale:** [output-locale.md](../../plans/_shared/output-locale.md) — chat → `locale.chat`; code **English**.

## When to use

Entire feature/module needs systematic repair — not a single-line bug fix.

Triggers: "make X work", "fix the Y feature", "module is broken", "focus on [area]", "uçtan uca".

## Iron law

```
NO FIXES WITHOUT COMPLETING SCOPE → TRACE → DIAGNOSE FIRST
```

Follow **5 phases in order**: SCOPE → TRACE → DIAGNOSE → FIX → VERIFY. If fix #3+ creates new issues, STOP and discuss architecture with user.

## Phase 1: SCOPE

1. Confirm target feature/folder with user if unclear
2. Read every file in the feature folder
3. Output feature manifest: primary path, entry points, internal files, file/line counts

## Phase 2: TRACE

**Inbound:** every import → verify file/export exists; types match; note env vars, config, DB models, API calls, packages.

**Outbound:** grep codebase for imports from this feature → verify consumers use correct API.

Output dependency map: inbound, outbound, required env vars, config files.

## Phase 3: DIAGNOSE

Run all checks before fixing:

| Area | Checks |
|------|--------|
| Code | Imports resolve; no circular deps; no `any` at boundaries; async error handling |
| Runtime | Env vars set; migrations current; API shapes correct |
| Tests | Run all feature tests + record failures |
| Logs/git | Recent commits on feature + dependencies |
| Config | Valid configs; dev/prod mismatches |

Label each issue **HIGH/MED/LOW**. Confirm root cause with evidence before adding to fix list.

Output diagnosis report: CRITICAL + WARNINGS + test summary.

## Phase 4: FIX (order matters)

1. Dependencies → 2. Types → 3. Logic → 4. Tests → 5. Integration

Rules: one issue at a time; run related test after each fix; log every change; avoid edits outside feature folder without stating why; HIGH before MED before LOW.

**3-strike rule:** 3+ fixes that create new issues → stop, summarize, ask user about restructuring vs patching.

## Phase 5: VERIFY

1. All feature tests pass
2. All consumer tests pass
3. Full suite if available
4. Manual UI steps if applicable
5. Completion report: files changed, fixes, test count, consumers verified

## Stop signals

- "Obvious bug, skip tracing" → return to TRACE
- "Only this one file" → return to SCOPE
- "Tests pass, done" → run consumer tests too
- "One more fix" after 2+ cascades → escalate

## Related skills

- `screen-test-protocol` — UI verification in Phase 5
- `implementation-plan` — if repair becomes a redesign

## Subagent delegation

- **After Phase 1 (SCOPE), before Phase 3 (DIAGNOSE):** Launch `dependency-tracer` for inbound/outbound import map.
