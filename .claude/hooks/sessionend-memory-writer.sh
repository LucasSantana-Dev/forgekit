#!/usr/bin/env bash
# Stop hook — reminds to capture session memory
set -euo pipefail

INPUT=$(cat)
STOP_REASON=$(echo "$INPUT" | python3 -c "import json,sys; print(json.load(sys.stdin).get('stop_hook_active',''))" 2>/dev/null || echo "")

if [[ "$STOP_REASON" != "true" ]]; then
  echo "Session ending. Consider: save key decisions to memory, update .agents/memory/MEMORY.md if new patterns emerged." >&2
fi

STATE_DIR="${HOME}/.claude/projects"
rm -f "${STATE_DIR}/forgekit-turn-count" 2>/dev/null || true
rm -f "${STATE_DIR}/forgekit-session-start" 2>/dev/null || true

exit 0
