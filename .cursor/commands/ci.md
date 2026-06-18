# CI pipeline

Generate or refactor CI/CD pipelines from detected stack signals.

## Prerequisites

- Repo with detectable lockfiles and scripts

## Workflow

1. Read `.cursor/skills/ci-cd-pipeline-builder/SKILL.md` and follow its workflow
2. Launch **`command-validator`** subagent to verify lint/test/build commands exist
3. Detect stack from lockfiles and manifests — never invent commands
4. Generate `.github/workflows/ci.yml` or `.gitlab-ci.yml` as appropriate
5. Validate YAML parses; mirror detected package manager in cache keys

## Subagents

| When | Subagent |
|------|----------|
| Before pipeline generation | `command-validator` |

## Stop rules

- Do not add deploy stages until CI baseline is stable unless user requests
- Document secrets in CI store — never commit secrets in YAML
