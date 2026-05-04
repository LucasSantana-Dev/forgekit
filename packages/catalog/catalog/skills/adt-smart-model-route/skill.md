---
name: smart-model-route
description: Auto-classify prompt complexity via Haiku (with heuristic fallback) and inject model routing hints for Agent tool calls. Wired as a UserPromptSubmit hook — fires on every prompt, routes low tasks to Haiku, standard to Sonnet, complex to Sonnet with thorough reasoning, and critical (security/arch/migrations) to Opus.
triggers:
  - smart model routing
  - model selection
  - route by complexity
  - choose model
  - auto model
  - task complexity
---

# Smart Model Route

Classifies each incoming prompt and injects a `systemMessage` telling the AI which model to pass to `Agent` tool calls and what reasoning depth to use. Uses Haiku for classification when `ANTHROPIC_API_KEY` is available; otherwise falls back to keyword heuristics.

## How It Works

1. `UserPromptSubmit` hook fires on every prompt
2. Sends prompt to `claude-haiku-4-5` with a classification system prompt
3. Returns `low | medium | high | critical`
4. Injects a `[AUTO:haiku]` or `[AUTO:heuristic]` system message for non-medium tasks
5. Claude uses this to calibrate reasoning depth and `model:` parameter on Agent calls

## Classification Rules

| Level | Signals | Agent model |
|-------|---------|-------------|
| **low** | Search, grep, read, git status, quick questions, <20 words | `claude-haiku-4-5` |
| **medium** | Standard coding, bug fixes, typical tasks (default) | `claude-haiku-4-5` (env) |
| **high** | Implement, refactor, debug, optimize, PR review, >15 words | `claude-sonnet-4-6` |
| **critical** | Security, OAuth, CVE, arch decisions, prod deploys, migrations | `claude-opus-4-7` |

## Installation

1. Copy `complexity-classifier.sh` to `~/.claude/hooks/`
2. Make it executable: `chmod +x ~/.claude/hooks/complexity-classifier.sh`
3. Add to `settings.json`:

```json
"UserPromptSubmit": [{
  "matcher": "*",
  "hooks": [{
    "type": "command",
    "command": "/path/to/hooks/complexity-classifier.sh",
    "timeout": 5
  }]
}]
```

4. To enable Haiku-based classification (vs heuristic fallback):

```json
"env": {
  "ANTHROPIC_API_KEY": "your-key"
}
```

Or for OAC workstation proxy:

```json
"env": {
  "ANTHROPIC_API_KEY": "sk-forge-local",
  "ANTHROPIC_BASE_URL": "http://oac-workstation:4000"
}
```

## Using in Agent Calls

Once the hook is active, Claude reads the injected hint and applies it:

```python
# For clearly simple tasks (override default)
Agent(model="haiku", prompt="search for all TODO comments")

# For complex tasks (override default)
Agent(model="opus", prompt="design the auth architecture for multi-tenant SaaS")
```

## Session Model Override

For architecture or security sessions, switch the main model:

```
/model claude-opus-4-7
```

Switch back when done:

```
/model claude-sonnet-4-6
```

## Dependencies

- `anthropic` Python SDK (for Haiku classification): `pip install anthropic`
- Heuristic fallback requires no dependencies
