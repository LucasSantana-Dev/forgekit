#!/bin/bash
set -euo pipefail

echo "=== AI Dev Toolkit — AI Workflow Setup (macOS) ==="

INSTALLED=()
SKIPPED=()
WARNINGS=()

ensure_brew() {
  if command -v brew >/dev/null 2>&1; then
    SKIPPED+=("homebrew")
    return
  fi

  echo "Installing Homebrew..."
  /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
  INSTALLED+=("homebrew")
}

install_brew_formula() {
  local formula="$1"
  if brew list --formula "$formula" >/dev/null 2>&1; then
    echo "✓ $formula already installed"
    SKIPPED+=("$formula")
    return
  fi

  echo "Installing $formula..."
  brew install "$formula"
  INSTALLED+=("$formula")
}

install_npm_global() {
  local package="$1"
  local bin_name="$2"
  if command -v "$bin_name" >/dev/null 2>&1; then
    echo "✓ $package already installed"
    SKIPPED+=("$package")
    return
  fi

  if ! command -v npm >/dev/null 2>&1; then
    WARNINGS+=("npm missing: skipped $package")
    return
  fi

  echo "Installing $package..."
  npm install -g "$package"
  INSTALLED+=("$package")
}

install_pipx_package() {
  local package="$1"
  local bin_name="$2"
  if command -v "$bin_name" >/dev/null 2>&1; then
    echo "✓ $package already installed"
    SKIPPED+=("$package")
    return
  fi

  if ! command -v pipx >/dev/null 2>&1; then
    WARNINGS+=("pipx missing: skipped $package")
    return
  fi

  echo "Installing $package..."
  pipx install "$package" || WARNINGS+=("failed to install $package with pipx")
  if command -v "$bin_name" >/dev/null 2>&1; then
    INSTALLED+=("$package")
  fi
}

install_memory_stack() {
  local py_bin="python3.13"
  local venv_dir="$HOME/.local/share/ai-memory-venv"
  local pip_in_venv="$venv_dir/bin/pip"
  local check_cmd="$HOME/.local/bin/ai-memory-check"

  if ! command -v "$py_bin" >/dev/null 2>&1; then
    WARNINGS+=("python3.13 missing: skipped mem0ai/graphiti-core memory stack")
    return
  fi

  echo "Installing memory stack (mem0ai + graphiti-core)..."
  "$py_bin" -m venv "$venv_dir"
  "$pip_in_venv" install --upgrade pip >/dev/null 2>&1 || true
  if "$pip_in_venv" install mem0ai graphiti-core >/dev/null 2>&1; then
    mkdir -p "$HOME/.local/bin"
    cat >"$check_cmd" <<'EOF'
#!/usr/bin/env bash
set -euo pipefail
"$HOME/.local/share/ai-memory-venv/bin/python" - <<'PY'
import importlib
for module in ("mem0", "graphiti_core"):
    importlib.import_module(module)
print("memory stack ok: mem0 + graphiti_core")
PY
EOF
    chmod +x "$check_cmd"
    INSTALLED+=("memory stack (mem0ai + graphiti-core)")
  else
    WARNINGS+=("failed to install mem0ai/graphiti-core memory stack")
  fi
}

setup_claude_code() {
  local settings_dir="$HOME/.claude"
  local settings_file="$settings_dir/settings.json"
  local mcp_file="$settings_dir/.mcp.json"

  mkdir -p "$settings_dir"

  # Sub-agent model routing: route background agents to Haiku (60-80% cost reduction)
  if [ ! -f "$settings_file" ]; then
    echo '{"env":{"CLAUDE_CODE_SUBAGENT_MODEL":"claude-haiku-4-5-20251001"}}' > "$settings_file"
    INSTALLED+=("claude settings.json (sub-agent routing)")
    echo "✓ Created ~/.claude/settings.json with sub-agent model routing"
  elif ! python3 -c "import json,sys; d=json.load(open('$settings_file')); sys.exit(0 if d.get('env',{}).get('CLAUDE_CODE_SUBAGENT_MODEL') else 1)" 2>/dev/null; then
    python3 - "$settings_file" <<'PY'
import json, sys
path = sys.argv[1]
with open(path) as f:
    data = json.load(f)
data.setdefault("env", {})["CLAUDE_CODE_SUBAGENT_MODEL"] = "claude-haiku-4-5-20251001"
with open(path, "w") as f:
    json.dump(data, f, indent=2)
PY
    INSTALLED+=("claude settings.json (sub-agent routing added)")
    echo "✓ Added CLAUDE_CODE_SUBAGENT_MODEL to ~/.claude/settings.json"
  else
    echo "✓ sub-agent model routing already configured"
    SKIPPED+=("claude sub-agent routing")
  fi

  # Global MCP servers: Tavily (web search) + Context7 (live docs)
  if [ ! -f "$mcp_file" ]; then
    local tavily_key="${TAVILY_API_KEY:-your-tavily-api-key}"
    cat > "$mcp_file" <<EOF
{
  "mcpServers": {
    "tavily": {
      "command": "npx",
      "args": ["-y", "tavily-mcp@0.2.18"],
      "env": {
        "TAVILY_API_KEY": "$tavily_key"
      }
    },
    "context7": {
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp@latest"]
    }
  }
}
EOF
    INSTALLED+=("~/.claude/.mcp.json (Tavily + Context7)")
    echo "✓ Created ~/.claude/.mcp.json with Tavily and Context7 MCP servers"
    if [ "$tavily_key" = "your-tavily-api-key" ]; then
      WARNINGS+=("Set TAVILY_API_KEY in ~/.claude/.mcp.json — get a free key at https://tavily.com")
    fi
  else
    echo "✓ ~/.claude/.mcp.json already exists"
    SKIPPED+=("~/.claude/.mcp.json")
  fi
}

