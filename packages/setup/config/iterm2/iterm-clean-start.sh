#!/usr/bin/env bash
set -euo pipefail

SAVED_STATE_DIR="$HOME/Library/Application Support/iTerm2/SavedState"
BACKUP_ROOT="$HOME/.config/iterm2/backups"
TS="$(date +%Y%m%d-%H%M%S)"
BACKUP_DIR="$BACKUP_ROOT/savedstate-$TS"

mkdir -p "$BACKUP_DIR"

if pgrep -f "iTerm2|iTermServer" >/dev/null 2>&1; then
	pkill -f iTerm2 || true
	pkill -f iTermServer || true
	sleep 1
fi

if [[ -d "$SAVED_STATE_DIR" ]]; then
	shopt -s nullglob
	for f in "$SAVED_STATE_DIR"/*; do
		mv "$f" "$BACKUP_DIR/"
	done
	shopt -u nullglob
fi

open -a iTerm
printf 'Backed up and cleared saved state to: %s\n' "$BACKUP_DIR"
