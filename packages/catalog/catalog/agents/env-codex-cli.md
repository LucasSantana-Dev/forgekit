---
id: env-codex-cli
name: OpenAI Codex CLI environment
description: Configuration guide for OpenAI Codex CLI — AGENTS.md, approval modes, multi-agent via Codex SDK, sandboxed execution
version: 0.1.0
tags:
- agent
- platform-env
- codex
- openai
- cli
source:
  type: git
  repo: https://github.com/LucasSantana-Dev/forgekit
license: MIT
author: Lucas Santana
usage:
  use_when: You are setting up or documenting an OpenAI Codex CLI workspace and need to wire AGENTS.md, configure approval policy, or orchestrate multi-agent tasks via the Codex SDK.
  skip_when: You want the Codex web app experience — use env-codex-app instead.
  prerequisites:
    - Node.js 22+
    - Codex CLI installed (npm install -g @openai/codex)
    - OPENAI_API_KEY set
  resources:
    ram: 256MB
    compute: cpu-light
    network: online
    cost: metered-api
  install_difficulty: easy
  time_to_setup: minutes
  good_for:
    - terminal-native agentic coding
    - sandboxed code execution
    - multi-agent pipelines via SDK
    - CI-integrated automation
translations:
  pt-BR:
    name: Ambiente OpenAI Codex CLI
    description: Guia de configuração para OpenAI Codex CLI — AGENTS.md, modos de aprovação, multi-agente via Codex SDK e execução em sandbox
---
# OpenAI Codex CLI Environment

## Install and authenticate

```bash
npm install -g @openai/codex
export OPENAI_API_KEY=sk-...
codex --version
```

## Context files

| File | Location | Purpose |
|------|----------|---------|
| `AGENTS.md` | Project root or any directory | Instructions, commands, conventions for the agent |

Codex CLI reads `AGENTS.md` from the current directory and all parent directories up to the git root. Place task-specific instructions in subdirectory `AGENTS.md` files for fine-grained control.

```markdown
# AGENTS.md

## About this project
Monorepo for the forgekit AI toolkit. TypeScript throughout.

## Build
- `pnpm build` — build all packages
- `pnpm test` — run tests

## Coding conventions
- Prefer functional patterns
- No `any` types
- All exports must have JSDoc

## Do not modify
- `packages/catalog/catalog/` — catalog source of truth; validate with `pnpm catalog:validate`
```

## Approval modes

Codex CLI has three approval levels, set via `--approval-policy` or interactively:

| Mode | Behavior |
|------|----------|
| `suggest` (default) | Shows proposed changes; user approves each file edit and command |
| `auto-edit` | File edits applied automatically; shell commands still require approval |
| `full-auto` | Fully autonomous; runs in a sandbox; all actions auto-approved |

For CI or batch tasks, run with `full-auto` inside the sandbox:

```bash
codex --approval-policy full-auto "fix all TypeScript errors in src/"
```

## Sandboxed execution

In `full-auto` mode, Codex runs inside a macOS sandbox (Apple Seatbelt on macOS, or a container on Linux) that restricts filesystem writes to the project directory and blocks network access except to the OpenAI API. This prevents supply-chain-style attacks from agentic sessions.

## Multi-agent via Codex SDK

The Codex SDK (`@openai/codex`) exposes a programmatic API for orchestrating multiple agents:

```typescript
import { Codex } from "@openai/codex";

const codex = new Codex({ apiKey: process.env.OPENAI_API_KEY });

const session = await codex.createSession({
  instructions: "Refactor the auth module for testability",
  approvalPolicy: "full-auto",
  workdir: process.cwd(),
});

for await (const event of session.stream()) {
  if (event.type === "file_edit") console.log("edited:", event.path);
  if (event.type === "done") console.log("result:", event.summary);
}
```

Spawn multiple sessions in parallel for independent tasks; join results with `Promise.all`.

## Key behaviors

- **Model**: `o4-mini` by default; override with `--model gpt-4.1` or env var `CODEX_MODEL`
- **Context**: reads `AGENTS.md`, current directory tree, and git status automatically
- **Rollback**: every session creates a git snapshot; roll back with `codex rollback <session-id>`
- **Streaming**: SDK streams events — `file_edit`, `shell_run`, `thought`, `done` — for real-time monitoring
- **Open source**: Codex CLI is MIT-licensed on GitHub at `openai/codex`
