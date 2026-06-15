#!/usr/bin/env bash
# sessionStart: derive stack signals from repo — project-agnostic
set -euo pipefail

ROOT="${CURSOR_PROJECT_DIR:-.}"
signals=()

# Language / runtime
if [ -f "$ROOT/package.json" ] || [ -f "$ROOT/app/package.json" ]; then
  signals+=("nodejs")
fi
if find "$ROOT" -maxdepth 3 -name "*.csproj" 2>/dev/null | head -1 | grep -q .; then
  signals+=("dotnet")
fi
if [ -f "$ROOT/pyproject.toml" ] || [ -f "$ROOT/requirements.txt" ]; then
  signals+=("python")
fi
if [ -f "$ROOT/go.mod" ]; then
  signals+=("go")
fi
if [ -f "$ROOT/Cargo.toml" ]; then
  signals+=("rust")
fi

# Platform
PKG=""
[ -f "$ROOT/app/package.json" ] && PKG="$ROOT/app/package.json"
[ -z "$PKG" ] && [ -f "$ROOT/package.json" ] && PKG="$ROOT/package.json"

if [ -n "$PKG" ]; then
  grep -q '"expo"' "$PKG" 2>/dev/null && signals+=("expo")
  grep -q 'react-native' "$PKG" 2>/dev/null && signals+=("react-native")
  grep -q '"next"' "$PKG" 2>/dev/null && signals+=("nextjs")
  grep -q '"vite"' "$PKG" 2>/dev/null && signals+=("vite")
  grep -q '"vue"' "$PKG" 2>/dev/null && signals+=("vue")
  grep -q '"@angular/core"' "$PKG" 2>/dev/null && signals+=("angular")
fi

[ -d "$ROOT/android" ] || [ -d "$ROOT/app/android" ] && signals+=("android-native")
[ -d "$ROOT/ios" ] || [ -d "$ROOT/app/ios" ] && signals+=("ios-native")
[ -d "$ROOT/apps" ] && signals+=("monorepo")
[ -d "$ROOT/docs" ] && signals+=("spec-docs")
if find "$ROOT/.cursor/plans/_briefs" -maxdepth 1 -name '*.brief.md' 2>/dev/null | head -1 | grep -q .; then
  signals+=("has-briefs")
fi

# Tailwind / Bootstrap
if find "$ROOT" -maxdepth 4 -name "tailwind.config.*" 2>/dev/null | head -1 | grep -q .; then
  signals+=("tailwind")
fi
if [ -n "$PKG" ] && grep -qE 'bootstrap|react-bootstrap' "$PKG" 2>/dev/null; then
  signals+=("bootstrap")
fi

joined=$(IFS=, ; echo "${signals[*]:-unknown}")

# Reset per-session read tracking for context report
LOG_DIR="$ROOT/.cursor/logs"
mkdir -p "$LOG_DIR"
printf '{"rules_read":[],"skills_read":[],"configs_read":[]}\n' > "$LOG_DIR/.active-context.json"

cat <<EOF
{"additional_context": "[Stack:${joined}]"}
EOF
exit 0
