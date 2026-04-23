#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WITH_ITERM2=false
SHELL_TARGET="auto"
SKIP_PACKAGES=false
WORK_MAC=false

while [[ $# -gt 0 ]]; do
	case "$1" in
	--with-iterm2) WITH_ITERM2=true ;;
	--shell)
		shift
		SHELL_TARGET="${1:-auto}"
		;;
	--skip-packages) SKIP_PACKAGES=true ;;
	--work-mac)
		SKIP_PACKAGES=true
		WORK_MAC=true
		;;
	*)
		printf 'Unknown argument: %s\n' "$1" >&2
		exit 1
		;;
	esac
	shift || true
done

OS="$(uname -s)"

if ! $SKIP_PACKAGES; then
	case "$OS" in
	Darwin)
		bash "$ROOT/scripts/install-macos.sh" "$ROOT"
		;;
	Linux)
		bash "$ROOT/scripts/install-ubuntu.sh" "$ROOT"
		;;
	*)
		printf 'Unsupported OS for bootstrap.sh: %s\nUse bootstrap.ps1 on Windows.\n' "$OS" >&2
		exit 1
		;;
	esac
fi

bash "$ROOT/scripts/install-ai-clis.sh"

bash "$ROOT/scripts/setup-tmux.sh" "$ROOT"
bash "$ROOT/scripts/setup-shell.sh" "$ROOT" "$SHELL_TARGET"
bash "$ROOT/scripts/setup-ai-tools.sh" "$ROOT"
bash "$ROOT/scripts/setup-local-env.sh" "$ROOT"

if [[ "$OS" == "Darwin" && "$WITH_ITERM2" == "true" ]]; then
	bash "$ROOT/scripts/setup-iterm2.sh" "$ROOT"
fi

if $WORK_MAC; then
	echo
	echo "Work-Mac mode: skipping Homebrew-dependent installs."
	echo "See docs/work-mac-setup.md for manual steps."
fi

bash "$ROOT/scripts/doctor.sh"

cat <<'EOF'

Bootstrap concluído.

Próximos passos:
  1. Abra um novo terminal
	2. Rode: source ~/.bashrc  (ou source ~/.zshrc)
	3. Autentique o GitHub: gh auth login
	4. Opcional: bash ./scripts/auth-ai-tools.sh
	5. Em um repositório, use: repo-terminal-ready

Se quiser iTerm2 no macOS:
  ./bootstrap.sh --with-iterm2
EOF
