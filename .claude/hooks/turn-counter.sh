#!/usr/bin/env bash
# PostToolUse hook — counts turns and warns at context thresholds
set -euo pipefail

STATE_DIR="${HOME}/.claude/projects"
TURN_FILE="${STATE_DIR}/forgekit-turn-count"

mkdir -p "$STATE_DIR"

COUNT=0
if [[ -f "$TURN_FILE" ]]; then
  COUNT=$(cat "$TURN_FILE" 2>/dev/null || echo 0)
fi

COUNT=$((COUNT + 1))
echo "$COUNT" > "$TURN_FILE"

if [[ $COUNT -eq 12 ]]; then
  echo "Context at ~45% — consider /compact to extend runway." >&2
elif [[ $COUNT -eq 18 ]]; then
  echo "Context ~70% — /compact recommended." >&2
elif [[ $COUNT -ge 22 ]]; then
  echo "Context approaching limit. Save state and start a new session." >&2
fi

exit 0
