# forge-kit Hooks

Optional PostToolUse hooks for Claude Code that automate code formatting, type-checking, and quality validation during edits.

## What They Do

- **post-edit-format.sh**: Auto-formats edited files using the repo's configured formatter (npm, ruff, cargo, gofmt)
- **post-edit-typecheck.sh**: Runs type-checking warnings non-blocking (tsc, mypy, go vet)
- **evaluate-response.sh**: Flags incomplete AI output (TODO stubs, NotImplementedError, empty bodies)

## How to Enable

Hooks are **default OFF per repo** (governance-safe for adoption). To enable:

```bash
sh kit/install.sh --with-hooks
```

This symlinks the 3 hooks into `~/.claude/hooks/` and wires them into your Claude Code settings.

## Why Default-Off?

- Hooks add 500ms–2s per edit depending on formatter
- Not all repos benefit from auto-formatting
- Team governance may require explicit hooks policy
- Each hook is advisory (never blocks edits)

## Configuration

Edit `~/.claude/hooks.json` to customize:
- Hook order
- Repo-specific skip patterns
- Output verbosity

See [`docs/guides/hooks.md`](../../docs/guides/hooks.md) for full reference.

## Behavior

- **post-edit-format**: silently formats, logs to `~/.claude/logs/format.log`
- **post-edit-typecheck**: prints warnings, exit 0 (advisory)
- **evaluate-response**: logs red flags, gated on `RAG_HOOKS_EVALUATE=1`

All hooks fail gracefully if tool not found or repo not applicable.
