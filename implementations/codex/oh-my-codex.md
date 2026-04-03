# forge-kit oh-my-codex compatibility

This file is an optional bridge for mixed setups where `forge-kit` and
oh-my-codex style orchestration are both used.

Use this flow:

1. Keep `~/.codex/AGENTS.md` and `~/.codex/providers.json` managed by `forge-kit`.
2. Keep orchestration-specific behavior in your oh-my-codex layer.
3. Avoid defining the same policy in both locations.

Recommended ownership split:

- `forge-kit`: baseline rules and provider registry.
- oh-my-codex layer: task orchestration and model routing strategy.

If conflicts appear, keep one canonical source for each concern.
