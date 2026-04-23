#!/usr/bin/env bash
set -euo pipefail
WORKDIR="${1:-${CLAUDE_PROJECT_DIR:-$PWD}}"
HANDOFF_FILE="${2:-}"
warn() { echo "WARN [handoff]: $*" >&2; }
if [ -n "$HANDOFF_FILE" ] && [ -f "$HANDOFF_FILE" ]; then
  grep -qi "next action" "$HANDOFF_FILE" || warn "handoff is missing a clear Next action section"
  grep -qi "done when" "$HANDOFF_FILE" || warn "handoff is missing Done when checks"
fi
PLAN_FILE=$(ls -t "$WORKDIR"/.agents/plans/*.md "$WORKDIR"/.claude/plans/*.md 2>/dev/null | head -1 || true)
if [ -n "$PLAN_FILE" ] && ! grep -q "^- \[ \]" "$PLAN_FILE" 2>/dev/null; then
  warn "active plan has no unchecked tasks; ensure the next action is explicit"
fi
exit 0
