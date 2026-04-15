#!/usr/bin/env bash
# PostToolUse hook: if the just-written file lives in a tracked RAG source dir,
# reindex it incrementally. Silent on non-matches. Never blocks or errors out.
set -u
INPUT=$(cat 2>/dev/null || true)

FILE=$(printf '%s' "$INPUT" | python3 -c 'import json,sys
try:
  d=json.loads(sys.stdin.read() or "{}")
  p=d.get("tool_input",{}).get("file_path") or d.get("file_path") or ""
  print(p)
except Exception:
  print("")
' 2>/dev/null)

[ -z "$FILE" ] && exit 0

case "$FILE" in
  "$HOME"/.claude/projects/*/memory/*.md|\
  "$HOME"/.claude/plans/*.md|\
  "$HOME"/.claude/handoffs/*/*.md|\
  "$HOME"/.claude/skills/*/SKILL.md|\
  "$HOME"/.codex/AGENTS.md|\
  "$HOME"/.codex/rules/*.rules)
    "$HOME/.claude/rag-index/venv/bin/python" \
      "$HOME/.claude/rag-index/build.py" --incremental "$FILE" \
      >>"$HOME/.claude/rag-index/hook.log" 2>&1 &
    ;;
esac
exit 0
