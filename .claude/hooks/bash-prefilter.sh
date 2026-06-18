#!/usr/bin/env bash
# PreToolUse hook — blocks destructive shell commands
set -euo pipefail

INPUT=$(cat)
CMD=$(echo "$INPUT" | python3 -c "import json,sys; d=json.load(sys.stdin); print(d.get('tool_input',{}).get('command',''))" 2>/dev/null || echo "")

# Patterns that should be blocked
BLOCKED_PATTERNS=(
  'rm -rf /'
  'rm -rf ~'
  'git reset --hard'
  'git clean -f'
  'git push.*--force'
  'git push origin main --force'
  'DROP TABLE'
  'DELETE FROM'
  'chmod -R 777'
  'dd if=/dev/zero'
  'mkfs'
)

for pat in "${BLOCKED_PATTERNS[@]}"; do
  if echo "$CMD" | grep -qiE "$pat"; then
    echo "BLOCKED: Command matches dangerous pattern '$pat'. Rejected by bash-prefilter hook." >&2
    exit 1
  fi
done

exit 0
