#!/usr/bin/env bash
set -euo pipefail
INPUT=$(cat 2>/dev/null || true)
PROMPT=$(python3 -c 'import json,sys
try:
 d=json.loads(sys.stdin.read() or "{}")
 print(d.get("prompt") or d.get("user_prompt") or "")
except Exception:
 print("")' <<< "$INPUT")
[ ${#PROMPT} -lt 24 ] && exit 0
printf '%s' "$PROMPT" | grep -qiE 'implement|refactor|fix|debug|investigate|replace|migrate|review|ship|plan|design' || exit 0
PACK_TOOL="$HOME/.claude/rag-index/venv/bin/python"
PACK_SCRIPT="$HOME/.claude/rag-index/pack.py"
[ -x "$PACK_TOOL" ] || exit 0
[ -f "$PACK_SCRIPT" ] || exit 0
OUTPUT=$(timeout 12 "$PACK_TOOL" "$PACK_SCRIPT" "$PROMPT" --budget 1800 --diff 2>/dev/null || true)
[ -z "$OUTPUT" ] && exit 0
printf '%s\n' "$OUTPUT"
