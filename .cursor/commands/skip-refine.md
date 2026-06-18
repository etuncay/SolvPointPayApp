# Skip refinement

Proceed without prompt refinement gate.

## Behavior

1. Treat this session as **refinement skipped** — same effect as prompt text `skip refinement`
2. Do not run prompt-refinement skill
3. Proceed directly to routed skill (intake, plan, design, scaffold) or user task

## When to use

- Prompt is already detailed and structured
- User has `[refined-prompt]` or `## Goal` section in prompt
- Speed is preferred over clarification round

## Stop rules

- If prompt is vague (< `prompt_refinement_min_words` words), warn once before proceeding
- Do not skip intake gate unless user also uses `/skip-intake`
