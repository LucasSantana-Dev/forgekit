---
status: active
audience: maintainers
reading_time: 8 min
---

# Secret hygiene — pre-commit gitleaks

How to stop committing tokens by accident on any repo, in under 5 minutes. Three
drop-in styles (pick the one that fits the repo), plus a ready-to-copy
`.gitleaks.toml` base config with an allowlist pattern for common test
fixtures.

## Why pre-commit (and not just CI)

Forge Kit's CI runs **TruffleHog + GitGuardian + Semgrep** on every PR —
catches secrets before merge. Pre-commit catches them before they **leave your
laptop**. Both matter:

- CI-only: a leaked token is in your local `.git` history (rotatable, but
  awkward) and, if the push hits a public mirror or a misbehaving remote,
  technically already exposed.
- Pre-commit: caught before `git commit` completes. Token never enters history.

Use both. Pre-commit is the cheap line of defence.

## Install `gitleaks`

```bash
# macOS
brew install gitleaks
# Linux (x86_64)
curl -sL https://github.com/gitleaks/gitleaks/releases/latest/download/gitleaks_linux_x64.tar.gz | tar xz -C /usr/local/bin gitleaks
```

Verify: `gitleaks version` should print `≥ 8.30`.

## Pick a hook style

```
your repo already has…       → use style…
─────────────────────────────────────────────
husky/ (Node project)        → A. Husky + lint-staged
.pre-commit-config.yaml      → B. pre-commit framework
neither                      → C. plain git hook script
```

All three run the same underlying command: `gitleaks protect --staged`. The
differences are just how the hook is registered.

### A — Husky + lint-staged (Node projects)

`.husky/pre-commit` already exists. Append this step after your
`lint-staged` line:

```bash
# .husky/pre-commit
pnpm exec lint-staged
gitleaks protect --staged --no-banner --redact --exit-code 1
```

Or register it once via husky CLI:

```bash
npx husky add .husky/pre-commit "gitleaks protect --staged --no-banner --redact --exit-code 1"
chmod +x .husky/pre-commit
```

Drawback: every contributor needs gitleaks installed locally. Document it in
`CONTRIBUTING.md`.

### B — pre-commit framework (Python-shop / polyglot repos)

Already have `.pre-commit-config.yaml`. Add a local hook entry:

```yaml
# .pre-commit-config.yaml — add under `repos:`
  - repo: https://github.com/gitleaks/gitleaks
    rev: v8.30.1
    hooks:
      - id: gitleaks
```

Then `pre-commit install` once.

The official repo pins gitleaks itself — contributors don't need to install it
separately; pre-commit manages the binary.

### C — Plain git hook (everything else, zero deps)

For a repo with no hook framework, drop this into `.git/hooks/pre-commit`
(local only, not checked in) or — better — into `.githooks/pre-commit` and
ask contributors to run `git config core.hooksPath .githooks` once:

```bash
#!/usr/bin/env bash
# .githooks/pre-commit — secret-scan the staged diff. Exit 1 blocks the commit.
set -euo pipefail
if ! command -v gitleaks >/dev/null 2>&1; then
  echo "gitleaks not installed — skipping secret scan."
  echo "  Install: brew install gitleaks  (or see https://github.com/gitleaks/gitleaks)"
  exit 0
fi
gitleaks protect --staged --no-banner --redact --exit-code 1
```

`chmod +x` the file. Commit it. Ship.

## Ready-to-copy `.gitleaks.toml`

Drop this at the repo root. It extends the default ruleset and allowlists the
patterns test fixtures typically carry.

