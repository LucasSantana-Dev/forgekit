#!/usr/bin/env bash
# PostToolUse hook — tracks session duration
set -euo pipefail

STATE_DIR="${HOME}/.claude/projects"
SESSION_FILE="${STATE_DIR}/forgekit-session-start"

mkdir -p "$STATE_DIR"

if [[ ! -f "$SESSION_FILE" ]]; then
  date +%s > "$SESSION_FILE"
fi

START=$(cat "$SESSION_FILE" 2>/dev/null || echo 0)
NOW=$(date +%s)
ELAPSED=$((NOW - START))
HOURS=$((ELAPSED / 3600))

if [[ $HOURS -ge 3 && $((ELAPSED % 3600)) -lt 60 ]]; then
  echo "Session running for ${HOURS}h. Consider wrapping up or saving state." >&2
fi

exit 0
