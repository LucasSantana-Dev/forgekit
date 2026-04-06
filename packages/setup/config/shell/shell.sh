#!/usr/bin/env bash
# shellcheck shell=bash
# shellcheck source=/dev/null

command_exists() {
	command -v "$1" >/dev/null 2>&1
}

[ -f "$HOME/.config/ai-dev-toolkit/local.env" ] && source "$HOME/.config/ai-dev-toolkit/local.env"

if [ -n "${ZSH_VERSION:-}" ]; then
	__ai_shell="zsh"
else
	__ai_shell="bash"
fi

if command_exists fzf; then
	if [ "$__ai_shell" = "zsh" ]; then
		eval "$(fzf --zsh 2>/dev/null)"
	else
		eval "$(fzf --bash 2>/dev/null)"
	fi
fi

command_exists zoxide && eval "$(zoxide init "$__ai_shell")"
command_exists atuin && eval "$(atuin init "$__ai_shell")"
command_exists direnv && eval "$(direnv hook "$__ai_shell")"
command_exists starship && eval "$(starship init "$__ai_shell")"

command_exists eza && alias ls='eza'
command_exists eza && alias ll='eza -la --git'
command_exists eza && alias lt='eza -la --tree --level=2 --git'
command_exists bat && alias cat='bat'
command_exists lazygit && alias lg='lazygit'

alias gs='git status'
alias ga='git add'
alias gc='git commit'
alias gp='git push'

alias ta='tmux attach -t main || tmux new -s main'
alias tn='tmux new -s'
alias tls='tmux ls'
alias tk='tmux kill-session -t'
alias ts='~/.config/tmux/sessionizer.sh'
alias tns='~/.config/tmux/tmux-smart-new.sh'
alias tboot='~/.config/tmux/bootstrap-project-session.sh'
alias tonboard='~/.config/tmux/onboard-repo.sh'
alias trepo-prefs='python3 ~/.config/tmux/repo-preferences.py'
alias ttemplate='python3 ~/.config/tmux/generate-session-template.py'
alias ttemplate-suggest='python3 ~/.config/tmux/generate-session-template.py suggest'
alias ttemplate-detect='python3 ~/.config/tmux/generate-session-template.py detect'
alias ttemplate-preview='python3 ~/.config/tmux/generate-session-template.py preview'
alias ttemplate-apply='python3 ~/.config/tmux/generate-session-template.py apply'
alias ttemplate-update='python3 ~/.config/tmux/generate-session-template.py update'
alias mcp-status='python3 ~/.config/opencode/scripts/toggle-mcp.py list'

mcp-health() {
	python3 "$HOME/.config/opencode/scripts/mcp-health.py" "$@"
}

release-plan() {
	python3 "$HOME/.config/opencode/scripts/release.py" --dry-run "$@"
}

release-plan-github() {
	python3 "$HOME/.config/opencode/scripts/release.py" --dry-run --github-release "$@"
}

release-patch() {
	python3 "$HOME/.config/opencode/scripts/release.py" --level patch "$@"
}

release-patch-github() {
	python3 "$HOME/.config/opencode/scripts/release.py" --level patch --github-release "$@"
}

release-minor() {
	python3 "$HOME/.config/opencode/scripts/release.py" --level minor "$@"
}

release-minor-github() {
	python3 "$HOME/.config/opencode/scripts/release.py" --level minor --github-release "$@"
}

release-major() {
	python3 "$HOME/.config/opencode/scripts/release.py" --level major "$@"
}

release-major-github() {
	python3 "$HOME/.config/opencode/scripts/release.py" --level major --github-release "$@"
}

release-tag() {
	python3 "$HOME/.config/opencode/scripts/release.py" --level tag-only "$@"
}

release-tag-github() {
	python3 "$HOME/.config/opencode/scripts/release.py" --level tag-only --github-release "$@"
}

toolkit-version-check() {
	python3 "$HOME/.config/ai-dev-toolkit/scripts/sync-toolkit-version.py" "$@"
}

toolkit-version-prepare() {
	python3 "$HOME/.config/ai-dev-toolkit/scripts/sync-toolkit-version.py" --prepare-pr "$@"
}

toolkit-version-pr() {
	python3 "$HOME/.config/ai-dev-toolkit/scripts/sync-toolkit-version.py" --prepare-pr "$@"
}

toolkit-version-sync() {
	python3 "$HOME/.config/ai-dev-toolkit/scripts/sync-toolkit-version.py" --apply "$@"
}

mcp-enable() {
	python3 "$HOME/.config/opencode/scripts/toggle-mcp.py" enable "$1"
}

mcp-disable() {
	python3 "$HOME/.config/opencode/scripts/toggle-mcp.py" disable "$1"
}

work() {
	~/.config/tmux/sessionizer.sh "$@"
}

work-here() {
	local name
	name="$(basename "$PWD" | tr '. ' '__' | tr -cd '[:alnum:]_-')"
	~/.config/tmux/tmux-smart-new.sh "$name" "$PWD"
	~/.config/tmux/bootstrap-project-session.sh "$name" "$PWD"
	tmux attach -t "$name" 2>/dev/null || true
}

tmux-template-node() {
	python3 "$HOME/.config/tmux/generate-session-template.py" node "${1:-$PWD}"
}

tmux-template-python() {
	python3 "$HOME/.config/tmux/generate-session-template.py" python "${1:-$PWD}"
}

tmux-template-docker() {
	python3 "$HOME/.config/tmux/generate-session-template.py" docker "${1:-$PWD}"
}

tmux-template-monorepo() {
	python3 "$HOME/.config/tmux/generate-session-template.py" monorepo "${1:-$PWD}"
}

tmux-template-auto() {
	python3 "$HOME/.config/tmux/generate-session-template.py" detect "${1:-$PWD}"
}

tmux-template-preview() {
	python3 "$HOME/.config/tmux/generate-session-template.py" preview "${1:-$PWD}"
}

tmux-template-apply() {
	python3 "$HOME/.config/tmux/generate-session-template.py" apply "${1:-$PWD}"
}

tmux-template-apply-yes() {
	python3 "$HOME/.config/tmux/generate-session-template.py" apply "${1:-$PWD}" --yes
}

tmux-template-update() {
	python3 "$HOME/.config/tmux/generate-session-template.py" update "${1:-$PWD}"
}

tmux-template-force() {
	local template="${1:?template required}"
	local dir="${2:-$PWD}"
	python3 "$HOME/.config/tmux/generate-session-template.py" force "$template" "$dir"
}

repo-terminal-ready() {
	bash "$HOME/.config/tmux/onboard-repo.sh" "${1:-$PWD}" --launch
}

repo-terminal-ready-yes() {
	bash "$HOME/.config/tmux/onboard-repo.sh" "${1:-$PWD}" --yes --launch
}

repo-template-remember() {
	local template="${1:?template required}"
	local dir="${2:-$PWD}"
	local auto_apply="${3:-false}"
	python3 "$HOME/.config/tmux/repo-preferences.py" set "$dir" "$template" "$auto_apply"
}

repo-template-prefs() {
	python3 "$HOME/.config/tmux/repo-preferences.py" get "${1:-$PWD}"
}
