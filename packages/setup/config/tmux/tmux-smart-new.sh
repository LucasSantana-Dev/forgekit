#!/usr/bin/env bash
set -euo pipefail
name="${1:-main}"
path="${2:-$PWD}"

if tmux has-session -t "$name" 2>/dev/null; then
	exec tmux switch-client -t "$name"
fi

exec tmux new-session -d -s "$name" -c "$path"
