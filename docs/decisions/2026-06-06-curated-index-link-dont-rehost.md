# ADR: Curated index — link to external skills, don't re-host them

**Date:** 2026-06-06
**Status:** Accepted

## Context

forgekit is positioned as a **curated, useful tools list** (inspired by skills.sh and
mcpmarket.com), not an exhaustive mirror of every skill that exists. Yet the catalog had
drifted toward re-hosting: of the ~155 published skill manifests, **37 stored a full
`SKILL.md` body copy vendored from other people's repositories** — 13 from
`anthropics/skills`, 12 from `obra/superpowers`, 12 from `alirezarezvani/claude-skills`
(~365 KB of duplicated content).

Re-hosting other authors' skills has real costs: the copies go stale the moment upstream
changes, forgekit takes on implicit maintenance/attribution of content it didn't write,
and the catalog reads as "everything" rather than "the curated set worth knowing about."
Every external manifest already carried `source.repo` + `ref` + `path` + `homepage`, so
the provenance to link out was present — only the redundant body needed to go.

## Alternatives considered

| Option | Description | Rejection reason |
|--------|-------------|------------------|
| **A — De-vendor externals → link to source (CHOSEN)** | Drop the 37 vendored `SKILL.md` bodies; keep the manifests as curated link-out entries; install fetches the body from upstream on demand; web shows "view at source" | — (chosen) |
| **B — Keep vendoring everything** | Status quo — store a copy of every catalog skill | The drift, staleness, and "list everything" framing this ADR exists to reverse. A copy of someone else's skill is wrong within days of their next commit. |
| **C — Remove external skills from the catalog entirely** | Only list forgekit-authored skills | Loses curation value — the point of a curated list is to surface the good external tools too, not hide them. Discovery is the product. |
| **D — Add a bespoke `skills.sh` URL source type + scrape/sync** | Integrate with skills.sh as a content source | Over-engineered. `source.type: git` already resolves to upstream content; a registry-specific integration is new surface area for no extra benefit today. |

## Decision

**Adopt Option A.** External skills stay in the catalog as **curated references that link to
their source**; forgekit stores manifests, not bodies, for content it didn't author.

Scope of "external" = `source.type: git` whose `source.repo` is **not** the forgekit repo.
forgekit-authored skills (86) and unsourced skills (32) keep their bodies unchanged — only
the 37 externally-authored skills were de-vendored.

### Mechanism

- **Catalog**: each external skill keeps `<id>/manifest.json` (with `source` + `homepage`);
  the `<id>/SKILL.md` body copy is removed. `catalog:validate` passes — bodies are not
  required by the schema.
- **CLI (`forge install`)**: when a skill body is not vendored locally, fetch it from the
  upstream source on demand — `raw.githubusercontent.com` built from
  `source.repo`/`ref`/`path` — instead of erroring. Install still works; forgekit pulls
  from upstream rather than serving a copy.
- **Web (`skills/[id]`)**: a body-less skill renders *"maintained upstream — View the full
  skill at source ↗"* with a clickable link; forgekit-own skills render their body as before.

### Invariant

forgekit re-hosts only content it authored. A skill sourced from another repo is **listed
and linked, never copied**. New external additions to the catalog must follow this pattern
(manifest + `source` + `homepage`, no vendored `SKILL.md`).

## Consequences

### Positive
- **No stale copies.** External skills always resolve to upstream's current version at
  install time; forgekit can't ship a months-old fork of someone's skill.
- **Honest curation + attribution.** The catalog is a curated index that credits and links
  to authors, not a re-host. Matches the skills.sh/mcpmarket framing.
- **Smaller, clearer repo.** ~365 KB of duplicated bodies gone; the diff to review when a
  skill is added/removed is a manifest, not a vendored markdown blob.
- **Install still works** for external skills (fetched from source), so discoverability is
  preserved without the hosting cost.

### Negative
- **Install now needs network for external skills.** `forge install <external>` fetches from
  GitHub raw at install time; offline installs of external skills fail (own skills are
  unaffected). Acceptable — installation is inherently an online operation.
- **Upstream can break a link.** If an upstream repo moves/renames the file or deletes the
  ref, the fetch 404s. Mitigated: the CLI prints the `homepage` on failure; a future
  link-checker could flag dead sources.
- **Two rendering paths in the web detail page** (body vs link-out) to keep in sync.

### Neutral
- Reversible per skill: re-vendoring a body is just re-adding the `SKILL.md`.
- `source.type: vendored` remains available in the schema for the rare case forgekit
  deliberately wants a pinned copy.

## Revisit when

1. **External link rot becomes common** (several dead `source` URLs) → add a CI link-checker
   over external manifests, and/or a `vendored` fallback for high-value skills that pins a
   copy with an explicit "snapshot of <ref>" note.
2. **skills.sh exposes a stable per-skill API/URL** → consider linking `homepage` at the
   skills.sh entry rather than the raw source repo, for richer discovery.
3. **An external author requests removal or changes license** → de-listing is a manifest
   delete; no body to scrub.
4. **forge install's on-demand fetch proves too slow/fragile at scale** → reconsider a
   pinned `vendored` snapshot model with a refresh command.

## Affected change

- Commit de-vendoring the 37 externals + CLI/web support (this branch,
  `feat/catalog-v0.24.0-skill-refresh`).
- Verified: `catalog:validate` ✅, `cli:typecheck` ✅, `web:build` ✅ (297 pages; external
  pages render the source link, own pages render their body).
