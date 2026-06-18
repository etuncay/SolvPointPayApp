# Status

Show current Agent Kit context — briefs, plans, git state, last hook report.

## Workflow

1. List briefs: `.cursor/plans/_briefs/*.brief.md` (name, mtime if available)
2. List plans: `.cursor/plans/features/*.plan.md`, `.cursor/plans/design-*.plan.md`
3. For latest or user-specified plan, summarize todo counts (`pending`, `in_progress`, `completed`)
4. Run `git branch --show-current` and `git log -1 --oneline` if git repo
5. Read and summarize `.cursor/logs/last-context-report.txt` if present
6. List available subagents in `.cursor/agents/` and commands in `.cursor/commands/`

## Output format

```markdown
## Agent Kit status

### Briefs
- <path> or none

### Plans
- <path> — todos: <counts>

### Git
- Branch: <name>
- Last commit: <hash> <message>

### Last context report
<summary or NOT_FOUND>

### Kit artifacts
- Subagents: <count> in .cursor/agents/
- Commands: <count> in .cursor/commands/
```

Readonly — do not modify files.
