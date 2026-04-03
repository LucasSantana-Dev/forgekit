# forge-kit oh-my-cursor compatibility

This file is an optional bridge for mixed setups where `forge-kit` and a
Cursor-specific oh-my orchestration layer are both used.

Use this flow:

1. Keep `.cursor/rules/forge.mdc`, `.cursor/skills/`, and `.cursor/providers.json`
   managed by `forge-kit`.
2. Keep orchestration-specific prompts, routing, and workflow overlays in your
   oh-my Cursor layer.
3. Avoid defining the same policy in both locations.

Recommended ownership split:

- `forge-kit`: baseline rules, portable skills, provider registry, MCP baseline.
- oh-my Cursor layer: task orchestration, role routing, specialized workflow
  overlays.

If conflicts appear, keep one canonical source for each concern.
