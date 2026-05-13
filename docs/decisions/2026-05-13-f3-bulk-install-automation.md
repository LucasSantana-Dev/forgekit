# ADR: F3 rollout — manual per-repo PRs, no bulk automation

**Date:** 2026-05-13
**Status:** Accepted
**Supersedes / extends:** [2026-05-10-multi-repo-review-tools-rollout](2026-05-10-multi-repo-review-tools-rollout.md) (the parent ADR's F3 phase was under-specified; this ADR settles the mechanism)

## Context

The parent ADR defined F3 ("Bulk roll to remaining repos: Craftvaria, homelab, portfolio, openclaw-sandbox, opencode-autopilot, ai-dev-toolkit-pt-br") but didn't specify HOW the rollout happens. After F1 (Lucky #838) and F2 (forgekit #173) were drafted, the natural follow-up question surfaced: write a `bulk-install.sh` wrapper, a forge-kit subcommand, or just open the PRs by hand.

The `critic` agent ran a multi-perspective review of the leading two options (local bash wrapper vs forge-kit subcommand) and rejected both as premature over-engineering for a solo developer with 6 repos.

## Alternatives considered

| Option | Description | Rejection reason |
|--------|-------------|------------------|
| **A — Manual per-repo PRs (CHOSEN)** | `cd <repo>; sh install.sh; gh secret set ...; gh pr create` for each repo, one at a time, with manual sanity-check on each install | — (chosen) |
| **B — Local `bulk-install.sh` wrapper** | Bash loop with `[y/N]` confirmation per repo; manifest file for resumability | Adds 80+ lines of bash + error handling + secret provisioning + manifest tooling for what is fundamentally a 2-3 hour one-time task. Maintenance cost over 12 months exceeds savings. |
| **C — GitHub Actions workflow in `LucasSantana-Dev/.github`** | Central workflow uses `repository_dispatch` + `gh` to open PRs in each consumer | Requires cross-repo write PAT; split-brain failure modes; more surface area to debug than benefit. |
| **D — `forge-kit review-tools roll-out` subcommand** | Same loop as B, wrapped as a CLI subcommand | Same maintenance cost as B with extra CLI router integration. Discoverability win is meaningless for a one-time op by a solo developer. |
| **E — Per-repo Dependabot-style scheduled workflow** | Each repo runs `install.sh` on a cadence and opens its own PR | Chicken-and-egg: needs the workflow installed everywhere first. Overkill for the rollout itself; would be a separate decision if the install gets ongoing updates. |

## Decision

**Adopt Option A: manual per-repo PRs, gated by 4 prerequisite checks.**

### Prerequisite gates (all must pass before opening any consumer PR)

| Gate | Definition | Validation |
|------|------------|------------|
| **G1** | Lucky #838 merged into `release/v2.10.0` AND ≥10 green CI runs on the caller workflow | `gh pr view 838 --json state,mergedAt` + `gh run list --workflow review-tools.yml --status success` |
| **G2** | forgekit PR #173 merged into `main` | `gh pr view --repo LucasSantana-Dev/forgekit 173 --json state` |
| **G3** | F4 drift detector implemented in `LucasSantana-Dev/.github`, tested on Lucky | scheduled workflow file exists in central repo + has run at least once with a clean exit |
| **G4** | Manual dry-run + variant validation against all 6 repos, with overrides documented for any mis-detected repos | `--dry-run --status` output recorded in a follow-up to this ADR or in `forgekit:packages/core/review-tools/README.md` |

Today's dry-run (2026-05-13) already surfaced:
- **homelab** mis-detected as `minimal` instead of `bash-iac` → needs `--variant bash-iac` override at install time
- **ai-dev-toolkit-pt-br** detected as `node`; may need `--variant ts-monorepo` if it mirrors the parent monorepo structure
- All others detected correctly (Craftvaria, portfolio, opencode-autopilot → `node`; openclaw-sandbox → `minimal`)

### Per-repo rollout sequence

For each of the 6 target repos:

1. `cd` to repo, `git checkout main && git pull` (clean baseline)
2. `git checkout -b chore/install-review-tools`
3. `sh forgekit/.../install.sh` (add `--variant <X>` per the override map)
4. `gh secret set ANTHROPIC_API_KEY` (before PR open — avoids first-run CI failure)
5. Skim `dangerfile.ts` and delete rules that don't apply (per dangerfile-customization checklist, to be added to forgekit README in a follow-up to PR #173)
6. `git add -A && git commit -m "chore: install review-tools (forgekit F3)"`
7. `gh pr create --base main` with body linking to this ADR + parent ADR
8. Wait for CI green, address review comments, merge
9. Update this ADR's rollout log with PR # + merge SHA

Estimated: 20-30 min per repo × 6 = 2-3 hours total spread over the week after gates clear.

## Consequences

### Positive
- **Zero new tooling to maintain.** No `bulk-install.sh`, no subcommand router changes. The installer (`install.sh`) is the only new artifact.
- **Per-repo audit trail.** Each rollout is a normal PR with normal CI and normal review. 6 months from now, `git log --follow .github/workflows/review-tools.yml` in any repo tells the full story.
- **Forces dangerfile customization per repo.** Critic's MAJOR finding (#1) was that the templates are a black box post-install. Manual PRs make customization a real step, not a skippable one.
- **Catches G4 surprises early.** The homelab variant mis-detection surfaced today — automation would have shipped the wrong dangerfile silently.

### Negative
- **2-3 hours of manual work.** Not a real cost for a solo developer doing this once.
- **Inconsistent dangerfile rules across repos.** Each repo customizes its own; review-tools.md and the dangerfile customization checklist must stay current to keep them coherent.
- **No mechanism to push central changes back through.** If the installer's templates evolve (e.g. `ts-monorepo` gains a new rule), consumer repos won't pick it up without re-running install. Mitigated by F4 drift detector (tracked separately).

### Neutral
- The decision is reversible. If F3 reveals that rollout pattern is repeated 3+ times per year (e.g., new repos added often, or installer updates pushed quarterly), revisit and consider Option B.

## Revisit when

1. **The rollout becomes a recurring operation** (e.g., 3+ repos installed per quarter from forge templates) → automate via Option B with the gaps identified by critic (error handling, secret provisioning, dry-run, resumability, per-repo variant override map).
2. **An organization is added under `LucasSantana-Dev` umbrella** → org-level secrets remove the ANTHROPIC_API_KEY replication burden, which changes the cost-benefit on automation.
3. **One of the 4 prerequisite gates is repeatedly hard to satisfy** (e.g., F4 drift detector keeps slipping, or Lucky's CI churns false positives) → reconsider the gating criteria, not the rollout mechanism.

## Open items captured from critic

These are tracked as separate work, NOT blockers for F3 once the 4 gates pass:

- [ ] Add dangerfile customization checklist to forgekit README (per-repo-type guidance)
- [ ] Add comment in `detect_variant()` noting homelab-style edge cases require `--variant` override
- [ ] Define `.review-tools-config.json` schema explicitly (currently underspecified for F4)
- [ ] Document the pilot bake-window's "ship or kill" date (avoid open-ended gating)
- [ ] Pre-flight check in `install.sh`: warn if `ANTHROPIC_API_KEY` is not present in repo secrets (`gh secret list | grep`)

## Rollout log

| Repo | PR # | Merged | Variant used | Notes |
|------|------|--------|--------------|-------|
| Craftvaria | — | — | node | pending G1-G4 |
| homelab | — | — | bash-iac (override) | pending G1-G4 |
| portfolio | — | — | node | pending G1-G4 |
| openclaw-sandbox | — | — | minimal | pending G1-G4; verify stack first |
| opencode-autopilot | — | — | node | pending G1-G4 |
| ai-dev-toolkit-pt-br | — | — | TBD | confirm `node` vs `ts-monorepo` against parent layout |
