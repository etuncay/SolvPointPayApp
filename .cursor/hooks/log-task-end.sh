#!/usr/bin/env bash
# stop: record task END time + duration to the activity log.
set -euo pipefail

ROOT="${CURSOR_PROJECT_DIR:-.}"
LOG_DIR="$ROOT/.cursor/logs"
mkdir -p "$LOG_DIR"
LOG_FILE="$LOG_DIR/agent-activity.log"
STATE_FILE="$LOG_DIR/.task-start"

cat >/dev/null 2>&1 || true

now_epoch="$(date +%s)"
now_iso="$(date +"%Y-%m-%dT%H:%M:%S%z")"

dur="?"
conv="session"
if [ -f "$STATE_FILE" ]; then
  start_epoch="$(awk '{print $1}' "$STATE_FILE" 2>/dev/null || echo "")"
  file_conv="$(awk '{print $2}' "$STATE_FILE" 2>/dev/null || echo "")"
  [ -n "$file_conv" ] && conv="$file_conv"
  if [[ "$start_epoch" =~ ^[0-9]+$ ]]; then
    dur="$(( now_epoch - start_epoch ))s"
  fi
  rm -f "$STATE_FILE"
fi

printf '%s END   conv=%s duration=%s\n' "$now_iso" "$conv" "$dur" >> "$LOG_FILE"

echo '{}'
exit 0
