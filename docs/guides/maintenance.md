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

## Context gate (skill and note reachability)

The `Context gate` workflow runs [hitgate](https://github.com/LucasSantana-Dev/hitgate)'s context gate on every PR that touches `packages/catalog/catalog/` or `packages/core/`. It mines a test case from every skill trigger, auto-invoke phrase and note `description`, ranks all documents with BM25, and fails when Hit@5 drops more than 5 points or when a phrase that used to reach its own document no longer does. A hit means the phrase still finds its document under a lexical proxy, not that the document is good.

Baselines live in `.hitgate/`. Run the gate locally before pushing:

```bash
pip install "git+https://github.com/LucasSantana-Dev/hitgate@d403e5065f27118da801948ff5bba4ba5eeba2d1"
hitgate-context packages/catalog/catalog --baseline .hitgate/context.catalog.json --out /tmp/hg
hitgate-context packages/core --baseline .hitgate/context.core.json --out /tmp/hg
```

The output lists newly unreachable phrases and the documents that now shadow them. Fix the trigger or description, or re-freeze when the change is intended (for example a skill was removed on purpose):

```bash
hitgate-context packages/catalog/catalog --label catalog --out .hitgate
hitgate-context packages/core --label core --out .hitgate
```

Name skill files `SKILL.md` exactly. On Linux a lowercase `skill.md` is mined as a plain note, while Windows matches it as a skill, so the two platforms would disagree.

For a local pre-commit hook without Python, build the static binary from `rust/hitgate-context` in the hitgate repo and use its `hooks/pre-commit` with `HITGATE_CONTEXT_ROOT=packages/catalog/catalog` and `HITGATE_CONTEXT_BASELINE=.hitgate/context.catalog.json`.
