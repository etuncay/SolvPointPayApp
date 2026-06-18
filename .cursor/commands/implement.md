# Implement plan

Execute an approved implementation plan — update todo status only.

## Prerequisites

- Approved plan at `.cursor/plans/features/{slug}.plan.md` or `.cursor/plans/design-{slug}.plan.md`
- User intent: implement mode (matches hook `IMPLEMENT_PLAN`)

## Workflow

1. Read the plan file — **plan body is read-only**
2. Only update `todos[].status` in plan frontmatter (`pending` → `in_progress` → `completed`)
3. Implement each todo in order per plan scope
4. Apply verification per `.cursor/plans/_shared/verification.md` and brief `verification` level
5. For UI screens, run screen-test-protocol when `screen_test_docs: auto`
6. Mark verify todo completed only after tests pass or document `Could not run` with reason

## Subagents

None by default. Launch `route-mapper` before screen tests if running screen-test-protocol.

## Stop rules

- **Never edit plan body** except `todos[].status`
- Do not start intake or write new brief unless user explicitly changes scope
- Do not mark verify completed without evidence
