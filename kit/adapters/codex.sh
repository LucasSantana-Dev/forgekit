#!/usr/bin/env sh
# forge-kit adapter: OpenAI Codex CLI (codex command)
# Writes AGENTS.md, merges provider config

. "$FORGE_KIT_DIR/lib/log.sh"
. "$FORGE_KIT_DIR/lib/os.sh"
. "$FORGE_KIT_DIR/lib/merge.sh"

adapter_install() {
	codex_dir="$(get_config_dir codex)"

	ensure_dir "$codex_dir"

	# 1. FORGE_RULES=true: write AGENTS.md from core/rules.md
	if [ "${FORGE_RULES:-false}" = "true" ]; then
		log_step "Installing rules to $codex_dir/AGENTS.md"

		agents_md_path="$codex_dir/AGENTS.md"
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

	# 2. FORGE_PROVIDERS=true: write providers config
	if [ "${FORGE_PROVIDERS:-false}" = "true" ]; then
		log_step "Installing providers config to $codex_dir/providers.json"

		providers_src="$FORGE_KIT_DIR/core/providers.json"
		providers_dst="$codex_dir/providers.json"
		providers_exists_before="false"

		if [ -f "$providers_dst" ]; then
			providers_exists_before="true"
		fi

		if [ -f "$providers_src" ]; then
			if [ -f "$providers_dst" ] && files_equal "$providers_src" "$providers_dst"; then
				log_dim "  (no changes)"
			else
				if [ "${FORGE_DRY_RUN:-false}" = "true" ]; then
					if [ -f "$providers_dst" ]; then
						log_info "  [DRY RUN] Would update providers.json"
					else
						log_info "  [DRY RUN] Would create providers.json"
					fi
				else
					cp "$providers_src" "$providers_dst"
					if [ "$providers_exists_before" = "true" ]; then
						log_success "providers.json updated"
					else
						log_success "providers.json created"
					fi
				fi
			fi
		fi
	fi

	if [ "${FORGE_SKILLS:-false}" = "true" ]; then
		log_step "Installing skills to $codex_dir/skills/"
		install_skills "$FORGE_KIT_DIR/core/skills" "$codex_dir/skills"
	fi

	if [ "${FORGE_OHMY_COMPAT:-false}" = "true" ]; then
		compat_src="$FORGE_KIT_DIR/../implementations/codex/oh-my-codex.md"
		compat_dst="$codex_dir/oh-my-codex.md"

		if [ -f "$compat_src" ]; then
			log_step "Installing oh-my compatibility reference to $compat_dst"

			if [ -f "$compat_dst" ] && files_equal "$compat_src" "$compat_dst"; then
				log_dim "  (no changes)"
			else
				if [ "${FORGE_DRY_RUN:-false}" = "true" ]; then
					if [ -f "$compat_dst" ]; then
						log_info "  [DRY RUN] Would update oh-my-codex.md"
					else
						log_info "  [DRY RUN] Would create oh-my-codex.md"
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
	command -v codex >/dev/null 2>&1
}

adapter_status() {
	codex_dir="$(get_config_dir codex)"
	agents_md=""
	[ -f "$codex_dir/AGENTS.md" ] && agents_md="AGENTS.md ✓" || agents_md="AGENTS.md ✗"
	printf 'codex | %s | config → %s/\n' "$agents_md" "$codex_dir"
}

adapter_uninstall() {
	codex_dir="$(get_config_dir codex)"

	if [ -f "$codex_dir/AGENTS.md" ]; then
		if grep -q "^# forge-kit" "$codex_dir/AGENTS.md" 2>/dev/null; then
			if [ "${FORGE_DRY_RUN:-false}" = "true" ]; then
				log_info "[DRY RUN] Would remove $codex_dir/AGENTS.md"
			else
				rm "$codex_dir/AGENTS.md"
				log_success "Removed AGENTS.md"
			fi
		fi
	fi

	uninstall_skills "$codex_dir/skills"

	if [ -f "$codex_dir/oh-my-codex.md" ]; then
		if grep -q "^# forge-kit" "$codex_dir/oh-my-codex.md" 2>/dev/null; then
			if [ "${FORGE_DRY_RUN:-false}" = "true" ]; then
				log_info "[DRY RUN] Would remove $codex_dir/oh-my-codex.md"
			else
				rm "$codex_dir/oh-my-codex.md"
				log_success "Removed oh-my compatibility reference"
			fi
		fi
	fi
}
