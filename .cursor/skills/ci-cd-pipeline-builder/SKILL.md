---
name: "ci-cd-pipeline-builder"
description: "Generate pragmatic CI/CD pipelines from detected project stack signals — fast baseline generation, repeatable checks, environment-aware deployment stages. Use when setting up CI for a new project, refactoring existing pipelines, or standardizing deployment workflows across multiple repos."
---

# CI/CD Pipeline Builder

Generate CI/CD from detected stack — not copied guesswork.

## When to use

Bootstrap CI, replace brittle pipelines, GitHub Actions ↔ GitLab CI migration, audit steps vs actual stack.

## Workflow

### 1. Detect stack (Glob/Grep/Read)

- Lockfiles → package manager (`package-lock.json`, `pnpm-lock.yaml`, `poetry.lock`, `go.sum`, `Cargo.lock`, `*.csproj`)
- Manifests → runtime version (`engines`, `python_requires`)
- **Scripts** → real `lint` / `test` / `build` commands — never invent

### 2. Generate pipeline

- GitHub Actions → `.github/workflows/ci.yml`
- GitLab CI → `.gitlab-ci.yml`

Minimal stages: checkout → setup runtime → cache deps → lint → test → build. Mirror detected package manager cache action.

### 3. Deploy (add after CI stable)

Staging with env context → production with manual approval + protected branches. Document secrets in CI store, never in YAML.

### 4. Validate

- YAML parses; commands exist in repo
- Cache keys match package manager
- `actionlint` (GHA) or GitLab CI Lint

## Pitfalls

Wrong-ecosystem template; deploy before green tests; missing cache; expensive matrix on every branch; hardcoded secrets.

## Best practices

Detect first; one canonical pipeline per repo; require green CI before deploy; protected environments for prod; regenerate when stack changes.

Refs: [GitHub Actions](https://docs.github.com/actions), [GitLab CI](https://docs.gitlab.com/ee/ci/)
