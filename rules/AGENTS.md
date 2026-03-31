# Agent Routing Guide

> **Applies to**: Codex CLI and OpenCode — both read `AGENTS.md` automatically.  
> For Claude Code, pair this with `CLAUDE.md`. Deeply nested `AGENTS.md` files override parent-level ones.

## Multi-Model Strategy

Use different models for different task complexities:

**OpenCode agents:**

| Agent | Model | Use For |
|-------|-------|---------|
| **primary** | Claude Sonnet | Default. Implementation, debugging, refactoring |
| **architect** | Claude Opus | Complex design, cross-repo impact, API design |
| **fast** | Claude Haiku | Linting, formatting, simple edits, quick lookups |

**Codex CLI models** (set via `--model` or `config.toml`):

| Task | Model |
|------|-------|
| Default / exploration | `o4-mini` |
| Complex architecture | `o3` |
| Quick edits | `gpt-4.1-mini` |
| Full codebase reasoning | `gpt-4.1` |

## Tool Allocation

Not every agent needs every tool:
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
