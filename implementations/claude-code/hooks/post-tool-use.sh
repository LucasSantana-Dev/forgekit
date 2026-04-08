#!/bin/bash
#
# Example Claude Code PostToolUse hook.
# Reads hook payload JSON from stdin and performs non-mutating checks.
#

set -euo pipefail

payload="$(cat)"
tool_name="$(printf '%s' "$payload" | jq -r '.tool_name // .toolName // ""')"
file_path="$(printf '%s' "$payload" | jq -r '.tool_input.file_path // .toolInput.filePath // ""')"

notice() {
  jq -n --arg message "$1" '{decision:"approve",message:$message}'
  exit 0
}

if [[ "$tool_name" =~ ^(Write|Edit|MultiEdit)$ ]] && [[ -n "$file_path" ]] && [[ -f "$file_path" ]]; then
  if grep -qE '(sk_live_|pk_live_|AKIA[0-9A-Z]{16}|BEGIN (RSA|OPENSSH) PRIVATE KEY)' "$file_path" 2>/dev/null; then
    notice "Warning: potential secret pattern detected in $file_path. Review before commit."
  fi

  case "$file_path" in
    *.ts|*.tsx|*.js|*.jsx)
      if command -v eslint >/dev/null 2>&1; then
        eslint "$file_path" >/dev/null 2>&1 || \
          notice "Non-blocking notice: lint check failed for $file_path."
      fi
      ;;
    *.py)
      if command -v ruff >/dev/null 2>&1; then
        ruff check "$file_path" >/dev/null 2>&1 || \
          notice "Non-blocking notice: ruff check failed for $file_path."
      fi
      ;;
  esac
fi

jq -n '{decision:"approve"}'
