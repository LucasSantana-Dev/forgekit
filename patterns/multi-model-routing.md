# Multi-Model Routing

> Use the cheapest model that can do the job. Escalate only when needed.

## The Problem

Using a frontier model for every task wastes money and time. Using a weak model for hard tasks wastes your time fixing its output. The optimal strategy routes tasks to the right capability tier.

## The Pattern

### Three-Tier Routing

| Tier | Use For | Examples |
|------|---------|---------|
| **Fast** (Haiku, GPT-4o-mini, Flash) | Simple edits, formatting, config changes, file renames, quick lookups | Fix a typo, rename a variable, update a dependency version |
| **Standard** (Sonnet, GPT-4o, Pro) | Implementation, debugging, refactoring, test writing | Build a feature, fix a bug, write tests, code review |
| **Deep** (Opus, o1/o3, Deep Research) | Architecture design, cross-system impact, complex debugging, planning | Design an API, analyze a race condition, plan a migration |

### Routing Heuristics

**Route to Fast when:**
- The task is mechanical (formatting, renaming, moving)
- The output is easily verified (linting, type errors)
- The context is small (<5 files)
- You could do it yourself in 2 minutes

**Route to Standard when:**
- The task requires understanding business logic
- Multiple files need coordinated changes
- Tests need to be written or fixed
- The output needs code review

**Route to Deep when:**
- The decision has cross-repo impact
- Multiple valid approaches exist and the tradeoffs matter
- The problem requires reasoning across >10 files
- You're planning, not implementing

### Cost Math

| Tier | Relative Cost | Speed |
|------|--------------|-------|
| Fast | 1x | Instant |
| Standard | 5-10x | Fast |
| Deep | 20-50x | Slow |

A typical day might be: 70% Fast, 25% Standard, 5% Deep.

## Tool-Specific Mapping

| Tier | Claude | OpenAI | Google |
|------|--------|--------|--------|
| Fast | Haiku 4.5 | GPT-4o-mini | Flash 2.5 |
| Standard | Sonnet 4.6 | GPT-4o / Codex | Pro 2.5 |
| Deep | Opus 4.6 | o3 | Deep Research |

## Implementation

### Agent Definitions

Define named agents with fixed model assignments:

```json
{
  "agents": {
    "fast": { "model": "haiku-tier", "tools": ["read", "write", "edit", "bash"] },
    "primary": { "model": "standard-tier", "tools": ["all"] },
    "architect": { "model": "deep-tier", "tools": ["all"] }
  }
}
```

### Tool Allocation

Not every agent needs every tool:
- **Fast**: Core only (read, write, edit, bash, glob, grep)
- **Standard**: All tools including web fetch, task management
- **Deep**: All tools — the cost is in reasoning, not tool calls

### Anti-Patterns

- **Always-Opus syndrome**: Using the most expensive model for everything "just to be safe"
- **Penny-wise routing**: Using Fast for tasks that clearly need Standard, then spending 3x the tokens fixing the output
- **No routing at all**: One model, one agent, one price for everything
- **Ignoring sub-agents**: Claude Code spawns sub-agents for compaction and background work — they use your default model unless you override `CLAUDE_CODE_SUBAGENT_MODEL`

## Sub-Agent Routing

Claude Code sub-agents (background compaction, parallel task agents) default to the same model as the main session. This is wasteful — sub-agents do summarization and simple coordination, not complex reasoning.

**Override in `settings.json` `env` block:**

```json
{
  "env": {
    "CLAUDE_CODE_SUBAGENT_MODEL": "claude-haiku-4-5-20251001"
  }
}
```

Expected savings: 60-80% on sub-agent costs with no quality impact on main session work.

## Claude Code Router (CCR)

[CCR](https://github.com/musistudio/claude-code-router) is a local proxy for Claude Code that
routes requests to different models based on request slot type.

**Slots:**

| Slot | Triggered by | Recommended model |
|------|-------------|-------------------|
| `default` | Interactive work | Sonnet |
| `background` | Auto-compaction, sub-agents | Haiku |
| `think` | Complex reasoning tasks | Opus |
| `longContext` | Conversations > threshold | Opus |

**Minimal preset** (`~/.claude-code-router/presets/<name>/manifest.json`):

```json
{
  "name": "my-preset",
  "PORT": 3456,
  "Providers": [
    {
      "name": "anthropic",
      "api_base_url": "https://api.anthropic.com/v1/messages",
      "api_key": "$ANTHROPIC_API_KEY",
      "models": ["claude-sonnet-4-6", "claude-opus-4-6", "claude-haiku-4-5-20251001"],
      "transformer": { "use": ["Anthropic"] }
    }
  ],
  "Router": {
    "default": "anthropic,claude-sonnet-4-6",
    "background": "anthropic,claude-haiku-4-5-20251001",
    "think": "anthropic,claude-opus-4-6",
    "longContext": "anthropic,claude-opus-4-6",
    "longContextThreshold": 120000
  }
}
```

**Use:**
```bash
npm install -g @musistudio/claude-code-router
ccr my-preset start
eval "$(ccr activate)"   # sets ANTHROPIC_BASE_URL for current shell
claude                   # now routes through CCR
```

CCR and `CLAUDE_CODE_SUBAGENT_MODEL` can be used together — CCR handles slot routing for the main session flow, `CLAUDE_CODE_SUBAGENT_MODEL` handles agent spawning.
