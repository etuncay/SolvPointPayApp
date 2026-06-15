# Project config

Central defaults for agents. Edit [`project.defaults.yaml`](project.defaults.yaml) to set team standards; agents merge config → repo inference → user prompt → `AskQuestion` for gaps.

AskQuestion field catalog (rounds, `required_when`): [`project.intake-fields.yaml`](project.intake-fields.yaml) — read during intake only, not every session.

## Resolution order

1. **User prompt** — explicit choices win
2. **Repo signals** — `package.json`, `*.csproj`, folder layout (see `repo_signals` in YAML)
3. **`project.defaults.yaml`** — defaults for this repo
4. **AskQuestion** — only for required fields still empty (max rounds: `intake.max_ask_rounds`)

## Key sections

| File | Section | Purpose |
|------|---------|---------|
| `project.defaults.yaml` | `locale` | Chat, plan, AskQuestion label, and code languages |
| | `architecture` | Frontend/backend split, default languages & frameworks |
| | `defaults` | Fallback values when nothing else is known |
| | `intake` | Required fields, brief/plan paths, ask behavior |
| | `repo_signals` | Repo inference hints |
| `project.intake-fields.yaml` | `fields` | Full intake catalog with rounds and conditional `required_when` |

## Option IDs

Multiple-choice IDs for shared fields live in [../plans/_shared/intake-canonical-options.md](../plans/_shared/intake-canonical-options.md). Config-only fields (`architecture`, `backend.api_style`, `backend.database`) are defined in `project.intake-fields.yaml`.

## Brief output

Approved values are written to `.cursor/plans/_briefs/{slug}.brief.md` using [../plans/_templates/project-brief.template.md](../plans/_templates/project-brief.template.md).

## Quick overrides

```yaml
# Example: React + .NET API shop standard
architecture:
  default: fullstack-separated
  frontend:
    default_language: typescript
    default_framework: react
  backend:
    default_language: csharp-dotnet
    default_framework: aspnet-core

locale:
  chat: english
  ask_question_labels: english
```

Skill: [../skills/project-intake/SKILL.md](../skills/project-intake/SKILL.md)
