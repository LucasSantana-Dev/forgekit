#!/usr/bin/env sh
# forge-kit adapter: VS Code (GitHub Copilot agent mode)
# Writes .github/copilot-instructions.md to the current working directory
# (project-local, native always-on instructions format read by Copilot chat/agent)

. "$FORGE_KIT_DIR/lib/log.sh"
. "$FORGE_KIT_DIR/lib/os.sh"
. "$FORGE_KIT_DIR/lib/merge.sh"

adapter_install() {
	project_dir="${CWD:-$(pwd)}"
	github_dir="$project_dir/.github"
	rules_dst="$github_dir/copilot-instructions.md"

	# 1. FORGE_RULES=true: write copilot-instructions.md from core/rules.md
	if [ "${FORGE_RULES:-false}" = "true" ]; then
		ensure_dir "$github_dir"
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
					log_success "copilot-instructions.md written"
				fi
			fi
		else
			if [ "${FORGE_DRY_RUN:-false}" = "true" ]; then
				log_info "  [DRY RUN] Would create $rules_dst"
			else
				printf '%s' "$new_content" >"$rules_dst"
				log_success "copilot-instructions.md created"
			fi
		fi
	fi

	if [ "${FORGE_SKILLS:-false}" = "true" ]; then
		log_step "Installing skills to $project_dir/.vscode/skills/"
		install_skills "$FORGE_KIT_DIR/core/skills" "$project_dir/.vscode/skills"
	fi

	if [ "${FORGE_PROVIDERS:-false}" = "true" ]; then
		log_step "Installing providers to $project_dir/.vscode/providers.json"
		install_providers "$FORGE_KIT_DIR/core/providers.json" "$project_dir/.vscode/providers.json"
	fi

	if [ "${FORGE_DURABLE:-false}" = "true" ]; then
		log_step "Adding durable execution config"
		install_durable "$FORGE_KIT_DIR/core/rules.md" "$rules_dst"
	fi

	# 2. FORGE_MCP=true: merge MCP servers into .vscode/mcp.json under
	# "servers" (VS Code's own key/shape — not "mcpServers"). Each entry
	# needs "type": "stdio" added.
	if [ "${FORGE_MCP:-false}" = "true" ]; then
		vscode_dir="$project_dir/.vscode"
		ensure_dir "$vscode_dir"
		mcp_dst="$vscode_dir/mcp.json"
		mcp_src="$FORGE_KIT_DIR/core/mcp.json"

		log_step "Merging MCP servers to $mcp_dst (servers)"

		if [ -f "$mcp_src" ]; then
			if [ "${FORGE_DRY_RUN:-false}" = "true" ]; then
				log_info "  [DRY RUN] Would merge servers"
			else
				python3 - "$mcp_src" "$mcp_dst" <<'PYEOF'
import json, sys
from pathlib import Path

src_path = Path(sys.argv[1])
dst_path = Path(sys.argv[2])

src_data = json.loads(src_path.read_text()) if src_path.exists() else {}
mcp_servers_src = src_data.get("mcpServers", {})

dst_data = json.loads(dst_path.read_text()) if dst_path.exists() and dst_path.stat().st_size > 0 else {}
servers_dst = dst_data.get("servers", {})

for key, val in mcp_servers_src.items():
    if key not in servers_dst:
        entry = {"type": "stdio", "command": val.get("command"), "args": val.get("args", [])}
        if val.get("env"):
            entry["env"] = val["env"]
        servers_dst[key] = entry

dst_data["servers"] = servers_dst
dst_path.write_text(json.dumps(dst_data, indent=2) + "\n")
PYEOF
				log_success "MCP servers merged"
			fi
		fi
	fi
}

adapter_verify() {
	command -v code >/dev/null 2>&1 ||
		[ -d "/Applications/Visual Studio Code.app" ] ||
		[ -d "$HOME/Applications/Visual Studio Code.app" ]
}

adapter_status() {
	project_dir="${CWD:-$(pwd)}"
	rules_file="$project_dir/.github/copilot-instructions.md"
	status=""
	[ -f "$rules_file" ] && status="copilot-instructions.md ✓" || status="copilot-instructions.md ✗"
	printf 'vscode | %s | project → %s/\n' "$status" "$project_dir"
}

adapter_uninstall() {
	project_dir="${CWD:-$(pwd)}"
	rules_file="$project_dir/.github/copilot-instructions.md"

	uninstall_skills "$project_dir/.vscode/skills"

	if [ -f "$rules_file" ]; then
		if grep -qm1 "^# forge-kit" "$rules_file" 2>/dev/null; then
			if [ "${FORGE_DRY_RUN:-false}" = "true" ]; then
				log_info "[DRY RUN] Would remove $rules_file"
			else
				rm "$rules_file"
				log_success "Removed copilot-instructions.md"
			fi
		else
			log_warn "Skipping $rules_file (not marked by forge-kit)"
		fi
	fi
}
