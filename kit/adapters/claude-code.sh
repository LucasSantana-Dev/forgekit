#!/usr/bin/env sh
# forge-kit adapter: Claude Code (claude command)
# Writes CLAUDE.md, installs skills, merges MCP config

. "$FORGE_KIT_DIR/lib/log.sh"
. "$FORGE_KIT_DIR/lib/os.sh"
. "$FORGE_KIT_DIR/lib/merge.sh"

adapter_install() {
	home="$(get_home)"
	claude_dir="$home/.claude"

	ensure_dir "$claude_dir"

	# 1. FORGE_RULES=true: write CLAUDE.md from core/rules.md
	if [ "${FORGE_RULES:-false}" = "true" ]; then
		log_step "Installing rules to $claude_dir/CLAUDE.md"

		claude_md_path="$claude_dir/CLAUDE.md"
		new_content="$(cat "$FORGE_KIT_DIR/core/rules.md")"

		if [ -f "$claude_md_path" ]; then
			old_sha="$(file_sha256 "$claude_md_path")"
			new_sha="$(printf '%s' "$new_content" | sha256sum | cut -d' ' -f1)"
			if [ "$old_sha" = "$new_sha" ]; then
				log_dim "  (no changes)"
			else
				if [ "${FORGE_DRY_RUN:-false}" = "true" ]; then
					log_info "  [DRY RUN] Would overwrite $claude_md_path"
				else
					printf '%s' "$new_content" >"$claude_md_path"
					log_success "CLAUDE.md written"
				fi
			fi
		else
			if [ "${FORGE_DRY_RUN:-false}" = "true" ]; then
				log_info "  [DRY RUN] Would create $claude_md_path"
			else
				printf '%s' "$new_content" >"$claude_md_path"
				log_success "CLAUDE.md created"
			fi
		fi
	fi

	# 2. FORGE_SKILLS=true: copy skill files
	if [ "${FORGE_SKILLS:-false}" = "true" ]; then
		log_step "Installing skills to $claude_dir/skills/"

		skills_src="$FORGE_KIT_DIR/core/skills"
		skills_dst="$claude_dir/skills"

		if [ -d "$skills_src" ]; then
			ensure_dir "$skills_dst"

			if [ "${FORGE_DRY_RUN:-false}" != "true" ]; then
				: >"$skills_dst/.forge-kit"
			fi

			count=0
			for skill_file in "$skills_src"/*.md; do
				if [ -f "$skill_file" ]; then
					filename="$(basename "$skill_file")"
					dst="$skills_dst/$filename"

					if [ -f "$dst" ]; then
						old_sha="$(file_sha256 "$dst")"
						new_sha="$(file_sha256 "$skill_file")"
						if [ "$old_sha" = "$new_sha" ]; then
							log_dim "  (skip) $filename"
							continue
						fi
					fi

					if [ "${FORGE_DRY_RUN:-false}" = "true" ]; then
						log_info "  [DRY RUN] Would copy $filename"
					else
						cp "$skill_file" "$dst"
						count=$((count + 1))
					fi
				fi
			done

			if [ "${FORGE_DRY_RUN:-false}" != "true" ]; then
				log_success "$count skills installed"
			fi
		fi
	fi

	# 3. FORGE_MCP=true: merge MCP servers
	if [ "${FORGE_MCP:-false}" = "true" ]; then
		log_step "Merging MCP servers to $claude_dir/.mcp.json"

		mcp_dst="$claude_dir/.mcp.json"
		mcp_src="$FORGE_KIT_DIR/core/mcp.json"

		if [ -f "$mcp_src" ]; then
			if [ "${FORGE_DRY_RUN:-false}" = "true" ]; then
				log_info "  [DRY RUN] Would merge MCP servers"
			else
				# Extract mcpServers from source, merge into destination
				python3 - "$mcp_src" "$mcp_dst" <<'PYEOF'
import json, sys
from pathlib import Path

src_path = Path(sys.argv[1])
dst_path = Path(sys.argv[2])

src_data = json.loads(src_path.read_text()) if src_path.exists() else {}
mcp_servers_src = src_data.get("mcpServers", {})

dst_data = json.loads(dst_path.read_text()) if dst_path.exists() and dst_path.stat().st_size > 0 else {}
mcp_servers_dst = dst_data.get("mcpServers", {})

# Deep merge mcpServers
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

	# 4. FORGE_DURABLE=true: append Durable Execution section
	if [ "${FORGE_DURABLE:-false}" = "true" ]; then
		log_step "Adding durable execution config"

		claude_md_path="$claude_dir/CLAUDE.md"

		if [ -f "$claude_md_path" ]; then
			if grep -q "## Durable Execution" "$claude_md_path"; then
				log_dim "  (durable execution section already present)"
			else
				durable_section="$(extract_section "$FORGE_KIT_DIR/core/rules.md" "durable-execution")"

				if [ -n "$durable_section" ]; then
					if [ "${FORGE_DRY_RUN:-false}" = "true" ]; then
						log_info "  [DRY RUN] Would append durable execution section"
					else
						printf '\n%s\n' "$durable_section" >>"$claude_md_path"
						log_success "Durable execution section added"
					fi
				fi
			fi
		fi
	fi
}

adapter_verify() {
	command -v claude >/dev/null 2>&1
}

adapter_status() {
	home="$(get_home)"
	claude_dir="$home/.claude"

	skills_count=0
	if [ -d "$claude_dir/skills" ]; then
		skills_count=$(find "$claude_dir/skills" -maxdepth 1 -name "*.md" 2>/dev/null | wc -l | awk '{print $1}')
	fi

	printf 'claude-code | CLAUDE.md → %s/ | %d skills\n' "$claude_dir" "$skills_count"
}

adapter_uninstall() {
	home="$(get_home)"
	claude_dir="$home/.claude"

	# Only remove if marked with forge-kit
	if [ -f "$claude_dir/CLAUDE.md" ]; then
		if grep -q "^# forge-kit" "$claude_dir/CLAUDE.md" 2>/dev/null; then
			if [ "${FORGE_DRY_RUN:-false}" = "true" ]; then
				log_info "[DRY RUN] Would remove $claude_dir/CLAUDE.md"
			else
				rm "$claude_dir/CLAUDE.md"
				log_success "Removed CLAUDE.md"
			fi
		fi
	fi

	# Remove skills directory if marked
	if [ -d "$claude_dir/skills" ]; then
		if [ -f "$claude_dir/skills/.forge-kit" ] || grep -qm1 "^# forge-kit" "$claude_dir/skills"/*.md 2>/dev/null; then
			if [ "${FORGE_DRY_RUN:-false}" = "true" ]; then
				log_info "[DRY RUN] Would remove $claude_dir/skills/"
			else
				rm -rf "$claude_dir/skills"
				log_success "Removed skills directory"
			fi
		fi
	fi
}
