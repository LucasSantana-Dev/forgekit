#!/bin/bash
set -euo pipefail

echo "=== Installing productivity tools on Ubuntu ==="

# apt packages
sudo apt update -qq
sudo apt install -y -qq fish fzf bat btop jq

# batcat -> bat symlink (Ubuntu names it batcat)
if command -v batcat &>/dev/null && ! command -v bat &>/dev/null; then
  sudo ln -sf "$(which batcat)" /usr/local/bin/bat
fi

# lazygit
LAZYGIT_VERSION=$(curl -s "https://api.github.com/repos/jesseduffield/lazygit/releases/latest" | jq -r '.tag_name' | tr -d 'v')
curl -sLo /tmp/lazygit.tar.gz "https://github.com/jesseduffield/lazygit/releases/download/v${LAZYGIT_VERSION}/lazygit_${LAZYGIT_VERSION}_Linux_x86_64.tar.gz"
tar -xzf /tmp/lazygit.tar.gz -C /tmp lazygit
sudo install /tmp/lazygit /usr/local/bin/lazygit
rm /tmp/lazygit /tmp/lazygit.tar.gz

# eza (modern ls)
sudo mkdir -p /etc/apt/keyrings
wget -qO- https://raw.githubusercontent.com/eza-community/eza/main/deb.asc | sudo gpg --dearmor -o /etc/apt/keyrings/gierens.gpg 2>/dev/null || true
echo "deb [signed-by=/etc/apt/keyrings/gierens.gpg] http://deb.gierens.de stable main" | sudo tee /etc/apt/sources.list.d/gierens.list >/dev/null
sudo apt update -qq
sudo apt install -y -qq eza

# delta (git diff pager)
DELTA_VERSION=$(curl -s "https://api.github.com/repos/dandavison/delta/releases/latest" | jq -r '.tag_name')
curl -sLo /tmp/delta.deb "https://github.com/dandavison/delta/releases/download/${DELTA_VERSION}/git-delta_${DELTA_VERSION}_amd64.deb"
sudo dpkg -i /tmp/delta.deb
rm /tmp/delta.deb

# zoxide (smart cd)
curl -sSfL https://raw.githubusercontent.com/ajeetdsouza/zoxide/main/install.sh | sh

# atuin (shell history sync)
curl -sSf https://setup.atuin.sh | bash

# yq (yaml processor)
YQ_VERSION=$(curl -s "https://api.github.com/repos/mikefarah/yq/releases/latest" | jq -r '.tag_name')
curl -sLo /tmp/yq "https://github.com/mikefarah/yq/releases/download/${YQ_VERSION}/yq_linux_amd64"
sudo install /tmp/yq /usr/local/bin/yq
rm /tmp/yq

echo ""
echo "=== Configuring git delta ==="
git config --global core.pager delta
git config --global interactive.diffFilter "delta --color-only"
git config --global delta.navigate true
git config --global delta.side-by-side true
git config --global delta.line-numbers true
git config --global merge.conflictstyle zdiff3

echo ""
echo "=== Setting up fish shell ==="
# Add fish shell integrations
mkdir -p ~/.config/fish/conf.d

cat > ~/.config/fish/conf.d/tools.fish << 'FISHEOF'
# Productivity tools — auto-loaded by fish

if status is-interactive
    # fzf
    if type -q fzf
        fzf --fish | source
    end

    # zoxide (smart cd — use 'z')
    if type -q zoxide
        zoxide init fish | source
    end

    # atuin (searchable shell history)
    if type -q atuin
        atuin init fish | source
    end
end

# Aliases
if type -q bat
    alias cat='bat'
end

if type -q eza
    alias ls='eza'
    alias ll='eza -la --git'
    alias lt='eza -la --tree --level=2 --git'
else
    alias ll='ls -la'
end

alias lg='lazygit'
FISHEOF

echo ""
echo "=== Configuring bash fallback ==="
cat >> ~/.bashrc << 'BASHEOF'

# Productivity tools
eval "$(fzf --bash 2>/dev/null)"
eval "$(zoxide init bash 2>/dev/null)"
eval "$(atuin init bash 2>/dev/null)"
alias lg='lazygit'
[ -x "$(command -v bat)" ] && alias cat='bat'
[ -x "$(command -v eza)" ] && alias ls='eza' && alias ll='eza -la --git'
BASHEOF

echo ""
echo "=== Setting up atuin sync ==="
echo "Run: atuin login"
echo ""

echo "=== Changing default shell to fish ==="
FISH_PATH=$(which fish)
if ! grep -q "$FISH_PATH" /etc/shells; then
    echo "$FISH_PATH" | sudo tee -a /etc/shells
fi
chsh -s "$FISH_PATH"

echo ""
echo "=== Done! All tools installed ==="
echo "Installed: lazygit, fzf, bat, eza, delta, zoxide, atuin, btop, jq, yq, fish"
echo ""
echo "Next steps:"
echo "  1. Run: exec fish"
echo "  2. Run: atuin login --username lucassantana"
echo "  3. Run: atuin sync"
