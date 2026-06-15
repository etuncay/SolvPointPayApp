# Verification (post-implement)

Checklist after code changes. Apply level from brief `verification` field.

## Levels

| brief.verification | Required actions |
|--------------------|------------------|
| `unit-only` | Run project test command; report exit code |
| `browser-mcp` | Dev server up → `cursor-ide-browser` navigate → snapshot → scenario table |
| `e2e-playwright` | Run project E2E command (e.g. `pnpm exec playwright test`) |
| `manual-user` | Document steps for user; do not mark verify todo completed |
| `skip-for-now` | Report "verification deferred" in English |

## Browser MCP flow (when required)

1. Run tests + build for touched package(s) — exit 0.
2. Start or use running dev server; note URL/port from config or terminal.
3. **cursor-ide-browser:** navigate → snapshot → exercise spec/plan scenarios (login, click, fill, create/edit/delete).
4. Reply with **`## Verification results`** table: Pass / Partial / Fail.

## Screen test docs (UI screens)

When a UI screen is built or changed, also run [screen-test-protocol/SKILL.md](../../skills/screen-test-protocol/SKILL.md):

- Drive the browser test above per screen, then write a per-screen doc at `user_test/<app>/processes/NN-slug.md` (one file per screen) and a run log under `user_test/<app>/runs/`.
- Gate: config `defaults.shared.screen_test_docs` (`auto` | `on-request` | `off`).
- `manual-user` level: skip browser, write manual steps only; do not mark verify todo completed.

## Plan todo alignment

- Plan todo `*-verify` → test + build
- Mark completed only after pass, or document `Could not run` with reason

## Exceptions

- Pure backend/domain change with no UI → unit/build only
- No dev server available → report `Could not run`; do not mark browser todo completed
