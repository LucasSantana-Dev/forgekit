#!/usr/bin/env bash
set -euo pipefail

OS="$(uname -s)"

install_opencode() {
	if command -v opencode >/dev/null 2>&1; then
		return 0
	fi

	case "$OS" in
	Darwin)
		if command -v brew >/dev/null 2>&1; then
			brew install anomalyco/tap/opencode
			return 0
		fi
		;;
	Linux)
		if command -v npm >/dev/null 2>&1; then
			npm install -g opencode-ai
			return 0
		fi
		;;
	esac

	echo "Could not auto-install opencode on this platform." >&2
	return 1
}

install_claude() {
	if command -v claude >/dev/null 2>&1; then
		return 0
	fi

	case "$OS" in
	Darwin)
		if command -v brew >/dev/null 2>&1; then
			brew install --cask claude-code
			return 0
		fi
		;;
	Linux)
		curl -fsSL https://claude.ai/install.sh | bash
		return 0
		;;
	esac

	echo "Could not auto-install Claude Code on this platform." >&2
	return 1
}

install_rtk() {
	if command -v rtk >/dev/null 2>&1; then
		return 0
	fi

	case "$OS" in
	Darwin)
		if command -v brew >/dev/null 2>&1; then
			brew install rtk
			return 0
		fi
		;;
	Linux)
		if command -v npm >/dev/null 2>&1; then
			npm install -g openrtk
			return 0
		fi
		;;
	esac

	echo "Could not auto-install rtk on this platform." >&2
	return 1
}

install_oh_my_openagents() {
	if npm list -g oh-my-claude-sisyphus >/dev/null 2>&1; then
		return 0
	fi

	if command -v npm >/dev/null 2>&1; then
		npm install -g oh-my-claude-sisyphus
		return 0
	fi

	echo "Could not auto-install oh-my-openagents (npm required)." >&2
	return 1
}

install_openclaw() {
	if npm list -g openclaw >/dev/null 2>&1; then
		return 0
	fi

	if command -v npm >/dev/null 2>&1; then
		npm install -g openclaw
		return 0
	fi

	echo "Could not auto-install openclaw (npm required)." >&2
	return 1
}

install_gemini() {
	if command -v gemini >/dev/null 2>&1; then
		return 0
	fi

	if command -v npm >/dev/null 2>&1; then
		npm install -g @google/gemini-cli
		return 0
	fi

	echo "Could not auto-install Gemini CLI (npm required). Install manually: npm install -g @google/gemini-cli" >&2
	return 1
}

install_opencode || true
install_claude || true
install_rtk || true
install_oh_my_openagents || true
install_openclaw || true
install_gemini || true
