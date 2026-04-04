#!/usr/bin/env bash
set -euo pipefail

ok() { printf '✅ %s\n' "$1"; }
warn() { printf '⚠️  %s\n' "$1"; }

check_cmd() {
	if command -v "$1" >/dev/null 2>&1; then
		ok "$2"
	else
		warn "$2 not found"
	fi
}

check_npm_global() {
	if npm list -g "$1" >/dev/null 2>&1; then
		ok "$2"
	else
		warn "$2 not installed (npm i -g $1)"
	fi
}

echo "ai-dev-toolkit doctor"
echo

echo "== Core tools =="
check_cmd git "git"
check_cmd gh "GitHub CLI"
check_cmd node "Node.js"
check_cmd python3 "Python 3"
check_cmd jq "jq"
check_cmd rg "ripgrep"
check_cmd fd "fd"
check_cmd fzf "fzf"
check_cmd tmux "tmux"
check_cmd rtk "RTK token optimizer"

echo
echo "== AI coding tools =="

AI_TOOLS_FOUND=0

if command -v claude >/dev/null 2>&1; then
	ok "Claude Code"
	AI_TOOLS_FOUND=$((AI_TOOLS_FOUND + 1))
	if [[ -f "$HOME/.claude/CLAUDE.md" ]]; then
		ok "  Claude Code rules installed"
	else
		warn "  Claude Code rules missing"
	fi
else
	warn "Claude Code not installed (optional)"
fi

if command -v opencode >/dev/null 2>&1; then
	ok "OpenCode"
	AI_TOOLS_FOUND=$((AI_TOOLS_FOUND + 1))
	if [[ -f "$HOME/.config/opencode/opencode.jsonc" ]]; then
		ok "  OpenCode config installed"
	else
		warn "  OpenCode config missing"
	fi
else
	warn "OpenCode not installed (optional)"
fi

if command -v codex >/dev/null 2>&1; then
	ok "Codex CLI"
	AI_TOOLS_FOUND=$((AI_TOOLS_FOUND + 1))
	local_codex="${HOME}/.codex"
	[[ -d "${HOME}/.config/codex" ]] && local_codex="${HOME}/.config/codex"
	if [[ -f "$local_codex/AGENTS.md" ]]; then
		ok "  Codex rules installed"
	else
		warn "  Codex rules missing"
	fi
else
	warn "Codex CLI not installed (optional)"
fi

if [[ -d "/Applications/Cursor.app" ]] || [[ -d "$HOME/Applications/Cursor.app" ]]; then
	ok "Cursor"
	AI_TOOLS_FOUND=$((AI_TOOLS_FOUND + 1))
else
	warn "Cursor not installed (optional)"
fi

if [[ -d "/Applications/Windsurf.app" ]] || [[ -d "$HOME/Applications/Windsurf.app" ]]; then
	ok "Windsurf"
	AI_TOOLS_FOUND=$((AI_TOOLS_FOUND + 1))
else
	warn "Windsurf not installed (optional)"
fi

if [[ $AI_TOOLS_FOUND -eq 0 ]]; then
	warn "No AI coding tools detected — install at least one"
fi

echo
echo "== Agent orchestration (optional) =="
check_npm_global oh-my-claude-sisyphus "oh-my-openagents"
check_npm_global openclaw "openclaw"

echo
echo "== Environment =="

if gh auth status >/dev/null 2>&1; then
	ok "GitHub authentication"
else
	warn "GitHub CLI not authenticated (run: gh auth login)"
fi

if [[ -n "${OPENAI_API_KEY:-}" || -n "${ANTHROPIC_API_KEY:-}" || -n "${GOOGLE_API_KEY:-}" || -n "${GITHUB_TOKEN:-}" ]]; then
	ok "at least one AI/provider token loaded"
else
	warn "no AI/provider tokens loaded (edit ~/.config/ai-dev-toolkit/local.env)"
fi

if [[ -f "$HOME/.config/ai-dev-toolkit/shell.sh" ]]; then
	ok "portable shell config"
else
	warn "portable shell config missing"
fi

if [[ -f "$HOME/.config/ai-dev-toolkit/local.env" ]]; then
	ok "local env template"
else
	warn "local env template missing"
fi

if [[ -f "$HOME/.config/tmux/sessionizer.sh" ]]; then
	ok "tmux toolkit"
else
	warn "tmux toolkit missing"
fi

echo
echo "== Toolkit sync =="

TOOLKIT_STAMP="$HOME/.config/ai-dev-toolkit/.toolkit-version"
if [[ -f "$TOOLKIT_STAMP" ]]; then
	STAMP_VAL="$(cat "$TOOLKIT_STAMP")"
	if [[ "$STAMP_VAL" == "local-fallback" || "$STAMP_VAL" == "no-pin" ]]; then
		warn "toolkit source: $STAMP_VAL (not synced from ai-dev-toolkit)"
	else
		ok "toolkit content from ai-dev-toolkit v${STAMP_VAL}"
	fi
else
	warn "toolkit version stamp missing (run setup-ai-tools.sh)"
fi

echo
echo "Run: bash scripts/setup-ai-tools.sh . # to install/update AI tool configs"
