---
name: "api-design-reviewer"
description: "Comprehensive REST API design review with automated linting, breaking-change detection, and design scorecards. Catches inconsistent conventions, missing versioning, and design smells before APIs ship. Use when reviewing a PR that adds or changes API endpoints, auditing an existing API for v2 migration, or establishing API standards for a team."
---

# API Design Reviewer

Review REST/OpenAPI designs for consistency, breaking changes, security, and developer experience.

## When to use

- PR adds/changes endpoints
- v2 migration audit
- Establishing team API standards

## Review checklist

### Conventions
- Resources: kebab-case plural nouns (`/api/v1/users`), not verbs (`/getUsers`)
- Fields: camelCase in JSON
- HTTP: GET read, POST create, PUT replace, PATCH partial, DELETE remove
- Status codes: 400 invalid, 401 unauth, 403 forbidden, 404 missing, 409 conflict, 422 semantic, 429 rate limit, 500 server
- Lists: always paginated (cursor preferred for large sets)
- Versioning: URL prefix `/api/v1/` or documented header strategy — pick one, stay consistent

### Error format (standardize)
```json
{"error":{"code":"VALIDATION_ERROR","message":"…","details":[{"field":"email","code":"INVALID_FORMAT"}],"requestId":"…"}}
```

### Breaking vs safe changes

| Safe (non-breaking) | Breaking (needs version bump) |
|---------------------|-------------------------------|
| Optional request fields | Remove/rename response fields |
| New response fields | Change field types |
| New endpoints | Remove endpoints |
| Optional → required forbidden without version | Change URL structure or error format |

### Design scorecard (report %)

| Dimension | Weight | Check |
|-----------|--------|-------|
| Consistency | 30% | Naming, response shape, patterns |
| Documentation | 20% | OpenAPI descriptions, examples |
| Security | 20% | Auth, HTTPS, input validation, rate limits |
| Usability | 15% | Discoverability, clear errors |
| Performance | 15% | Pagination, caching headers, field selection |

### Anti-patterns
Verb URLs, inconsistent envelopes, deep nesting (>2 levels), missing pagination, no versioning, exposing internal DB shape, vague errors.

## Tooling

```bash
npx @stoplight/spectral-cli lint openapi.yaml
npx oasdiff breaking old.yaml new.yaml
```

Encode team rules as a Spectral ruleset. Fail CI on breaking diffs for published APIs.

## Output

Deliver: scorecard, breaking-change list, convention violations (severity), recommended fixes. Link to specific paths/operations in the spec.

## Subagent delegation

- **Before review checklist:** Launch `openapi-linter` for spectral lint and oasdiff breaking detection.
