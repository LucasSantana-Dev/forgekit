#!/usr/bin/env bash
set -euo pipefail

ROOT="${1:?repo root required}"
TOOLKIT_REPO="Forge-Space/ai-dev-toolkit"
TOOLKIT_STAMP_DIR="$HOME/.config/ai-dev-toolkit"
TOOLKIT_STAMP="$TOOLKIT_STAMP_DIR/.toolkit-version"

TOOLKIT_VERSION_FILE="$ROOT/TOOLKIT_VERSION"
if [[ -f "$TOOLKIT_VERSION_FILE" ]]; then
	TOOLKIT_VERSION="$(tr -d '[:space:]' <"$TOOLKIT_VERSION_FILE")"
else
	TOOLKIT_VERSION=""
fi

FORGE_KIT_PROFILE="${FORGE_KIT_PROFILE:-standard}"
FORGE_KIT_TOOLS="${FORGE_KIT_TOOLS:-auto}"

mkdir -p "$TOOLKIT_STAMP_DIR"

fetch_toolkit() {
	local version="$1"
	local url="https://github.com/${TOOLKIT_REPO}/archive/refs/tags/v${version}.tar.gz"
	local tmpdir
	tmpdir="$(mktemp -d)"

	echo "  Fetching ai-dev-toolkit v${version}..."
	if curl -fsSL "$url" | tar xz -C "$tmpdir" 2>/dev/null; then
		TOOLKIT_DIR="$tmpdir/ai-dev-toolkit-${version}"
		return 0
	else
		rm -rf "$tmpdir"
		echo "  WARNING: Could not fetch toolkit v${version}."
		return 1
	fi
}

install_via_toolkit() {
	local toolkit_root="$1"
	echo "  Running kit/install.sh --tools $FORGE_KIT_TOOLS --profile $FORGE_KIT_PROFILE ..."
	FORGE_KIT_DIR="$toolkit_root/kit" \
		sh "$toolkit_root/kit/install.sh" \
		--tools "$FORGE_KIT_TOOLS" \
		--profile "$FORGE_KIT_PROFILE"
}

install_fallback() {
	echo "  Offline fallback: minimal OpenCode-only setup..."
	local oc_dir="$HOME/.config/opencode"
	mkdir -p "$oc_dir"

	if [[ -f "$ROOT/config/ai-tools/AGENTS.md" ]]; then
		cp "$ROOT/config/ai-tools/AGENTS.md" "$oc_dir/AGENTS.md"
	fi

	if [[ -f "$ROOT/scripts/render-opencode-config.py" ]] &&
		[[ -f "$ROOT/config/ai-tools/opencode.template.jsonc" ]]; then
		python3 "$ROOT/scripts/render-opencode-config.py" \
			"$ROOT/config/ai-tools/opencode.template.jsonc" \
			"$oc_dir/opencode.jsonc"
	fi

	if [[ ! -f "$oc_dir/dcp.jsonc" ]] &&
		[[ -f "$ROOT/config/ai-tools/dcp.template.jsonc" ]]; then
		cp "$ROOT/config/ai-tools/dcp.template.jsonc" "$oc_dir/dcp.jsonc"
	fi
}

echo "Setting up AI tools..."

TOOLKIT_DIR=""

if [[ -n "$TOOLKIT_VERSION" ]]; then
	if fetch_toolkit "$TOOLKIT_VERSION"; then
		install_via_toolkit "$TOOLKIT_DIR"
		echo "$TOOLKIT_VERSION" >"$TOOLKIT_STAMP"
		rm -rf "$(dirname "$TOOLKIT_DIR")"
	else
		install_fallback
		echo "local-fallback" >"$TOOLKIT_STAMP"
	fi
else
	echo "  No TOOLKIT_VERSION file found. Using local fallback."
	install_fallback
	echo "no-pin" >"$TOOLKIT_STAMP"
fi

echo "AI tools setup complete."
