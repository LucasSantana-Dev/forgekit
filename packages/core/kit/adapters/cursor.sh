#!/usr/bin/env sh
# forge-kit adapter: Cursor editor
# Writes .cursor/rules/ to the current working directory (project-local)

. "$FORGE_KIT_DIR/lib/log.sh"
. "$FORGE_KIT_DIR/lib/os.sh"
. "$FORGE_KIT_DIR/lib/merge.sh"

adapter_install() {
	project_dir="${CWD:-$(pwd)}"
	cursor_rules_dir="$project_dir/.cursor/rules"

	ensure_dir "$cursor_rules_dir"

	# 1. FORGE_RULES=true: write forge.mdc from core/rules.md
	if [ "${FORGE_RULES:-false}" = "true" ]; then
		log_step "Installing rules to $cursor_rules_dir/forge.mdc"

		rules_dst="$cursor_rules_dir/forge.mdc"
		new_content="$(cat "$FORGE_KIT_DIR/core/rules.md")"

		if [ -f "$rules_dst" ]; then
			old_sha="$(file_sha256 "$rules_dst")"
			new_sha="$(printf '%s' "$new_content" | sha256sum | cut -d' ' -f1)"
			if [ "$old_sha" = "$new_sha" ]; then
				log_dim "  (no changes)"
			else
				if [ "${FORGE_DRY_RUN:-false}" = "true" ]; then
					log_info "  [DRY RUN] Would overwrite $rules_dst"
				else
					printf '%s' "$new_content" >"$rules_dst"
					log_success "forge.mdc written"
				fi
			fi
		else
			if [ "${FORGE_DRY_RUN:-false}" = "true" ]; then
				log_info "  [DRY RUN] Would create $rules_dst"
			else
				printf '%s' "$new_content" >"$rules_dst"
				log_success "forge.mdc created"
			fi
		fi
	fi

	if [ "${FORGE_SKILLS:-false}" = "true" ]; then
		log_step "Installing skills to $cursor_rules_dir/../skills/"
		install_skills "$FORGE_KIT_DIR/core/skills" "$project_dir/.cursor/skills"
	fi

	if [ "${FORGE_PROVIDERS:-false}" = "true" ]; then
		log_step "Installing providers to $project_dir/.cursor/providers.json"
		install_providers "$FORGE_KIT_DIR/core/providers.json" "$project_dir/.cursor/providers.json"
	fi

	if [ "${FORGE_DURABLE:-false}" = "true" ]; then
		log_step "Adding durable execution config"
		install_durable "$FORGE_KIT_DIR/core/rules.md" "$cursor_rules_dir/forge.mdc"
	fi

	# 2. FORGE_MCP=true: merge MCP servers into .cursor/mcp.json
	if [ "${FORGE_MCP:-false}" = "true" ]; then
		cursor_dir="$project_dir/.cursor"
		mcp_dst="$cursor_dir/mcp.json"
		mcp_src="$FORGE_KIT_DIR/core/mcp.json"

		log_step "Merging MCP servers to $mcp_dst"

		if [ -f "$mcp_src" ]; then
			if [ "${FORGE_DRY_RUN:-false}" = "true" ]; then
				log_info "  [DRY RUN] Would merge MCP servers"
			else
				python3 - "$mcp_src" "$mcp_dst" <<'PYEOF'
import json, sys
from pathlib import Path

src_path = Path(sys.argv[1])
dst_path = Path(sys.argv[2])

src_data = json.loads(src_path.read_text()) if src_path.exists() else {}
mcp_servers_src = src_data.get("mcpServers", {})

dst_data = json.loads(dst_path.read_text()) if dst_path.exists() and dst_path.stat().st_size > 0 else {}
mcp_servers_dst = dst_data.get("mcpServers", {})

for key, val in mcp_servers_src.items():
    if key not in mcp_servers_dst:
        mcp_servers_dst[key] = val

dst_data["mcpServers"] = mcp_servers_dst
dst_path.write_text(json.dumps(dst_data, indent=2) + "\n")
PYEOF
				log_success "MCP servers merged"
			fi
		fi
	fi

	if [ "${FORGE_OHMY_COMPAT:-false}" = "true" ]; then
		compat_src="$FORGE_KIT_DIR/../implementations/cursor/oh-my-cursor.md"
		compat_dst="$project_dir/.cursor/oh-my-cursor.md"

		if [ -f "$compat_src" ]; then
			log_step "Installing oh-my compatibility reference to $compat_dst"

			if [ -f "$compat_dst" ] && files_equal "$compat_src" "$compat_dst"; then
				log_dim "  (no changes)"
			else
				if [ "${FORGE_DRY_RUN:-false}" = "true" ]; then
					if [ -f "$compat_dst" ]; then
						log_info "  [DRY RUN] Would update oh-my-cursor.md"
					else
						log_info "  [DRY RUN] Would create oh-my-cursor.md"
					fi
				else
					cp "$compat_src" "$compat_dst"
					log_success "oh-my compatibility reference installed"
				fi
			fi
		fi
	fi
}

adapter_verify() {
	command -v cursor >/dev/null 2>&1 ||
		[ -d "/Applications/Cursor.app" ] ||
		[ -d "$HOME/Applications/Cursor.app" ]
}

adapter_status() {
	project_dir="${CWD:-$(pwd)}"
	rules_file="$project_dir/.cursor/rules/forge.mdc"
	status=""
	[ -f "$rules_file" ] && status="forge.mdc ✓" || status="forge.mdc ✗"
	printf 'cursor | %s | project → %s/\n' "$status" "$project_dir"
}

adapter_uninstall() {
	project_dir="${CWD:-$(pwd)}"
	rules_file="$project_dir/.cursor/rules/forge.mdc"

	uninstall_skills "$project_dir/.cursor/skills"

	if [ -f "$rules_file" ]; then
		if grep -qm1 "^# forge-kit" "$rules_file" 2>/dev/null; then
			if [ "${FORGE_DRY_RUN:-false}" = "true" ]; then
				log_info "[DRY RUN] Would remove $rules_file"
			else
				rm "$rules_file"
				log_success "Removed forge.mdc"
			fi
		else
			log_warn "Skipping $rules_file (not marked by forge-kit)"
		fi
	fi

	if [ -f "$project_dir/.cursor/oh-my-cursor.md" ]; then
		if grep -qm1 "^# forge-kit" "$project_dir/.cursor/oh-my-cursor.md" 2>/dev/null; then
			if [ "${FORGE_DRY_RUN:-false}" = "true" ]; then
				log_info "[DRY RUN] Would remove $project_dir/.cursor/oh-my-cursor.md"
			else
				rm "$project_dir/.cursor/oh-my-cursor.md"
				log_success "Removed oh-my compatibility reference"
			fi
		fi
	fi
}
