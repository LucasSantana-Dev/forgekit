# Decision: adopt js-yaml 5.0.0 with a default→named import migration

- **Date:** 2026-06-22
- **Status:** Accepted
- **Process:** /research-and-decide (the breakage + fix were forced empirically by CI + a local validation run, so this is recorded without a separate critic pass — the evidence is mechanical)
- **Governs:** `js-yaml` dependency + its 2 import sites; supersedes Dependabot PR #274 (PR #276)

## Context

Dependabot #274 bumped `js-yaml` 4.2.0 → 5.0.0. Its CI **failed** on the `Validate catalog, CLI, and web` job with:

```
import yaml from "js-yaml";
SyntaxError: The requested module 'js-yaml' does not provide an export named 'default'
```

js-yaml 5.0.0 is **ESM-first and drops the `default` export** (named exports only). Two call sites used the default:
- `packages/catalog/scripts/lib/catalog.ts`: `import yaml from "js-yaml"`
- `packages/cli/src/commands/add-server.ts`: `const { default: yaml } = await import("js-yaml")`

(`scripts/validate-schemas.js` uses the *different* `yaml` package — unaffected.) The `yaml.load()` API itself is unchanged in v5.

## Decision

**Adopt js-yaml 5.0.0** with a minimal default→namespace import migration:
- `import yaml from "js-yaml"` → `import * as yaml from "js-yaml"`
- `const { default: yaml } = await import("js-yaml")` → `const yaml = await import("js-yaml")`
- Bump `^4.1.0` → `^5.0.0` in `packages/catalog/scripts` + `packages/cli`.

**Verified locally** (the empirical gate): `pnpm catalog:validate` ✓ (the job that failed on #274) and `pnpm cli:typecheck` ✓.

## Alternatives considered
- **Defer / pin js-yaml 4.x.** Rejected: the fix is two mechanical lines and locally validated; pinning leaves the dep a major behind for no benefit.
- **Switch to the `yaml` package** (already used by `validate-schemas.js`) to consolidate on one YAML lib. Deferred — sensible cleanup but out of scope for a dep bump; tracked as a future consolidation.

## Consequences
- (+) Stays current; build green; one of the two held majors cleared.
- (+) Establishes the named-import pattern for js-yaml across the repo.
- (−) Two YAML libraries still coexist (`js-yaml` + `yaml`) — see the deferred alternative.

## Revisit when
- A future js-yaml major changes the `load`/`dump` API (not just module format) → re-evaluate.
- The repo consolidates YAML parsing onto a single library → drop js-yaml.
