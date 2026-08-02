#!/usr/bin/env sh
# forge-kit adapter: Kimi Code CLI (kimi command)
# Writes AGENTS.md, installs skills, appends real programmatic hooks to config.toml
#
# Unlike codex/cursor/windsurf (declarative-only hook instructions in a rules file),
# Kimi Code CLI has genuine event-driven hooks (PreToolUse/PostToolUse/UserPromptSubmit/
# SubagentStart/SubagentStop/...) configured as `[[hooks]]` TOML array entries, with a
# stdin-JSON contract that already matches forge-kit's existing PostToolUse hook scripts
# (kit/hooks/post-edit-format.sh, post-edit-typecheck.sh both read tool_input.file_path
# from stdin — no translation needed). FORGE_MCP and FORGE_PROVIDERS are intentionally
# NOT implemented here: no confirmed Kimi Code CLI support for forge-kit's mcp.json /
# providers.json schemas — do not guess a config shape, skip rather than fabricate.

. "$FORGE_KIT_DIR/lib/log.sh"
. "$FORGE_KIT_DIR/lib/os.sh"
. "$FORGE_KIT_DIR/lib/merge.sh"

adapter_install() {
	kimi_dir="$(get_config_dir kimi-code)"

	ensure_dir "$kimi_dir"

	# 1. FORGE_RULES=true: write AGENTS.md from core/rules.md
	#    NOTE: unconfirmed whether kimi-code auto-reads AGENTS.md the way codex does —
	#    writing it anyway matches the emerging cross-tool convention and is a harmless
	#    no-op if unused; `--agent-file` is Kimi's own explicit (non-auto) equivalent.
	if [ "${FORGE_RULES:-false}" = "true" ]; then
		log_step "Installing rules to $kimi_dir/AGENTS.md"

		agents_md_path="$kimi_dir/AGENTS.md"
		new_content="$(cat "$FORGE_KIT_DIR/core/rules.md")"

		if [ -f "$agents_md_path" ]; then
			old_sha="$(file_sha256 "$agents_md_path")"
			new_sha="$(printf '%s' "$new_content" | sha256sum | cut -d' ' -f1)"
			if [ "$old_sha" = "$new_sha" ]; then
				log_dim "  (no changes)"
			else
				if [ "${FORGE_DRY_RUN:-false}" = "true" ]; then
					log_info "  [DRY RUN] Would overwrite $agents_md_path"
				else
					printf '%s' "$new_content" >"$agents_md_path"
					log_success "AGENTS.md written"
				fi
			fi
		else
			if [ "${FORGE_DRY_RUN:-false}" = "true" ]; then
				log_info "  [DRY RUN] Would create $agents_md_path"
			else
				printf '%s' "$new_content" >"$agents_md_path"
				log_success "AGENTS.md created"
			fi
		fi
	fi

	# 2. FORGE_SKILLS=true: install skills to the user-level auto-discovered directory
	#    (per `kimi --help`: "--skills-dir ... Defaults to auto-discovered user and
	#    project directories" — ~/.kimi-code/skills/ is the user-level convention,
	#    matching every other adapter's config_dir/skills pattern).
	if [ "${FORGE_SKILLS:-false}" = "true" ]; then
		log_step "Installing skills to $kimi_dir/skills/"
		install_skills "$FORGE_KIT_DIR/core/skills" "$kimi_dir/skills"
	fi

	# 3. FORGE_HOOKS=true: append real [[hooks]] entries to config.toml, wrapped in
	#    marker comments for idempotent re-run and clean uninstall (TOML array-of-tables
	#    is append-safe — no need to parse/rewrite the whole file).
	if [ "${FORGE_HOOKS:-false}" = "true" ]; then
		config_toml="$kimi_dir/config.toml"
		log_step "Installing hooks to $config_toml"

		if [ -f "$config_toml" ] && grep -q "^# BEGIN forge-kit hooks$" "$config_toml" 2>/dev/null; then
			log_dim "  (hooks already installed)"
		else
			if [ "${FORGE_DRY_RUN:-false}" = "true" ]; then
				log_info "  [DRY RUN] Would append forge-kit hooks block to $config_toml"
			else
				: >>"$config_toml"
				cat >>"$config_toml" <<EOF

# BEGIN forge-kit hooks
[[hooks]]
event = "PostToolUse"
matcher = "Write|Edit"
command = "$FORGE_KIT_DIR/hooks/post-edit-format.sh"
timeout = 10

[[hooks]]
event = "PostToolUse"
matcher = "Write|Edit"
command = "$FORGE_KIT_DIR/hooks/post-edit-typecheck.sh"
timeout = 10
# END forge-kit hooks
EOF
				log_success "hooks installed"
			fi
		fi
	fi

	# 4. FORGE_DURABLE=true: same durable-execution section codex/opencode append,
	#    into the same AGENTS.md file written above.
	if [ "${FORGE_DURABLE:-false}" = "true" ]; then
		if [ -f "$kimi_dir/AGENTS.md" ]; then
			log_step "Adding durable execution config"
			install_durable "$FORGE_KIT_DIR/core/rules.md" "$kimi_dir/AGENTS.md"
		else
			log_warn "Skipping durable execution config: missing $kimi_dir/AGENTS.md"
		fi
	fi
}

adapter_verify() {
	command -v kimi >/dev/null 2>&1
}

adapter_status() {
	kimi_dir="$(get_config_dir kimi-code)"
	agents_md=""
	[ -f "$kimi_dir/AGENTS.md" ] && agents_md="AGENTS.md ✓" || agents_md="AGENTS.md ✗"
	hooks_status="hooks ✗"
	[ -f "$kimi_dir/config.toml" ] && grep -q "^# BEGIN forge-kit hooks$" "$kimi_dir/config.toml" 2>/dev/null && hooks_status="hooks ✓"
	printf 'kimi-code | %s | %s | config → %s/\n' "$agents_md" "$hooks_status" "$kimi_dir"
}

adapter_uninstall() {
	kimi_dir="$(get_config_dir kimi-code)"

	if [ -f "$kimi_dir/AGENTS.md" ]; then
		if grep -q "forge-kit Universal Rules" "$kimi_dir/AGENTS.md" 2>/dev/null; then
			if [ "${FORGE_DRY_RUN:-false}" = "true" ]; then
				log_info "[DRY RUN] Would remove $kimi_dir/AGENTS.md"
			else
				rm "$kimi_dir/AGENTS.md"
				log_success "Removed AGENTS.md"
			fi
		fi
	fi

	uninstall_skills "$kimi_dir/skills"

	config_toml="$kimi_dir/config.toml"
	if [ -f "$config_toml" ] && grep -q "^# BEGIN forge-kit hooks$" "$config_toml" 2>/dev/null; then
		if [ "${FORGE_DRY_RUN:-false}" = "true" ]; then
			log_info "[DRY RUN] Would remove forge-kit hooks block from $config_toml"
		else
			awk '/^# BEGIN forge-kit hooks$/{skip=1} !skip{print} /^# END forge-kit hooks$/{skip=0}' \
				"$config_toml" >"$config_toml.tmp" && mv "$config_toml.tmp" "$config_toml"
			log_success "Removed hooks block"
		fi
	fi
}
