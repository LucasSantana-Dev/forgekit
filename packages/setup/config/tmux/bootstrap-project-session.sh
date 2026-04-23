#!/usr/bin/env bash
set -euo pipefail

session_name="${1:?session name required}"
project_path="${2:?project path required}"
project_path="$(realpath "$project_path")"
override_file="$project_path/.tmux-session.json"

has_git_repo=false
has_node=false
has_python=false
has_docker=false
node_runner=""
node_dev_cmd=""
node_test_cmd=""
python_test_cmd=""
docker_cmd=""

if git -C "$project_path" rev-parse --is-inside-work-tree >/dev/null 2>&1; then
	has_git_repo=true
fi

if [[ -f "$project_path/package.json" ]]; then
	has_node=true
	if [[ -f "$project_path/bun.lockb" || -f "$project_path/bun.lock" ]]; then
		node_runner="bun"
	else
		node_runner="npm"
	fi

	if [[ "$node_runner" == "bun" ]]; then
		node_dev_cmd="bun run dev"
		node_test_cmd="bun test"
	else
		node_dev_cmd="npm run dev"
		node_test_cmd="npm test"
	fi
fi

if [[ -f "$project_path/pyproject.toml" || -f "$project_path/requirements.txt" || -f "$project_path/setup.py" ]]; then
	has_python=true
	python_test_cmd="python3 -m pytest -q"
fi

if [[ -f "$project_path/docker-compose.yml" || -f "$project_path/docker-compose.yaml" || -f "$project_path/compose.yml" || -f "$project_path/compose.yaml" ]]; then
	has_docker=true
	if [[ -f "$project_path/docker-compose.yml" || -f "$project_path/docker-compose.yaml" ]]; then
		docker_cmd="docker-compose ps"
	else
		docker_cmd="docker compose ps"
	fi
fi

if ! tmux has-session -t "$session_name" 2>/dev/null; then
	tmux new-session -d -s "$session_name" -c "$project_path" -n editor
else
	window_count="$(tmux list-windows -t "$session_name" 2>/dev/null | wc -l | tr -d ' ')"
	first_window_name="$(tmux list-windows -t "$session_name" -F '#{window_index}:#{window_name}' 2>/dev/null | head -n 1 | cut -d: -f2-)"
	if [[ "$window_count" != "1" ]]; then
		exit 0
	fi
	if [[ "$first_window_name" != "zsh" && "$first_window_name" != "bash" && "$first_window_name" != "sh" && "$first_window_name" != "tmux" && "$first_window_name" != "editor" ]]; then
		exit 0
	fi
fi

apply_override_config() {
	local windows_count window_index name rel_path abs_path command panes_count pane_index pane_command split target
	windows_count="$(jq '.windows | length' "$override_file")"
	[[ "$windows_count" -gt 0 ]] || return 1

	tmux kill-window -t "$session_name":0 2>/dev/null || true

	for ((window_index = 0; window_index < windows_count; window_index++)); do
		name="$(jq -r ".windows[$window_index].name // \"window-$window_index\"" "$override_file")"
		rel_path="$(jq -r ".windows[$window_index].path // \".\"" "$override_file")"
		command="$(jq -r ".windows[$window_index].command // \"\"" "$override_file")"
		abs_path="$(realpath "$project_path/$rel_path")"

		if [[ "$window_index" == "0" ]]; then
			tmux new-session -d -s "$session_name" -c "$abs_path" -n "$name" 2>/dev/null || tmux new-window -t "$session_name" -n "$name" -c "$abs_path"
		else
			tmux new-window -t "$session_name" -n "$name" -c "$abs_path"
		fi

		if [[ -n "$command" ]]; then
			tmux send-keys -t "$session_name":$window_index "$command" C-m
		fi

		panes_count="$(jq ".windows[$window_index].panes | length" "$override_file" 2>/dev/null || echo 0)"
		if [[ "$panes_count" -gt 0 ]]; then
			for ((pane_index = 0; pane_index < panes_count; pane_index++)); do
				pane_command="$(jq -r ".windows[$window_index].panes[$pane_index].command // \"\"" "$override_file")"
				split="$(jq -r ".windows[$window_index].panes[$pane_index].split // \"none\"" "$override_file")"
				if [[ "$pane_index" == "0" ]]; then
					[[ -n "$pane_command" ]] && tmux send-keys -t "$session_name":$window_index.0 "$pane_command" C-m
				else
					target="$session_name":$window_index
					if [[ "$split" == "v" ]]; then
						tmux split-window -t "$target" -v -c "$abs_path"
					else
						tmux split-window -t "$target" -h -c "$abs_path"
					fi
					[[ -n "$pane_command" ]] && tmux send-keys -t "$target".$pane_index "$pane_command" C-m
				fi
			done
			tmux select-layout -t "$session_name":$window_index tiled >/dev/null 2>&1 || true
		fi
	done

	tmux select-window -t "$session_name":0
	tmux select-pane -t "$session_name":0.0
	return 0
}

apply_default_layout() {
	local next_index
	if $has_git_repo; then
		tmux rename-window -t "$session_name":0 editor
		tmux split-window -t "$session_name":0 -h -c "$project_path"
		tmux send-keys -t "$session_name":0.0 'clear' C-m
		tmux send-keys -t "$session_name":0.1 'git status --short --branch || true' C-m

		tmux new-window -t "$session_name" -n git -c "$project_path"
		if command -v lazygit >/dev/null 2>&1; then
			tmux send-keys -t "$session_name":1 'lazygit' C-m
		else
			tmux send-keys -t "$session_name":1 'git log --oneline --graph --decorate -20' C-m
		fi

		tmux new-window -t "$session_name" -n files -c "$project_path"
		if command -v eza >/dev/null 2>&1; then
			tmux send-keys -t "$session_name":2 'eza -la --git' C-m
		else
			tmux send-keys -t "$session_name":2 'ls -la' C-m
		fi
	else
		tmux rename-window -t "$session_name":0 shell
		tmux split-window -t "$session_name":0 -h -c "$project_path"
		tmux send-keys -t "$session_name":0.0 'clear' C-m
		if command -v eza >/dev/null 2>&1; then
			tmux send-keys -t "$session_name":0.1 'eza -la' C-m
		else
			tmux send-keys -t "$session_name":0.1 'ls -la' C-m
		fi
	fi

	next_index="$(tmux list-windows -t "$session_name" 2>/dev/null | wc -l | tr -d ' ')"

	if $has_node; then
		tmux new-window -t "$session_name" -n dev -c "$project_path"
		tmux send-keys -t "$session_name":"$next_index" "$node_dev_cmd" C-m
		next_index=$((next_index + 1))

		tmux new-window -t "$session_name" -n test -c "$project_path"
		tmux send-keys -t "$session_name":"$next_index" "$node_test_cmd" C-m
		next_index=$((next_index + 1))
	fi

	if $has_python; then
		tmux new-window -t "$session_name" -n py -c "$project_path"
		tmux send-keys -t "$session_name":"$next_index" "$python_test_cmd" C-m
		next_index=$((next_index + 1))
	fi

	if $has_docker; then
		tmux new-window -t "$session_name" -n ops -c "$project_path"
		tmux send-keys -t "$session_name":"$next_index" "$docker_cmd" C-m
		next_index=$((next_index + 1))
	fi

	tmux select-window -t "$session_name":0
	tmux select-pane -t "$session_name":0.0
}

if [[ -f "$override_file" ]]; then
	if apply_override_config; then
		exit 0
	fi
fi

apply_default_layout
