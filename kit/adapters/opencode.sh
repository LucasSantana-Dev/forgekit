#!/usr/bin/env sh
# forge-kit adapter: OpenCode (opencode command)
# Writes system prompt and merges MCP config into ~/.config/opencode/

. "$FORGE_KIT_DIR/lib/log.sh"
. "$FORGE_KIT_DIR/lib/os.sh"
. "$FORGE_KIT_DIR/lib/merge.sh"

adapter_install() {
	opencode_dir="$(get_config_dir opencode)"

	ensure_dir "$opencode_dir"

	# 1. FORGE_RULES=true: write system prompt from core/rules.md
	if [ "${FORGE_RULES:-false}" = "true" ]; then
		log_step "Installing rules to $opencode_dir/system.md"

		system_md_path="$opencode_dir/system.md"
		new_content="$(cat "$FORGE_KIT_DIR/core/rules.md")"

		if [ -f "$system_md_path" ]; then
			old_sha="$(file_sha256 "$system_md_path")"
			new_sha="$(printf '%s' "$new_content" | sha256sum | cut -d' ' -f1)"
			if [ "$old_sha" = "$new_sha" ]; then
				log_dim "  (no changes)"
			else
				if [ "${FORGE_DRY_RUN:-false}" = "true" ]; then
					log_info "  [DRY RUN] Would overwrite $system_md_path"
				else
					printf '%s' "$new_content" >"$system_md_path"
					log_success "system.md written"
				fi
			fi
		else
			if [ "${FORGE_DRY_RUN:-false}" = "true" ]; then
				log_info "  [DRY RUN] Would create $system_md_path"
			else
				printf '%s' "$new_content" >"$system_md_path"
				log_success "system.md created"
			fi
		fi
	fi

	# 2. FORGE_MCP=true: merge MCP servers into opencode config.json
	if [ "${FORGE_MCP:-false}" = "true" ]; then
		log_step "Merging MCP servers to $opencode_dir/config.json"

		mcp_src="$FORGE_KIT_DIR/core/mcp.json"
		config_dst="$opencode_dir/config.json"

		if [ -f "$mcp_src" ]; then
			if [ "${FORGE_DRY_RUN:-false}" = "true" ]; then
				log_info "  [DRY RUN] Would merge MCP servers into config.json"
			else
				python3 - "$mcp_src" "$config_dst" <<'PYEOF'
import json, sys
from pathlib import Path

src_path = Path(sys.argv[1])
dst_path = Path(sys.argv[2])

src_data = json.loads(src_path.read_text()) if src_path.exists() else {}
mcp_servers_src = src_data.get("mcpServers", {})

dst_data = json.loads(dst_path.read_text()) if dst_path.exists() and dst_path.stat().st_size > 0 else {}
mcp_servers_dst = dst_data.get("mcp", {}).get("servers", {})

for key, val in mcp_servers_src.items():
    if key not in mcp_servers_dst:
        mcp_servers_dst[key] = val

if "mcp" not in dst_data:
    dst_data["mcp"] = {}
dst_data["mcp"]["servers"] = mcp_servers_dst
dst_path.write_text(json.dumps(dst_data, indent=2) + "\n")
PYEOF
				log_success "MCP servers merged into config.json"
			fi
		fi
	fi

	if [ "${FORGE_SKILLS:-false}" = "true" ]; then
		log_step "Installing skills to $opencode_dir/skills/"
		install_skills "$FORGE_KIT_DIR/core/skills" "$opencode_dir/skills"
	fi

	if [ "${FORGE_PROVIDERS:-false}" = "true" ]; then
		log_step "Installing providers to $opencode_dir/providers.json"
		install_providers "$FORGE_KIT_DIR/core/providers.json" "$opencode_dir/providers.json"
	fi

	if [ "${FORGE_DURABLE:-false}" = "true" ]; then
		log_step "Adding durable execution config"
		install_durable "$FORGE_KIT_DIR/core/rules.md" "$opencode_dir/system.md"
	fi

	if [ "${FORGE_OHMY_COMPAT:-false}" = "true" ]; then
		compat_src="$FORGE_KIT_DIR/../implementations/opencode/oh-my-openagent.jsonc"
		compat_dst="$opencode_dir/oh-my-opencode.jsonc"
		compat_marker="$opencode_dir/.forge-kit-oh-my-openagent"

		if [ -f "$compat_src" ]; then
			log_step "Installing oh-my-openagent reference config to $compat_dst"

			if [ -f "$compat_dst" ]; then
				log_dim "  (existing oh-my-opencode.jsonc kept)"
			else
				if [ "${FORGE_DRY_RUN:-false}" = "true" ]; then
					log_info "  [DRY RUN] Would create oh-my-opencode.jsonc"
				else
					cp "$compat_src" "$compat_dst"
					: >"$compat_marker"
					log_success "oh-my-openagent reference config created"
				fi
			fi
		fi
	fi
}

adapter_verify() {
	command -v opencode >/dev/null 2>&1
}

adapter_status() {
	opencode_dir="$(get_config_dir opencode)"
	system_md=""
	[ -f "$opencode_dir/system.md" ] && system_md="system.md ✓" || system_md="system.md ✗"
	printf 'opencode | %s | config → %s/\n' "$system_md" "$opencode_dir"
}

adapter_uninstall() {
	opencode_dir="$(get_config_dir opencode)"

	if [ -f "$opencode_dir/system.md" ]; then
		if grep -q "^# forge-kit" "$opencode_dir/system.md" 2>/dev/null; then
			if [ "${FORGE_DRY_RUN:-false}" = "true" ]; then
				log_info "[DRY RUN] Would remove $opencode_dir/system.md"
			else
				rm "$opencode_dir/system.md"
				log_success "Removed system.md"
			fi
		fi
	fi

	uninstall_skills "$opencode_dir/skills"

	if [ -f "$opencode_dir/.forge-kit-oh-my-openagent" ] && [ -f "$opencode_dir/oh-my-opencode.jsonc" ]; then
		if [ "${FORGE_DRY_RUN:-false}" = "true" ]; then
			log_info "[DRY RUN] Would remove $opencode_dir/oh-my-opencode.jsonc"
			log_info "[DRY RUN] Would remove $opencode_dir/.forge-kit-oh-my-openagent"
		else
			rm "$opencode_dir/oh-my-opencode.jsonc"
			rm "$opencode_dir/.forge-kit-oh-my-openagent"
			log_success "Removed oh-my-openagent reference config"
		fi
	fi
}
