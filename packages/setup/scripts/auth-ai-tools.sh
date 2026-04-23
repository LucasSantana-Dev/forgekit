#!/usr/bin/env bash
set -euo pipefail

if command -v gh >/dev/null 2>&1; then
	if ! gh auth status >/dev/null 2>&1; then
		gh auth login
	fi
fi

if command -v opencode >/dev/null 2>&1; then
	echo
	echo "OpenCode auth:"
	echo "Run: opencode auth login"
fi

if command -v claude >/dev/null 2>&1; then
	echo
	echo "Claude Code auth:"
	echo "Run: claude"
	echo "Then use /login if prompted."
fi

if command -v gemini >/dev/null 2>&1; then
	echo
	echo "Gemini CLI auth:"
	echo "  Option 1 (recommended for work): Set GEMINI_API_KEY in ~/.config/ai-dev-toolkit/local.env"
	echo "  Option 2 (personal accounts): Run: gemini auth"
	echo "  Get an API key at: https://aistudio.google.com/apikey"
fi
