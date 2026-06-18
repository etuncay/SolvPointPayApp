# Cursor — Generic Project Intake

Project-agnostic agent instructions: **refine prompt → infer → AskQuestion → brief → plan → implement** flow for planning, design, scaffold, and greenfield work.

**Instruction language:** English (this tree).  
**Output locale:** config `locale.*` in [config/project.defaults.yaml](config/project.defaults.yaml); inline summary in [rules/core.mdc](rules/core.mdc).

## Token-conscious design

Minimize always-on system prompt cost; load heavy intake only when hooks or user intent require it.

| Load mode | Artifacts | When |
|-----------|-----------|------|
| **Always-on** (~1.2 KB) | [rules/core.mdc](rules/core.mdc) only | Every agent turn |
| **Glob rules** | quality-standards, plan-authoring, screen-test-docs | Matching file paths only |
| **Session hook** | `[Stack:…]` from session-detect-stack | Once per session |
| **Prompt hook** | route-work.sh intent + compact `[route:…]` tag | Greenfield/plan/design/etc. |
| **On-demand** | prompt-refinement, project-intake skill, intake-workflow rule, project.defaults.yaml, project.intake-fields.yaml | Refinement / intake / greenfield |
| **On-demand** | [agents/](agents/) subagents, [commands/](commands/) slash workflows | When skill delegation or user `/` trigger applies |

Legacy stubs (`cursor-guidelines.mdc`, `output-locale.mdc`, `project-config.mdc`) point to `core.mdc` — not always-on.

## Subagents and commands

Three layers — do not duplicate routing:

| Layer | Location | Role |
|-------|----------|------|
| **Hooks** | [route_engine.py](hooks/lib/route_engine.py) + [registry.json](skills/skills-router/registry.json) | Deterministic intent + skill selection |
| **Skills** | [skills/](skills/) | Step-by-step workflow (main agent orchestrator) |
| **Subagents** | [agents/](agents/) | Parallel exploration, validation, or shell scans |
| **Commands** | [commands/](commands/) | User-triggered `/` shortcuts; same skills + explicit subagent steps |

Skills with `## Subagent delegation` tell the main agent when to launch a subagent. Commands encode the same orchestration for manual use. Hooks are unchanged — commands do not override hook routing.

### Subagents (11)

| Name | Mode | Purpose |
|------|------|---------|
| [repo-explorer](agents/repo-explorer.md) | readonly | Gap analysis, layout patterns, stack signals |
| [brief-validator](agents/brief-validator.md) | readonly | Brief vs `required_before_plan` / `required_before_code` |
| [plan-reviewer](agents/plan-reviewer.md) | readonly | Plan vs brief + plan-authoring rules |
| [dependency-tracer](agents/dependency-tracer.md) | readonly | Inbound/outbound import map (focused-fix TRACE) |
| [route-mapper](agents/route-mapper.md) | readonly | Screen / route / auth / CRUD matrix |
| [command-validator](agents/command-validator.md) | shell | Validate install / dev / test / build commands |
| [audit-runner](agents/audit-runner.md) | shell | osv-scanner, npm/pnpm audit, pip-audit, govulncheck |
| [security-scanner](agents/security-scanner.md) | shell | semgrep, gitleaks, osv-scanner, checkov |
| [openapi-linter](agents/openapi-linter.md) | shell | spectral lint, oasdiff breaking |
| [schema-reviewer](agents/schema-reviewer.md) | readonly | ORM / migration inventory before schema design |
| [artifact-collector](agents/artifact-collector.md) | readonly | Briefs, plans, git state for handoff |

Shell subagents return raw CLI output; triage stays in the main agent. If a tool is missing, report `Could not run (tool not found: …)`.

### Slash commands (17)

Plain markdown in [commands/](commands/) — filename = command name (e.g. `plan.md` → `/plan`).

| Command | Skill / mode | Subagents |
|---------|--------------|-----------|
| `/refine` | prompt-refinement | — |
| `/intake` | project-intake | repo-explorer, brief-validator |
| `/plan` | implementation-plan | repo-explorer, plan-reviewer |
| `/implement` | implement mode (plan read-only) | — |
| `/scaffold` | module-scaffolder | repo-explorer, brief-validator |
| `/design` | design-intake | repo-explorer, plan-reviewer |
| `/fix` | focused-fix | dependency-tracer |
| `/screen-test` | screen-test-protocol | route-mapper |
| `/handoff` | handoff | artifact-collector |
| `/onboard` | codebase-onboarding | repo-explorer, command-validator |
| `/audit-deps` | dependency-auditor | audit-runner |
| `/security` | senior-secops | security-scanner |
| `/api-review` | api-design-reviewer | openapi-linter |
| `/ci` | ci-cd-pipeline-builder | command-validator |
| `/skip-intake` | bypass intake gate | — |
| `/skip-refine` | bypass refinement gate | — |
| `/status` | kit status report | — |

