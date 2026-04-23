# Memory Systems

> Every session should make the next one better.

## The Problem

You explain the same thing to the AI every Monday. "We use trunk-based development." "The auth middleware is in this file." "Don't mock the database in integration tests." Without persistent memory, every session starts from zero.

## The Pattern

### Three Layers of Memory

```
┌─────────────────────────────────────────────┐
│  Layer 1: Static Context (always loaded)    │
│  CLAUDE.md, .cursorrules, AGENTS.md         │
│  → Project rules, architecture, commands    │
├─────────────────────────────────────────────┤
│  Layer 2: Dynamic Memory (loaded on demand) │
│  Memory files, learned patterns, decisions  │
│  → What was done, why, what to avoid        │
├─────────────────────────────────────────────┤
│  Layer 3: Session State (ephemeral)         │
│  Conversation history, current task context │
│  → Discarded after session ends             │
└─────────────────────────────────────────────┘
```

### What to Remember

| Memory Type | Example | Where to Store |
|-------------|---------|---------------|
| **User preferences** | "Never add co-authored-by to commits" | Global memory |
| **Feedback** | "Don't mock the DB — we got burned last quarter" | Project memory |
| **Decisions** | "We chose Supabase over Firebase because of row-level security" | Project memory |
| **References** | "Pipeline bugs are tracked in Linear project INGEST" | Project memory |
| **Gotchas** | "pre-commit runs full monorepo type-check, use HUSKY=0 for docs" | Project rules file |

### What NOT to Remember

- Code patterns (read from the current codebase)
- Git history (use `git log` / `git blame`)
- Debugging solutions (the fix is in the code, the context is in the commit)
- Ephemeral task details (current session handles these)

### Memory File Structure

```
.claude/memory/          # or .serena/memories/, .cursor/context/
  MEMORY.md              ← Index file (always loaded, kept short)
  user-preferences.md    ← How to work with this user
  project-decisions.md   ← Why we made certain choices
  gotchas.md             ← Things that break if you're not careful
  integrations.md        ← External systems and how to access them
```

### The Index Pattern

Keep the index file (MEMORY.md) as a table of contents, not a dumping ground:

```markdown
# Memory Index

## User
- [user-preferences.md](user-preferences.md) — Work style, model preferences

## Project
- [decisions.md](decisions.md) — Architecture choices and rationale
- [gotchas.md](gotchas.md) — Known foot-guns
```

### Cross-Session Memory

For memory that persists across tools and machines:
- **Git-committed** memory files (shared with team)
- **Local** memory files (personal, gitignored)
- **External** memory services (vector DBs, Supermemory, claude-mem)
- **Dotfiles repo** (synced via chezmoi)

### Memory Hygiene

- **Update, don't append** — Fix stale memories instead of adding contradicting new ones
- **Delete when obsolete** — A decision that was reversed is worse than no memory
- **Date your memories** — "Merge freeze begins 2026-03-05" not "merge freeze next Thursday"
- **Include the why** — "Use Supabase RLS" means nothing without "because we need row-level tenant isolation"

## Anti-Patterns

- **Memory hoarding**: 50 memory files nobody reads
- **Stale memories**: Rules from 6 months ago that contradict current code
- **Index bloat**: MEMORY.md with 500 lines (should be <100)
- **Duplicate memories**: Same fact in 3 different files
