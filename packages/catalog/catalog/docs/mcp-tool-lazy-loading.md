---
id: mcp-tool-lazy-loading
title: MCP Tool Lazy Loading
description: How Claude Code lazily resolves MCP tool schemas via ToolSearch, and
  how that changes which tools you can call at any moment.
tags:
- mcp
- claude-code
- tooling
- reference
source:
  path: ai-dev-toolkit/packages/core/patterns/mcp-tool-lazy-loading.md
  license: MIT
translations:
  pt-BR:
    title: Carregamento Preguiçoso de Ferramentas MCP
    description: Como o Claude Code resolve preguiçosamente schemas de ferramentas
      MCP via ToolSearch, e como isso muda o design de servidores MCP para baixo consumo
      de contexto.
---

# MCP Tool Lazy Loading

Claude Code registers MCP tools by **name** at session start but does not load their full JSON schemas until a tool is first needed. When you see a "deferred tools" system reminder, calling those tools directly fails with `InputValidationError` — you must use `ToolSearch` to materialize the schema first.

## Why this matters

- Session context stays cheap. Hundreds of tools cost ~one name each until actually used.
- A tool can disappear from the registry (upstream removed it) while your local config still lists it — the lazy layer hides this until first call.
- Subagents get their own deferred list; what's callable in the main session may need re-loading in a delegated agent.

## Practical recipe

1. See a `<system-reminder>` listing deferred tools.
2. Call `ToolSearch({ query: "select:<name1>,<name2>", max_results: N })` — schemas land inline.
3. Only then call the tool.

## Not a bug

The reminder looks alarming ("not listed above") but is the normal steady state. If a tool is used frequently in your workflow, it graduates to the top-of-prompt list after enough use.
