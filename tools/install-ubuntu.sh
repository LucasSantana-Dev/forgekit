#!/bin/bash
set -euo pipefail

echo "=== AI Dev Toolkit — Ubuntu Setup ==="

INSTALLED=()
SKIPPED=()

# Update apt cache
echo "Updating apt cache..."
sudo apt update -qq

# APT packages
APT_PACKAGES=(
  "fish"
  "fzf"
  "bat"
  "btop"
  "jq"
)

echo ""
echo "=== Installing apt packages ==="

for pkg in "${APT_PACKAGES[@]}"; do
  if dpkg -l | grep -q "^ii  $pkg "; then
    echo "✓ $pkg already installed"
    SKIPPED+=("$pkg")
  else
    echo "Installing $pkg..."
    sudo apt install -y -qq "$pkg"
    INSTALLED+=("$pkg")
  fi
done

# batcat -> bat symlink (Ubuntu names it batcat)
if command -v batcat &>/dev/null && ! command -v bat &>/dev/null; then
  echo "Creating bat symlink..."
  sudo ln -sf "$(which batcat)" /usr/local/bin/bat
  echo "✓ bat symlink created"
fi

# fd-find (Ubuntu package name) -> fd symlink
if ! command -v fd &>/dev/null; then
  if dpkg -l | grep -q "^ii  fd-find "; then
    echo "✓ fd-find already installed"
    SKIPPED+=("fd-find")
  else
    echo "Installing fd-find..."
    sudo apt install -y -qq fd-find
    INSTALLED+=("fd-find")
  fi

  if ! command -v fd &>/dev/null; then
    echo "Creating fd symlink..."
    sudo ln -sf "$(which fdfind)" /usr/local/bin/fd
    echo "✓ fd symlink created"
  fi
else
  echo "✓ fd already available"
  SKIPPED+=("fd")
fi

# ripgrep
if command -v rg &>/dev/null; then
  echo "✓ ripgrep already installed"
  SKIPPED+=("ripgrep")
else
  echo "Installing ripgrep..."
  sudo apt install -y -qq ripgrep
  INSTALLED+=("ripgrep")
fi

# chezmoi
if command -v chezmoi &>/dev/null; then
  echo "✓ chezmoi already installed"
  SKIPPED+=("chezmoi")
