#!/usr/bin/env bash
# complexity-advisor.sh — PostToolUse hook for UserPromptSubmit
# Classifies prompt complexity and recommends agent tier.
# Output is advisory — the orchestrator decides routing.
#
# Complexity tiers:
#   low    → single-file edit, grep, config change → fast/local agent
#   medium → multi-file feature, bug fix, test writing → standard agent
#   high   → architecture, cross-repo, security audit → oracle/architect agent

set -euo pipefail

INPUT=$(cat)

# Extract the user prompt from the input JSON
PROMPT=$(echo "$INPUT" | python3 -c "
import json, sys
try:
    data = json.load(sys.stdin)
    # Try common fields
    prompt = data.get('prompt', '') or data.get('input', '') or data.get('message', '') or ''
    print(prompt)
except:
    print('')
" 2>/dev/null || echo "")

# Empty prompt — skip
if [ -z "$PROMPT" ]; then
    exit 0
fi

PROMPT_LEN=${#PROMPT}
WORD_COUNT=$(echo "$PROMPT" | wc -w | tr -d ' ')

# High-complexity signals
HIGH_SIGNALS=0
echo "$PROMPT" | grep -qiE '(architecture|security|audit|refactor.*across|cross-repo|migration|scale|performance.*bottleneck|data.*integrity|threat.*model)' && HIGH_SIGNALS=$((HIGH_SIGNALS + 1))
echo "$PROMPT" | grep -qiE '(design.*system|api.*design|database.*schema|infrastructure|deploy.*prod|incident|production.*down)' && HIGH_SIGNALS=$((HIGH_SIGNALS + 1))
[ "$WORD_COUNT" -gt 100 ] && HIGH_SIGNALS=$((HIGH_SIGNALS + 1))
[ "$PROMPT_LEN" -gt 500 ] && HIGH_SIGNALS=$((HIGH_SIGNALS + 1))

# Low-complexity signals
LOW_SIGNALS=0
echo "$PROMPT" | grep -qiE '(grep|find|search|show|list|read|cat|head|tail|what is|where is)' && LOW_SIGNALS=$((LOW_SIGNALS + 1))
echo "$PROMPT" | grep -qiE '(rename|move|copy|delete.*file|format|lint|fix.*typo|update.*version)' && LOW_SIGNALS=$((LOW_SIGNALS + 1))
[ "$WORD_COUNT" -lt 15 ] && LOW_SIGNALS=$((LOW_SIGNALS + 1))
[ "$PROMPT_LEN" -lt 100 ] && LOW_SIGNALS=$((LOW_SIGNALS + 1))

# Classify
if [ "$HIGH_SIGNALS" -ge 2 ]; then
    TIER="high"
    RECOMMENDATION="Route to oracle/architect agent. Use high reasoning effort."
elif [ "$LOW_SIGNALS" -ge 2 ]; then
    TIER="low"
    RECOMMENDATION="Route to fast/local agent. Standard reasoning sufficient."
else
    TIER="medium"
    RECOMMENDATION="Route to standard coding agent. Medium reasoning effort."
fi

# Output advisory signal (consumed by orchestrator if available)
echo "{\"complexity\": \"$TIER\", \"recommendation\": \"$RECOMMENDATION\", \"prompt_length\": $PROMPT_LEN, \"word_count\": $WORD_COUNT}"
