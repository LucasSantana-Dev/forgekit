#!/usr/bin/env bash
set -euo pipefail

sudo apt update
sudo apt install -y \
	git gh curl wget unzip zip jq ripgrep fzf tmux python3 python3-pip build-essential fd-find zsh direnv bat

if ! command -v node >/dev/null 2>&1; then
	curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
	sudo apt install -y nodejs
fi

mkdir -p "$HOME/.local/bin"
if ! command -v fd >/dev/null 2>&1 && command -v fdfind >/dev/null 2>&1; then
	ln -sf "$(command -v fdfind)" "$HOME/.local/bin/fd"
fi
