# `deprecated` field has no active behavior

**Date:** 2026-05-20  
**Status:** Accepted

## Context

The catalog schemas (skill, hook, command, tool, server, agent) all declare a
`deprecated` boolean field with `default: false`. The field is propagated to
`index.json` by `generate-index.ts`. A reasonable contributor assumption is that
setting `deprecated: true` on a catalog entry causes it to be hidden from search,
excluded from `adtl list`, or blocked from `adtl install`.

Evidence from the codebase:

| Surface | Behavior |
|---------|---------|
| `packages/catalog/scripts/generate-index.ts` | Passes through `deprecated` to index; no filtering |
| `packages/cli/src/commands/list.ts` | No filter on `deprecated`; deprecated entries appear in `adtl list` |
| `packages/cli/src/commands/install.ts` | No check on `deprecated`; deprecated entries are installable without warning |
| `apps/web/src/` | No references to `deprecated` at all; web UI shows all entries equally |

The `skill-md-adoption` skill describes a date-typed `deprecated` field in *local*
SKILL.md frontmatter (different context: local skill lifecycle, not catalog manifest).
That description does not apply to the catalog's `deprecated: boolean`.

## Decision

**No action taken.** The `deprecated` field remains inert — it is schema
infrastructure declared in advance of a filtering implementation that does not yet
exist. This decision records the current state explicitly so contributors are not
misled into assuming `deprecated: true` hides or disables an entry.

A future PR that implements active behavior for this field (CLI warning, web UI
badge, `adtl list` filter) must update this ADR to reflect the new state.

## Alternatives considered

| Option | Rejected because |
|--------|-----------------|
| Remove `deprecated` from schemas | Would break any manifest already using the field; removing is more disruptive than keeping an inert field |
| Implement filtering now | Out of scope for this grill session; deferred to a dedicated PR |
| Warn contributors in CONTEXT.md | `deprecated` is schema behavior, not domain vocabulary; the ADR is the right home |

## Consequences

- Contributors who set `deprecated: true` on a catalog entry will see no change
  in CLI or web UI behavior until a filtering implementation ships.
- `CONTEXT.md` does NOT define "Deprecated" as a glossary term — it is not yet
  a live domain concept with observable behavior.
- The `IndexEntry.deprecated?: boolean` field in `packages/cli/src/lib/catalog.ts`
  is the hook point for future filtering.

## Revisit when

A PR implements active behavior for `deprecated: true` — at that point, "Deprecated"
becomes a domain concept worth adding to CONTEXT.md with a precise definition of what
it does (hide from list, block install, show web badge, or some combination).
