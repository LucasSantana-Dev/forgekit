#!/usr/bin/env bash
# pre-compact-summary.sh — PreCompact hook
# Generates a brief summary of current task state before context compaction.
# Helps the agent maintain orientation after compact resets context.

set -euo pipefail

INPUT=$(cat)

# Extract compaction info if available
REASON=$(echo "$INPUT" | python3 -c "
import json, sys
try:
    data = json.load(sys.stdin)
    print(data.get('reason', 'manual'))
except:
    print('manual')
" 2>/dev/null || echo "manual")

# Write a compact state marker so post-compact can reference it
STATE_DIR="/tmp/claude-hook-state-$$"
mkdir -p "$STATE_DIR" 2>/dev/null || true

echo "{\"pre_compact\": true, \"reason\": \"$REASON\", \"timestamp\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"}" > "$STATE_DIR/pre-compact.json" 2>/dev/null || true

# Advisory output — tells the agent compaction is about to happen
echo "Context compaction imminent ($REASON). Preserve active task state and file references."
