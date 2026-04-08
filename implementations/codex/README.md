# Codex CLI Implementation

Reference implementation of the toolkit patterns for [Codex CLI](https://github.com/openai/codex).

## How Codex Differs from Other AI Coding Tools

Most AI coding tools (Claude Code, OpenCode, Cursor) are **trust-first**: they assume you want maximum access and require explicit setup to add isolation. Codex is the opposite — **sandbox-first by default**.

Documented defaults are conservative:

- `read-only` sandbox
- network disabled unless you explicitly broaden access
- approval prompts when the agent needs to go beyond its current trust boundary

For active implementation work, many teams intentionally move to `workspace-write`
with `on-request` approval. That is a recommended dev posture, not the documented
baseline.

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

Prefer keeping the live model choice in `~/.codex/config.toml` or per-session flags.
Model names change faster than workflow patterns, so this guide stays tier-based
and only uses concrete model names as examples when necessary.

## oh-my-codex Compatibility

Use [oh-my-codex.md](./oh-my-codex.md) as the ownership boundary when combining
`forge-kit` with an oh-my-codex orchestration layer.

`forge-kit` can install this reference to `~/.codex/oh-my-codex.md` with:

```bash
FORGE_KIT_DIR=./kit sh kit/install.sh --tools codex --oh-my-compat
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

| Policy       | Interrupts on | When to use                                     |
| ------------ | ------------- | ----------------------------------------------- |
| `untrusted`  | Every action  | Security audits, untrusted codebases            |
| `on-request` | Uncertainty   | **Interactive dev** — flow-preserving oversight |
| `on-failure` | Errors only   | Repetitive tasks you've already validated       |
| `never`      | Nothing       | CI pipelines, containers, fully scripted runs   |

`on-request` is the right default for dev because Codex only pauses when it's genuinely uncertain — not on every routine file write or shell command. `untrusted` looks safer but trains you to click through every prompt, which defeats the point of oversight.

Override per session:

```bash
codex --approval-mode on-request "refactor the auth module"
codex --approval-mode on-failure "run tests and fix any failures"
codex --approval-mode never "generate a changelog summary"  # CI
```

## Sandbox Modes

| Mode                 | File access          | Network  | Use case        |
| -------------------- | -------------------- | -------- | --------------- |
| `read-only`          | Read only            | Disabled | Audit / explain |
| `workspace-write`    | Write within project | Disabled | Recommended active-dev mode |
| `danger-full-access` | Unrestricted         | Enabled  | Containers only |

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

# Use a stronger reasoning model only when the task needs it
codex --model <deep-reasoning-model> "review this PR diff for security issues"
```

## Multi-Model Routing

Prefer stable tiers instead of hardcoding model names in team guidance:

| Task type | Recommended tier | How to choose |
| --- | --- | --- |
| Exploration, explanation | Fast or balanced coding tier | Use the current default fast or balanced coding model from official OpenAI docs |
| Quick edits, formatting | Fast tier | Optimize for speed and low cost |
| Standard implementation | Balanced coding tier | Use your default coding model |
| Complex architecture or debugging | Deep reasoning tier | Switch only when the task clearly needs stronger reasoning |
| Full codebase review | Balanced or deep reasoning tier | Start balanced, escalate only if the task stalls |

See [Multi-Model Routing pattern](../../patterns/multi-model-routing.md).

As of today, the safest operational rule is:

- keep the repository guidance tier-based
- keep the actual model names in local config
- periodically verify the current recommended coding models in official OpenAI docs

Current OpenAI examples that fit those tiers:

- fast: `gpt-5.4-mini` or `gpt-5.4-nano`
- balanced: `gpt-5.4`
- long-horizon coding: `gpt-5.2-codex`

## Memory

Treat Codex memory as an external layer, not a built-in toggle in this starter config.

For cross-session context, follow the [Memory Systems pattern](../../patterns/memory-systems.md):

- Keep a `DECISIONS.md` or `.codex/context/` directory
- Reference it in your root `AGENTS.md`: "Read `.codex/context/` for project decisions"
- Add an MCP memory server only if you actually use one
- Prefer simple handoff files over always-on memory complexity when a project is small

## MCP Servers

Enable servers in `config.toml` only for projects that need them — each active server adds context overhead.

```bash
# Override at runtime
codex --mcp-server filesystem --mcp-server github "list open PRs"
```

See [config.toml](config.toml) for the reference MCP setup.

Keep the always-on set small. A lean default usually looks like:

- filesystem
- git or GitHub
- fetch or docs retrieval
- one memory system if you actually use it

Everything else should be project-specific or turned on only when needed.

## Task Orchestration

Codex does not have a built-in backlog. Use the shell-level approach:

```bash
# Feed tasks from a backlog file
cat .codex/tasks/next.md | codex --approval-mode on-request

# Chain tasks
codex "implement feature X" && codex "write tests for feature X"
```

See [Task Orchestration pattern](../../patterns/task-orchestration.md) for queue management strategies.
