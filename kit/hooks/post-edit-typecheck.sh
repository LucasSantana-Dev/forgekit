#!/usr/bin/env bash
# forge-kit PostToolUse hook: type-checking (advisory)
# Triggered on Write/Edit events
# Reads tool-use JSON from stdin, runs type-checker if applicable
# Print warnings only; exit 0 always (advisory, never blocks)

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

# Detect repo root by walking up from file
repo_root=$(cd "$(dirname "$file_path")" && while [ ! -f package.json ] && [ ! -f pyproject.toml ] && [ ! -f Cargo.toml ] && [ ! -f go.mod ] && [ "$PWD" != "/" ]; do cd ..; done; pwd)

if [ ! -d "$repo_root" ]; then
	repo_root=$(dirname "$file_path")
fi

cd "$repo_root" || exit 0

# Try TypeScript (tsc)
if [ -f tsconfig.json ]; then
	if command -v npx >/dev/null 2>&1; then
		printf '[typecheck] TypeScript: '
		npx tsc --noEmit 2>&1 || true
	fi
fi

# Try mypy (Python)
if [ -f pyproject.toml ]; then
	if command -v mypy >/dev/null 2>&1; then
		printf '[typecheck] mypy: '
		mypy "$file_path" 2>&1 || true
	fi
fi

# Try go vet (Go)
if [ -f go.mod ]; then
	if command -v go >/dev/null 2>&1; then
		printf '[typecheck] go vet: '
		go vet ./... 2>&1 || true
	fi
fi

exit 0
