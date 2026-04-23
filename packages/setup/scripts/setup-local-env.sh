#!/usr/bin/env bash
set -euo pipefail

ROOT="${1:?repo root required}"
INSTALL_DIR="$HOME/.config/ai-dev-toolkit"
TARGET="$INSTALL_DIR/local.env"
TEMPLATE="$ROOT/templates/local.env.example"

mkdir -p "$INSTALL_DIR"

if [[ ! -f "$TARGET" ]]; then
	cp "$TEMPLATE" "$TARGET"
fi
