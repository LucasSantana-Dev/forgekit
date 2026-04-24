---
status: draft
audience: all
---

# AI Dev Toolkit Guides

Batteries-included, opt-in-per-skill reference layer for AI-assisted development. Thin pointers into existing skills, rules, and patterns — not re-documentation.

Pick your entry point:

## Step-by-step adoption
Stepped walkthroughs. Pick the depth that matches where you are.
- **[Adoption — beginner](./adoption-beginner.md)** — 7 steps, 45 min. Copy-paste-able. For people who've never installed an AI dev tool before (15 min read, hours of steps)
- **[Adoption — advanced](./adoption-advanced.md)** — 6 stages, ~3 hours. Gateway + MCP + hooks + CI + observability. Assumes Docker/Node/git fluency (20 min read)

## Installing
- **[Installing entries](./installing.md)** — the reference. Why there's no mega-install script; what each kind of install does; where files land; how to verify and uninstall (15 min)

## Just curious about AI tools? Start here.
Plain-language, non-technical. No install required for the first two.
- **[Get productive with AI in 10 minutes](./ten-minute-start.md)** — three decisions, one real task, no jargon (10 min)
- **[Pick your first tool](./pick-your-first-tool.md)** — maps 5 common situations to the right Forge Kit piece (6 min)
- **[Is it working?](./is-it-working.md)** — honest measurements so you don't confuse "feeling faster" with actually shipping more (7 min)

## Technical deep-dives
- **[Catalog schema reference](./catalog-schema-reference.md)** — every field on every kind, with examples and validation rules (12 min)
- **[MCP servers](./mcp-servers.md)** — transport choice, gateway model, secrets, how to add a server, how to troubleshoot (9 min)

## First Time Here? (technical)
- **[Getting Started](./getting-started.md)** — 10-minute clone → install → first query (5 min read)

## By Role
- **[For Individual Devs](./for-individual-devs.md)** — personal workflows, skill map, plan → ship → spec loop (8 min)
- **[For Teams](./for-teams.md)** — adoption, governance, compliance Q&A at work (12 min)

## Core Concepts
- **[Primitives](./primitives.md)** — 4-primitive model: Rules, Skills, Agents, Hooks. Decision flowchart: "What should this be?" (7 min)
- **[AI-Assisted Development](./ai-assisted-development.md)** — AAD pillar: context, standards, gates, memory (6 min)
- **[Agent-Driven Development](./agent-driven-development.md)** — ADD pillar: agents.json, auto-invoke, Command → Agent → Skill (8 min)
- **[Agents vs Skills](./agents-vs-skills.md)** — when to pick noun-named agents over verb-named skills (3 min)
- **[Conventions as Code](./conventions-as-code.md)** — rules/ rendering, tool-overlay model, sliced standards (5 min)

## Operations
- **[Auto-deploy](./auto-deploy.md)** — how `forgekit.lucassantana.tech` redeploys on every push to main. One-time CF token setup, smoke check, manual fallback (4 min)
- **[Hooks](./hooks.md)** — edit-moment hooks pack: format, typecheck, evaluate-response. Signature feature (6 min)
- **[Governance](./governance.md)** — compliance Q&A: data, secrets, deps, audit, chezmoi vs dual-branch (10 min)
- **[Tool Matrix](./tool-matrix.md)** — skill × tool (Claude Code / Codex / Cursor / Copilot / Gemini) × primitive (4 min)
- **[Benchmarks](./benchmarks.md)** — eval numbers, methodology, reproduction (3 min)

---

Internal links assume `docs/guides/` as root. See [AI_ASSISTED_DEVELOPMENT_SUMMARY.md](../AI_ASSISTED_DEVELOPMENT_SUMMARY.md) for repository overview.
