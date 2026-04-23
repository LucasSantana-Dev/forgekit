#!/usr/bin/env bash
set -euo pipefail

ROOT="${1:?repo root required}"
TARGET="${2:-auto}"
INSTALL_DIR="$HOME/.config/ai-dev-toolkit"
SCRIPTS_DIR="$INSTALL_DIR/scripts"
# shellcheck disable=SC2016
SOURCE_LINE='[ -f "$HOME/.config/ai-dev-toolkit/shell.sh" ] && . "$HOME/.config/ai-dev-toolkit/shell.sh"'

mkdir -p "$INSTALL_DIR"
cp "$ROOT/config/shell/shell.sh" "$INSTALL_DIR/shell.sh"
mkdir -p "$SCRIPTS_DIR"
cp "$ROOT/scripts/sync-toolkit-version.py" "$SCRIPTS_DIR/sync-toolkit-version.py"
chmod +x "$SCRIPTS_DIR/sync-toolkit-version.py"

append_once() {
	local file="$1"
	mkdir -p "$(dirname "$file")"
	touch "$file"
	grep -Fqx "$SOURCE_LINE" "$file" || printf '\n%s\n' "$SOURCE_LINE" >>"$file"
}

case "$TARGET" in
auto)
	if [[ -n "${ZSH_VERSION:-}" || "${SHELL:-}" == *zsh ]]; then
		append_once "$HOME/.zshrc"
	else
		append_once "$HOME/.bashrc"
	fi
	;;
bash)
	append_once "$HOME/.bashrc"
	;;
zsh)
	append_once "$HOME/.zshrc"
	;;
both)
	append_once "$HOME/.bashrc"
	append_once "$HOME/.zshrc"
	;;
none) ;;
*)
	printf 'Shell target inválido: %s\n' "$TARGET" >&2
	exit 1
	;;
esac
