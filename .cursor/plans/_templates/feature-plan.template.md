---
name: [Module / feature name — English]
overview: [1-2 sentences — English]
todos:
  - id: brief
    content: Project brief approved and embedded in plan
    status: pending
  - id: scaffold
    content: Project/module scaffold (per brief stack)
    status: pending
  - id: ui-shell
    content: UI shell + theme/tokens (if UI platform)
    status: pending
  - id: data-layer
    content: Mock adapter or real API integration
    status: pending
  - id: feature-core
    content: Business logic / screens / endpoints
    status: pending
  - id: i18n
    content: i18n (if brief i18n ≠ defer)
    status: pending
  - id: verify
    content: test + build + brief verification level
    status: pending
isProject: false
---

# [Title] — Implementation Plan

## Brief (approved)

(Copy brief table from `.cursor/plans/_briefs/{slug}.brief.md`)

---

## Scope

**Included:**

**Excluded:**

**Reference:**

---

## UI pattern (conditional)

Fill based on brief `ui_pattern` / `component_library`:

| Screen | Component | Config / file |
|--------|-----------|---------------|
| | | |

Write a checklist for the chosen library + css_stack.

---

## Architecture

```mermaid
flowchart LR
  UI --> Data
  Data --> API
```

---

## 1. UI

| File | Responsibility |
|------|----------------|

---

## 2. Data layer

| Source | Strategy |
|--------|----------|
| brief.data_source | |

---

## 3. Integration

- Routes / navigation
- Auth (brief.auth)
- i18n (brief.i18n)

---

## Verification

Template: [verification.md](../_shared/verification.md)

### Automated

(project commands — e.g. `pnpm test`, `pnpm build`)

### Scenarios (if UI)

| # | Scenario | Expected |
|---|----------|----------|

---

## Target file tree

```
...
```
