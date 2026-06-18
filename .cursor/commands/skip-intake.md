# Skip intake

Proceed without creating or requiring an approved project brief.

## Behavior

1. Treat this session as **intake skipped** — same effect as prompt text `skip intake`
2. Do not block on missing brief in `.cursor/plans/_briefs/`
3. Do not run project-intake skill unless user later requests it
4. **User responsibility** — stack, scope, and deliverable assumptions may be incomplete

## When to use

- Quick fixes, spikes, or work where a formal brief is unnecessary
- User explicitly accepts missing `required_before_plan` / `required_before_code` fields

## Stop rules

- Do not write code for greenfield/plan work without at least verbal scope confirmation
- Warn once if proceeding without brief for plan-then-code deliverables
