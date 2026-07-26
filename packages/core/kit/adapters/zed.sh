#!/usr/bin/env sh
# forge-kit adapter: Zed editor
# Writes .rules to the current working directory (project-local, Zed-native
# top-priority scan target: .rules > .cursorrules > .windsurfrules > .clinerules
# > .github/copilot-instructions.md > AGENTS.md > CLAUDE.md > GEMINI.md)

. "$FORGE_KIT_DIR/lib/log.sh"
. "$FORGE_KIT_DIR/lib/os.sh"
. "$FORGE_KIT_DIR/lib/merge.sh"

adapter_install() {
	project_dir="${CWD:-$(pwd)}"
	rules_dst="$project_dir/.rules"

	# 1. FORGE_RULES=true: write .rules from core/rules.md
	if [ "${FORGE_RULES:-false}" = "true" ]; then
		log_step "Installing rules to $rules_dst"

		new_content="$(cat "$FORGE_KIT_DIR/core/rules.md")"

		if [ -f "$rules_dst" ]; then
			old_sha="$(file_sha256 "$rules_dst")"
			tmp_rules="$(mktemp)"
			printf '%s' "$new_content" >"$tmp_rules"
			new_sha="$(file_sha256 "$tmp_rules" || printf '')"
			rm -f "$tmp_rules"
			if [ "$old_sha" = "$new_sha" ]; then
				log_dim "  (no changes)"
			else
				if [ "${FORGE_DRY_RUN:-false}" = "true" ]; then
					log_info "  [DRY RUN] Would overwrite $rules_dst"
				else
					printf '%s' "$new_content" >"$rules_dst"
					log_success ".rules written"
				fi
			fi
		else
			if [ "${FORGE_DRY_RUN:-false}" = "true" ]; then
				log_info "  [DRY RUN] Would create $rules_dst"
			else
				printf '%s' "$new_content" >"$rules_dst"
				log_success ".rules created"
			fi
		fi
	fi

	if [ "${FORGE_SKILLS:-false}" = "true" ]; then
		log_step "Installing skills to $project_dir/.zed/skills/"
		install_skills "$FORGE_KIT_DIR/core/skills" "$project_dir/.zed/skills"
	fi

	if [ "${FORGE_PROVIDERS:-false}" = "true" ]; then
		log_step "Installing providers to $project_dir/.zed/providers.json"
		install_providers "$FORGE_KIT_DIR/core/providers.json" "$project_dir/.zed/providers.json"
	fi

	if [ "${FORGE_DURABLE:-false}" = "true" ]; then
		log_step "Adding durable execution config"
		install_durable "$FORGE_KIT_DIR/core/rules.md" "$rules_dst"
	fi

	# 2. FORGE_MCP=true: merge MCP servers into .zed/settings.json under
	# "context_servers" (Zed's own key/shape — not "mcpServers"). Each entry
	# needs "source": "custom" added; existing unrelated settings keys in
	# settings.json (font size, theme, etc.) must survive the merge untouched.
	if [ "${FORGE_MCP:-false}" = "true" ]; then
		zed_dir="$project_dir/.zed"
		ensure_dir "$zed_dir"
		settings_dst="$zed_dir/settings.json"
		mcp_src="$FORGE_KIT_DIR/core/mcp.json"

		log_step "Merging MCP servers to $settings_dst (context_servers)"

		if [ -f "$mcp_src" ]; then
			if [ "${FORGE_DRY_RUN:-false}" = "true" ]; then
				log_info "  [DRY RUN] Would merge context_servers"
			else
				python3 - "$mcp_src" "$settings_dst" <<'PYEOF'
import json, sys
from pathlib import Path

src_path = Path(sys.argv[1])
dst_path = Path(sys.argv[2])

src_data = json.loads(src_path.read_text()) if src_path.exists() else {}
mcp_servers_src = src_data.get("mcpServers", {})

dst_data = json.loads(dst_path.read_text()) if dst_path.exists() and dst_path.stat().st_size > 0 else {}
context_servers_dst = dst_data.get("context_servers", {})

for key, val in mcp_servers_src.items():
    if key not in context_servers_dst:
        entry = {"source": "custom", "command": val.get("command"), "args": val.get("args", [])}
        if val.get("env"):
            entry["env"] = val["env"]
        context_servers_dst[key] = entry

dst_data["context_servers"] = context_servers_dst
dst_path.write_text(json.dumps(dst_data, indent=2) + "\n")
PYEOF
				log_success "MCP servers merged"
			fi
		fi
	fi
}

adapter_verify() {
	command -v zed >/dev/null 2>&1 ||
		[ -d "/Applications/Zed.app" ] ||
		[ -d "$HOME/Applications/Zed.app" ]
}

adapter_status() {
	project_dir="${CWD:-$(pwd)}"
	rules_file="$project_dir/.rules"
	status=""
	[ -f "$rules_file" ] && status=".rules ✓" || status=".rules ✗"
	printf 'zed | %s | project → %s/\n' "$status" "$project_dir"
}

adapter_uninstall() {
	project_dir="${CWD:-$(pwd)}"
	rules_file="$project_dir/.rules"

	uninstall_skills "$project_dir/.zed/skills"

	if [ -f "$rules_file" ]; then
		if grep -qm1 "^# forge-kit" "$rules_file" 2>/dev/null; then
			if [ "${FORGE_DRY_RUN:-false}" = "true" ]; then
				log_info "[DRY RUN] Would remove $rules_file"
			else
				rm "$rules_file"
				log_success "Removed .rules"
			fi
		else
			log_warn "Skipping $rules_file (not marked by forge-kit)"
		fi
	fi
}