### Skill → subagent delegation

| Skill | Subagent(s) | When |
|-------|-------------|------|
| project-intake | repo-explorer, brief-validator | infer / after brief saved |
| implementation-plan | repo-explorer, plan-reviewer | gap analysis / before presenting plan |
| design-intake | repo-explorer, plan-reviewer | theme patterns / before design plan approval |
| module-scaffolder | repo-explorer, brief-validator | layout match / brief check |
| focused-fix | dependency-tracer | after SCOPE, before DIAGNOSE |
| screen-test-protocol | route-mapper | before browser test (Step 3) |
| codebase-onboarding | repo-explorer, command-validator | before drafting doc |
| dependency-auditor | audit-runner | audit start |
| senior-secops | security-scanner | security audit workflow |
| api-design-reviewer | openapi-linter | before spec review |
| ci-cd-pipeline-builder | command-validator | before pipeline generation |
| database-schema-designer | schema-reviewer | before ERD / migration design |
| handoff | artifact-collector | on invoke |

### Routing notes

- Simple `fix` / `bug` / `refactor` → hook `QUICK_FIX` (no skill route); `/fix` or `make X work` / `uçtan uca` → **focused-fix**
- Registry additions: **handoff**, **mcp-server-builder** (auto-route on natural-language match)
- Do **not** add subagents for skill routing, prompt refinement, intake AskQuestion, plan writing, or browser MCP — those stay in hooks / skills / main agent

### Context visibility (on-screen)

Each prompt shows an **Agent Kit — Bağlam** report via `user_message` from [route-work.sh](hooks/route-work.sh) / [route_engine.py](hooks/lib/route_engine.py):

- Active **rules** (always-on + glob match from prompt attachments)
- **Routed skills** and token estimate from [context-manifest.json](config/context-manifest.json)
- **Actually read** rules/skills this session (tracked by [track-context-read.sh](hooks/track-context-read.sh))

Last report also written to `.cursor/logs/last-context-report.txt` (gitignored).

**Token savings:** verbose `agent_message` skill paths replaced with compact `[route:skill-id]` (~5 tokens). Full routing detail stays in skill files (read on demand).

## Layout

| Folder | Purpose |
|--------|---------|
| [config/](config/) | **Project defaults** + [project.intake-fields.yaml](config/project.intake-fields.yaml) (AskQuestion catalog) |
| [rules/](rules/) | core.mdc (always-on), lazy intake workflow, quality standards |
| [skills/](skills/) | Condensed workflow + specialist skills (~35 KB total; checklists over prose) |
| [skills/skills-router/registry.json](skills/skills-router/registry.json) | Hook skill priority table |
| [agents/](agents/) | Custom subagents — parallel exploration, validation, shell scans |
| [commands/](commands/) | Slash commands (`/plan`, `/intake`, …) — manual workflow shortcuts |
| [hooks/](hooks/) | Stack detect, task logging, unified route-work router |
| [logs/](logs/) | Runtime `agent-activity.log` — task start/end timestamps + duration (gitignored) |
| [plans/_briefs/](plans/_briefs/) | Approved brief files (`*.brief.md`) |
| [plans/features/](plans/features/) | Feature implementation plans (created on demand) |
| [plans/_shared/](plans/_shared/) | Intake options, locale, verification |
| [plans/_templates/](plans/_templates/) | Brief, plan, design templates |

## Flow

```text
Prompt → sessionStart ([Stack:signals])
      → route-work.sh (intent + refinement gate + intake gate + skill route)
      → on demand: prompt-refinement → user approval
      → project.defaults.yaml + project-intake → brief.md
      → implementation-plan | design-intake | module-scaffolder
      → *.plan.md → approval → implement (todos[].status only)
      → parallel subagents (repo-explorer, brief-validator, …) per skill delegation
Slash → commands/*.md → same skills + explicit subagent orchestration
```

## User prompt examples

