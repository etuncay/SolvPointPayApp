---
name: design-intake
description: >-
  UI/design-focused intake — aesthetic, theme, motion, component stack. After or
  alongside project-intake. Triggers: design, mockup, redesign, UI.
---

# Design intake

UI and visual design workflow. Requires brief fields from [project-intake](../project-intake/SKILL.md) or infer from prompt.

**Output locale:** [output-locale.md](../../plans/_shared/output-locale.md) — chat → config `locale.chat`; plans/briefs → `locale.plan` (English); code English.

## Triggers

- design, mockup, prototype, wireframe, theme, redesign
- `[Work Intent: DESIGN]` hook context
- brief.work_type = design-only

## When NOT to apply

- Pure backend, native module without UI, test-only, CI fix

## Flow

1. **Infer** target screen/feature from prompt + repo specs (`docs/`, `*.md` screen inventories)
2. **AskQuestion** (one round) for missing:
   - target (screen / flow / theme-only)
   - aesthetic
   - theme
   - reference (spec file, app name, none)
   - interaction level
   - scope (plan-only | plan-and-implement | implement-fast)
3. Merge into brief → save/update `.cursor/plans/_briefs/{slug}.brief.md`
4. **Create plan** `.cursor/plans/design-{slug}.plan.md`:

```yaml
---
name: Design - [Feature]
overview: "[platform] - [one-sentence English summary]"
todos:
  - id: brief
    content: Design brief approved
    status: pending
  - id: tokens
    content: Theme/token structure
    status: pending
  - id: layout
    content: Layout and component hierarchy
    status: pending
  - id: visual
    content: Typography, color, spacing, motion
    status: pending
  - id: implement
    content: Code implementation
    status: pending
  - id: verify
    content: Platform verification (responsive, a11y, touch)
    status: pending
isProject: false
---
```

5. **Quality:** follow [quality-standards.mdc](../../rules/quality-standards.mdc)
6. **Approval** before code unless scope = implement-fast

## Stack-specific notes

| brief.platform | Verify step |
|----------------|-------------|
| mobile-cross | Safe area, 44dp touch, TalkBack/VoiceOver labels |
| web-spa/ssr | Responsive breakpoints, focus states |
| vanilla-js | Semantic HTML, CSS organization |

## Forbidden defaults

- Inter/Roboto-only with no design intent
- Purple gradient on white
- Cookie-cutter layouts without brief aesthetic

Reuse existing component library from repo when present; extend via tokens, not raw color strings.
