#!/usr/bin/env bash
set -euo pipefail

if ! command -v opencode >/dev/null 2>&1; then
	echo "OpenCode CLI not found. Run bootstrap first." >&2
	exit 1
fi

if [[ $# -eq 0 ]]; then
  echo "Configured MCP servers:"
  if output="$(opencode mcp ls 2>/dev/null)"; then
    printf '%s\n' "$output"
  else
    echo "(unable to query MCP server status yet)"
  fi

  echo
  echo "OAuth-capable MCP auth status:"
  if output="$(opencode mcp auth ls 2>/dev/null)"; then
    printf '%s\n' "$output"
  else
    echo "(unable to query MCP auth status yet)"
  fi

  echo
  echo "Optional hosted MCPs seeded in the shared config:"
  echo "  supabase vercel sentry linear cloudflare huggingface stitch jam"
  echo
  echo "To authenticate one, run for example:"
  echo "  bash ./scripts/auth-mcp-tools.sh linear"
  exit 0
fi

for name in "$@"; do
	echo
	echo "Authenticating MCP server: $name"
	opencode mcp auth "$name"
done
