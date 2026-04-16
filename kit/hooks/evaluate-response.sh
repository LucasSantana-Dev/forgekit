#!/usr/bin/env bash
# forge-kit PostToolUse hook: flag incomplete AI output
# Gated on RAG_HOOKS_EVALUATE=1 env var
# Detects TODO stubs, NotImplementedError, empty bodies
# Logs warnings to ~/.claude/logs/evaluate-response.log
# Never blocks; exit 0 always

set -eu

# Gate on env var
if [ "${RAG_HOOKS_EVALUATE:-0}" != "1" ]; then
	exit 0
fi

# Parse JSON from stdin to extract file path
tool_input=$(cat)
file_path=$(printf '%s' "$tool_input" | grep -o '"file_path":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$file_path" ]; then
	exit 0
fi

# Ensure file exists
if [ ! -f "$file_path" ]; then
	exit 0
fi

log_dir="$HOME/.claude/logs"
mkdir -p "$log_dir"
log_file="$log_dir/evaluate-response.log"

timestamp=$(date -u +%Y-%m-%dT%H:%M:%SZ)

# Patterns to detect incomplete code
patterns=(
	"// TODO: implement"
	"# TODO: implement"
	"raise NotImplementedError"
	"pass$"
	"return;\\s*$"
	"{}\\s*$"
)

for pattern in "${patterns[@]}"; do
	if grep -E "$pattern" "$file_path" >/dev/null 2>&1; then
		{
			printf '[%s] WARNING: %s — found pattern: %s\n' "$timestamp" "$file_path" "$pattern"
		} >>"$log_file" 2>&1
	fi
done

exit 0
