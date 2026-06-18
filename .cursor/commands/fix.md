# Focused fix

Systematic end-to-end repair of a feature or module.

## Prerequisites

- Target feature/folder identified in prompt or confirmed with user
- Not for single-line quick fixes — use natural `fix bug` for those

## Workflow

1. Read `.cursor/skills/focused-fix/SKILL.md` and follow **5 phases in order**: SCOPE → TRACE → DIAGNOSE → FIX → VERIFY
2. Complete Phase 1 (SCOPE) manifest before tracing
3. Launch **`dependency-tracer`** subagent after SCOPE, before DIAGNOSE
4. Merge tracer output into dependency map
5. Fix in order: dependencies → types → logic → tests → integration
6. Apply 3-strike rule — stop after 3+ cascading fixes and discuss with user

## Subagents

| When | Subagent |
|------|----------|
| After SCOPE, before DIAGNOSE | `dependency-tracer` |

## Stop rules

- **NO FIXES WITHOUT SCOPE → TRACE → DIAGNOSE FIRST**
- Do not skip consumer verification in VERIFY phase
- Escalate if fix #3+ creates new issues
