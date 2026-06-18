#!/usr/bin/env bash
# PreToolUse hook — protects sensitive files from direct editing
set -euo pipefail

INPUT=$(cat)
FILE=$(echo "$INPUT" | python3 -c "
import json, sys
d = json.load(sys.stdin)
ti = d.get('tool_input', {})
print(ti.get('file_path', '') or ti.get('path', '') or '')
" 2>/dev/null || echo "")

# Files that should not be directly edited
PROTECTED_PATTERNS=(
  'package-lock.json'
  'pnpm-lock.yaml'
  '.env'
  '.env.local'
  '.env.production'
)

for pat in "${PROTECTED_PATTERNS[@]}"; do
  if echo "$FILE" | grep -qE "$pat$"; then
    echo "WARNING: '$FILE' is a protected file. Edit rejected by protect-files hook." >&2
    exit 1
  fi
done

exit 0
