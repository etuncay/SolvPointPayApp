#!/usr/bin/env bash
# beforeReadFile: track when agent reads kit rules/skills/config (display-only state).
set -euo pipefail

ROOT="${CURSOR_PROJECT_DIR:-.}"
STATE="$ROOT/.cursor/logs/.active-context.json"
mkdir -p "$ROOT/.cursor/logs"

input="$(cat)"
[ -z "$input" ] && echo '{"permission":"allow"}' && exit 0

INPUT="$input" STATE="$STATE" CURSOR_PROJECT_DIR="$ROOT" python3 <<'PY'
import json
import os
from pathlib import Path

raw = os.environ.get("INPUT", "")
state_path = Path(os.environ["STATE"])

try:
    data = json.loads(raw)
except json.JSONDecodeError:
    print('{"permission":"allow"}')
    raise SystemExit(0)

file_path = data.get("file_path") or ""
if not file_path:
    print('{"permission":"allow"}')
    raise SystemExit(0)

root = Path(os.environ.get("CURSOR_PROJECT_DIR", ".")).resolve()
try:
    rel = Path(file_path).resolve().relative_to(root.resolve()).as_posix()
except ValueError:
    print('{"permission":"allow"}')
    raise SystemExit(0)

state = {"rules_read": [], "skills_read": [], "configs_read": []}
if state_path.is_file():
    try:
        with state_path.open(encoding="utf-8") as f:
            state = json.load(f)
    except (OSError, json.JSONDecodeError):
        pass


def add(key: str, label: str) -> None:
    items = state.setdefault(key, [])
    if label not in items:
        items.append(label)


if rel.startswith(".cursor/rules/") and rel.endswith(".mdc"):
    add("rules_read", Path(rel).name)
elif rel.startswith(".cursor/skills/") and rel.endswith("/SKILL.md"):
    add("skills_read", Path(rel).parent.name)
elif rel == ".cursor/config/project.defaults.yaml":
    add("configs_read", "project.defaults.yaml")
elif rel == ".cursor/config/project.intake-fields.yaml":
    add("configs_read", "project.intake-fields.yaml")

state_path.parent.mkdir(parents=True, exist_ok=True)
with state_path.open("w", encoding="utf-8") as f:
    json.dump(state, f, ensure_ascii=False, indent=2)

print('{"permission":"allow"}')
PY

exit 0
