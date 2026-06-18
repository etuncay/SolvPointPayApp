---
name: "dependency-auditor"
description: "Audit and manage dependencies across multi-language projects. Identifies vulnerabilities, license conflicts, transitive dependency risks, and safe-upgrade paths. Use when auditing third-party packages before release, investigating a CVE, planning a major version bump, or running a license-compliance review."
---

# Dependency Auditor

Audit dependencies for CVEs, licenses, outdated versions, and upgrade risk. Run ecosystem tools; interpret output; prioritize fixes.

## When to use

Pre-release audit, CVE investigation, major version bump planning, license compliance.

## Workflow

1. **Scan vulnerabilities** — `osv-scanner -r .` + ecosystem audit
2. **License check** — classify all direct + transitive deps
3. **Outdated analysis** — patch/minor/major categorization
4. **Upgrade plan** — security patches first; test after each bump
5. **Report** — CVE list with paths, license conflicts, recommended actions

## Tooling by ecosystem

| Ecosystem | Vulnerabilities | Licenses | Outdated |
|-----------|-----------------|----------|----------|
| npm/pnpm/yarn | `npm audit`, `pnpm audit`, `osv-scanner` | `license-checker` | `npm outdated`, `ncu` |
| Python | `pip-audit`, `safety` | `pip-licenses` | `pip list --outdated` |
| Go | `govulncheck` | `go-licenses` | `go list -u -m all` |
| Rust | `cargo audit` | `cargo deny check licenses` | `cargo outdated` |
| Multi/SBOM | `osv-scanner`, `trivy fs`, `grype` | `trivy`, `scancode` | — |

SBOM: `syft` (CycloneDX/SPDX). Advisories: [OSV](https://osv.dev), GitHub Advisory Database.

## License categories

| Type | Examples | Risk |
|------|----------|------|
| Permissive | MIT, Apache-2.0, BSD, ISC | Low |
| Weak copyleft | LGPL, MPL | Medium — review distribution |
| Strong copyleft | GPL, AGPL | High — may infect proprietary code |
| Unknown/missing | — | Block until clarified |

Flag GPL in permissive projects; document exceptions.

## Risk prioritization

1. Critical/high CVEs — immediate patch
2. License blockers — before release
3. Patch updates — scheduled
4. Major upgrades — planned with regression tests

## CI integration

```bash
osv-scanner --lockfile=package-lock.json   # fail on high/critical
npm audit --audit-level=high
pip-audit
```

## Output

Deliver: vulnerability table (CVE, package, path, fixed version), license conflicts, outdated summary, prioritized upgrade plan. No bundled scripts — use repo lockfiles and commands above.

## Subagent delegation

- **At workflow start:** Launch `audit-runner` in parallel for raw scan output; interpret and prioritize in main agent.
