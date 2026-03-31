#!/bin/bash
set -euo pipefail

echo "=== AI Dev Toolkit — macOS Setup ==="

INSTALLED=()
SKIPPED=()

# Check if brew is installed
if ! command -v brew &>/dev/null; then
  echo "Installing Homebrew..."
  /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
  INSTALLED+=("homebrew")
else
  echo "✓ Homebrew already installed"
  SKIPPED+=("homebrew")
fi

# Core CLI tools
TOOLS=(
  "lazygit"
  "fzf"
  "git-delta"
  "zoxide"
  "eza"
  "atuin"
  "bat"
  "btop"
  "jq"
  "yq"
  "fd"
  "ripgrep"
  "chezmoi"
  "rtk"
)

echo ""
echo "=== Installing CLI tools ==="

for tool in "${TOOLS[@]}"; do
  if brew list --formula "$tool" &>/dev/null || brew list --cask "$tool" &>/dev/null; then
    echo "✓ $tool already installed"
    SKIPPED+=("$tool")
  else
    echo "Installing $tool..."
    brew install "$tool"
    INSTALLED+=("$tool")
  fi
done

# Git delta config (idempotent — git config will update if already set)
echo ""
echo "=== Configuring git delta ==="
git config --global core.pager delta
git config --global interactive.diffFilter "delta --color-only"
git config --global delta.navigate true
git config --global delta.side-by-side true
git config --global delta.line-numbers true
git config --global merge.conflictstyle zdiff3
echo "✓ Git delta configured"

# RTK Claude Code hook
echo ""
echo "=== Configuring RTK ==="
if command -v rtk &>/dev/null; then
  rtk init -g 2>/dev/null || true
  echo "✓ RTK hook installed — Bash outputs compressed before reaching LLM context"
  echo "  Run 'rtk gain' after a few sessions to see token savings"
fi

# Atuin service (check if already running)
if brew services list | grep -q "atuin.*started"; then
  echo "✓ Atuin service already running"
else
  echo "Starting Atuin service..."
  brew services start atuin
  echo "✓ Atuin service started"
fi

echo ""
echo "=== Shell Integration ==="
echo ""
echo "Add to your shell config (~/.zshrc, ~/.bashrc, or fish conf.d/):"
echo ""
echo "  # fzf"
echo '  eval "$(fzf --bash)"        # bash'
echo '  eval "$(fzf --zsh)"         # zsh'
echo '  fzf --fish | source          # fish'
echo ""
echo "  # zoxide"
echo '  eval "$(zoxide init bash)"  # bash'
echo '  eval "$(zoxide init zsh)"   # zsh'
echo '  zoxide init fish | source    # fish'
echo ""
echo "  # atuin"
echo '  eval "$(atuin init bash)"   # bash'
echo '  eval "$(atuin init zsh)"    # zsh'
echo '  atuin init fish | source     # fish'
echo ""
echo "  # aliases"
echo '  alias lg="lazygit"'
echo '  alias ll="eza -la --git"'
echo '  alias lt="eza -la --tree --level=2 --git"'
echo '  alias cat="bat"'
echo ""

# Summary
echo "=== Installation Summary ==="
echo ""
if [ ${#INSTALLED[@]} -gt 0 ]; then
  echo "Newly installed (${#INSTALLED[@]}):"
  for item in "${INSTALLED[@]}"; do
    echo "  ✓ $item"
  done
fi

if [ ${#SKIPPED[@]} -gt 0 ]; then
  echo ""
  echo "Already present (${#SKIPPED[@]}):"
  for item in "${SKIPPED[@]}"; do
    echo "  • $item"
  done
fi

echo ""
echo "=== Done! Restart your shell or run: exec \$SHELL ==="