append_zsh_block() {
  local zshrc="$HOME/.zshrc"
  local begin="# >>> ai-dev-toolkit workflow >>>"
  local end="# <<< ai-dev-toolkit workflow <<<"
  local block
  block=$(cat <<'EOF'
# >>> ai-dev-toolkit workflow >>>
alias ai-eval='promptfoo'
alias ai-flow='n8n'
alias ai-ollama='ollama'
alias ai-webui='docker run --rm -p 3000:8080 --name open-webui ghcr.io/open-webui/open-webui:main'
alias ai-portkey='docker run --rm -p 8787:8787 --name portkey-gateway portkeyai/gateway:latest'
alias ai-docs='echo "Use Context7 MCP in your agent for up-to-date docs grounding."'
alias ai-search='echo "Use Tavily MCP for research queries in agent workflows."'
alias ai-crawl='echo "Use Firecrawl API/MCP with FIRECRAWL_API_KEY for web-to-markdown ingestion."'
alias ai-browser-mcp='npx -y @playwright/mcp@latest'
alias ai-skills-find='npx -y skills find'
alias ai-skills-add='npx -y skills add'
alias ai-plan-files='npx -y skills add OthmanAdi/planning-with-files --skill planning-with-files -g'
alias ai-skill-pack='npx -y antigravity-awesome-skills --claude'
alias ai-openviking='openviking-server'
alias ai-browser-use='browser-use'
alias ai-letta='letta'
alias ai-memory-check='$HOME/.local/bin/ai-memory-check'
alias ai-memory-python='$HOME/.local/share/ai-memory-venv/bin/python'
# <<< ai-dev-toolkit workflow <<<
EOF
)

  if [ ! -f "$zshrc" ]; then
    printf "%s\n" "$block" >>"$zshrc"
    INSTALLED+=("zsh workflow block")
    echo "✓ Added workflow aliases to ~/.zshrc"
    return
  fi

  if grep -Fq "$begin" "$zshrc" && grep -Fq "$end" "$zshrc"; then
    python3 - "$zshrc" "$begin" "$end" "$block" <<'PY'
from pathlib import Path
import sys

path = Path(sys.argv[1])
begin = sys.argv[2]
end = sys.argv[3]
block = sys.argv[4]
text = path.read_text()
start = text.index(begin)
finish = text.index(end) + len(end)
new_text = text[:start].rstrip() + "\n\n" + block + "\n"
path.write_text(new_text)
PY
    INSTALLED+=("zsh workflow block (updated)")
    echo "✓ Updated workflow aliases in ~/.zshrc"
  else
    printf "\n%s\n" "$block" >>"$zshrc"
    INSTALLED+=("zsh workflow block")
    echo "✓ Added workflow aliases to ~/.zshrc"
  fi
}

echo ""
echo "=== Configuring Claude Code ==="
setup_claude_code

echo ""
echo "=== Installing core local AI workflow tools ==="
ensure_brew
install_brew_formula "ollama"
install_brew_formula "pipx"
install_npm_global "promptfoo" "promptfoo"
install_npm_global "n8n" "n8n"
install_pipx_package "openviking" "openviking-server"
install_pipx_package "browser-use" "browser-use"
install_pipx_package "letta" "letta"
install_memory_stack
append_zsh_block

echo ""
echo "=== Summary ==="
if [ ${#INSTALLED[@]} -gt 0 ]; then
  echo "Installed/updated:"
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
echo "Run: source ~/.zshrc"
echo "Then try: ai-eval --help, ai-flow --help, ai-ollama --help, ai-browser-mcp --help"
echo "Optional: ai-plan-files, ai-skill-pack, ai-openviking --help"
echo "Optional: ai-browser-use --help, ai-letta --help"
echo "Optional: ai-memory-check"
