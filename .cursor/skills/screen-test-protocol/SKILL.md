---
name: screen-test-protocol
description: >-
  Drive automatic browser screen tests (login, click, fill, create/edit/delete)
  via cursor-ide-browser when a dev server is up, and generate per-screen test
  docs under user_test/<app>/. Use after building or changing a UI screen, or on
  "ekran testi yap", "screen test", "test docs", "smoke test ekran".
---

# Screen test protocol

Two outputs for every UI screen built or changed:

1. **Automatic browser test** (when a dev server is reachable) using `cursor-ide-browser` — log in, navigate, click, fill forms, and exercise create / edit / delete.
2. **Per-screen Markdown doc** under `user_test/<app>/processes/NN-slug.md` so the end user can re-run the test manually.

**Instruction language:** English (this file). **Generated docs language:** `locale.chat` from [project.defaults.yaml](../../config/project.defaults.yaml) (default Turkish). **Templates:** [user_test/_templates/](../../../user_test/_templates/).

## When to apply

- After implementing or changing a screen/route with UI (during the verify step of a plan).
- Explicit: "ekran testi", "screen test", "test dokumani", "smoke test", `[Work Intent: SCREEN_TEST]` hook context.
- Config gate: `defaults.shared.screen_test_docs` = `auto` (run when server up) | `on-request` (only when asked) | `off` (skip).

## When NOT to apply

- Pure backend / domain / library change with no UI.
- `screen_test_docs: off`, or brief `verification: skip-for-now`.

## Step 1 - Resolve inputs

Resolve, in order user prompt -> repo -> config -> ask only if blocking:

| Input | Source |
|-------|--------|
| `app` slug | monorepo `apps/*` dir, single app name, or prompt |
| `dev_url` + `dev_command` | repo scripts (`package.json`, `*.csproj`), running terminal, or config |
| screen list + routes | router files, plan scope, `docs/` specs |
| auth / role / seed | brief `auth`, mock seed, fixtures |

If `user_test/_templates/` is missing (consumer project not scaffolded), create the four templates from this kit before generating docs.

## Step 2 - Bootstrap folders

Create when missing (do not overwrite existing docs):

```
user_test/<app>/
  index.md          (from _templates/app-index.template.md)
  processes/
  fixtures/
  runs/
```

Register the app row in [user_test/index.md](../../../user_test/index.md).

## Step 3 - Automatic browser test (auto mode, server up)

Use `cursor-ide-browser`. Keep focus background; never use CDP `Input.*`.

1. `browser_navigate` to `dev_url`; `browser_lock` (lock) for the session.
2. **Login** if required — fill credentials from mock seed/fixture, submit, confirm landing.
3. For **each screen**:
   - Navigate to route; `browser_snapshot` for structure; `browser_take_screenshot` for evidence.
   - **Create:** fill the form with valid fixture data, submit, assert success (toast/row/redirect).
   - **Edit:** open a record, change a field, save, assert update.
   - **Delete:** remove a record, confirm, assert it is gone.
   - **Validation:** submit invalid/empty input, assert field error shown.
   - Record Pass / Partial / Fail per scenario.
4. `browser_lock` (unlock) when done.

**Blocker handling (stop, do not brute force):** real login wall, captcha, 2FA, OTP, payment, or destructive irreversible action -> stop that screen, mark the auto result `Could not run (blocker: ...)`, and fall back to writing the manual steps so the user can complete it. Follow the 4-attempt limit in the browser server instructions.

If no dev server is reachable: skip browser steps, set `tested_by: manual`, and still write full manual docs.

## Step 4 - Write per-screen doc

For each screen create/update `user_test/<app>/processes/NN-slug.md` from [process.template.md](../../../user_test/_templates/process.template.md):

- Fill frontmatter (`app`, `screen`, `route`, `dev_url`, `auth`, `updated`, `status`, `tested_by`).
- Fill **Adimlar** (manual steps a user follows) and **CRUD / form senaryolari**.
- Fill **Otomatik test sonucu** with the run date and Pass/Partial/Fail.
- Link related code/plan paths.
- New fixtures -> `fixtures/*.md` from [fixture.template.md](../../../user_test/_templates/fixture.template.md).

Keep one file per screen. Group sub-screens with `NN.x-slug.md` if needed.

## Step 5 - Run log + index

- Append a session log `user_test/<app>/runs/YYYY-MM-DD-<scope>.md` from [run.template.md](../../../user_test/_templates/run.template.md).
- Update `<app>/index.md` screen table (status + result).

## Step 6 - Report

Reply (in `locale.chat`) with a **`## Verification results`** table: Screen | Scenario | Pass/Partial/Fail | Note, plus the list of doc files written. Mark a plan `*-verify` todo completed only on Pass, otherwise document `Could not run` with the reason.

## Safety

- No real PII (TCKN, phone, email) in fixtures or docs — synthetic / mock seed only.
- No code changes in `user_test/` — test documentation only.
- Never perform irreversible production actions during automated runs.

Related: [verification.md](../../plans/_shared/verification.md) - [screen-test-docs.mdc](../../rules/screen-test-docs.mdc)

## Subagent delegation

- **Before Step 3 (browser test):** Launch `route-mapper` to resolve screen list, routes, and auth requirements.
