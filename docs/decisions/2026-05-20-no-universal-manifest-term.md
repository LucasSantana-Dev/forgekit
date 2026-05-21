# No universal term for per-entry metadata files

**Date:** 2026-05-20  
**Status:** Accepted

## Context

The `Entry` definition in `CONTEXT.md` described each catalog entry as having "a `manifest.json` (or equivalent file)." This was imprecise: the catalog uses three distinct file formats across nine entry kinds.

| Format | Kinds | Loader variable |
|--------|-------|-----------------|
| `manifest.json` (JSON) | skill, hook, command, tool | `manifestPath` (appears in loader) |
| `<id>.yaml` (YAML) | server, collection | no `manifestPath` variable |
| `<id>.md` (Markdown + frontmatter) | agent, doc, tutorial | no `manifestPath` variable |

Evidence from `packages/catalog/scripts/lib/catalog.ts`: the `manifestPath` variable exists only in `loadSkills`, `loadHooks`, `loadCommands`, and `loadTools`. YAML and Markdown loaders iterate their respective file extensions with no reference to "manifest."

`CLAUDE.md` already uses kind-specific language: "agent definition," "server definition," "installable tool."

The question arose: should the glossary adopt a universal canonical term for the per-entry metadata file across all nine kinds?

## Decision

**No universal term.** Use kind-specific language that matches existing codebase conventions:

- "manifest" / `manifest.json` — for JSON-format kinds only (skill, hook, command, tool)
- "definition file" or kind-specific phrasing — for YAML and Markdown kinds, consistent with CLAUDE.md

The `Entry` definition in `CONTEXT.md` must not imply a universal file type.

## Alternatives considered

| Option | Rejected because |
|--------|-----------------|
| Universal "manifest" | `manifestPath` only exists in JSON loaders; extending the term to `.yaml` and `.md` contradicts established codebase language |
| Universal "definition" | Unused in the codebase; introduces a new word where kind-specific names already exist |
| Universal "entry file" | Vague; doesn't help contributors find the right file for a given kind |
| Universal "source file" | Collides with source code connotation |
| Per-kind terms (status quo) | ✅ Matches how loaders, CLAUDE.md, and contributor docs already describe each kind |

## Consequences

- `CONTEXT.md` Entry definition is updated to remove "manifest.json (or equivalent file)"; the entry kind's file path is derivable from `CLAUDE.md` and `packages/catalog/catalog/` directory structure.
- Contributors learn file paths per kind from `CLAUDE.md`'s catalog structure table, not from a glossary universal term.
- The glossary term "Promotion" can describe the workflow without needing to name the file type universally.

## Revisit when

A future contributor is confused by the inconsistency across file formats, or a refactor standardizes all nine kinds to one format.
