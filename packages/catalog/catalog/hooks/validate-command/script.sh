#!/usr/bin/env bash
set -euo pipefail
INPUT=$(cat)
COMMAND=$(printf '%s' "$INPUT" | jq -r '.tool_input.command // .command // empty' 2>/dev/null || true)
[ -z "$COMMAND" ] && exit 0
block() { echo "BLOCKED: $1" >&2; exit 2; }
case "$COMMAND" in
  *"rm -rf /"*|*":(){ :|:& };:"*|*"mkfs"*|*"fdisk"*|*"shutdown -h"*|*"poweroff"*) block "dangerous destructive command detected" ;;
esac
if [[ "$COMMAND" =~ (^|[[:space:]])sudo[[:space:]]+rm[[:space:]] ]]; then block "sudo rm detected"; fi
if [[ "$COMMAND" =~ git[[:space:]]+push([^[:alnum:]]|.*[[:space:]])(--force|-f)([[:space:]]|$) ]] && [[ ! "$COMMAND" =~ --force-with-lease ]]; then block "plain force-push detected"; fi
if [[ "$COMMAND" =~ gh[[:space:]]+pr[[:space:]]+merge ]] && [[ "$COMMAND" =~ --admin ]]; then block "admin merge bypass detected"; fi
if [[ "$COMMAND" =~ (^|[[:space:]])rm[[:space:]]+-rf[[:space:]]+([^[:space:]]+) ]]; then echo "WARN: recursive delete detected for ${BASH_REMATCH[2]}" >&2; fi
exit 0
