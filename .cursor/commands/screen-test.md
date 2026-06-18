# Screen test

Run browser tests and generate per-screen test documentation.

## Prerequisites

- UI screen(s) built or changed, or explicit screen list in prompt
- Dev server reachable for auto mode, or document manual steps

## Workflow

1. Read `.cursor/skills/screen-test-protocol/SKILL.md` and follow its flow
2. Launch **`route-mapper`** subagent before Step 3 (browser test) to resolve screen list and routes
3. Bootstrap `user_test/<app>/` folders from templates if missing
4. Run `cursor-ide-browser` tests per screen (create/edit/delete/validation)
5. Write `user_test/<app>/processes/NN-slug.md` per screen
6. Register app in `user_test/index.md`

## Subagents

| When | Subagent |
|------|----------|
| Before browser test (Step 3) | `route-mapper` |

## Stop rules

- Stop on login wall, captcha, 2FA — mark `Could not run (blocker: …)` and write manual steps
- Skip browser if no dev server; set `tested_by: manual`
- Respect `screen_test_docs: off` in config
