# Audit dependencies

Run vulnerability, license, and outdated dependency analysis.

## Prerequisites

- Lockfiles or manifests present in repo

## Workflow

1. Read `.cursor/skills/dependency-auditor/SKILL.md` and follow its workflow
2. Launch **`audit-runner`** subagent in parallel at start for raw scan output
3. Interpret results: CVE table, license conflicts, outdated summary
4. Prioritize: critical/high CVEs first, then license blockers, then upgrades
5. Deliver prioritized upgrade plan — no bundled scripts

## Subagents

| When | Subagent |
|------|----------|
| At audit start | `audit-runner` |

## Stop rules

- If tools missing, report `Could not run` per tool and use available scanners
- Do not auto-bump versions without user approval for major upgrades
