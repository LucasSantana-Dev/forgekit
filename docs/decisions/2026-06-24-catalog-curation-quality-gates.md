# ADR: Catalog curation quality gates for external link-out entries

**Date:** 2026-06-24
**Status:** Accepted
**Supersedes:** (none — extends 2026-06-06-curated-index-link-dont-rehost.md)

## Context

ADR 2026-06-06 established that forgekit links to externally-authored skills rather
than re-hosting them. That decision preserved 37 manifest-only link-outs from three
upstream collections (anthropics/skills, obra/superpowers, alirezarezvani/claude-skills)
and defined the mechanism (manifest + `source` + `homepage`; no vendored `SKILL.md`).

What it did not define: a minimum quality bar for what forgekit is willing to curate.
As a result, the catalog links to skills of varying depth and relevance — some are
comprehensive and actively maintained, others are thin (10–20 lines, no trigger
guidance) or sourced from repos with no recent activity. Users who click "view at
source ↗" on a low-quality entry get a poor signal, which undermines the catalog's
stated positioning as "a curated, useful tools list, not an exhaustive mirror."

This ADR defines concrete retention gates for external link-out entries and applies
them retroactively.

## Decision

**Retain an external link-out only if it passes ALL three gates:**

| Gate | Criterion |
|------|-----------|
| **Depth** | Upstream `SKILL.md` body is ≥30 lines AND contains a recognisable trigger/invocation section |
| **Relevance** | Entry carries ≥1 tag from forgekit's primary audience taxonomy: `ai`, `agents`, `code`, `git`, `testing`, `security`, `deploy`, `mcp`, `orchestration`, `planning`, `debugging`, `rag` |
| **Freshness** | Source repo has a commit within the last 18 months |

Forgekit-authored skills (those whose `source.repo` is the forgekit repo, or that
have no `source` field) are exempt from these gates — they are maintained within
this repo and subject to ordinary PR review.

### Retroactive audit

A follow-up PR will fetch each of the 37 existing external link-outs against these
gates. Entries that fail are removed (manifest deleted, collection references cleaned).
Entries that pass are kept as-is. No SKILL.md is written for failing entries — removal
is the correct response, not remediation of someone else's upstream content.

### Ongoing enforcement

New external entries added to the catalog must pass all three gates at PR time. The
PR description for any new external link-out must include:
- Link to the upstream `SKILL.md` showing line count and trigger section
- Tag list justifying the relevance gate
- Date of the most recent upstream commit

`catalog:validate` does not yet enforce these gates programmatically; enforcement is
PR-review until a validator rule is implemented.

## Alternatives considered

| Option | Rejection reason |
|--------|-----------------|
| Keep all 37 external link-outs as-is | Perpetuates "useless" signal; no curation standard means quality drifts further down over time |
| Remove all external link-outs | Already rejected in 2026-06-06 ADR (Option C): loses discovery value for high-quality external skills; the catalog's curation mission includes pointing to good external work |
| Add quality gates (CHOSEN) | Preserves curation value of genuinely good external skills; removes the tail of low-quality entries; matches the "curated, useful tools list" positioning |
| Auto-quality-check in CI | Valuable future work (per the 2026-06-06 revisit condition), but not a substitute for human curation judgment on content quality — a script cannot evaluate whether a skill is genuinely useful |

## Consequences

### Positive
- The catalog's "view at source ↗" links point only to substantive upstream content.
- The quality gate is concrete and checkable at PR time — no subjective judgment needed.
- Removal of low-quality link-outs shrinks the catalog to a tighter, more trustworthy
  set, reinforcing the "curated" positioning.

### Negative
- Retroactive audit requires fetching 37 upstream URLs — one-time cost.
- Some external skills that are borderline (e.g., 28 lines but well-structured) will
  need a judgment call at the depth gate boundary.
- Catalog shrinks on first application; perception may be "we removed content" before
  the quality improvement is felt.

### Neutral
- Re-addition of a removed external skill is low-cost: add the manifest back, verify
  it now passes all gates, open a PR.
- The 18-month freshness gate will cause entries to expire over time as upstreams go
  stale; this is the intended behavior.

## Revisit when

1. **A CI link-checker is implemented** (per 2026-06-06 Revisit 1) — at that point,
   the Freshness gate can be enforced automatically and this ADR's manual process
   is partially superseded.
2. **The ratio of external to forgekit-authored skills exceeds 40%** (currently ~27%)
   — re-evaluate whether the balance between curation breadth and content ownership
   is still correct.
3. **A major upstream (anthropics/skills, obra/superpowers) publishes a stable API**
   — consider whether a registry-integration approach (per 2026-06-06 Option D) is
   now worth the cost.
