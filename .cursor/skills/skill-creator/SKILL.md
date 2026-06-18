---
name: skill-creator
description: >-
  Create, edit, and improve Cursor agent skills (SKILL.md). Use when the user
  wants a new skill, to capture a workflow as a skill, refine skill descriptions
  for better auto-routing, add registry triggers, or review skill structure.
  Trigger on "skill oluştur", "create skill", "yeni skill", "skill yaz",
  "optimize skill description", or "turn this into a skill".
license: MIT
---

# Skill Creator

Help users author skills for `.cursor/skills/` in this kit. Skills are folders with a `SKILL.md` file (YAML frontmatter + markdown instructions).

## Workflow

1. **Capture intent** — What should the skill do? When should it trigger? What is the output format?
2. **Draft SKILL.md** — `name`, `description`, and concise body instructions.
3. **Test manually** — Run 2–3 realistic user prompts; compare with and without the skill.
4. **Iterate** — Tighten triggers, remove fluff, add examples only where they reduce ambiguity.
5. **Register** — Add a route entry to [skills-router/registry.json](../skills-router/registry.json) when hook auto-routing should apply.

Skip heavy eval automation unless the user explicitly wants it.

## Frontmatter

Required:

| Field | Rules |
|-------|--------|
| `name` | Lowercase, hyphens, max 64 chars |
| `description` | Third person; **what** + **when** (triggers live here, not in the body) |

Optional: `license`, `compatibility`, `disable-model-invocation`.

### Description (triggering)

Agents under-trigger skills. Write descriptions that are specific and slightly expansive:

- List file types, verbs, and deliverables (`".docx"`, `merge pdf`, `scaffold module`)
- Include EN and TR phrases when this kit serves both locales
- State what **not** to use the skill for (negative triggers reduce false positives)

Bad: `Helps with documents.`  
Good: `Use when the user works with .pdf files — merge, split, extract text/tables, encrypt. Trigger on ".pdf", "pdf birleştir". Do NOT use for Word or Excel deliverables.`

## Body guidelines

- Keep SKILL.md under ~500 lines; split long reference into `references/` or sibling markdown files.
- Use imperative instructions; explain *why* for non-obvious rules.
- Match existing kit style: tables for config keys, short workflows, links to `.cursor/config/` when relevant.
- No vendor-specific product names in user-facing skill text.
- Bundled `scripts/` only when repetition or validation justifies them — prefer open licenses (MIT/BSD).

## Anatomy

```text
skill-name/
├── SKILL.md          # required
├── LICENSE.txt       # optional; MIT for this repo
├── references/       # optional deep docs
└── scripts/          # optional helpers (write clean-room)
```

## Registry entry

Add to `skills-router/registry.json`:

```json
{
  "id": "my-skill",
  "priority": 70,
  "match": "english pattern|türkçe pattern",
  "skillPath": ".cursor/skills/my-skill/SKILL.md"
}
```

Higher `priority` wins on overlap. Test patterns against real prompts.

## Manual eval (recommended)

For each test prompt:

1. Note whether the agent would read the skill (description match).
2. Execute the task following the skill; save outputs.
3. Collect user feedback; revise description first, then body.

Objective skills (file transforms, fixed steps) benefit from checklists. Subjective skills (tone, design) rely on user review.

## Quality checklist

- [ ] `name` unique in `.cursor/skills/`
- [ ] Description has triggers + negative triggers
- [ ] No secrets or misleading instructions
- [ ] Links use repo-relative paths
- [ ] Registry entry added if auto-route desired
- [ ] README skill table updated if the skill is user-facing

## This repo

- Router: [skills-router/registry.json](../skills-router/registry.json)
- Config-aware skills: link [project.defaults.yaml](../../config/project.defaults.yaml)
- Locale: chat/plan language from config; code and JSON keys in English
