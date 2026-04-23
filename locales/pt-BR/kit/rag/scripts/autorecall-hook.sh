#!/usr/bin/env bash
# UserPromptSubmit hook: inject top RAG hits for the user's prompt when
# confidence is high. Silent on low-confidence / long prompts. Never blocks.
#
# Env dial:
#   CLAUDE_RAG_AUTORECALL=off        → disabled
#   CLAUDE_RAG_AUTORECALL=quiet      → threshold 0.40 (default)
#   CLAUDE_RAG_AUTORECALL=loud       → threshold 0.30
set -u

MODE="${CLAUDE_RAG_AUTORECALL:-quiet}"
[ "$MODE" = "off" ] && exit 0

INPUT=$(cat 2>/dev/null || true)

PROMPT=$(printf '%s' "$INPUT" | python3 -c 'import json,sys
try:
  d=json.loads(sys.stdin.read() or "{}")
  print(d.get("prompt","") or d.get("user_prompt","") or "")
except Exception:
  print("")
' 2>/dev/null)

# Too short / too long → skip
LEN=${#PROMPT}
[ "$LEN" -lt 15 ] && exit 0
[ "$LEN" -gt 2000 ] && exit 0

THRESHOLD="0.35"
[ "$MODE" = "loud" ] && THRESHOLD="0.28"

RESULT=$("$HOME/.claude/rag-index/venv/bin/python" "$HOME/.claude/rag-index/query.py" \
  --top 3 --format json --scope-repo all --fast "$PROMPT" 2>/dev/null)

[ -z "$RESULT" ] && exit 0

INJECTED=$(printf '%s' "$RESULT" | python3 -c "
import json, os, sys
data = json.loads(sys.stdin.read() or '[]')
threshold = float('$THRESHOLD')
keep = [r for r in data if r.get('cos', 0) >= threshold]
if not keep:
    sys.exit(0)
print('<!-- Auto-recall (RAG top hits; cos >= ' + str(threshold) + '). Treat as hints, verify before relying. -->')
for r in keep:
    tag = r['source_type']
    if r.get('repo'): tag += '/' + r['repo']
    if r.get('symbol'): tag += '::' + r['symbol']
    text = (r['text'] or '')[:500].replace('\n', ' ')
    print(f\"- [{tag}] {r['path']}:{r['start_line']}-{r['end_line']} (cos={r['cos']}) — {text}\")
" 2>/dev/null)

[ -z "$INJECTED" ] && exit 0
# Claude Code reads stdout from UserPromptSubmit hooks and appends it as context.
printf '%s\n' "$INJECTED"
exit 0
