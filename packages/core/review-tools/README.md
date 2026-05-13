# Review Tools

Per-repo installer for the multi-repo PR review-tooling stack. Pairs with the org-level reusable workflows in [`LucasSantana-Dev/.github`](https://github.com/LucasSantana-Dev/.github).

## What it installs

| File | Purpose |
|------|---------|
| `.github/workflows/review-tools.yml` | Caller for the org-level Claude review + Danger workflows. Pinned to a central tag. |
| `.coderabbit.yaml` | `profile: chill` config — no nit-spam blocking merges. |
| `dangerfile.ts` | Deterministic rules (lockfile drift, .env leaks, console.log residue, branch prefix, big-PR warnings). Per repo-type variant. |
| `.review-tools-config.json` | Version lockfile read by the forthcoming drift detector. |

## Quick start

```bash
cd /path/to/your-repo
sh /path/to/ai-dev-toolkit/packages/core/review-tools/install.sh
```

The installer auto-detects the repo variant (`ts-monorepo`, `node`, `bash-iac`, `minimal`) from `package.json`, `*.tf` files, etc.

After install, you must:

1. Add `ANTHROPIC_API_KEY` to the repo's GitHub Actions secrets (`Settings → Secrets → Actions → New repository secret`).
2. Customize `dangerfile.ts` for repo-specific rules — the templates are a starting point, not a final spec.
3. Commit and push. The workflow fires on the next PR.

## Variants

| Variant | Auto-detected when | Enforces |
|---------|---------------------|---------|
| `ts-monorepo` | `package.json` + `packages/` exist | Test-coverage-with-source, CHANGELOG on user-facing changes, console.log residue, lockfile sync, .env, branch prefix, big files/PRs |
| `node` | `package.json` without `packages/` | Same as monorepo but with `src/` instead of `packages/*/src/` globs |
| `bash-iac` | `*.tf` / `*.tfvars` present | Terraform state-leak protection, provider lockfile sync, shellcheck reminder, .env protection, branch prefix |
| `minimal` | Anything else | .env protection, big-PR warning, branch prefix only |

Override auto-detection with `--variant <name>`.

## Options

```
sh install.sh --help
```

- `--target <dir>` — install into a different directory (default: pwd)
- `--variant <name>` — force a specific variant
- `--tag <v1>` — pin to a different LucasSantana-Dev/.github tag
- `--dry-run` — print actions without writing
- `--force` — overwrite existing files
- `--uninstall` — remove the 4 installed files
- `--status` — show install state of target repo

## Updates

When the central workflows (`LucasSantana-Dev/.github`) tag a new version, consumer repos pick it up by either:

1. Re-running `install.sh --tag vN --force` (updates the caller workflow's pin)
2. Editing `.github/workflows/review-tools.yml` directly

The dangerfile and `.coderabbit.yaml` are **repo-owned** after install — they won't auto-update. If the installer's templates evolve, run `--status` against your repo to spot drift.

## Related

- ADR: [`docs/decisions/2026-05-10-multi-repo-review-tools-rollout.md`](../../../docs/decisions/2026-05-10-multi-repo-review-tools-rollout.md)
- Central reusable workflows: [`LucasSantana-Dev/.github`](https://github.com/LucasSantana-Dev/.github)
- Pilot consumer: [`LucasSantana-Dev/Lucky` PR #838](https://github.com/LucasSantana-Dev/Lucky/pull/838)
