---
status: ready-for-execution
audience: owner
depends-on: playbook-rename.md
---

# Playbook — archive `ai-dev-toolkit-setup`, `ai-dev-toolkit-pt-br`, `ai-dev-toolkit-library`

**Who runs this:** the repo owner.
**When:** after the rename playbook is done, the monorepo has shipped one
release since, and a green bootstrap from the monorepo is verified.

**Archive, don't delete.** `gh repo archive` is reversible (`gh repo unarchive`).
Deletion is not. Per the parent spec, "old repos become read-only pointers
after one successful monorepo release and one successful setup bootstrap from
the monorepo."

---

## 0. Pre-flight

```bash
# 0.1 Rename playbook completed
gh repo view LucasSantana-Dev/forge-kit --json name --jq .name
# → forge-kit

# 0.2 One monorepo release tag exists after the rename
gh release list --repo LucasSantana-Dev/forge-kit --limit 3

# 0.3 One green bootstrap from the monorepo
# Run packages/setup/scripts/* (or bin/init) on a clean machine, end-to-end.
# Document the run in docs/specs/2026-04-22-toolkit-monorepo-rebrand/bootstrap-verification.md
# (or link to a GitHub Actions run that did it).

# 0.4 Source repos have no open PRs
for repo in ai-dev-toolkit-setup ai-dev-toolkit-pt-br ai-dev-toolkit-library; do
  echo "=== $repo ==="
  gh pr list --repo "LucasSantana-Dev/$repo" --state open
done

# 0.5 Source repos have no unresolved issues
for repo in ai-dev-toolkit-setup ai-dev-toolkit-pt-br ai-dev-toolkit-library; do
  echo "=== $repo ==="
  gh issue list --repo "LucasSantana-Dev/$repo" --state open --limit 20
done
# → resolve, migrate to forge-kit, or leave a one-line "moved to forge-kit" close
```

---

## 1. Add a redirect README to each source repo

For each of the 3 repos, replace (or prepend) the top of the README. Do this
as a one-commit PR per repo so the history shows the move.

Template:

```markdown
# <repo-name> — moved to Forge Kit

This repository was consolidated into the Forge Kit monorepo on
**2026-04-??**. It is now **archived** and will not receive further updates.

**New canonical location:**
→ https://github.com/LucasSantana-Dev/forge-kit

**What moved where:**

| This repo | In Forge Kit |
|---|---|
| <original path> | <new path under packages/ or apps/ or locales/> |

**If you had this repo bookmarked:**
- `git remote set-url origin git@github.com:LucasSantana-Dev/forge-kit.git`
- Pin to the pre-archive commit (`<SHA>`) if you need the legacy layout.

**Questions / issues:** file them at the new location.
```

Specific mappings to put into each README's table:

**`ai-dev-toolkit-setup`**
```
ai-dev-toolkit-setup/*  →  packages/setup/
```

**`ai-dev-toolkit-pt-br`**
```
ai-dev-toolkit-pt-br/<package>/*  →  locales/pt-BR/<package>/
```

**`ai-dev-toolkit-library`**
```
ai-dev-toolkit-library/catalog/   →  packages/catalog/catalog/
ai-dev-toolkit-library/schemas/   →  packages/catalog/schemas/
ai-dev-toolkit-library/cli/       →  packages/cli/
ai-dev-toolkit-library/web/       →  apps/web/
ai-dev-toolkit-library/gateway/   →  infra/gateway/
```

Commit each as a single PR titled **"docs: point to Forge Kit monorepo"**.
Merge, do not auto-delete branches (you want the commit in the archived
repo's history).

## 2. Archive each repo

**Only after the redirect README merges.**

```bash
for repo in ai-dev-toolkit-setup ai-dev-toolkit-pt-br ai-dev-toolkit-library; do
  gh repo archive "LucasSantana-Dev/$repo" --yes
done
```

Verify:

```bash
for repo in ai-dev-toolkit-setup ai-dev-toolkit-pt-br ai-dev-toolkit-library; do
  gh repo view "LucasSantana-Dev/$repo" --json isArchived --jq "\"$repo archived=\(.isArchived)\""
done
# → all isArchived=true
```

Archived repos are read-only. Issues, PRs, and pushes are blocked until
unarchived.

## 3. Metadata cleanup on archived repos

```bash
for repo in ai-dev-toolkit-setup ai-dev-toolkit-pt-br ai-dev-toolkit-library; do
  gh repo edit "LucasSantana-Dev/$repo" \
    --description "Archived — consolidated into LucasSantana-Dev/forge-kit on 2026-04-??" \
    --homepage "https://github.com/LucasSantana-Dev/forge-kit"
done
```

## 4. Final tidy

- Update `forge-kit/README.md` with an "Ecosystem heritage" section listing
  the 3 archived repos and their SHAs at the time of archival.
- Close out the parent spec: mark the final task done, move the spec to
  `docs/specs/archived/2026-04-22-toolkit-monorepo-rebrand/`.
- Update `docs/roadmap.md` (auto-generation should pick this up).

## 5. Do **not** delete

Leave the archived repos in place indefinitely. Reasons:

- GitHub's rename redirect (from step 1 of the rename playbook) preserves
  most URL continuity, but deleting the archived repos breaks any
  remaining direct refs.
- External blog posts, wiki pages, and training data reference the old
  URLs; an archived repo serves a read-only README; a deleted repo returns
  404 and blocks search-indexing of the redirect.
- Storage cost is negligible.

## 6. Rollback

If, after archival, you find you need to push one more change to an
archived repo:

```bash
gh repo unarchive "LucasSantana-Dev/<repo>" --yes
# ... make the change + PR ...
gh repo archive "LucasSantana-Dev/<repo>" --yes
```

Keep archive / unarchive cycles rare — each one weakens the "this is frozen"
signal to outside consumers.

## 7. Done when

- [ ] Each of the 3 repos has a redirect-README merged.
- [ ] Each of the 3 repos shows `archived=true` in `gh repo view`.
- [ ] Each of the 3 repos has its description updated to the archival
      notice.
- [ ] `forge-kit/README.md` has the "Ecosystem heritage" section.
- [ ] `docs/specs/2026-04-22-toolkit-monorepo-rebrand/tasks.md` has the
      final task checked off and is moved to `docs/specs/archived/`.
