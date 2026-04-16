#!/usr/bin/env sh
# forge-kit installer
# Usage: FORGE_KIT_DIR=<path/to/kit> sh install.sh [options]
#
# Options:
#   --tools <list>     Tools to install for (default: auto)
#                      Values: all, auto, or comma-separated: claude-code,codex,opencode,cursor,windsurf,antigravity
#   --profile <name>   Profile to use (default: standard)
#                      Values: standard, minimal, research, durable
#   --dry-run          Print what would be done without making changes
#   --with-hooks       Install code hooks (format, typecheck, evaluate)
#   --uninstall        Remove forge-kit managed files
#   --status           Show installation status
#   --help             Show this help message

set -e

FORGE_KIT_DIR="${FORGE_KIT_DIR:-$(cd "$(dirname "$0")" && pwd)}"

. "$FORGE_KIT_DIR/lib/log.sh"
. "$FORGE_KIT_DIR/lib/os.sh"
. "$FORGE_KIT_DIR/lib/detect.sh"

# Defaults
FORGE_TOOLS="auto"
FORGE_PROFILE="standard"
FORGE_DRY_RUN="false"
FORGE_OHMY_COMPAT="false"
FORGE_OHMY_COMPAT_CLI=""
FORGE_WITH_HOOKS="false"
FORGE_ACTION="install"

# Parse args
while [ "$#" -gt 0 ]; do
	case "$1" in
	--tools)
		if [ "$#" -lt 2 ] || [ -z "$2" ] || [ "${2#-}" != "$2" ]; then
			log_error "--tools requires a value"
			exit 1
		fi
		FORGE_TOOLS="$2"
		shift 2
		;;
	--profile)
		if [ "$#" -lt 2 ] || [ -z "$2" ] || [ "${2#-}" != "$2" ]; then
			log_error "--profile requires a value"
			exit 1
		fi
		FORGE_PROFILE="$2"
		shift 2
		;;
	--dry-run)
		FORGE_DRY_RUN="true"
		shift
		;;
	--oh-my-compat)
		FORGE_OHMY_COMPAT="true"
		FORGE_OHMY_COMPAT_CLI="true"
		shift
		;;
	--with-hooks)
		FORGE_WITH_HOOKS="true"
		shift
		;;
	--uninstall)
		FORGE_ACTION="uninstall"
		shift
		;;
	--status)
		FORGE_ACTION="status"
		shift
		;;
	--help | -h)
		FORGE_ACTION="help"
		shift
		;;
	*)
		log_error "Unknown option: $1"
		exit 1
		;;
	esac
done

export FORGE_KIT_DIR FORGE_DRY_RUN FORGE_WITH_HOOKS

show_help() {
	cat <<'EOF'
forge-kit installer

Usage:
  sh install.sh [options]

Options:
  --tools <list>     Tools: all, auto, or claude-code,codex,opencode,cursor,windsurf,antigravity
  --profile <name>   Profile: standard (default), minimal, research, durable
  --dry-run          Show what would change without making changes
  --with-hooks       Install code hooks (format, typecheck, evaluate) to ~/.claude/hooks/
  --oh-my-compat     Enable optional oh-my compatibility assets
  --uninstall        Remove forge-kit managed files
  --status           Show current installation status
  --help             Show this help

Examples:
  sh install.sh                                  # auto-detect tools, standard profile
  sh install.sh --tools claude-code --profile minimal
  sh install.sh --tools all --oh-my-compat
  sh install.sh --with-hooks                    # install hooks only
  sh install.sh --tools all --dry-run
  sh install.sh --uninstall

EOF
}

