# ADR: Multi-repo PR review tools rollout strategy

**Date:** 2026-05-10
**Status:** Accepted (pilot phase)
**Scope:** All repos under `~/Desenvolvimento/` — Lucky, ai-dev-toolkit, Craftvaria, homelab, forge-space, etc.

## Context

The `Lucky/chore/review-tools-revamp` PR (#838) introduced a tightened PR-review stack — `.coderabbit.yaml` (chill profile), `.github/workflows/claude-review.yml` (Claude PR reviewer), `.github/workflows/danger.yml` + `dangerfile.ts` (deterministic rules). The motivation was that Greptile's trial cap was reached, CodeRabbit's default profile flooded PRs with nits that flipped the merge gate to `CHANGES_REQUESTED`, and the merge rule in `~/.claude/standards/workflow.md` ("green CI + reviewers approved") was being silently dishonored.

The same problem exists in every other repo — every PR gets the same broken gate behavior. Distributing the same tooling to ~10 repos by hand is tedious; doing it in a way that drifts after 6 months is worse.

## Alternatives considered

| Option | Description | Rejection reason |
|--------|-------------|------------------|
| **A — Manual copy-paste** | Copy the 4 files into each repo, update by hand | Drift inevitable; 6-month half-life on consistency |
| **B — Installer profile only** | Add `forge-kit install --review-tools` that copies all 4 files | Profile maintenance overhead grows with repo-type variance; updates require re-running installer in each repo; no version tracking; lock-in to Lucas's installer with high switching cost |
| **C — Reusable workflows only** | Centralize workflows in `LucasSantana-Dev/.github`; each repo has 5-line caller. Skip `.coderabbit.yaml` / `dangerfile.ts` distribution | Doesn't solve dotfile drift; secrets-replication still manual; centralized failure domain |
| **D — GitHub starter workflows** | Native `.github/workflow-templates/`-driven repo creation | Only fires at repo creation, no live updates; insufficient for retrofitting existing repos |
| **E — Hybrid: reusable workflows + installer for dotfiles** (preliminary — see F) | Reusable workflows for CI logic, separate installer for `.coderabbit.yaml` + `dangerfile.ts` | Doesn't track versions across consumers; no drift detection — superseded by F |
| **F — Hybrid + version lockfile** (CHOSEN) | E plus `.review-tools-config.json` lockfile and a weekly drift-detector | — (chosen below) |

## Decision

**Adopt Option F: Hybrid — reusable workflows for CI logic, installer profile for dotfiles, version lockfile for drift tracking.**

Concretely:

1. **Reusable workflows live in `LucasSantana-Dev/.github`:**
   - `.github/workflows/claude-review.yml` (callable from any consumer)
   - `.github/workflows/danger.yml` (callable from any consumer)
   - Updates here propagate when consumer re-runs CI (no per-repo edit needed for action SHA / image bumps)

2. **Per-repo dotfiles via `forge-kit install --review-tools`:**
   - `.coderabbit.yaml` (repo-specific path filters, base branches)
   - `dangerfile.ts` (repo-specific conventions: TS-only repos get TS rules, Bash/IaC repos get Bash rules — no conditional logic in a single template)
   - `.github/workflows/review-tools-caller.yml` (5-line caller pointing at central reusable workflows)

3. **Version lockfile** at `.review-tools-config.json` per consumer repo:
   - Pins Danger.js version, Claude action SHA, CodeRabbit config version
   - Read by the F4 drift detector (forthcoming scheduled workflow in `LucasSantana-Dev/.github`); future installer enhancement may add a `--check-updates` flag, but not part of the F2 deliverable

4. **Weekly drift detector** as a scheduled workflow in `LucasSantana-Dev/.github`:
   - Scans all consumer repos' `.review-tools-config.json`
   - Opens issues in repos that lag behind central versions

## Consequences

### Positive
- **Workflow logic centralized**: action SHA bumps, prompt tuning, timeout adjustments propagate without 10 PRs.
- **Repo-specific dangerfile rules are explicit**: a Bash-only IaC repo's dangerfile won't pretend to enforce Jest conventions.
- **Lower lock-in than B**: GitHub reusable workflows are a platform primitive; consumers can fork the central repo at any time.
- **Drift becomes visible**: lockfile + scheduled detector turn silent drift into actionable issues.

### Negative
- **Secret replication overhead**: each consumer repo must add `ANTHROPIC_API_KEY` (and others) to its Actions secrets. No automated sync. Mitigation: documented setup checklist in `forge-kit` profile output + manual quarterly audit.
- **Centralized failure domain**: a force-push to `LucasSantana-Dev/.github` could break all consumers' CI simultaneously. Mitigation: `LucasSantana-Dev/.github` requires PR review for any change; pin caller workflows to specific tags (`@v1`) not `@main` once the workflow is stable.
- **More moving parts than B**: 3 layers (central workflows, installer profile, lockfile) vs 1 (installer). Extra cognitive cost when onboarding a new repo.
- **Two-touch update model**: consumers MUST re-run CI to pick up workflow updates; no auto-rebuild.

### Neutral
- 4 files per repo become 3 files + 1 caller workflow. Net file count unchanged.
- The dangerfile customization burden is real but explicit — was hidden in option B.

## Revisit when

Re-evaluate this ADR if any of these become true:

1. **More than 3 of 10 consumer repos drift past the lockfile-tracked versions for >30 days** — the drift-detector isn't enough; need stricter enforcement (e.g. PRs auto-opened by the detector).
2. **GitHub deprecates or rate-limits reusable workflows for org-private repos** — would force fallback to copying workflow YAML into each repo (closer to Option B).
3. **Anthropic action API breaks compatibility** — central reusable workflow becomes a single point of failure; may want a multi-vendor abstraction (Qodo Merge fallback).
4. **Secret-replication burden becomes painful** (>1 hour/quarter to audit) — investigate GitHub Organizations + org-level secrets to remove the manual sync.
5. **A repo emerges that doesn't fit the polyglot template** (e.g. pure documentation site, monorepo of 50 packages) — the dangerfile template may need a repo-type plugin system.

## Pilot status (2026-05-10)

- **Lucky** — review-tools landed in `chore/review-tools-revamp` (PR #838); not yet merged. Treated as the canonical reference dangerfile.
- **ai-dev-toolkit** — F1 not started. Will pilot as the second repo once #838 merges and the central reusable workflow is staged.
- **Other repos** — frozen pending pilot completion.

## Related

- `~/.claude/standards/workflow.md` — Merge rule that this tooling enforces.
- `Lucky:docs/review-tools.md` — Tool inventory and rationale (Lucky-specific).
- `~/.claude/projects/-Users-lucassantana/memory/free-tools-analysis.md` — Original 2026-03-07 OSS tools audit.
- Critic review (2026-05-10 conversation): the no-go on pure Option B and pure Option E.
