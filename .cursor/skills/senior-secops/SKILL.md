---
name: "senior-secops"
description: Senior SecOps engineer skill for application security, vulnerability management, compliance verification, and secure development practices. Runs SAST/DAST scans, generates CVE remediation plans, checks dependency vulnerabilities, creates security policies, enforces secure coding patterns, and automates compliance checks against SOC2, PCI-DSS, HIPAA, and GDPR. Use when conducting a security review or audit, responding to a CVE or security incident, hardening infrastructure, implementing authentication or secrets management, running penetration test prep, checking OWASP Top 10 exposure, or enforcing security controls in CI/CD pipelines.
---

# Senior SecOps Engineer

Security audits, CVE triage, secure coding, compliance evidence. **Hard STOP** on critical findings before deploy.

## When to use

Security scan, pentest prep, CVE response, hardening, OWASP review, compliance check, incident response.

## Workflow 1: Security audit

```bash
# 1 SAST + secrets — STOP on critical
semgrep --config p/owasp-top-ten --config p/secrets .
gitleaks detect --source . --redact

# 2 Dependencies — STOP on critical/high CVE
osv-scanner -r .
# ecosystem: npm audit | pip-audit | govulncheck

# 3 IaC/config
checkov -d .
trivy config .
```

Record JSON artifacts for CI: `semgrep --json`, `osv-scanner --format json`, `trivy config --format json`.

## Workflow 2: CI security gate

PR pipeline minimum: SAST (semgrep) + secrets (gitleaks) + deps (osv-scanner). Fail job on high/critical exit codes. No prod deploy past failures.

## Workflow 3: CVE triage

1. **Assess** — identify affected packages; CVSS; escalate if 9.0+ internet-facing
2. **Prioritize** — Critical 24h, High 7d, Medium 30d, Low 90d
3. **Remediate** — patch, re-scan, test, deploy with monitoring
4. **Verify** — CVE cleared in scanner output; document actions

## Workflow 4: Incident response (summary)

Detect → Contain (isolate, rotate creds, preserve logs) → Eradicate (patch, re-scan clean) → Recover → Post-incident report (timeline, RCA, preventive measures).

## Tool reference

| Purpose | Tools |
|---------|-------|
| SAST | semgrep, bandit (Py), eslint-plugin-security (JS) |
| Secrets | gitleaks, detect-secrets, trufflehog |
| CVEs | osv-scanner, npm audit, pip-audit, govulncheck, trivy fs |
| IaC | checkov, trivy config, tfsec |
| Cloud | prowler, scoutsuite |
| SBOM | syft, grype, cosign |

## Secure coding checklist

- Validate input server-side; allowlists over denylists
- Parameterized queries; no secrets in code/logs
- bcrypt/argon2 passwords; MFA on admin; HttpOnly+Secure+SameSite cookies
- Generic errors to users; structured logs without secrets
- Env vars or secrets manager; rotate credentials

## OWASP Top 10 quick-check

| # | Check |
|---|-------|
| A01 | Role checks on every endpoint |
| A02 | TLS 1.2+; no secrets in source/logs |
| A03 | Parameterized queries; audit raw ORM |
| A04 | Threat model for critical flows |
| A05 | No default creds; generic error pages |
| A06 | osv-scanner — zero critical/high |
| A07 | MFA admin; brute-force protection |
| A08 | Signed CI artifacts |
| A09 | Auth events logged + alerted |
| A10 | SSRF filters; block metadata IPs |

## Compliance (evidence-based)

Record pass/gap per control — do not claim compliance without evidence.

- **SOC2:** access control (CC6), monitoring/IR (CC7), change mgmt (CC8)
- **PCI:** encryption (Req 3/4), secure dev (6), MFA (8), logging (10/11)
- **HIPAA:** audit trails, MFA, TLS for PHI
- **GDPR:** privacy by design (Art 25/32), breach 72h (Art 33)

Refs: [OWASP Top 10](https://owasp.org/www-project-top-ten/), [OSV](https://osv.dev). Cross-ref: `dependency-auditor` for license/CVE depth.

## Subagent delegation

- **Workflow 1 start:** Launch `security-scanner` in parallel for semgrep, gitleaks, osv-scanner, checkov raw output.
