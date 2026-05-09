---
id: env-codex-app
name: OpenAI Codex App environment
description: Configuration guide for the OpenAI Codex web app — cloud-sandboxed coding agent with internet access, available on ChatGPT Plus and Team plans
version: 0.1.0
tags:
- agent
- platform-env
- codex
- openai
- web-app
source:
  type: git
  repo: https://github.com/LucasSantana-Dev/forgekit
license: MIT
author: Lucas Santana
usage:
  use_when: You are using the Codex web app (openai.com/codex) for cloud-sandboxed coding tasks and need to understand its capabilities, context wiring, and limits.
  skip_when: You want a terminal-native workflow — use env-codex-cli instead.
  prerequisites:
    - ChatGPT Plus, Team, Enterprise, or Pro subscription
    - GitHub account connected to Codex
  resources:
    ram: cloud-managed
    compute: cpu-light
    network: online
    cost: paid-required
  install_difficulty: easy
  time_to_setup: minutes
  good_for:
    - cloud-sandboxed long-running tasks
    - asynchronous coding with GitHub integration
    - tasks requiring real internet access
    - non-technical stakeholders delegating code tasks
translations:
  pt-BR:
    name: Ambiente OpenAI Codex App
    description: Guia do app web OpenAI Codex — agente de código em sandbox na nuvem com acesso à internet, disponível nos planos ChatGPT Plus e Team
---
# OpenAI Codex App Environment

## Access

Available at `openai.com/codex` (May 2025 launch). Requires:
- ChatGPT Plus, Team, Enterprise, or Pro plan
- GitHub repository connected via OAuth

## How it works

1. User submits a task in natural language ("add pagination to the user list endpoint")
2. Codex spins up a cloud sandbox with a copy of the connected repository
3. The agent browses the web, reads docs, writes and runs code, and commits changes
4. Results are delivered as a GitHub PR or a downloadable diff
5. The sandbox is destroyed after the task completes

Tasks run asynchronously — the user can close the browser and check back later.

## Context wiring

| File | Purpose |
|------|---------|
| `AGENTS.md` | Primary instruction file read by the agent — identical format to Codex CLI |
| `README.md` | Fallback context if no `AGENTS.md` present |

Best practice: include in `AGENTS.md`:
- Build and test commands
- Coding conventions the agent must follow
- Files or directories it should not modify
- External API docs or links to reference during tasks

## Internet access

Unlike Codex CLI (which blocks network except OpenAI API), the Codex App sandbox has real internet access during task execution. The agent can:
- Browse documentation sites
- Fetch API specs (OpenAPI/Swagger)
- Search GitHub for examples
- Read Stack Overflow answers

This is useful for tasks that require up-to-date library documentation.

## GitHub integration

- **PR creation**: completed tasks are auto-submitted as pull requests to the connected repo
- **Branch naming**: `codex/<task-slug>` by default
- **Commit messages**: auto-generated from task description
- **Review**: standard GitHub PR review flow applies

## Parallel tasks

Multiple tasks can be queued simultaneously. Each runs in its own sandbox. Results arrive as separate PRs.

## Limits

- **Task duration**: up to 30 minutes per task
- **Repo size**: large repos (>1GB) may hit context limits
- **Private repos**: requires GitHub App installation with repo read/write access
- **No persistent storage**: each task starts from a fresh clone

## Key differences from Codex CLI

| Dimension | Codex App | Codex CLI |
|-----------|-----------|-----------|
| Environment | Cloud sandbox | Local machine |
| Internet access | Yes (full) | No (API only) |
| UI | Web browser | Terminal |
| Task style | Async, queued | Interactive |
| Output | GitHub PR | Local file edits |
| Auth | ChatGPT subscription | `OPENAI_API_KEY` |
