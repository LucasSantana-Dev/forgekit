---
id: claude-managed-agents
title: Claude Managed Agents
description: "Anthropic's hosted agent runtime (public beta since April 2026) — sandboxed execution, state management, sessions, scoped permissions, and tracing with token pricing plus $0.08/session-hour. Adopt when you want turnkey multi-step autonomy without infrastructure. Understand tradeoffs vs. local agents, launchd, and CI-based orchestration."
tags:
  - agents
  - orchestration
  - platform
  - anthropic
  - beta
translations:
  pt-BR:
    title: Agentes Gerenciados Claude
    description: "Runtime de agentes hospedado pela Anthropic (beta pública desde abril 2026) — execução em sandbox, gerenciamento de estado, sessões, permissões escopo e tracing com preço por token mais $0.08/hora-de-sessão. Adote quando quiser autonomia multi-passo pronta sem infraestrutura. Entenda tradeoffs vs agentes locais, launchd e orquestração baseada em CI."
---

**Status: Public Beta (April 2026 onwards)**

Claude Managed Agents is Anthropic's hosted platform for running multi-step agents in a secure, stateful environment. Unlike local agents (running in your CLI, launchd, or CI), Managed Agents handle sandboxing, session persistence, and tracing at the platform level.

---

## What It Is

A stateful agent runtime where you:

1. **Define a behavior** — write a system prompt, pick a model (Claude 3.5 Sonnet or Claude 3 Opus)
2. **Send user requests** — agents run until they finish or hit a step limit
3. **Get transcripts + artifacts** — full execution trace, tool calls, reasoning steps

Built-in features:
- **Stateful sessions** — agent remembers conversation history across turns
- **Scoped permissions** — define which tools the agent can call (read-only, write, approve-before-execute)
- **Dreaming** (May 2026) — agents self-improve by replaying past sessions and learning from outcomes
- **Native multi-agent** (May 2026) — orchestrate sub-agents within a single session without manual dispatch logic

---

## When to Use

**Use Managed Agents when:**

- You want multi-step autonomy without running your own infrastructure
- Session persistence across user turns matters (e.g., context that agents build over time)
- You need fine-grained tool permissions + audit trails (security, compliance)
- Your agents are user-facing (SaaS, embedded workflows) and you want platform uptime guarantees

**Avoid when:**

- You need agents to run on a schedule (launchd, cron) — Managed Agents is request-driven
- Your agents must run fully offline — Managed Agents requires API connectivity
- Latency is critical and you can't accept platform-API overhead
- You're iterating quickly on agent behavior (local agents are easier to test/debug in a single session)

---

## Pricing

- **Token-based**: same as standard Claude API (input + output tokens)
- **Session runtime**: $0.08/hour per active session
- **Example**: a 2-minute agent run (100k input tokens, 50k output tokens) on Claude 3.5 Sonnet costs ~$0.60 in tokens + $0.003 in session runtime

---

## Early Adopters

Notion, Rakuten, Sentry, and Asana began integrating Managed Agents in beta (May–June 2026).

---

## Getting Started

1. Enroll in the beta at https://www.anthropic.com/claude/managed-agents
2. Create an agent via the web console or API
3. Send requests and inspect execution traces
4. Integrate the agent into your app (webhook-style or SDK)

See the [official documentation](https://docs.anthropic.com) for API reference and examples.

---

## Dreaming + Multi-Agent Orchestration (May 2026)

**Dreaming**: agents now replay past sessions, identify patterns, and auto-improve their system prompts. Opt-in per agent.

**Multi-Agent**: define parent-child agent relationships without manual dispatch — the runtime coordinates sub-agents and aggregates results.

Both are beta-within-beta; expect API changes.

---

## Tradeoffs

| Dimension | Local Agents | Managed Agents |
|-----------|--------------|----------------|
| Setup | 10 min (launchd/cron) | 5 min (web console) |
| Session persistence | Manual (file/DB) | Built-in |
| Permissions | chmod / environment | Scoped + auditable |
| Latency | Low (local) | +200ms API round-trip |
| Cost | Infra + tokens | Tokens + $0.08/hour |
| Debugging | Local logs | Managed dashboard |

---

## Next Steps

- **Using Managed Agents from Claude Code**: multi-agent orchestration within Claude Code still runs locally; Managed Agents is orthogonal (you can call a Managed Agent as a tool, or run agents inside Managed Agents)
- **Upgrade path**: if you start with local agents and adoption grows, migrate to Managed Agents for persistence + compliance
- **GA timeline**: Anthropic hasn't announced a GA date; assume beta-only stability + breaking changes through Q3 2026
