#!/usr/bin/env bash
# SessionStart hook: refresh ~/.claude/rag-index/weekly.md once per 24h.
# Non-blocking, backgrounded, never errors visibly.
set -u
REPORT="$HOME/.claude/rag-index/weekly.md"
MAX_AGE=86400  # 24h

if [ -f "$REPORT" ]; then
  age=$(( $(date +%s) - $(stat -f %m "$REPORT" 2>/dev/null || stat -c %Y "$REPORT" 2>/dev/null || echo 0) ))
  [ "$age" -lt "$MAX_AGE" ] && exit 0
fi

"$HOME/.claude/rag-index/venv/bin/python" "$HOME/.claude/rag-index/report.py" \
  >>"$HOME/.claude/rag-index/report.log" 2>&1 &
exit 0
