---
name: dep-lifecycle
description: Full dependency lifecycle composite — audit known vulnerabilities, triage by severity and breaking-change risk, upgrade targeted packages, verify tests pass, ship PR. Use monthly, before releases, or when dependency alerts are stacking. Never do a blanket upgrade; always triage first.
triggers:
  - dep lifecycle
  - dependency audit
  - update dependencies
  - dependabot triage
  - bump deps
  - audit dependencies
---

# dep-lifecycle

Full dependency lifecycle: audit → triage → upgrade → verify → ship.

## Auto-invocation triggers

- User asks "update deps", "triage dependabot", "bump dependencies"
- Dependency alerts stacking before a release
- Monthly hygiene sweep

## Workflow

### Phase 1 — Audit (always)

Run the scanner for the stack:

```bash
npm audit --json           # Node
pip-audit                  # Python
bundle audit               # Ruby
cargo audit                # Rust
```

Fetch open dependency PRs if on GitHub:
```bash
gh pr list --label "dependencies" --json number,title,headRefName
```

Output: vulnerabilities ranked by severity + stale packages by version lag.

### Phase 2 — Triage (always)

Classify each finding:

| Class | Trigger | Action |
|---|---|---|
| CVE critical/high | CVSS ≥7 | Upgrade now; include in this sweep |
| Breaking major | semver major | Separate PR; read migration guide first |
| Routine minor/patch | semver minor/patch | Batch into one PR |
| No upstream fix | vuln with no fix | Document + open issue; do not block sweep |

Skip any dependency where the vulnerable API is provably not called (grep for usage; zero hits → dismiss rather than patch).

### Phase 3 — Upgrade (targeted, not blanket)

Upgrade each targeted package individually:
```bash
npm install <pkg>@<target>    # or pip install --upgrade <pkg>
```

Run a smoke check after each upgrade:
```bash
npm run build && npm test -- --testPathPattern="<related-area>"
```

Do NOT run `npm update` or `pip install --upgrade-all` — that mixes unrelated changes into one diff.

### Phase 4 — Verify

Run full quality gates. If tests fail after an upgrade: isolate the breakage to the specific package, revert it, open a follow-up issue. Do not block the whole sweep for one hard upgrade.

### Phase 5 — Ship

Open PRs per batch:
- **Patches + minors:** one PR with all low-risk upgrades
- **Majors:** one PR per major (separate review context)

PR title: `chore(deps): bump <package(s)> to <version(s)>`

PR body must include: what changed per package, CVE IDs addressed, any migration notes, CI gate results.

## Reconciliation

```
DEP LIFECYCLE — <date>

Phase 1 Audit:   N vulnerabilities, M stale packages ✅ DONE
Phase 2 Triage:  X critical/high, Y routine, Z dismissed (not called) ✅ DONE
Phase 3 Upgrade: <packages + versions> ✅ DONE
Phase 4 Verify:  PASS | <N packages reverted> ✅ DONE
Phase 5 Ship:    PR(s) <numbers> ✅ DONE

Deferred:
  - <pkg> — <reason> (issue: <N>)
```

## Failure / Stop Conditions

- Phase 2: if a CVE with no upstream fix IS actively called in the codebase → halt, escalate to user before continuing.
- Phase 3: if a major upgrade breaks >2 test files → revert that package, document in reconciliation, continue with the rest.
- Phase 4: do not ship if any required gate is red due to an upgrade in this sweep.
- Never batch a major upgrade with routine patches — it makes the diff unreviable.

## Memory Hooks

- Read memory for prior upgrade decisions on the same package (e.g., "held major pending integration coverage").
- Write memory if a major upgrade is held or dismissed — future sweeps need the reason.
