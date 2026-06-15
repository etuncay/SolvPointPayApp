# Design Intake — [Feature]

> Example: Android-first phone cleaner. Specs: `product-plan.md`, `screens.md`.

## Intake mode

Agent **infers** brief fields from the user prompt and specs first.  
Missing fields only → **one** `AskQuestion` round with **multiple-choice** options (see `design-intake` skill and `intake-canonical-options.md`).

## Platform (infer → ask if blocking)

- Stack: React Native CLI / Expo / not scaffolded yet
- Target platform (e.g. Android-first)
- OS version range: (default per product plan unless user specifies)

## Brief (approved via AskQuestion or inferred)

| Field | Value | Source |
|-------|-------|--------|
| Target screen | e.g. MVP flow, Dashboard | inferred / user MC |
| Aesthetic | e.g. soft-pastel | inferred / user MC |
| Reference | e.g. screens spec | inferred / user MC |
| Theme | e.g. dark-light-single-accent | inferred / user MC |
| Interaction | e.g. low | inferred / user MC |
| Scope | e.g. plan-and-implement | inferred / user MC |

## Theme notes

- Dark default per spec unless user chose otherwise
- Token file: yes/no — if no, encode as principles until scaffolded

## Plan status

→ `.cursor/plans/design-XXX.plan.md`
