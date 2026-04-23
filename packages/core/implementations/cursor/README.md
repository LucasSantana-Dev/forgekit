# Cursor Implementation

Reference implementation of the toolkit patterns for [Cursor](https://cursor.com).

## Context Building

Cursor uses `.cursorrules` (project root) and `.cursor/rules/*.mdc` (scoped rules).

```bash
cp ../../rules/CLAUDE.md your-project/.cursorrules
```

For scoped rules:
```
.cursor/
  rules/
    api.mdc          ← Rules when working in src/api/
    frontend.mdc     ← Rules when working in src/components/
    testing.mdc      ← Rules when writing tests
```

See [Context Building pattern](../../patterns/context-building.md).

## Multi-Model Routing

Cursor supports model selection per-chat:
- **Fast** (Tab completions): Uses smaller models automatically
- **Standard** (Cmd+K, Chat): Configure in settings
- **Deep** (Composer): Use for multi-file changes

## Memory

Cursor doesn't have built-in persistent memory. Implement via:
- `.cursor/context/` directory with markdown files
- Reference in `.cursorrules`: "Read .cursor/context/ files for project decisions"
- Notepad feature for session-level persistence

## Task Orchestration

Use Cursor Composer for multi-step plans:
1. Open Composer (Cmd+I)
2. Describe the full plan
3. Composer breaks it into file-level changes
4. Review and apply

For backlog management, use the same `backlog.json` pattern with a shell wrapper.

## Contributions Welcome

If you build Cursor implementations of these patterns, open a PR.
