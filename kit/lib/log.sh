#!/usr/bin/env sh
# forge-kit: portable colored logging (sh/bash/zsh, no tput dependency)

FORGE_NO_COLOR="${FORGE_NO_COLOR:-}"

_forge_color() {
  [ -z "$FORGE_NO_COLOR" ] && [ -t 1 ] && printf '%s' "$1" || true
}

FORGE_RESET="$(_forge_color '\033[0m')"
FORGE_BOLD="$(_forge_color '\033[1m')"
FORGE_GREEN="$(_forge_color '\033[0;32m')"
FORGE_YELLOW="$(_forge_color '\033[0;33m')"
FORGE_RED="$(_forge_color '\033[0;31m')"
FORGE_BLUE="$(_forge_color '\033[0;34m')"
FORGE_CYAN="$(_forge_color '\033[0;36m')"
FORGE_DIM="$(_forge_color '\033[2m')"

log_info()    { printf '%s[forge-kit]%s %s\n'   "$FORGE_BLUE"   "$FORGE_RESET" "$*"; }
log_success() { printf '%s[forge-kit]%s %s✓%s %s\n' "$FORGE_GREEN"  "$FORGE_RESET" "$FORGE_GREEN" "$FORGE_RESET" "$*"; }
log_warn()    { printf '%s[forge-kit]%s %s⚠%s  %s\n' "$FORGE_YELLOW" "$FORGE_RESET" "$FORGE_YELLOW" "$FORGE_RESET" "$*"; }
log_error()   { printf '%s[forge-kit]%s %s✗%s %s\n' "$FORGE_RED"    "$FORGE_RESET" "$FORGE_RED" "$FORGE_RESET" "$*" >&2; }
log_step()    { printf '%s  →%s %s\n' "$FORGE_CYAN" "$FORGE_RESET" "$*"; }
log_dim()     { printf '%s%s%s\n' "$FORGE_DIM" "$*" "$FORGE_RESET"; }

log_header() {
  printf '\n%s%s━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━%s\n' "$FORGE_BOLD" "$FORGE_CYAN" "$FORGE_RESET"
  printf '%s%s  %s  %s\n' "$FORGE_BOLD" "$FORGE_CYAN" "$*" "$FORGE_RESET"
  printf '%s%s━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━%s\n\n' "$FORGE_BOLD" "$FORGE_CYAN" "$FORGE_RESET"
}

log_table_row() {
  printf '  %-24s %s%-12s%s %s\n' "$1" "$FORGE_GREEN" "$2" "$FORGE_RESET" "$3"
}
