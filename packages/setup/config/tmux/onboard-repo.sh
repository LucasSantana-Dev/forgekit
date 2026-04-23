#!/usr/bin/env bash
set -euo pipefail

repo_dir="${1:-$PWD}"
repo_dir="$(realpath "$repo_dir")"
generator="$HOME/.config/tmux/generate-session-template.py"
prefs="$HOME/.config/tmux/repo-preferences.py"
sessionizer="$HOME/.config/tmux/sessionizer.sh"

assume_yes=false
launch=false
for arg in "$@"; do
	case "$arg" in
	--yes) assume_yes=true ;;
	--launch) launch=true ;;
	esac
done

if [[ ! -d "$repo_dir" ]]; then
	echo "Directory not found: $repo_dir" >&2
	exit 1
fi

pref_json="$(python3 "$prefs" get "$repo_dir")"
pref_template="$(printf '%s' "$pref_json" | python3 -c 'import json,sys; data=json.load(sys.stdin); print(data.get("template",""))')"
pref_auto_apply="$(printf '%s' "$pref_json" | python3 -c 'import json,sys; data=json.load(sys.stdin); print(str(data.get("auto_apply", False)).lower())')"

template_cmd="detect"
if [[ -n "$pref_template" ]]; then
	template_cmd="$pref_template"
fi

if [[ ! -f "$repo_dir/.tmux-session.json" ]]; then
	python3 "$generator" "$template_cmd" "$repo_dir"
	detected_template="$(python3 "$generator" suggest "$repo_dir")"
	python3 "$prefs" record "$repo_dir" "$detected_template" generated >/dev/null
else
	if $assume_yes || [[ "$pref_auto_apply" == "true" ]]; then
		if [[ -n "$pref_template" ]]; then
			python3 "$generator" apply-template "$pref_template" "$repo_dir" --yes
			detected_template="$pref_template"
		else
			python3 "$generator" apply "$repo_dir" --yes
			detected_template="$(python3 "$generator" suggest "$repo_dir")"
		fi
		python3 "$prefs" record "$repo_dir" "$detected_template" applied >/dev/null
	else
		if [[ -n "$pref_template" ]]; then
			python3 "$generator" preview-template "$pref_template" "$repo_dir"
		else
			python3 "$generator" preview "$repo_dir"
		fi
		echo
		echo "Existing .tmux-session.json detected."
		echo "Run again with --yes to apply detected changes automatically, or use tmux-template-apply interactively."
	fi
fi

if $launch; then
	"$sessionizer" "$repo_dir"
fi
