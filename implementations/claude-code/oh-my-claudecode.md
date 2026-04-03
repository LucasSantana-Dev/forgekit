# forge-kit oh-my-claudecode compatibility

This file is an optional bridge for mixed setups where `forge-kit` and
[oh-my-claudecode](https://github.com/Yeachan-Heo/oh-my-claudecode) are both used.

Use this flow:

1. Keep `~/.claude/CLAUDE.md` managed by `forge-kit`.
2. Keep oh-my specific routing and orchestration settings in the oh-my config files.
3. Do not duplicate the same policy in two places.

Recommended ownership split:

- `forge-kit`: global rules, portable skills, MCP baseline, durable execution section.
- `oh-my-claudecode`: agent orchestration, category routing, model fallback strategy.

If both systems define the same behavior, prefer one source of truth and delete the other.
