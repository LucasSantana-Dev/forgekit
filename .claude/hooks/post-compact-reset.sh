#!/usr/bin/env bash
# post-compact-reset.sh — PostCompact hook
# Surfaces key state after compaction so the agent can reorient quickly.

set -euo pipefail

INPUT=$(cat)

# Check if there was a pre-compact state marker
STATE_DIR="/tmp/claude-hook-state-$$"
if [ -f "$STATE_DIR/pre-compact.json" ]; then
    rm -f "$STATE_DIR/pre-compact.json" 2>/dev/null || true
fi

# Output reorientation guidance
echo "Context compacted. Re-read active task context if needed: git status, open files, current branch."
