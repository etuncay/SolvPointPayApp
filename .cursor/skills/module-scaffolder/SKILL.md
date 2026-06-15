---
name: module-scaffolder
description: >-
  Scaffold a feature module from approved brief — stack-aware file tree. Triggers:
  scaffold, new module, create screen, add feature.
---

# Module scaffolder (generic)

Create feature/module skeleton per approved brief. Clarify target path before coding.

**Output locale:** [output-locale.md](../../plans/_shared/output-locale.md) — chat → config `locale.chat`; code English; i18n per brief.

## Triggers

- scaffold, new module, new screen, create screen, add feature, create module
- `[Work Intent: SCAFFOLD]` hook context

## Prerequisites

- Brief at `.cursor/plans/_briefs/{slug}.brief.md` OR explicit user answers for path + stack
- If missing → [project-intake](../project-intake/SKILL.md) first

## Module type (infer or ask)

| Intent | Type |
|--------|------|
| List only | table-only |
| List + CRUD form | table + form |
| API endpoint only | backend-route |
| Single page / screen | page-only |
| Default | table + form for admin UIs; page-only for marketing/landing |

## Stack routing

| brief.framework + platform | Scaffold pattern |
|----------------------------|------------------|
| react + web-spa (vite) | `src/features/{slug}/` — page, components, hooks |
| next + web-ssr | `app/` or `src/app/` route + components |
| react-native / expo | `src/screens/` or `app/` (expo router) |
| aspnet-core + backend-api | `Controllers/`, `Services/`, DTOs |

**Match existing repo layout** before generating paths.

## Required steps

1. Confirm module slug (kebab-case, ASCII)
2. Create files per brief `ui_pattern` / `component_library` / `css_stack`
3. Wire routes / navigation / exports
4. Data layer per brief.data_source (mock JSON, MSW, API client)
5. i18n keys if brief.i18n ≠ defer
6. Report file tree to user in English

**Example trees:** Vite → `src/features/{slug}/` (page, components, hooks, types); Next → `src/app/{slug}/` (page, components, actions).

## Do not

- Scaffold without brief stack decisions
- Assume monorepo or a vendor-specific package namespace unless brief + repo confirm it
- Raw `fetch` in page components — use a data layer from the brief

When implementing from a plan, follow the plan **UI** section and file tree only.
