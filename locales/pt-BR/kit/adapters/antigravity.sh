#!/usr/bin/env sh
# forge-kit adapter: Antigravity IDE
# Writes rules and config to ~/.antigravity/

. "$FORGE_KIT_DIR/lib/log.sh"
. "$FORGE_KIT_DIR/lib/os.sh"
. "$FORGE_KIT_DIR/lib/merge.sh"

adapter_install() {
	ag_dir="$(get_config_dir antigravity)"

	ensure_dir "$ag_dir"

	# 1. FORGE_RULES=true: write rules.md from core/rules.md
	if [ "${FORGE_RULES:-false}" = "true" ]; then
		log_step "Installing rules to $ag_dir/rules.md"

		rules_dst="$ag_dir/rules.md"
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
					log_success "rules.md written"
				fi
			fi
		else
			if [ "${FORGE_DRY_RUN:-false}" = "true" ]; then
				log_info "  [DRY RUN] Would create $rules_dst"
			else
				printf '%s' "$new_content" >"$rules_dst"
				log_success "rules.md created"
			fi
		fi
	fi

	if [ "${FORGE_SKILLS:-false}" = "true" ]; then
		log_step "Installing skills to $ag_dir/skills/"
		install_skills "$FORGE_KIT_DIR/core/skills" "$ag_dir/skills"
	fi

	if [ "${FORGE_HOOKS:-false}" = "true" ]; then
		hooks_src="$FORGE_KIT_DIR/core/hooks.json"
		hooks_dst="$ag_dir/hooks.json"
		hooks_marker="$ag_dir/.forge-kit-hooks"

		if [ -f "$hooks_src" ]; then
			log_step "Installing hooks manifest to $hooks_dst"
			if [ -f "$hooks_dst" ]; then
				old_sha="$(file_sha256 "$hooks_dst")"
				new_sha="$(file_sha256 "$hooks_src")"
				if [ "$old_sha" = "$new_sha" ]; then
					log_dim "  (no changes)"
				elif [ "${FORGE_DRY_RUN:-false}" = "true" ]; then
					log_info "  [DRY RUN] Would overwrite $hooks_dst"
				else
					cp "$hooks_src" "$hooks_dst"
					: >"$hooks_marker"
					log_success "hooks manifest updated"
				fi
			else
				if [ "${FORGE_DRY_RUN:-false}" = "true" ]; then
					log_info "  [DRY RUN] Would create $hooks_dst"
				else
					cp "$hooks_src" "$hooks_dst"
					: >"$hooks_marker"
					log_success "hooks manifest created"
				fi
			fi
		fi
	fi

	if [ "${FORGE_PROVIDERS:-false}" = "true" ]; then
		log_step "Installing providers to $ag_dir/providers.json"
		install_providers "$FORGE_KIT_DIR/core/providers.json" "$ag_dir/providers.json"
	fi

	if [ "${FORGE_DURABLE:-false}" = "true" ]; then
		log_step "Adding durable execution config"
		install_durable "$FORGE_KIT_DIR/core/rules.md" "$ag_dir/rules.md"
	fi

	# 2. FORGE_MCP=true: merge MCP servers into ~/.antigravity/mcp.json
	if [ "${FORGE_MCP:-false}" = "true" ]; then
		mcp_dst="$ag_dir/mcp.json"
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
}

adapter_verify() {
	command -v antigravity >/dev/null 2>&1 ||
		[ -d "$HOME/.antigravity" ]
}

adapter_status() {
	ag_dir="$(get_config_dir antigravity)"
	rules_file="$ag_dir/rules.md"
	status=""
	[ -f "$rules_file" ] && status="rules.md ✓" || status="rules.md ✗"
	hooks_status="hooks.json ✗"
	[ -f "$ag_dir/hooks.json" ] && hooks_status="hooks.json ✓"
	printf 'antigravity | %s | %s | config → %s/\n' "$status" "$hooks_status" "$ag_dir"
}

adapter_uninstall() {
	ag_dir="$(get_config_dir antigravity)"
	rules_file="$ag_dir/rules.md"
	removed_hooks="false"

	uninstall_skills "$ag_dir/skills"

	if [ -f "$ag_dir/hooks.json" ]; then
		if [ "${FORGE_DRY_RUN:-false}" = "true" ]; then
			log_info "[DRY RUN] Would remove $ag_dir/hooks.json"
		else
			rm "$ag_dir/hooks.json"
		fi
		removed_hooks="true"
	fi

	if [ -f "$ag_dir/.forge-kit-hooks" ]; then
		if [ "${FORGE_DRY_RUN:-false}" = "true" ]; then
			log_info "[DRY RUN] Would remove $ag_dir/.forge-kit-hooks"
		else
			rm "$ag_dir/.forge-kit-hooks"
		fi
		removed_hooks="true"
	fi

	if [ "$removed_hooks" = "true" ]; then
		log_success "Removed hooks manifest"
	fi

	if [ -f "$rules_file" ]; then
		if grep -q "^# forge-kit" "$rules_file" 2>/dev/null; then
			if [ "${FORGE_DRY_RUN:-false}" = "true" ]; then
				log_info "[DRY RUN] Would remove $rules_file"
			else
				rm "$rules_file"
				log_success "Removed rules.md"
			fi
		fi
	fi
}
