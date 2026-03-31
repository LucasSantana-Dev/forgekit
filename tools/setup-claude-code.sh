#!/bin/bash
set -euo pipefail

echo "=== AI Dev Toolkit — Claude Code Setup ==="
echo ""
echo "Configures: MCP servers, memory structure, settings, plugin hygiene"
echo ""

INSTALLED=()
SKIPPED=()
WARNINGS=()

CLAUDE_DIR="$HOME/.claude"
MCP_CONFIG="$CLAUDE_DIR/.mcp.json"
SETTINGS_FILE="$CLAUDE_DIR/settings.json"

mkdir -p "$CLAUDE_DIR"

# ---------------------------------------------------------------------------
# 1. MCP servers — write ~/.claude/.mcp.json with recommended global servers
# ---------------------------------------------------------------------------
echo "=== MCP Server Configuration ==="

if [ -f "$MCP_CONFIG" ]; then
  echo "  ✓ $MCP_CONFIG already exists — merging missing servers"
  python3 <<PYEOF
import json
from pathlib import Path

path = Path("$MCP_CONFIG")
recommended = {
    "tavily": {
        "command": "npx",
        "args": ["-y", "tavily-mcp@latest"],
        "env": {"TAVILY_API_KEY": "\${TAVILY_API_KEY}"}
    },
    "context7": {
        "command": "npx",
        "args": ["-y", "@upstash/context7-mcp@latest"]
    },
    "playwright": {
        "command": "npx",
        "args": ["-y", "@playwright/mcp@latest"]
    },
    "markdownify": {
        "command": "npx",
        "args": ["-y", "markdownify-mcp@latest"]
    }
}

data = json.loads(path.read_text()) if path.stat().st_size > 0 else {}
existing = set(data.get("mcpServers", {}).keys())
servers = data.setdefault("mcpServers", {})
for name, cfg in recommended.items():
    if name not in existing:
        servers[name] = cfg

path.write_text(json.dumps(data, indent=2) + "\n")
added = [n for n in recommended if n not in existing]
if added:
    print(f"  Added: {', '.join(added)}")
else:
    print("  All recommended servers already present")
PYEOF
  SKIPPED+=(".mcp.json (merged)")
else
  python3 <<PYEOF > "$MCP_CONFIG"
import json
data = {
    "mcpServers": {
        "tavily": {
            "command": "npx",
            "args": ["-y", "tavily-mcp@latest"],
            "env": {"TAVILY_API_KEY": "\${TAVILY_API_KEY}"}
        },
        "context7": {
            "command": "npx",
            "args": ["-y", "@upstash/context7-mcp@latest"]
        },
        "playwright": {
            "command": "npx",
            "args": ["-y", "@playwright/mcp@latest"]
        },
        "markdownify": {
            "command": "npx",
            "args": ["-y", "markdownify-mcp@latest"]
        }
    }
}
print(json.dumps(data, indent=2))
PYEOF
  echo "  ✓ Created $MCP_CONFIG"
  INSTALLED+=(".mcp.json")
fi

echo ""
echo "  Servers: tavily (web search), context7 (library docs), playwright (browser automation), markdownify (PDF/image/audio→Markdown)"
echo "  Set TAVILY_API_KEY in your shell env for tavily to work: export TAVILY_API_KEY=tvly-..."
echo "  For project-specific servers, create .mcp.json in your project root."

# ---------------------------------------------------------------------------
# 2. settings.json — model defaults, remove agent-teams bloat
# ---------------------------------------------------------------------------
echo ""
echo "=== Claude Code Settings ==="

[ -f "$SETTINGS_FILE" ] || echo '{}' > "$SETTINGS_FILE"

python3 <<PYEOF
import json
from pathlib import Path

path = Path("$SETTINGS_FILE")
data = json.loads(path.read_text()) if path.stat().st_size > 0 else {}
changed = []

# Default model
if "model" not in data:
    data["model"] = "claude-sonnet-4-6"
    changed.append("model = claude-sonnet-4-6")

# Subagent model (haiku: fast + cheap for background tasks)
env = data.setdefault("env", {})
if "CLAUDE_CODE_SUBAGENT_MODEL" not in env:
    env["CLAUDE_CODE_SUBAGENT_MODEL"] = "claude-haiku-4-5-20251001"
    changed.append("env.CLAUDE_CODE_SUBAGENT_MODEL = claude-haiku-4-5-20251001")

# Remove CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS — triples all MCP tool entries
if "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS" in env:
    del env["CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS"]
    changed.append("removed CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS (was tripling MCP tool list)")

if not data.get("env"):
    data.pop("env", None)

path.write_text(json.dumps(data, indent=2) + "\n")
for msg in changed:
    print(f"  ✓ {msg}")
if not changed:
    print("  ✓ Settings already optimal")
PYEOF

# ---------------------------------------------------------------------------
# 3. Memory directory structure
# ---------------------------------------------------------------------------
echo ""
echo "=== Memory Structure ==="

MEMORY_BASE="$CLAUDE_DIR/memory"
mkdir -p "$MEMORY_BASE"

