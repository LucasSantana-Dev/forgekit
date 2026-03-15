#!/bin/bash
set -euo pipefail

echo "=== AI Dev Toolkit — macOS Setup ==="

# Core CLI tools
brew install lazygit fzf git-delta zoxide eza atuin bat btop jq yq

# Git delta config
git config --global core.pager delta
git config --global interactive.diffFilter "delta --color-only"
git config --global delta.navigate true
git config --global delta.side-by-side true
git config --global delta.line-numbers true
git config --global merge.conflictstyle zdiff3

# Atuin (shell history sync)
brew services start atuin

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
echo "=== Done! Restart your shell or run: exec \$SHELL ==="
