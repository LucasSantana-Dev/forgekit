# Maintenance & quality gates

Maintainer-facing checks for this repo. Users installing the toolkit don't need any of this.

## Validate the toolkit

```bash
npm install
npm test                 # 16 governance tests
npm run lint             # ESLint on scripts and tests
npm run validate         # Schema + config validation
npm run validate:schema  # Schema validation only
```

## Mutation testing (nightly/weekly, not per-PR)

Scoped Stryker run over the only 3 leaf modules with jest coverage
(`scripts/validate-schemas.js`, `scripts/parity-audit.js`,
`scripts/reconcile-backlog-state.mjs`: parsers, validation, classification,
and pure backlog-reconciliation logic). Scope and rationale live in
`stryker.conf.json`.

```bash
npm run test:mutation    # full scoped run; writes reports/mutation/mutation.json
```

Each mutant spawns a jest run, so this is a scheduled quality gate, not a PR
check. Thresholds are informational (high 60 / low 40, `break: null`); treat
survived mutants as a concrete list of missing test cases.

## Pre-flight release checks

```bash
python3 packages/core/tools/release.py \
  --repo /path/to/repo \
  --verify \
  --level patch \
  --notes-file RELEASE_NOTES.md \
  --changelog
```

Checks: git cleanliness, git identity, target tag availability, version detection, notes readiness, changelog, and optional GitHub CLI readiness, all *before any release mutation*.

## Parity audit

Cross-tool feature coverage:

```bash
node scripts/parity-audit.js

# Output example:
# Coverage: claude-code 6/6, cursor 6/6, windsurf 6/6, ...
# Skills: 29 | Configs: 8 | Gaps: 0
```
