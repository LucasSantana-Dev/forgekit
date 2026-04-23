# Antigravity Implementation

Reference implementation of the toolkit patterns for Antigravity.

## Context Building

Antigravity uses `~/.antigravity/` as its primary config surface.

With forge-kit, the baseline install writes:

- `~/.antigravity/rules.md`
- `~/.antigravity/skills/`
- `~/.antigravity/providers.json`
- `~/.antigravity/mcp.json`

## Task Orchestration

Use forge-kit as the portable baseline and keep any Antigravity-specific
orchestration overlays separate.

## Compatibility

See `oh-my-antigravity.md` for the recommended ownership split when you combine
forge-kit with an oh-my style orchestration layer.
