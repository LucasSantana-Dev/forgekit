# Agent Routing Guide

> **Applies to**: Codex CLI and OpenCode — both read `AGENTS.md` automatically.  
> For Claude Code, pair this with `CLAUDE.md`. Deeply nested `AGENTS.md` files override parent-level ones.

## Multi-Model Strategy

Use different model tiers for different task complexities.
Prefer tier labels in shared guidance and keep exact model names in local config.

**OpenCode with oh-my-openagent** ([reference config](../implementations/opencode/oh-my-openagent.jsonc)):

Sisyphus delegates by **category**, not model name. Keep the routing categories
stable and let the live config own the exact provider/model mapping.

| Agent | Tier | Use For |
|-------|------|---------|
| **Sisyphus** | Deep reasoning | Default orchestrator — plans, delegates, drives to completion |
| **Hephaestus** | Deep reasoning | Deep architecture, multi-file debugging, cross-domain reasoning |
| **Prometheus** | Deep reasoning | Strategic planning and interview mode |
| **Oracle** | Deep reasoning | Architecture consultation, trade-off analysis |
| **Librarian** | Deep reasoning | Documentation search, code reference, pattern lookup |
| **Atlas** | Balanced | Todo orchestration and parallel execution |
| **Sisyphus-Junior** | Balanced | Sub-tasks delegated from Sisyphus |
| **Explore** | Fast | Fast codebase grep, quick lookups |

| Category | Tier | Trigger |
|----------|------|---------|
| `visual-engineering` | Visual specialist | UI/UX, CSS, design, animation |
| `ultrabrain` | Deep reasoning | Deep architecture, complex reasoning |
| `deep` | Deep reasoning | Autonomous research, thorough investigation |
| `artistry` | Visual or creative specialist | Creative or unconventional approaches |
| `writing` | Balanced | Docs, CHANGELOG, README, prose |
| `quick` | Fast | Trivial edits, typo fixes, single-line changes |
| `unspecified-low` | Balanced | General low-effort tasks |
| `unspecified-high` | Balanced or deep reasoning | General high-effort tasks |

**Vanilla OpenCode agents** (without oh-my-openagent):

| Agent | Tier | Use For |
|-------|------|---------|
| **primary** | Balanced | Default. Implementation, debugging, refactoring |
| **architect** | Deep reasoning | Complex design, cross-repo impact, API design |
| **fast** | Fast | Linting, formatting, simple edits, quick lookups |

**Codex CLI tiers** (set actual model names in `config.toml` or per-session flags):

| Task | Tier |
|------|------|
| Default / exploration | Balanced coding tier |
| Complex architecture | Deep reasoning tier |
| Quick edits | Fast tier |
| Full codebase reasoning | Balanced or deep reasoning tier |

## Tool Allocation

With oh-my-openagent, tool access is set per-agent in `oh-my-opencode.jsonc` via `permission` overrides.

Without oh-my-openagent:
- **primary**: All tools (bash, read, write, edit, glob, grep, webfetch, task, todo)
- **architect**: All tools (needs planning capabilities)
- **fast**: Core only (bash, read, write, edit, glob, grep — no webfetch, no task)

## MCP Server Strategy

Keep context lean by enabling servers only where needed:

- **Always on globally**: filesystem, git, fetch, github, memory
- **Per-project**: supabase (for DB projects), vercel (for deployed apps), sentry (for monitored apps)
- **Disabled by default**: playwright, stitch, huggingface (heavy on context)

Rule: Remote MCP (`type: "remote"`) is cheaper than local — tools register lazily.

## Commands to Have

Essential workflow commands every project should have:

```
/resume   — Load git state, suggest next task
/verify   — Run lint + type-check + test + build
/ship     — Commit + push + create PR
/commit   — Conventional commit without push
/test     — Run tests, report results
/clean    — Clear build artifacts
/validate — Full repo health scorecard
```
