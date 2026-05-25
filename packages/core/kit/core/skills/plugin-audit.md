---
name: plugin-audit
description: Diff the Anthropic `claude-plugins-official` marketplace against installed plugins and surface the delta, filtering known-unwanted entries (language LSPs you don't use, SaaS integrations you don't use, sample/demo plugins).
triggers:
  - "audit plugins"
  - "what plugins am I missing"
  - "check anthropic marketplace"
  - "plugin delta"
---

# plugin-audit

Keeps the gap between Anthropic's official marketplace and your installed plugin set visible and actionable, without reinstalling things you already have or surfacing language LSPs you'll never use.

## When to run

- Monthly hygiene check.
- After a fresh clone / machine setup, before deep work.
- When a new feature lands in claude-plugins-official (watch its README for changelog hints).

## Steps

1. Fetch the current plugin list from `claude-plugins-official`.
2. Diff against installed plugins (`claude plugin list`).
3. Filter the delta against a per-user skip list (see below).
4. Output candidates to install with recommended install commands.

## Skip list (tune per user)

Maintain a skip list to exclude:

- **Language LSPs** not in use: `clangd-lsp`, `csharp-lsp`, `gopls-lsp`, `jdtls-lsp`, `kotlin-lsp`, `lua-lsp`, `php-lsp`, `ruby-lsp`, `rust-analyzer-lsp`, `swift-lsp`
- **SaaS integrations** not in use: `asana`, `imessage`, `telegram`, `greptile`, `firebase`, `gitlab`, `terraform` (unless running IaC)
- **Samples**: `example-plugin`, `fakechat`, `math-olympiad`, `playground`

Everything else is surfaced with a `(candidate)` tag.

## Output format

```
Installed: 30  |  Available (post-filter): 8  |  Delta: 3

Candidates to install:
  - session-report    — structured end-of-session report
  - hookify           — hook authoring assistant
  - mcp-server-dev    — MCP server build patterns

Install plan:
  claude plugin install session-report@claude-plugins-official
  claude plugin install hookify@claude-plugins-official
  claude plugin install mcp-server-dev@claude-plugins-official
```

## Why this exists

Claude's `find-skills` skill searches the full ecosystem (90k+ skills) and is great for discovery. `plugin-audit` is narrower and opinionated: it answers *"what should I install from the one marketplace I trust, and skip everything else"*. The two complement each other.

## Related

- `find-skills` — community-wide discovery
- `skill-creator` — authoring new skills once installed
- `skill-maintainer` — auditing installed skills (not plugins)
