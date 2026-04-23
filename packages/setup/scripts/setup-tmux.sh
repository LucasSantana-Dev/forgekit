#!/usr/bin/env bash
set -euo pipefail

ROOT="${1:?repo root required}"
TMUX_DIR="$HOME/.config/tmux"
EXAMPLES_DIR="$TMUX_DIR/examples"
TMUX_CONF="$HOME/.tmux.conf"
SOURCE_LINE='source-file ~/.config/tmux/tmux.conf'

mkdir -p "$TMUX_DIR" "$EXAMPLES_DIR"

copy_with_backup() {
	local src="$1"
	local dest="$2"
	if [[ -f "$dest" ]]; then
		cp "$dest" "$dest.bak.$(date +%Y%m%d-%H%M%S)"
	fi
	cp "$src" "$dest"
}

copy_with_backup "$ROOT/config/tmux/tmux.conf" "$TMUX_DIR/tmux.conf"
copy_with_backup "$ROOT/config/tmux/bootstrap-project-session.sh" "$TMUX_DIR/bootstrap-project-session.sh"
copy_with_backup "$ROOT/config/tmux/generate-session-template.py" "$TMUX_DIR/generate-session-template.py"
copy_with_backup "$ROOT/config/tmux/onboard-repo.sh" "$TMUX_DIR/onboard-repo.sh"
copy_with_backup "$ROOT/config/tmux/repo-preferences.py" "$TMUX_DIR/repo-preferences.py"
copy_with_backup "$ROOT/config/tmux/sessionizer.sh" "$TMUX_DIR/sessionizer.sh"
copy_with_backup "$ROOT/config/tmux/tmux-smart-new.sh" "$TMUX_DIR/tmux-smart-new.sh"
copy_with_backup "$ROOT/config/tmux/examples/project.tmux.json" "$EXAMPLES_DIR/project.tmux.json"

chmod +x \
	"$TMUX_DIR/bootstrap-project-session.sh" \
	"$TMUX_DIR/generate-session-template.py" \
	"$TMUX_DIR/onboard-repo.sh" \
	"$TMUX_DIR/repo-preferences.py" \
	"$TMUX_DIR/sessionizer.sh" \
	"$TMUX_DIR/tmux-smart-new.sh"

touch "$TMUX_CONF"
grep -Fqx "$SOURCE_LINE" "$TMUX_CONF" || printf '\n%s\n' "$SOURCE_LINE" >>"$TMUX_CONF"
