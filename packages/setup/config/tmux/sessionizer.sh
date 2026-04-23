#!/usr/bin/env bash
set -euo pipefail

roots=(
	"$HOME/Desenvolvimento"
	"$HOME"
)

collect_projects() {
	for root in "${roots[@]}"; do
		[[ -d "$root" ]] || continue
		fd . "$root" --max-depth 2 --min-depth 1 --type d \
			--hidden \
			--exclude .git \
			--exclude node_modules \
			--exclude .next \
			--exclude dist \
			--exclude build \
			--exclude .turbo \
			--exclude .venv \
			--exclude Library \
			--exclude Movies \
			--exclude Music \
			--exclude Pictures \
			--exclude Downloads 2>/dev/null
	done | awk '!seen[$0]++'
}

selected="${1:-}"
if [[ -z "$selected" ]]; then
	selected="$(collect_projects | fzf --height=40% --reverse --border --prompt='Project > ' --preview 'eza -la --git --icons --color=always {} | head -80' --preview-window=right:60%)"
fi

[[ -n "$selected" ]] || exit 0
selected="$(realpath "$selected")"
session_name="$(basename "$selected" | tr '. ' '__' | tr -cd '[:alnum:]_-')"
bootstrap="$HOME/.config/tmux/bootstrap-project-session.sh"

if tmux has-session -t "$session_name" 2>/dev/null; then
	if [[ -z "${TMUX:-}" ]]; then
		exec tmux attach -t "$session_name"
	fi
	tmux switch-client -t "$session_name"
	exit 0
fi

tmux new-session -d -s "$session_name" -c "$selected"
if [[ -x "$bootstrap" ]]; then
	"$bootstrap" "$session_name" "$selected"
fi

if [[ -z "${TMUX:-}" ]]; then
	exec tmux attach -t "$session_name"
fi

tmux switch-client -t "$session_name"
