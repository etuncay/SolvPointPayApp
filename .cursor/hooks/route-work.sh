#!/usr/bin/env bash
# beforeSubmitPrompt: intent classify + intake gate + skill router + context report
set -euo pipefail

ROOT="${CURSOR_PROJECT_DIR:-.}"
ENGINE="$ROOT/.cursor/hooks/lib/route_engine.py"

input="$(cat)"
[ -z "$input" ] && echo '{"continue":true}' && exit 0

if [ ! -f "$ENGINE" ]; then
  echo '{"continue":true}'
  exit 0
fi

printf '%s' "$input" | python3 "$ENGINE"
exit 0
