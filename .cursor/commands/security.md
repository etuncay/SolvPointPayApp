# Security audit

Run application security scans and compliance-oriented review.

## Prerequisites

- Repository checked out; user requests security scan or pre-release audit

## Workflow

1. Read `.cursor/skills/senior-secops/SKILL.md` and follow Workflow 1 (Security audit)
2. Launch **`security-scanner`** subagent in parallel for semgrep, gitleaks, osv-scanner, checkov
3. **STOP on critical** findings before recommending deploy
4. Triage CVEs per skill priority table (Critical 24h, High 7d, etc.)
5. Record findings with evidence; suggest remediation without auto-fixing production config

## Subagents

| When | Subagent |
|------|----------|
| At audit start | `security-scanner` |

## Stop rules

- Hard STOP on critical SAST/secrets/deps findings before deploy recommendation
- Redact secrets in all output
