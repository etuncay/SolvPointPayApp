#!/usr/bin/env bash
# beforeSubmitPrompt: record task START time to an activity log + show a short
# on-screen note. Stores start epoch so the stop hook can compute duration.
set -euo pipefail

ROOT="${CURSOR_PROJECT_DIR:-.}"
LOG_DIR="$ROOT/.cursor/logs"
mkdir -p "$LOG_DIR"
LOG_FILE="$LOG_DIR/agent-activity.log"
STATE_FILE="$LOG_DIR/.task-start"

input="$(cat)"

conv=""
if command -v python3 >/dev/null 2>&1; then
  conv="$(printf '%s' "$input" | python3 -c "
import json, sys
try:
    d = json.load(sys.stdin)
    print(d.get('conversation_id') or d.get('session_id') or d.get('thread_id') or '', end='')
except Exception:
    pass
" 2>/dev/null || true)"
fi
[ -z "$conv" ] && conv="session"

now_epoch="$(date +%s)"
now_iso="$(date +"%Y-%m-%dT%H:%M:%S%z")"
now_hm="$(date +"%H:%M:%S")"

printf '%s %s\n' "$now_epoch" "$conv" > "$STATE_FILE"
printf '%s START conv=%s\n' "$now_iso" "$conv" >> "$LOG_FILE"

# Display handled by route-work.sh user_message (rules/skills report). Log only here.
echo '{"continue":true}'
exit 0
