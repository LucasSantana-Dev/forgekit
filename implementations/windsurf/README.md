# Windsurf Implementation

Reference implementation of the toolkit patterns for Windsurf.

## Context Building

Windsurf reads `.windsurfrules` from the project root and can also consume
supporting files from a `.windsurf/` directory.

```bash
# from the repository root
cp rules/.windsurfrules your-project/.windsurfrules
```

## Multi-Model Routing

Use forge-kit to keep Windsurf rules, skills, providers, and MCP guidance in a
single portable install flow.

## Task Orchestration

Treat `forge-kit` as the baseline policy layer and keep any Windsurf-specific
automation or orchestration overlays separate.

## Compatibility

See `oh-my-windsurf.md` for the recommended ownership split when you combine
forge-kit with an oh-my style orchestration layer.
