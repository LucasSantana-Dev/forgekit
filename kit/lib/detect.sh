#!/usr/bin/env sh
# forge-kit: AI tool auto-detection

FORGE_SUPPORTED_TOOLS="claude-code codex opencode cursor windsurf antigravity"

# Return 0 if a tool is installed, 1 otherwise
is_tool_installed() {
  tool="$1"
  case "$tool" in
    claude-code)
      command -v claude >/dev/null 2>&1
      ;;
    codex)
      command -v codex >/dev/null 2>&1
      ;;
    opencode)
      command -v opencode >/dev/null 2>&1
      ;;
    cursor)
      command -v cursor >/dev/null 2>&1 || \
      [ -d "/Applications/Cursor.app" ] || \
      [ -d "$HOME/Applications/Cursor.app" ]
      ;;
    windsurf)
      command -v windsurf >/dev/null 2>&1 || \
      [ -d "/Applications/Windsurf.app" ] || \
      [ -d "$HOME/Applications/Windsurf.app" ]
      ;;
    antigravity)
      command -v antigravity >/dev/null 2>&1 || \
      [ -d "$HOME/.antigravity" ]
      ;;
    *)
      return 1
      ;;
  esac
}

# Print space-separated list of installed tools
detect_tools() {
  found=""
  for tool in $FORGE_SUPPORTED_TOOLS; do
    if is_tool_installed "$tool"; then
      found="${found:+$found }$tool"
    fi
  done
  printf '%s' "$found"
}

# Return the primary config directory for a tool
get_config_dir() {
  home="$(get_home 2>/dev/null || printf '%s' "$HOME")"
  case "$1" in
    claude-code)  printf '%s/.claude' "$home" ;;
    codex)
      if [ -d "$home/.config/codex" ]; then
        printf '%s/.config/codex' "$home"
      else
        printf '%s/.codex' "$home"
      fi
      ;;
    opencode)     printf '%s/.config/opencode' "$home" ;;
    cursor)       printf '%s' "${CWD:-.}" ;;
    windsurf)     printf '%s' "${CWD:-.}" ;;
    antigravity)  printf '%s/.antigravity' "$home" ;;
    *)            printf '%s/.config/%s' "$home" "$1" ;;
  esac
}

# Parse comma-or-space-separated tool list, expanding "all" and "auto"
# Usage: parse_tools "all" | parse_tools "claude-code,opencode"
parse_tools() {
  input="$1"
  case "$input" in
    all)
      printf '%s' "$FORGE_SUPPORTED_TOOLS"
      ;;
    auto)
      detect_tools
      ;;
    *)
      printf '%s' "$(printf '%s' "$input" | tr ',' ' ')"
      ;;
  esac
}
