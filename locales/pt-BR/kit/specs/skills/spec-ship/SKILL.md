---
name: spec-ship
description: Mark a spec shipped and move it to `docs/specs/archived/`. Stamps the frontmatter with `status: shipped`, `shipped: <date>`, and optional PR URL. Keeps the history searchable without cluttering active specs.
type: skill
---

# spec-ship

## When to use
- All checkboxes in the spec's `tasks.md` are ticked.
- The related PR is merged to main.
- Before starting the next feature — keeps the active spec list short.

## Usage
```bash
~/.claude/rag-index/venv/bin/python ~/.claude/rag-index/specs.py ship \
  <repo>/docs/specs/<date>-<slug> \
  [--pr https://github.com/.../pull/N]
```

Effect:
1. Rewrites `spec.md` frontmatter: `status: shipped`, `shipped: <today>`, `pr: <url>`.
2. Moves the entire folder to `docs/specs/archived/<date>-<slug>/`.
3. Archive stays indexed by RAG — future sessions can still retrieve "how we shipped X".

## Do NOT
- Don't delete shipped specs. Archive is the history.
- Don't ship a spec mid-implementation — leave it at `status: active`.

## See also
- `spec-new`, `roadmap-refresh`.
