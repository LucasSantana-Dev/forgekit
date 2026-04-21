#!/usr/bin/env bash
# sync-ai-tools — mirror Claude Code AI tooling to Cursor, VSCode, Warp
set -euo pipefail

CLAUDE_SKILLS="$HOME/.claude/skills"
AGENTS_SKILLS="$HOME/.agents/skills"
CURSOR_MCP="$HOME/.cursor/mcp.json"
VSCODE_MCP="$HOME/Library/Application Support/Code/User/mcp.json"
CLAUDE_JSON="$HOME/.claude.json"
STANDARDS_DIR="$HOME/.claude/standards"
CURSOR_RULES="$HOME/.cursor/rules"

log() { printf "\033[1;34m[sync]\033[0m %s\n" "$*"; }
warn() { printf "\033[1;33m[warn]\033[0m %s\n" "$*"; }
ok() { printf "\033[1;32m[ok]\033[0m %s\n" "$*"; }

# 1) Skills: Claude -> ~/.agents/skills (Cursor reads via symlink)
sync_skills() {
  if [ ! -d "$CLAUDE_SKILLS" ]; then warn "no $CLAUDE_SKILLS"; return; fi
  mkdir -p "$AGENTS_SKILLS"
  log "skills: $CLAUDE_SKILLS -> $AGENTS_SKILLS"
  rsync -a --delete "$CLAUDE_SKILLS/" "$AGENTS_SKILLS/"
  ok "skills synced ($(ls -1 "$AGENTS_SKILLS" | wc -l | tr -d ' ') items)"
}

# 2) MCP: Cursor -> VSCode (reformat servers key) + Cursor -> ~/.claude.json (Warp)
sync_mcp() {
  if [ ! -f "$CURSOR_MCP" ]; then warn "no $CURSOR_MCP"; return; fi
  if ! command -v jq >/dev/null; then warn "jq missing; skipping MCP sync"; return; fi

  log "mcp: Cursor -> VSCode ($VSCODE_MCP)"
  mkdir -p "$(dirname "$VSCODE_MCP")"
  jq '{servers: .mcpServers, inputs: []}' "$CURSOR_MCP" > "$VSCODE_MCP.tmp"
  mv "$VSCODE_MCP.tmp" "$VSCODE_MCP"
  ok "VSCode mcp.json written"

  log "mcp: Cursor -> ~/.claude.json (Warp File-based MCP)"
  if [ -f "$CLAUDE_JSON" ]; then
    jq --slurpfile s <(jq '.mcpServers' "$CURSOR_MCP") '.mcpServers = $s[0]' \
      "$CLAUDE_JSON" > "$CLAUDE_JSON.tmp" && mv "$CLAUDE_JSON.tmp" "$CLAUDE_JSON"
    ok "~/.claude.json mcpServers updated"
  else
    warn "~/.claude.json missing; run claude once to bootstrap"
  fi
}

# 3) Standards -> Cursor rules (delegated to agent-generated files; we just verify)
verify_rules() {
  local count
  count=$(ls "$CURSOR_RULES"/lucas-*.mdc 2>/dev/null | wc -l | tr -d ' ')
  if [ "$count" -ge 8 ]; then
    ok "cursor rules present: $count lucas-*.mdc files"
  else
    warn "only $count lucas-*.mdc rules in $CURSOR_RULES (expected ≥8)"
    warn "run: port standards via the sync-ai-tools skill prompt"
  fi
}

main() {
  sync_skills
  sync_mcp
  verify_rules
  ok "sync complete"
}

main "$@"
