#!/bin/bash
#
# Example Claude Code PreToolUse hook.
# Reads hook payload JSON from stdin and emits a structured decision.
#

set -euo pipefail

payload="$(cat)"
tool_name="$(printf '%s' "$payload" | jq -r '.tool_name // .toolName // ""')"
command="$(printf '%s' "$payload" | jq -r '.tool_input.command // .toolInput.command // ""')"
file_path="$(printf '%s' "$payload" | jq -r '.tool_input.file_path // .toolInput.filePath // ""')"

deny() {
  jq -n --arg reason "$1" '{decision:"deny",reason:$reason}'
  exit 0
}

approve() {
  jq -n '{decision:"approve"}'
  exit 0
}

if [[ "$tool_name" == "Bash" ]]; then
  if [[ "$command" =~ rm[[:space:]]+-rf[[:space:]]+/ ]] || \
     [[ "$command" =~ git[[:space:]]+push.*(--force|-f).*(main|master) ]] || \
     [[ "$command" =~ git[[:space:]]+reset[[:space:]]+--hard ]]; then
    deny "Blocked by PreToolUse hook: destructive shell command."
  fi
fi

if [[ "$tool_name" =~ ^(Write|Edit|MultiEdit)$ ]]; then
  if [[ "$file_path" =~ (/.ssh/|/.aws/|/.bashrc|/.zshrc|/.config/) ]]; then
    deny "Blocked by PreToolUse hook: critical user config path."
  fi
fi

approve
