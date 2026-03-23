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

append_zsh_block() {
  local zshrc="$HOME/.zshrc"
  local begin="# >>> ai-dev-toolkit workflow >>>"
  local end="# <<< ai-dev-toolkit workflow <<<"

  if grep -Fq "$begin" "$zshrc"; then
    echo "✓ Workflow aliases already present in ~/.zshrc"
    SKIPPED+=("zsh workflow block")
    return
  fi

  cat >>"$zshrc" <<'EOF'

# >>> ai-dev-toolkit workflow >>>
alias ai-eval='promptfoo'
alias ai-flow='n8n'
alias ai-ollama='ollama'
alias ai-webui='docker run --rm -p 3000:8080 --name open-webui ghcr.io/open-webui/open-webui:main'
alias ai-portkey='docker run --rm -p 8787:8787 --name portkey-gateway ghcr.io/portkey-ai/gateway:latest'
alias ai-docs='echo "Use Context7 MCP in your agent for up-to-date docs grounding."'
alias ai-search='echo "Use Tavily MCP for research queries in agent workflows."'
alias ai-crawl='echo "Use Firecrawl API/MCP with FIRECRAWL_API_KEY for web-to-markdown ingestion."'
alias ai-browser-mcp='npx -y @playwright/mcp@latest'
# <<< ai-dev-toolkit workflow <<<
EOF

  INSTALLED+=("zsh workflow block")
  echo "✓ Added workflow aliases to ~/.zshrc"
}

echo ""
echo "=== Installing core local AI workflow tools ==="
ensure_brew
install_brew_formula "ollama"
install_npm_global "promptfoo" "promptfoo"
install_npm_global "n8n" "n8n"
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