load_profile() {
	profile_file="$FORGE_KIT_DIR/profiles/${FORGE_PROFILE}.env"
	if [ ! -f "$profile_file" ]; then
		log_error "Unknown profile: $FORGE_PROFILE (expected: standard, minimal, research, durable)"
		exit 1
	fi
	# shellcheck disable=SC1090
	. "$profile_file"
	if [ -n "$FORGE_OHMY_COMPAT_CLI" ]; then
		FORGE_OHMY_COMPAT="$FORGE_OHMY_COMPAT_CLI"
	fi
	export FORGE_RULES FORGE_SKILLS FORGE_HOOKS FORGE_MCP FORGE_PROVIDERS FORGE_DURABLE FORGE_OHMY_COMPAT
}

run_adapter() {
	tool="$1"
	action="$2"

	adapter_file="$FORGE_KIT_DIR/adapters/${tool}.sh"
	if [ ! -f "$adapter_file" ]; then
		log_warn "No adapter found for: $tool (skipping)"
		return
	fi

	# shellcheck disable=SC1090
	. "$adapter_file"

	case "$action" in
	install) adapter_install ;;
	uninstall) adapter_uninstall ;;
	status) adapter_status ;;
	esac
}

install_hooks() {
	if [ "$FORGE_WITH_HOOKS" != "true" ]; then
		return 0
	fi

	hooks_src_dir="$FORGE_KIT_DIR/hooks"
	hooks_dst_dir="$HOME/.claude/hooks"

	if [ ! -d "$hooks_src_dir" ]; then
		log_warn "Hooks directory not found: $hooks_src_dir (skipping)"
		return
	fi

	log_step "Installing code hooks to $hooks_dst_dir"

	if [ "${FORGE_DRY_RUN:-false}" = "true" ]; then
		log_info "  [DRY RUN] Would install hooks: post-edit-format.sh, post-edit-typecheck.sh, evaluate-response.sh"
		return
	fi

	mkdir -p "$hooks_dst_dir"

	for hook_file in post-edit-format.sh post-edit-typecheck.sh evaluate-response.sh; do
		src="$hooks_src_dir/$hook_file"
		dst="$hooks_dst_dir/$hook_file"

		if [ -f "$src" ]; then
			rm -f "$dst"
			ln -s "$src" "$dst"
			chmod 755 "$src" 2>/dev/null || true
			log_dim "  ✓ $hook_file linked"
		else
			log_warn "  Hook not found: $hook_file"
		fi
	done

	log_success "hooks installed (run 'cat ~/.claude/hooks.json' to verify hooks.json has hook definitions)"
}

main() {
	case "$FORGE_ACTION" in
	help)
		show_help
		return 0
		;;
	esac

	log_header "forge-kit ${FORGE_ACTION}"

	if [ "$FORGE_ACTION" != "status" ]; then
		load_profile
	fi

	resolved_tools="$(parse_tools "$FORGE_TOOLS")"

	if [ -z "$resolved_tools" ]; then
		log_warn "No tools detected or specified."
		log_info "Specify with --tools or install a supported tool first."
		log_info "Supported: $FORGE_SUPPORTED_TOOLS"
		exit 0
	fi

	log_info "Profile:  $FORGE_PROFILE"
	log_info "Tools:    $resolved_tools"
	log_info "Compat:   ${FORGE_OHMY_COMPAT}"
	[ "$FORGE_DRY_RUN" = "true" ] && log_warn "DRY RUN — no changes will be made"
	printf '\n'

	for tool in $resolved_tools; do
		if ! is_tool_installed "$tool" && [ "$FORGE_ACTION" = "install" ]; then
			log_warn "$tool not detected — skipping (use --tools $tool to force)"
			continue
		fi

		log_step "[$tool]"
		run_adapter "$tool" "$FORGE_ACTION"
		printf '\n'
	done

	if [ "$FORGE_WITH_HOOKS" = "true" ] && [ "$FORGE_ACTION" = "install" ]; then
		install_hooks
		printf '\n'
	fi

	if [ "$FORGE_ACTION" = "install" ] && [ "$FORGE_DRY_RUN" != "true" ]; then
		log_success "forge-kit installation complete"
	fi
}

main "$@"
