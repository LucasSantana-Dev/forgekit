# Codex CLI Implementation

Reference implementation of the toolkit patterns for [Codex CLI](https://github.com/openai/codex).

## How Codex Differs from Other AI Coding Tools

Most AI coding tools (Claude Code, OpenCode, Cursor) are **trust-first**: they assume you want maximum access and require explicit setup to add isolation. Codex is the opposite — **sandbox-first by default**.

Out of the box:
- File writes are restricted to the project directory (`workspace-write`)
- Network access is disabled
- Every uncertain action pauses for approval (`on-request`)

You opt *out* of safety, not into it. This means the defaults are already right for most dev work — you only need to change them for specific use cases (CI, container environments, read-only audits).

**Approval policy as an autonomy dial:**

```
untrusted ──── on-request ──── on-failure ──── never
  (pause        (pause when      (pause on      (full
every action)   uncertain)       errors only)    auto)
```

Use `on-request` for interactive dev — not `untrusted`. The difference: `untrusted` interrupts every shell command and file write, breaking your flow. `on-request` lets Codex proceed when it's confident and only pauses when it genuinely needs your input. You get oversight without constant interruption.

## Setup

```bash
# Install
npm install -g @openai/codex

# Copy global config
cp config.toml ~/.codex/config.toml

# Copy global instructions
cp ../../rules/AGENTS.md ~/.codex/AGENTS.md

# Copy project instructions (run in your repo root)
cp ../../rules/AGENTS.md your-project/AGENTS.md
```

Set your API key:

```bash
export OPENAI_API_KEY=sk-...
```

## AGENTS.md Scope Rules

Codex reads `AGENTS.md` hierarchically — more deeply nested files take precedence:

```
~/.codex/AGENTS.md          ← global (all projects)
your-project/AGENTS.md      ← project root
your-project/src/AGENTS.md  ← scoped to src/ subtree
```

Instructions in a deeper file override the parent for any file modified within that directory tree. Direct prompt instructions always override `AGENTS.md`.

See [Context Building pattern](../../patterns/context-building.md).

## Approval Policies

| Policy | Interrupts on | When to use |
|--------|--------------|-------------|
| `untrusted` | Every action | Security audits, untrusted codebases |
| `on-request` | Uncertainty | **Interactive dev** — flow-preserving oversight |
| `on-failure` | Errors only | Repetitive tasks you've already validated |
| `never` | Nothing | CI pipelines, containers, fully scripted runs |

`on-request` is the right default for dev because Codex only pauses when it's genuinely uncertain — not on every routine file write or shell command. `untrusted` looks safer but trains you to click through every prompt, which defeats the point of oversight.

Override per session:

```bash
codex --approval-mode on-request "refactor the auth module"
codex --approval-mode on-failure "run tests and fix any failures"
codex --approval-mode never "generate a changelog summary"  # CI
```

## Sandbox Modes

| Mode | File access | Network | Use case |
|------|-------------|---------|----------|
| `read-only` | Read only | Disabled | Audit / explain |
| `workspace-write` | Write within project | Disabled | **Default dev** |
| `danger-full-access` | Unrestricted | Enabled | Containers only |

## Common Workflows

```bash
# Explore the codebase
codex "explain the architecture of this project"

# Implement a feature with review
codex --approval-mode on-request "add rate limiting to the /api/auth route"

# Run and fix tests automatically
codex --approval-mode on-failure "run tests and fix any failures"

# Non-interactive CI mode
codex -q --json --approval-mode never "generate a summary of recent changes"

# Use a specific model
codex --model gpt-4.1 "review this PR diff for security issues"
```

## Multi-Model Routing

| Task type | Recommended model | Flag |
|-----------|------------------|------|
| Exploration, explanation | `o4-mini` (default) | — |
| Complex architecture | `o3` | `--model o3` |
| Quick edits, formatting | `gpt-4.1-mini` | `--model gpt-4.1-mini` |
| Full codebase reasoning | `gpt-4.1` | `--model gpt-4.1` |

See [Multi-Model Routing pattern](../../patterns/multi-model-routing.md).

## Memory

Codex supports persistent memories when `features.memories = true` in `config.toml`.

For cross-session context beyond memories, follow the [Memory Systems pattern](../../patterns/memory-systems.md):
- Keep a `DECISIONS.md` or `.codex/context/` directory
- Reference it in your root `AGENTS.md`: "Read `.codex/context/` for project decisions"

## MCP Servers

Enable servers in `config.toml` only for projects that need them — each active server adds context overhead.

```bash
# Override at runtime
codex --mcp-server filesystem --mcp-server github "list open PRs"
```

See [config.toml](config.toml) for the reference MCP setup.

## Task Orchestration

Codex does not have a built-in backlog. Use the shell-level approach:

```bash
# Feed tasks from a backlog file
cat .codex/tasks/next.md | codex --approval-mode on-request

# Chain tasks
codex "implement feature X" && codex "write tests for feature X"
```

See [Task Orchestration pattern](../../patterns/task-orchestration.md) for queue management strategies.