else
  echo "Installing chezmoi..."
  CHEZMOI_VERSION=$(curl -s "https://api.github.com/repos/twpayne/chezmoi/releases/latest" | jq -r '.tag_name' | tr -d 'v')
  if [[ ! "$CHEZMOI_VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+ ]]; then
    echo "⚠️  Could not determine chezmoi version, skipping"
    SKIPPED+=("chezmoi")
  else
    curl -sLo /tmp/chezmoi.deb "https://github.com/twpayne/chezmoi/releases/download/v${CHEZMOI_VERSION}/chezmoi_${CHEZMOI_VERSION}_linux_amd64.deb"
    sudo dpkg -i /tmp/chezmoi.deb
    rm /tmp/chezmoi.deb
    INSTALLED+=("chezmoi")
  fi
fi

# lazygit
if command -v lazygit &>/dev/null; then
  echo "✓ lazygit already installed"
  SKIPPED+=("lazygit")
else
  echo "Installing lazygit..."
  LAZYGIT_VERSION=$(curl -s "https://api.github.com/repos/jesseduffield/lazygit/releases/latest" | jq -r '.tag_name' | tr -d 'v')
  if [[ ! "$LAZYGIT_VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+ ]]; then
    echo "⚠️  Could not determine lazygit version, skipping"
    SKIPPED+=("lazygit")
  else
    curl -sLo /tmp/lazygit.tar.gz "https://github.com/jesseduffield/lazygit/releases/download/v${LAZYGIT_VERSION}/lazygit_${LAZYGIT_VERSION}_Linux_x86_64.tar.gz"
    tar -xzf /tmp/lazygit.tar.gz -C /tmp lazygit
    sudo install /tmp/lazygit /usr/local/bin/lazygit
    rm /tmp/lazygit /tmp/lazygit.tar.gz
    INSTALLED+=("lazygit")
  fi
fi

# eza (modern ls)
if command -v eza &>/dev/null; then
  echo "✓ eza already installed"
  SKIPPED+=("eza")
else
  echo "Installing eza..."
  sudo mkdir -p /etc/apt/keyrings
  wget -qO- https://raw.githubusercontent.com/eza-community/eza/main/deb.asc | sudo gpg --dearmor -o /etc/apt/keyrings/gierens.gpg 2>/dev/null || true
  echo "deb [signed-by=/etc/apt/keyrings/gierens.gpg] http://deb.gierens.de stable main" | sudo tee /etc/apt/sources.list.d/gierens.list >/dev/null
  sudo apt update -qq
  sudo apt install -y -qq eza
  INSTALLED+=("eza")
fi

# delta (git diff pager)
if command -v delta &>/dev/null; then
  echo "✓ git-delta already installed"
  SKIPPED+=("git-delta")
else
  echo "Installing git-delta..."
  DELTA_VERSION=$(curl -s "https://api.github.com/repos/dandavison/delta/releases/latest" | jq -r '.tag_name')
  if [[ ! "$DELTA_VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+ ]]; then
    echo "⚠️  Could not determine git-delta version, skipping"
    SKIPPED+=("git-delta")
  else
    curl -sLo /tmp/delta.deb "https://github.com/dandavison/delta/releases/download/${DELTA_VERSION}/git-delta_${DELTA_VERSION}_amd64.deb"
    sudo dpkg -i /tmp/delta.deb
    rm /tmp/delta.deb
    INSTALLED+=("git-delta")
  fi
fi

# zoxide (smart cd)
if command -v zoxide &>/dev/null; then
  echo "✓ zoxide already installed"
  SKIPPED+=("zoxide")
else
  echo "Installing zoxide..."
  curl -sSfL https://raw.githubusercontent.com/ajeetdsouza/zoxide/main/install.sh | sh
  INSTALLED+=("zoxide")
fi

# atuin (shell history sync)
if command -v atuin &>/dev/null; then
  echo "✓ atuin already installed"
  SKIPPED+=("atuin")
else
  echo "Installing atuin..."
  curl -sSf https://setup.atuin.sh | bash
  INSTALLED+=("atuin")
fi

# yq (yaml processor)
if command -v yq &>/dev/null; then
  echo "✓ yq already installed"
  SKIPPED+=("yq")
else
  echo "Installing yq..."
  YQ_VERSION=$(curl -s "https://api.github.com/repos/mikefarah/yq/releases/latest" | jq -r '.tag_name')
  if [[ ! "$YQ_VERSION" =~ ^v[0-9]+\.[0-9]+\.[0-9]+ ]]; then
    echo "⚠️  Could not determine yq version, skipping"
    SKIPPED+=("yq")
  else
    curl -sLo /tmp/yq "https://github.com/mikefarah/yq/releases/download/${YQ_VERSION}/yq_linux_amd64"
    sudo install /tmp/yq /usr/local/bin/yq
    rm /tmp/yq
    INSTALLED+=("yq")
  fi
fi

# rtk (Rust Token Killer — Claude Code token optimizer)
if command -v rtk &>/dev/null; then
  echo "✓ rtk already installed"
  SKIPPED+=("rtk")
else
  echo "Installing rtk..."
  curl -fsSL https://raw.githubusercontent.com/rtk-ai/rtk/refs/heads/master/install.sh | sh
  grep -q '.local/bin' ~/.bashrc || echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc
  INSTALLED+=("rtk")
fi

echo ""
echo "=== Configuring git delta ==="
git config --global core.pager delta
git config --global interactive.diffFilter "delta --color-only"
git config --global delta.navigate true
git config --global delta.side-by-side true
git config --global delta.line-numbers true
git config --global merge.conflictstyle zdiff3
echo "✓ Git delta configured"

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

echo "✓ Fish shell configured"

echo ""
echo "=== Configuring bash fallback ==="
if ! grep -q "# Productivity tools" ~/.bashrc 2>/dev/null; then
  cat >> ~/.bashrc << 'BASHEOF'

# Productivity tools
eval "$(fzf --bash 2>/dev/null)"
eval "$(zoxide init bash 2>/dev/null)"
eval "$(atuin init bash 2>/dev/null)"
alias lg='lazygit'
[ -x "$(command -v bat)" ] && alias cat='bat'
[ -x "$(command -v eza)" ] && alias ls='eza' && alias ll='eza -la --git'
BASHEOF
  echo "✓ Bash configured"
else
  echo "✓ Bash already configured"
fi

echo ""
echo "=== Setting up atuin sync ==="
echo "Run: atuin login"
echo ""

echo "=== Shell Configuration ==="
echo "To change your default shell to fish, run:"
echo "  chsh -s \$(which fish)"
echo ""

# Summary
echo ""
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
echo "=== Done! All tools installed ==="
echo ""
echo "Next steps:"
echo "  1. Run: exec fish"
echo "  2. Run: atuin login"
echo "  3. Run: atuin sync"
echo "  4. Run: rtk gain  (after a few sessions to see token savings)"
