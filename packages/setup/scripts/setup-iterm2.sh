#!/usr/bin/env bash
set -euo pipefail

ROOT="${1:?repo root required}"
ITERM_DIR="$HOME/.config/iterm2"

mkdir -p "$ITERM_DIR"
cp "$ROOT/config/iterm2/forge_terminal_stack.py" "$ITERM_DIR/forge_terminal_stack.py"
cp "$ROOT/config/iterm2/iterm-clean-start.sh" "$ITERM_DIR/iterm-clean-start.sh"
chmod +x "$ITERM_DIR/iterm-clean-start.sh"

if [[ -d "/Applications/iTerm.app" || -d "$HOME/Applications/iTerm.app" ]]; then
	python3 "$ITERM_DIR/forge_terminal_stack.py" --default focus
fi