```toml
# .gitleaks.toml — extend default rules + allowlist for obvious test fixtures.
[extend]
useDefault = true

[allowlist]
description = "Test fixtures, example placeholders, CI dummies"
paths = [
  # Unit/integration test files — expected to contain bait tokens.
  '''tests?/.*\.(py|ts|tsx|js|mjs|cjs|go|rs|sh)$''',
  '''.*\.test\.(py|ts|tsx|js|mjs|cjs|go|rs)$''',
  '''.*\.spec\.(py|ts|tsx|js|mjs|cjs|go|rs)$''',
  # Documentation, examples, fixtures
  '''docs/.*\.md$''',
  '''examples?/.*''',
  '''fixtures?/.*''',
  # Env templates, NOT .env itself
  '''\.env\.example$''',
  '''\.env\.template$''',
  '''\.env\.sample$''',
]
regexes = [
  # Generic placeholder literals
  '''<(?:REDACTED|YOUR_[A-Z_]+|TOKEN|KEY|SECRET)>''',
  '''(?i)xxxxx+''',
  '''(?i)your[_-](?:token|key|api[_-]key|secret)''',
  # Common test-vector patterns
  '''test_(?:token|secret|password|key)_[A-Za-z0-9_-]+''',
  '''example[_-](?:token|key|secret)''',
  # Stripe test tokens (they start with sk_test_, not sk_live_)
  '''sk_test_[A-Za-z0-9]{10,}''',
  # JWTs with alg=none (structurally fake)
  '''eyJhbGciOiJub25lIn0\..*''',
]
```

**Tighten, don't loosen.** The defaults above are broad so the hook doesn't
annoy you on day one. When a real leak happens, audit whether an allowlist
entry was too permissive and narrow it.

## Allowlist a *specific* leak without relaxing rules

When a known, verified-fake token hits a real source file (not a test/fixture),
add a **per-occurrence** fingerprint to `.gitleaksignore`:

```bash
# Get the fingerprint from a gitleaks run
gitleaks detect --report-format json | jq -r '.[].Fingerprint'

# Drop it in .gitleaksignore (one fingerprint per line)
echo "<fingerprint>" >> .gitleaksignore
```

Fingerprints include the rule ID, file path, and a hash of the secret — so
they're stable and don't suppress other leaks in the same file.

## Verify the hook is wired

Write a short file whose contents match a real-looking Stripe or AWS key
pattern — gitleaks's default ruleset will catch the common ones. Do not
paste the pattern inline in any docs or commit messages (GitHub's own push
protection will block it, and you'd be modeling what this guide tells you
not to do).

One-line canary that doesn't involve pasting any secret shape into this
guide:

```bash
# Generate a fake Stripe-like shape locally, stage, attempt commit
printf 'export const CANARY = "sk_live_%s";\n' \
  "$(LC_ALL=C tr -dc 'A-Za-z0-9' < /dev/urandom | head -c 24)" > canary.ts
git add canary.ts
git commit -m "canary" || true

# Expected: commit refused by the pre-commit hook, gitleaks output names
# `canary.ts` + rule `stripe-access-token` or `generic-api-key`.
# Clean up.
git reset HEAD canary.ts 2>/dev/null; rm -f canary.ts
```

If the canary commit **succeeds**, the hook isn't wired — go back to the
relevant style and re-check.

## Adopting across several repos at once

One-shot script that adds style C to any repo:

```bash
#!/usr/bin/env bash
# add-gitleaks-hook.sh <repo-path>
set -euo pipefail
repo="${1:?usage: $0 <repo-path>}"
cd "$repo"
mkdir -p .githooks
cat > .githooks/pre-commit <<'HOOK'
#!/usr/bin/env bash
set -euo pipefail
if ! command -v gitleaks >/dev/null 2>&1; then
  echo "gitleaks not installed — skipping secret scan."
  exit 0
fi
gitleaks protect --staged --no-banner --redact --exit-code 1
HOOK
chmod +x .githooks/pre-commit
git config core.hooksPath .githooks
echo "✓ installed .githooks/pre-commit in $repo"
```

Not committing the above as a script in Forge Kit — too small to justify a
tool entry. Copy into your shell scripts dir if you want it.

## Forge Kit itself

This monorepo runs **three scanners** in CI (`.github/workflows/secret-scan.yml` for
TruffleHog, `semgrep.yml`, GitGuardian via a custom check). Gitleaks is not
currently wired as a pre-commit here — contributors rely on the CI belt.

Adding pre-commit gitleaks to this repo is a reasonable future addition; the
install path would be style C (plain git hook) since there's no husky or
pre-commit framework already in place. Open a PR if you want to add it.

## Related

- [Installing](./installing.md) — per-entry install pattern the CLI uses.
- [Auto-deploy](./auto-deploy.md) — Cloudflare API token handling, the
  incident-type this guide exists to prevent.
- [Governance](./governance.md) — compliance and audit posture more broadly.
