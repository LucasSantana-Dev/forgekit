# Decision: add a proactive maintainer-env leak lint to CI (literal-token denylist), don't keep scrubbing reactively

- **Date:** 2026-06-22
- **Status:** Accepted (implementation-gated — see "Gate")
- **Process:** /research-and-decide (RAG pre-check + decision-critic APPROVE-WITH-CONDITIONS; false-positive surface verified against the catalog)
- **Governs:** authored skill bodies under `packages/**/SKILL.md` + CI

## Context

forgekit is a public, distributable toolkit; end users install its skills. Maintainer-environment specifics are leaking into that public artifact, and there is **no automated guard** — only `parity-audit.js` (bilingual) and `validate-schemas.js` exist.

Verified by scanning the repo:
- **5 skills with literal-username/disk leaks**: `recall` (`-Users-lucassantana` path + hardcoded venv), `mac-optimize`, `branch-hygiene`, `repo-bootstrap` (`/Volumes/External HD`).
- `/Volumes/External HD` appears **~77×** in skill bodies (concentrated — largely worktree-path examples inherited from the maintainer's storage policy). So the leak is systemic, not a one-off.
- Reactive scrubbing demonstrably misses leaks: the `recall` leak **survived multiple dedicated "scrub leaked paths" commits**.
- **`~/.claude/` (~48 files) is NOT a leak** — it's the standard per-user Claude Code config dir; the lint must allow it.
- **Generic patterns would false-positive**: skills intentionally use placeholder usernames `/Users/jdoe`, `/Users/yourname`, `/Users/user`, `/Users/dev`. A generic `/Users/<name>` or `/Volumes/` denylist would break the build on legitimate examples.

## Decision

Add a **lightweight CI lint** (`scripts/skill-leak-check.js`, wired into existing CI) that fails the build when an authored skill body matches a **committed denylist of LITERAL maintainer tokens** — not pattern-classes. Initial denylist: `lucassantana` (covers `/Users/lucassantana`, `-Users-lucassantana-`), `/Volumes/External HD`, and the maintainer's machine hostname(s). It explicitly ALLOWS `~/.claude/`, `$HOME`, and placeholder names (`jdoe`, `yourname`, `user`, `dev`).

Pair the lint's introduction with **genericizing the existing occurrences**: `recall`'s username path → `~/.claude/projects/<project>/memory/`; the `/Volumes/External HD` worktree examples → a placeholder (`<worktree-root>` / `$HOME/...`).

### Gate (decision-critic condition — must hold before the lint PR merges)
The lint must NOT merge with a placeholder denylist. Before merge, demonstrate:
1. lint flags **all** current known leaks (recall, mac-optimize, branch-hygiene, repo-bootstrap);
2. lint produces **zero false positives** on a ≥15-file clean sample (must pass the `/Users/jdoe`/`yourname` placeholder skills and the ~48 `~/.claude/` skills);
3. the denylist (tokens + hostname list) is committed with a one-line maintenance note ("add new maintainer machines/usernames here").

## Alternatives considered
- **B. Fix the 5 leaks, no gate (stay reactive):** rejected — reactive scrubbing already missed `recall` across multiple scrub commits; ~77 occurrences with zero automated protection.
- **C. Full env-neutrality standard + lint** (paths + interpreters + require `mcp_servers`): rejected — heavier than warranted; scope creep. (The `mcp_servers` declaration push is already its own 2026-06-18 thread.)
- **D. Defer:** rejected — public artifact, zero current protection.

## Consequences
- (+) New leaks caught at PR time, not post-publish; cheap (one small script, CI precedent exists).
- (+) Literal-token denylist ≈ zero false-positive risk (verified: no other `/Volumes/` paths; placeholder usernames are distinct from the maintainer's).
- (−) One-time cleanup of ~77 `/Volumes/External HD` occurrences to genericize.
- (−) Hostname/username denylist is hand-maintained — small drift risk (mitigated by the maintenance note + the lint itself being the forcing function).

## Revisit when
- The denylist generates recurring false positives → move to an allowlist/structured-path approach.
- A leak class appears that a literal-token denylist can't catch (e.g., a new external-disk name) → broaden, and run a post-incident review (the leak shipped = the lint missed a class).
- The maintainer-token list drifts (new machine added without updating) → automate the list source.
