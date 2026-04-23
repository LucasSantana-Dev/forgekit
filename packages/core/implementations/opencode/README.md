# OpenCode Implementation

Reference implementation of the toolkit patterns for [OpenCode](https://opencode.ai).

## Setup

```bash
# Core OpenCode config
cp opencode.jsonc ~/.config/opencode/opencode.jsonc
cp dcp.jsonc ~/.config/opencode/dcp.jsonc

# oh-my-openagent plugin config (if using oh-my-openagent)
cp oh-my-openagent.jsonc ~/.config/opencode/oh-my-opencode.jsonc
```

## oh-my-openagent

[oh-my-openagent](https://github.com/code-yeongyu/oh-my-openagent) replaces the local plugin `.ts` files with a batteries-included npm plugin. When using it, skip the `plugin/` step above.

Add to `opencode.jsonc` plugins:

```json
{ "plugin": ["oh-my-openagent"] }
```

Configure agents and category routing in `oh-my-openagent.jsonc`. The `prompt_append` field on Sisyphus injects your `AGENTS.md` rules into every session automatically.

If you install with `forge-kit`, run with `--oh-my-compat` to copy this reference config to `~/.config/opencode/oh-my-opencode.jsonc` when it does not exist yet.

## Plugins

| Plugin               | Pattern                                                    | Description                                               |
| -------------------- | ---------------------------------------------------------- | --------------------------------------------------------- |
| `orchestrator.ts`    | [Task Orchestration](../../patterns/task-orchestration.md) | Centralized backlog, auto-dispatch, completion monitoring |
| `session-manager.ts` | [Session Management](../../patterns/session-management.md) | Auto-cleanup, status tagging, per-project limits          |
| `session-resume.ts`  | [Session Management](../../patterns/session-management.md) | Persist and resume interrupted work                       |
| `perf-optimizer.ts`  | [Session Management](../../patterns/session-management.md) | Auto-compact for faster switching                         |
| `notify.ts`          | —                                                          | Native OS notifications for events                        |

## Commands

| Command      | Description                                    |
| ------------ | ---------------------------------------------- |
| `/plan`      | Analyze repos, create prioritized task backlog |
| `/backlog`   | Show task status across all projects           |
| `/next`      | Manually dispatch next ready task              |
| `/resume`    | Load git state, suggest next task              |
| `/verify`    | Run lint + type-check + test + build           |
| `/ship`      | Commit + push + create PR                      |
| `/commit`    | Conventional commit without push               |
| `/test`      | Run tests, report results                      |
| `/clean`     | Clear build artifacts                          |
| `/validate`  | Full repo health scorecard                     |
| `/ecosystem` | Health check across all repos                  |

## Adapting to Other Tools

Each plugin implements a pattern. To port to another tool:

1. Read the pattern doc in `patterns/`
2. Use the plugin as a reference for logic
3. Implement using your tool's extension API

For example, `orchestrator.ts` could become:

- A **Cursor extension** using the Cursor API
- A **shell script** with `claude --session-id` for Claude Code
- A **VS Code task** with workspace automation
