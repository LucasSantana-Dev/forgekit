---
status: ready-for-execution
audience: owner
---

# Playbook — rename `ai-dev-toolkit` → `forge-kit`

**Who runs this:** the repo owner (this is a destructive GitHub operation).
Claude will not run any of the commands below without explicit approval.

**When to run:** after every open Forge Kit PR is either merged or explicitly
parked, CI on `main` is green, and you've skimmed the "what breaks" section
below.

**Blast radius:** renames the GitHub repository. GitHub keeps redirects for
`git`, `gh`, and web URLs, but **does not** redirect every downstream consumer
automatically — npm, Docker images, docs sites, and pinned Actions may need
updates. Fully reversible via `gh repo rename` back to the old name within
the redirect window.

---

## 0. Pre-flight (one pass, top-to-bottom)

Run these from anywhere with `gh` and `git` installed:

```bash
# 0.1 All PRs merged or explicitly parked
gh pr list --repo LucasSantana-Dev/ai-dev-toolkit --state open
# → empty list, or explicit decisions on each

# 0.2 Default branch is green
gh run list --repo LucasSantana-Dev/ai-dev-toolkit --branch main --limit 5 --json status,conclusion,name
# → every recent run: status=completed, conclusion=success

# 0.3 No open Dependabot security alerts
gh api /repos/LucasSantana-Dev/ai-dev-toolkit/dependabot/alerts --jq '[.[] | select(.state=="open")] | length'
# → 0 (or: accept the alerts you know about)

# 0.4 Local clone is clean + up to date
cd "/Volumes/External HD/Desenvolvimento/ai-dev-toolkit"
git fetch --all
git status                 # clean working tree
git rev-parse HEAD         # matches origin/main

# 0.5 You have admin rights
gh api /repos/LucasSantana-Dev/ai-dev-toolkit --jq .permissions
# → admin=true
```

If any pre-flight fails, fix it before renaming. Do not force through.

---

## 1. The rename itself

```bash
gh repo rename forge-kit --repo LucasSantana-Dev/ai-dev-toolkit --yes
# →  ✓ Renamed repository LucasSantana-Dev/ai-dev-toolkit to LucasSantana-Dev/forge-kit
```

GitHub now:

- Redirects every `github.com/LucasSantana-Dev/ai-dev-toolkit/*` URL to
  `/forge-kit/*`.
- Redirects `git clone`, `git fetch`, `git push` on the old URL for a
  grace period (typically 12+ months; don't rely on it indefinitely).
- Redirects `gh api repos/LucasSantana-Dev/ai-dev-toolkit/*`.

## 2. Update every local clone's remote

Every machine where you have this repo cloned:

```bash
cd "/path/to/your/ai-dev-toolkit"
git remote -v               # shows old URL
git remote set-url origin git@github.com:LucasSantana-Dev/forge-kit.git
git remote -v               # confirm new URL
git fetch                   # confirm the push/pull works
```

Repeat for any **worktrees**, **CI runners** with cached clones, and anyone
else with a clone.

Your workspaces known to have this repo cloned (verify and update each):

```bash
find "/Volumes/External HD/Desenvolvimento" -maxdepth 3 -type d -name .git \
  -exec sh -c 'cd "$(dirname {})" && pwd && git remote -v' \; 2>/dev/null \
  | grep -B1 'ai-dev-toolkit\|forge-kit'
```

## 3. Repo-metadata cleanup

These only matter if you want the new name to be truly canonical in GitHub
searches and tooling:

```bash
# 3.1 Description
gh repo edit LucasSantana-Dev/forge-kit \
  --description "Forge Kit — curated catalog of Skills, MCP servers, agents, hooks, commands, and tools for AI-assisted development"

# 3.2 Homepage
gh repo edit LucasSantana-Dev/forge-kit \
  --homepage "https://forgekit.lucassantana.tech"

# 3.3 Topics
gh repo edit LucasSantana-Dev/forge-kit \
  --add-topic ai-assisted-development \
  --add-topic claude-code \
  --add-topic mcp \
  --add-topic catalog \
  --add-topic monorepo
```

## 4. Inside-repo name references

These live in source files and need a commit on `main`:

```bash
cd "/path/to/forge-kit"
git checkout main && git pull

# Scan every hard-coded reference
rg -n 'ai-dev-toolkit' --glob '!node_modules/**' --glob '!pnpm-lock.yaml' \
    --glob '!package-lock.json' --glob '!CHANGELOG.md'
```

**Known places with the old name today** (scan this list against the rg output):

- `README.md` + `README.pt-BR.md` — the canonical GitHub URLs and the repo
  path in `git clone …` snippets.
- `apps/web/src/layouts/Base.astro` — GitHub link in header + footer
  (`github.com/LucasSantana-Dev/ai-dev-toolkit`).
- `apps/web/src/pages/{index,pt-br/index}.astro` — Quickstart CTA URL (now
  points at `/blob/main/docs/guides/installing.md`, but the repo path in
  that URL is hard-coded).
- `apps/web/astro.config.mjs` — deployment site and base.
- `packages/catalog/package.json` — `repository.url`.
- `packages/catalog/catalog/agents/*.md` — `source.repo` frontmatter.
- `packages/catalog/catalog/skills/*/manifest.json` — `source.repo` +
  `homepage`.
- `packages/catalog/README.md` + `packages/catalog/docs/*.md`.
- `docs/guides/*.md` — cross-links.
- `.github/workflows/*.yml` — any hard-coded repo references.
- `CHANGELOG.md` — release links. **Leave historic entries as-is** for
  accuracy; only update the "Unreleased" section.

Open a PR titled **"chore: update internal references from ai-dev-toolkit →
forge-kit"**. Keep the diff strictly mechanical; do not combine with other
changes.

Verify after the PR merges:

```bash
pnpm --filter @forge-kit/catalog run validate
pnpm --filter @forge-kit/web run build
pnpm test
# All green.
```

## 5. External consumers (scan and update)

- **Other personal repos with submodules / hard-coded URLs** — quick search:
  ```bash
  find ~/.claude/handoffs ~/.claude/memory \
    /Volumes/External\ HD/Desenvolvimento \
    -name '*.md' -maxdepth 4 -exec grep -l 'LucasSantana-Dev/ai-dev-toolkit' {} + 2>/dev/null
  ```
- **Cloudflare Worker** — `apps/web/wrangler.jsonc` has the Worker name
  `ai-dev-toolkit-library`. GitHub rename doesn't affect this; keep it for
  now (spec § "Out Of Scope" notes this explicitly).
- **npm packages** — no public packages today; if that changes, rename
  the npm scope separately and in its own release.

## 6. Rollback (if needed within redirect window)

```bash
gh repo rename ai-dev-toolkit --repo LucasSantana-Dev/forge-kit --yes
```

Also revert your local `git remote set-url`:

```bash
git remote set-url origin git@github.com:LucasSantana-Dev/ai-dev-toolkit.git
```

Then revert the metadata + internal-reference PR.

## 7. Done when

- [ ] `gh repo view LucasSantana-Dev/forge-kit` returns a live repo.
- [ ] `gh repo view LucasSantana-Dev/ai-dev-toolkit` redirects (or 404s after
      the redirect grace period).
- [ ] Your primary clone `git fetch` uses the new URL.
- [ ] The internal-references PR merged.
- [ ] CI green on `main` after the merge.
- [ ] The Forge Kit website deploys under the same custom domain
      (`forgekit.lucassantana.tech`) without code changes.

Then, and only then, proceed to **[playbook-archive-source-repos](./playbook-archive-source-repos.md)**.
