# Intake canonical options

Single source of truth for `AskQuestion` option IDs. Agent shows labels per [project.defaults.yaml](../../config/project.defaults.yaml) `locale.ask_question_labels`; stores **stable IDs** in brief.

**Config defaults:** [project.defaults.yaml](../../config/project.defaults.yaml) — load before infer/ask.

## Round 1 — Blockers

### work_type

| ID | Label |
|----|-------|
| `greenfield` | New project from scratch |
| `new-feature` | New feature in existing project |
| `design-only` | Design / mockup only |
| `plan-only` | Implementation plan only |
| `plan-and-implement` | Plan + code |
| `implement-plan` | Implement existing plan |
| `bugfix` | Bug fix |
| `refactor` | Refactor |

### language

| ID | Label |
|----|-------|
| `typescript` | TypeScript |
| `javascript` | JavaScript |
| `python` | Python |
| `csharp-dotnet` | C# / .NET |
| `kotlin` | Kotlin |
| `swift` | Swift |
| `go` | Go |
| `rust` | Rust |
| `other` | Other |

### platform

| ID | Label |
|----|-------|
| `web-spa` | Web — SPA |
| `web-ssr` | Web — SSR/SSG (Next, Nuxt, …) |
| `mobile-ios` | Mobile — iOS |
| `mobile-android` | Mobile — Android |
| `mobile-cross` | Mobile — cross-platform (RN, Flutter) |
| `desktop` | Desktop |
| `backend-api` | Backend API |
| `cli` | CLI tool |
| `library` | Library / SDK |
| `vr-quest` | VR / Meta Quest |
| `other` | Other |

### scope

| ID | Label |
|----|-------|
| `prototype-ui` | UI prototype / shell |
| `single-screen` | Single screen |
| `single-module` | Single module |
| `multi-module` | Multiple modules |
| `full-app-mvp` | Full app — MVP |
| `full-app-v1` | Full app — v1 |

### data_source

| ID | Label |
|----|-------|
| `mock-json` | Mock — local JSON |
| `mock-api-msw` | Mock API (MSW / fake REST) |
| `existing-api` | Existing API (OpenAPI/Swagger) |
| `build-backend` | Backend to be built |
| `static-hardcoded` | Static / hardcoded |
| `local-storage` | localStorage / AsyncStorage |
| `real-db-seed` | Real DB + seed |

### deliverable

| ID | Label |
|----|-------|
| `plan-only` | Plan file only |
| `plan-then-code` | Plan → approval → code |
| `code-only` | Direct code (brief complete) |
| `docs-only` | Documentation only |

### architecture

| ID | Label |
|----|-------|
| `fullstack-separated` | Full stack — separate frontend + backend |
| `frontend-only` | Frontend only |
| `backend-only` | Backend / API only |
| `monolith` | Monolith (Next.js full-stack, Rails, etc.) |
| `mobile-bff` | Mobile app + backend API |

### backend.api_style

| ID | Label |
|----|-------|
| `rest` | REST / OpenAPI |
| `graphql` | GraphQL |
| `grpc` | gRPC |
| `minimal` | Minimal / RPC-style |

### backend.database

| ID | Label |
|----|-------|
| `none` | None / in-memory only |
| `postgres` | PostgreSQL |
| `sqlite` | SQLite |
| `sqlserver` | SQL Server |
| `mongo` | MongoDB |
| `defer` | Decide later |

### monorepo.tool

| ID | Label |
|----|-------|
| `pnpm` | pnpm workspaces |
| `npm` | npm workspaces |
| `yarn` | Yarn workspaces |
| `bun` | Bun |
| `dotnet-sln` | .NET solution |
| `none` | Not a monorepo |

---

## Round 2 — UI (web / mobile / desktop)

### ui_approach

| ID | Label |
|----|-------|
| `component-library` | Component library |
| `utility-css` | Utility CSS (Tailwind, etc.) |
| `css-framework` | CSS framework (Bootstrap, etc.) |
| `pure-css` | Pure CSS / SCSS |
| `vanilla-js-no-framework` | Vanilla JS — no framework |

### component_library

| ID | Label |
|----|-------|
| `shadcn-radix` | shadcn/ui + Radix |
| `mui` | Material UI |
| `ant-design` | Ant Design |
| `bootstrap-components` | Bootstrap components |
| `chakra` | Chakra UI |
| `material-native` | React Native Paper / Material |
| `none-custom` | Custom — components from scratch |

### css_stack

| ID | Label |
|----|-------|
| `tailwind` | Tailwind CSS |
| `bootstrap-css` | Bootstrap CSS |
| `css-modules` | CSS Modules |
| `styled-components` | styled-components |
| `scss` | SCSS / Sass |
| `inline-style-system` | Framework inline styles |
| `none` | No separate CSS |

### aesthetic

| ID | Label |
|----|-------|
| `minimal` | Minimal |
| `corporate` | Corporate |
| `data-dense` | Data-dense |
| `playful` | Playful |
| `brutalist` | Brutalist |
| `editorial` | Editorial |
| `soft-pastel` | Soft / pastel |
| `custom-reference` | Reference / spec available |

### theme

| ID | Label |
|----|-------|
| `dark-default` | Dark default |
| `light-default` | Light default |
| `system` | System theme |
| `both-themes` | Light + dark |

### interaction

| ID | Label |
|----|-------|
| `minimal-static` | Minimal / static |
| `low` | Low animation |
| `medium` | Medium |
| `high` | High / rich motion |

### a11y

| ID | Label |
|----|-------|
| `baseline-a11y` | Baseline accessibility |
| `wcag-aa` | WCAG AA target |
| `defer` | Defer for later |

---

## Round 3 — Architecture

### framework (subset — expand by platform in skill)

| ID | Label |
|----|-------|
| `react` | React |
| `vue` | Vue |
| `angular` | Angular |
| `svelte` | Svelte |
| `next` | Next.js |
| `nuxt` | Nuxt |
| `react-native` | React Native CLI |
| `expo` | Expo |
| `flutter` | Flutter |
| `aspnet-core` | ASP.NET Core |
| `fastapi` | FastAPI |
| `express` | Express |
| `nestjs` | NestJS |
| `native-android` | Native Android |
| `native-ios` | Native iOS |
| `other` | Other |

### auth

| ID | Label |
|----|-------|
| `none` | None |
| `mock-login` | Mock login |
| `jwt-session` | JWT / session |
| `oauth` | OAuth / SSO |
| `rbac-full` | Full RBAC |

### i18n

| ID | Label |
|----|-------|
| `single-tr` | Turkish only |
| `single-en` | English only |
| `multi-tr-en` | TR + EN |
| `multi-tr-en-ar` | TR + EN + AR |
| `defer` | Defer for later |

### verification

| ID | Label |
|----|-------|
| `unit-only` | Unit test |
| `browser-mcp` | Browser (cursor-ide-browser) |
| `e2e-playwright` | E2E Playwright |
| `manual-user` | Manual user test |
| `skip-for-now` | Skip for now |

### ci_cd

| ID | Label |
|----|-------|
| `none` | None |
| `lint-test-only` | Lint + test |
| `full-pipeline` | Full CI/CD pipeline |

---

## Follow-up triggers

| Parent selection | Follow-up |
|------------------|-----------|
| `platform: other` | Ask platform detail MC or spec path |
| `language: other` | One MC or user spec file |
| `component_library: custom-reference` | Reference URL or `@file` |
| `scope: single-screen` | Screen name MC from spec or free pick list |
| `aesthetic: custom-reference` | Reference apps / Figma / spec |
