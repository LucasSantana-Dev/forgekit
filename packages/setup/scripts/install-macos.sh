#!/usr/bin/env bash
set -euo pipefail

ROOT="${1:?repo root required}"

if ! command -v brew >/dev/null 2>&1; then
	/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
fi

brew bundle --file "$ROOT/Brewfile"
