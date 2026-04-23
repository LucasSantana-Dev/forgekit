# Branch Strategy

`ai-dev-toolkit-setup` ships on two branches:

| Branch | Audience | Contains |
|---|---|---|
| `main` | **Work environment** | Work-safe installer. No vendor-CLI coupling. `--work-mac` flag for minimum-footprint setups. |
| `personal` | **Personal environment** | Everything on `main` + handoff/resume skill installer + Codex shortcut wiring + richer auto-invoke. |

The `personal` branch is a strict superset of `main`. Sync is mechanical: `git merge main` onto `personal` after every merge to `main`.

## Why split

- **Work environment** (corp Mac, SI review, compliance): audit-friendly, no cross-vendor session handoff, no outbound writes to `~/.codex/` or `~/.claude/handoffs/`. Nothing surprising for infosec.
- **Personal environment**: full-featured — handoff continuity between Claude Code ↔ Codex, session auto-resume, deeper MCP wiring.

Same approach as the companion repo `LucasSantana-Dev/ai-dev-toolkit` (which also ships `main` + `personal`).

## How to install

**Work:**
```bash
git clone -b main git@github.com:LucasSantana-Dev/ai-dev-toolkit-setup.git
cd ai-dev-toolkit-setup
./bootstrap.sh --work-mac
```

**Personal:**
```bash
git clone -b personal git@github.com:LucasSantana-Dev/ai-dev-toolkit-setup.git
cd ai-dev-toolkit-setup
./bootstrap.sh
bash scripts/install-personal-extras.sh   # personal branch only
```

## What differs

`git diff main..personal` should show only:

- `scripts/install-personal-extras.sh` — personal-only installer (handoff/resume, Codex scripts)
- `docs/personal-extras.md` — explainer
- 1-2 line callout at the top of `README.md` pointing to `personal-extras.md`

No divergence in `bootstrap.sh`, `scripts/install-rag.sh`, or any other shared script. Personal extras are strictly additive.

## Keeping branches in sync

Every merge to `main` gets fast-forward-merged into `personal`:

```bash
git checkout personal
git merge main --ff-only
git push
```

CI on `personal` runs the same suite as `main` plus a check that asserts the diff-set is exactly the expected files.
