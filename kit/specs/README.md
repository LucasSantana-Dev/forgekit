# kit/specs — Agent-OS-inspired spec + roadmap flow

Lightweight per-feature specs with YAML frontmatter + a derived `docs/roadmap.md`. Inspired by Buildermethods' Agent OS, trimmed to the primitives that actually survive after the first sprint.

## What you get

- `docs/specs/<YYYY-MM-DD>-<slug>/spec.md` — goal / context / approach / verification with `status: proposed|active|shipped`, `created`, `owner`, `pr`, `tags`.
- `docs/specs/<…>/tasks.md` — checkbox list (optionally seeded from a session plan's `### Phase N` headers).
- `docs/roadmap.md` — auto-generated Now / Next / Recently-shipped view. **Derived state; do not hand-edit.**
- `docs/specs/archived/` — shipped specs live here; still searchable, out of the active roadmap.

## One-time setup

```bash
cp kit/specs/scripts/specs.py ~/.claude/rag-index/
cp -r kit/specs/skills/* ~/.claude/skills/
```

No deps — pure stdlib.

## Daily use

```bash
python3 ~/.claude/rag-index/specs.py new "<slug>" --repo . --from-plan ~/.claude/plans/<file>.md
python3 ~/.claude/rag-index/specs.py list --repo .
python3 ~/.claude/rag-index/specs.py ship <spec-dir> --pr <url>
python3 ~/.claude/rag-index/specs.py roadmap --repo .
```

## Typical flow

1. Draft plan in `~/.claude/plans/<name>.md` (`plan` skill).
2. `spec new <slug> --from-plan ...` commits it to the repo.
3. Work through `tasks.md` across sessions; tick boxes as they land.
4. When all tasks ✓ and PR merged → `spec ship <dir> --pr <url>`.
5. `spec roadmap --repo .` keeps `docs/roadmap.md` in sync.

## Why derived, not hand-edited

Hand-curated roadmaps rot within 2 weeks. Spec frontmatters are the source of truth; `roadmap.md` is regenerated idempotently. Set up a git `post-commit` hook if you want it refreshed on every commit.

## What's deliberately NOT here

- No `.agent-os/standards/` layer — use sliced CLAUDE.md in `~/.claude/standards/` instead.
- No `mission.md` / `product.md` — overkill for personal projects.
- No dedicated installer — copy the script plus the `skills/` directory contents.