if [ ! -f "$MEMORY_BASE/MEMORY.md" ]; then
  cat > "$MEMORY_BASE/MEMORY.md" << 'EOF'
# Memory Index

<!-- Hard limit: 200 lines. Entries after line 200 are silently truncated.     -->
<!-- Keep each entry to one line ~150 chars: [Title](file.md) — one-line hook  -->
<!-- Move all details to topic files. This index is a pointer list, not storage -->

## Project Context
<!-- Add pointers to project-specific memory files here -->

## Key Decisions
<!-- [YYYY-MM-DD] Decision — see topic-file.md for rationale -->

## Gotchas
<!-- See gotchas.md for full list — tease the most painful ones here -->

## Active Work
<!-- Current tasks and PRs in flight -->
EOF
  echo "  ✓ Created $MEMORY_BASE/MEMORY.md"
  INSTALLED+=("memory/MEMORY.md")
else
  echo "  ✓ $MEMORY_BASE/MEMORY.md already exists"
  SKIPPED+=("memory/MEMORY.md")
fi

if [ ! -f "$MEMORY_BASE/gotchas.md" ]; then
  cat > "$MEMORY_BASE/gotchas.md" << 'EOF'
---
name: Gotchas
description: Project-specific gotchas and non-obvious operational issues
type: reference
---

## Gotchas

<!-- Format: **Short label**: what breaks and how to fix it -->
EOF
  echo "  ✓ Created $MEMORY_BASE/gotchas.md"
  INSTALLED+=("memory/gotchas.md")
else
  echo "  ✓ $MEMORY_BASE/gotchas.md already exists"
  SKIPPED+=("memory/gotchas.md")
fi

# ---------------------------------------------------------------------------
# 4. Plugin audit
# ---------------------------------------------------------------------------
echo ""
echo "=== Plugin Audit ==="

if command -v claude &>/dev/null; then
  echo "  Installed plugins:"
  claude plugin list 2>/dev/null | grep -v "^$" | head -20 || true
  echo ""
  echo "  ⚠  Check for servers in both ~/.claude/.mcp.json AND enabled as a plugin."
  echo "     Dual-registered servers appear twice in the tool list (doubles context cost)."
  echo "     To disable: claude plugin disable <name>@claude-plugins-official"
else
  echo "  Claude Code not found. Install from: https://claude.ai/download"
  WARNINGS+=("claude CLI not found — plugin audit skipped")
fi

# ---------------------------------------------------------------------------
# 5. capture-training — install session export script to ~/.local/bin
# ---------------------------------------------------------------------------
echo ""
echo "=== Training Data Capture ==="

CAPTURE_TARGET="$HOME/.local/bin/capture-training"
CAPTURE_SRC="$(cd "$(dirname "$0")" && pwd)/capture-training.py"

if [ -f "$CAPTURE_TARGET" ]; then
  echo "  ✓ capture-training already installed at $CAPTURE_TARGET"
  SKIPPED+=("capture-training")
elif [ -f "$CAPTURE_SRC" ]; then
  mkdir -p "$HOME/.local/bin"
  cp "$CAPTURE_SRC" "$CAPTURE_TARGET"
  chmod +x "$CAPTURE_TARGET"
  echo "  ✓ Installed capture-training → $CAPTURE_TARGET"
  INSTALLED+=("capture-training")
else
  echo "  ℹ  capture-training.py not found next to this script — skipping"
  echo "     To install manually: cp tools/capture-training.py ~/.local/bin/capture-training && chmod +x ~/.local/bin/capture-training"
fi

# ---------------------------------------------------------------------------
# Summary
# ---------------------------------------------------------------------------
echo ""
echo "=== Summary ==="

if [ ${#INSTALLED[@]} -gt 0 ]; then
  echo "Configured:"
  for item in "${INSTALLED[@]}"; do
    echo "  ✓ $item"
  done
fi

if [ ${#SKIPPED[@]} -gt 0 ]; then
  echo "Already present:"
  for item in "${SKIPPED[@]}"; do
    echo "  • $item"
  done
fi

if [ ${#WARNINGS[@]} -gt 0 ]; then
  echo "Warnings:"
  for item in "${WARNINGS[@]}"; do
    echo "  ! $item"
  done
fi

echo ""
echo "=== Next Steps ==="
echo ""
echo "  1. Set TAVILY_API_KEY for web search:"
echo "       export TAVILY_API_KEY=tvly-..."
echo ""
echo "  2. Restart Claude Code to pick up .mcp.json changes"
echo ""
echo "  3. Check plugin audit output above — disable duplicates:"
echo "       claude plugin disable <name>@claude-plugins-official"
echo ""
echo "  4. For per-project MCP servers, create .mcp.json in your project root"
echo ""
echo "  5. Token monitoring during sessions:"
echo "       rtk gain    (cumulative Bash output savings)"
echo "       /compact    (run inside Claude at 60-70% context usage)"
echo ""
echo "  6. Capture Claude Code sessions as training data (runs after each session):"
echo "       capture-training --export --min-turns 3"
