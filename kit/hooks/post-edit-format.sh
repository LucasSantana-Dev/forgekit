#!/usr/bin/env bash
# forge-kit PostToolUse hook: auto-format edited files
# Triggered on Write/Edit events
# Reads tool-use JSON from stdin, detects repo formatter, runs formatting
# Exit 0 always (advisory, never blocks)

set -eu

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
log_file="$log_dir/format.log"

# Log entry
{
	printf '[%s] %s ' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$file_path"
} >>"$log_file" 2>&1

# Detect repo root by walking up from file
repo_root=$(cd "$(dirname "$file_path")" && while [ ! -f package.json ] && [ ! -f pyproject.toml ] && [ ! -f Cargo.toml ] && [ ! -f go.mod ] && [ "$PWD" != "/" ]; do cd ..; done; pwd)

if [ ! -d "$repo_root" ]; then
	repo_root=$(dirname "$file_path")
fi

cd "$repo_root" || exit 0

# Try npm format (first priority)
if [ -f package.json ]; then
	if grep -q '"format"' package.json 2>/dev/null; then
		if command -v npm >/dev/null 2>&1; then
			npm run format --silent "$file_path" >>"$log_file" 2>&1 || true
			printf 'npm format\n' >>"$log_file" 2>&1
			exit 0
		fi
	fi
fi

# Try ruff (Python)
if [ -f pyproject.toml ]; then
	if command -v ruff >/dev/null 2>&1; then
		ruff format "$file_path" >>"$log_file" 2>&1 || true
		printf 'ruff format\n' >>"$log_file" 2>&1
		exit 0
	fi
fi

# Try cargo fmt (Rust)
if [ -f Cargo.toml ]; then
	if command -v cargo >/dev/null 2>&1; then
		cargo fmt --quiet >>"$log_file" 2>&1 || true
		printf 'cargo fmt\n' >>"$log_file" 2>&1
		exit 0
	fi
fi

# Try gofmt (Go)
if [ -f go.mod ]; then
	if command -v gofmt >/dev/null 2>&1; then
		gofmt -w "$file_path" >>"$log_file" 2>&1 || true
		printf 'gofmt\n' >>"$log_file" 2>&1
		exit 0
	fi
fi

# No formatter found
printf 'no-formatter\n' >>"$log_file" 2>&1
exit 0