| Request | Expected behavior |
|---------|-------------------|
| "Plan a Next.js admin panel from scratch" | prompt-refinement → approval → project-intake → brief → implementation-plan |
| "Design a dashboard with Tailwind + shadcn" | prompt-refinement → approval → design-intake (+ intake UI round) |
| "Scaffold a new module" | prompt-refinement → approval → module-scaffolder (brief required) |
| "Implement the plan" | Implement mode; refinement + intake skipped |
| "Fix login bug" | No refinement/intake noise; core.mdc only |
| "skip intake" / "skip refinement" | Skip refinement and/or brief (user responsibility) |
| "prompt geliştir: …" | Forces refinement when `prompt_refinement: on-request` |
| "Ekran testi yap" / "screen test" | screen-test-protocol: auto browser test + per-screen docs under `user_test/<app>/` |
| "hand this off" / "oturumu bitir" | handoff skill (registry route) + `artifact-collector` |
| "mcp server" / "expose api as mcp" | mcp-server-builder (registry route) |
| "make auth work" / "uçtan uca" | focused-fix + `dependency-tracer` |
| `/refine` | prompt-refinement — structured prompt, wait for approval |
| `/intake` | project-intake + `repo-explorer` / `brief-validator` |
| `/plan` | implementation-plan + `repo-explorer` / `plan-reviewer` |
| `/implement` | Plan body read-only; update `todos[].status` only |
| `/scaffold` | module-scaffolder + `repo-explorer` / `brief-validator` |
| `/design` | design-intake + `repo-explorer` / `plan-reviewer` |
| `/fix` | focused-fix + `dependency-tracer` after SCOPE |
| `/screen-test` | screen-test-protocol + `route-mapper` |
| `/handoff` | handoff + `artifact-collector` |
| `/onboard` | codebase-onboarding + `repo-explorer` / `command-validator` |
| `/audit-deps` | dependency-auditor + `audit-runner` |
| `/security` | senior-secops + `security-scanner` |
| `/api-review` | api-design-reviewer + `openapi-linter` |
| `/ci` | ci-cd-pipeline-builder + `command-validator` |
| `/skip-intake` | Same as `skip intake` — brief optional |
| `/skip-refine` | Same as `skip refinement` — refinement gate off |
| `/status` | Briefs, plans, git branch, last context report |

## Hooks

```bash
chmod +x .cursor/hooks/*.sh
```

| Event | Script | Effect |
|-------|--------|--------|
| `sessionStart` | `session-detect-stack.sh` | `[Stack:…]` signals only |
| `beforeSubmitPrompt` | `log-task-start.sh` | Activity log + on-screen note |
| `beforeSubmitPrompt` | `route-work.sh` | Intent classify + intake gate + skill router + context report |
| `beforeReadFile` | `track-context-read.sh` | Track rules/skills actually read (display state) |
| `stop` | `log-task-end.sh` | Task duration log |

`route-work.sh` is the single prompt router (intent + intake gate + registry skill routing merged into one script).

## File policy

| Mode | Plan / brief |
|------|--------------|
| Intake | New `*.brief.md` under `plans/_briefs/` |
| Create plan | New `*.plan.md` under `plans/features/` or `plans/design-*.plan.md` |
| Implement | Plan body read-only; only `todos[].status` |

## Related files

- **Subagents:** [agents/](agents/) — 11 custom agents (readonly + shell)
- **Commands:** [commands/](commands/) — 17 slash workflows
- **Skill router:** [skills/skills-router/registry.json](skills/skills-router/registry.json) — includes handoff, mcp-server-builder
- **Defaults config:** [config/project.defaults.yaml](config/project.defaults.yaml)
- **Field catalog:** [config/project.intake-fields.yaml](config/project.intake-fields.yaml)
- Question matrix: [intake-canonical-options.md](plans/_shared/intake-canonical-options.md)
- Intake workflow (lazy): [project-intake-workflow.mdc](rules/project-intake-workflow.mdc)
- Always-on rules: [core.mdc](rules/core.mdc)
- Verification: [verification.md](plans/_shared/verification.md)
- Screen testing: [screen-test-protocol/SKILL.md](skills/screen-test-protocol/SKILL.md) · [screen-test-docs.mdc](rules/screen-test-docs.mdc) → output in sibling `user_test/`
- Handoff: [handoff/SKILL.md](skills/handoff/SKILL.md) · command `/handoff`
- MCP server: [mcp-server-builder/SKILL.md](skills/mcp-server-builder/SKILL.md)
