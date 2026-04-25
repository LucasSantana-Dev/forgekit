---
status: active
audience: power-users
reading_time: 20 min
---

# Adopting Forge Kit — the advanced walkthrough

A stepped adoption guide for engineers who already use Claude Code / Codex / Cursor,
know their shell, and want Forge Kit wired into a **real** workflow — gateway,
MCP servers, skills, agents, hooks, CI, observability. Assumes Docker, Node, and
git fluency.

If you're new to AI dev tools, do **[Adoption (beginner)](./adoption-beginner.md)**
first — this guide will blow past foundational checks that the beginner guide
stops to verify.

**Time budget:** about 3 hours of focused work, split across 6 stages. Plan a
free evening or spread it across three days.

---

## Stage 0 — Prerequisites

On your workstation:

```bash
# Core
node --version                    # ≥ 20.11
pnpm --version                    # ≥ 9 (or corepack enable)
docker --version && docker compose version
git --version                     # ≥ 2.30

# Optional but helpful
gh --version                      # GitHub CLI
jq --version                      # JSON surgery
```

If any are missing, install before proceeding. The stages below assume all are
present.

Account setup:

- Claude Code authenticated (`claude login`).
- An editor of record — VS Code / JetBrains / Neovim — with the Claude extension
  *or* happy running Claude Code alongside it.
- A personal or team scratch repo where you can commit freely without affecting
  production.

---

## Stage 1 — Clone and inspect (≈ 15 min)

```bash
git clone https://github.com/LucasSantana-Dev/forgekit forge-kit
cd forge-kit
pnpm install --frozen-lockfile
pnpm --filter @forge-kit/catalog run validate
# ✅ catalog valid: {"skills":100,"servers":10,"collections":2,"docs":20,"agents":15,"hooks":26,"commands":0,"tools":10}
```

Walk the layout once so the rest of the guide lands:

```text
packages/core/       # original toolkit: rules, patterns, skills, installer
packages/setup/      # machine bootstrap scripts
packages/catalog/    # this catalog — YAML/JSON entries + validation
packages/cli/        # forge-kit CLI
apps/web/            # public Astro catalog site
infra/gateway/       # docker-compose for the local MCP gateway
locales/pt-BR/       # Portuguese overlay content
docs/specs/          # active + archived specs
docs/guides/         # you are here
```

Spend ten minutes reading `docs/specs/2026-04-22-toolkit-monorepo-rebrand/spec.md`
— it's the canonical "how this repo is meant to evolve" document.

---

## Stage 2 — Bring up the gateway (≈ 30 min)

The gateway is the one endpoint every agent talks to. It aggregates all your
registered MCP servers and binds to `127.0.0.1` only.

```bash
cd infra/gateway
cp .env.example .env

# Generate the gateway's admin token and JWT secret
openssl rand -hex 32 | tee >(pbcopy) | awk '{print "GATEWAY_ADMIN_TOKEN="$0}' >> .env
openssl rand -hex 32 | awk '{print "JWT_SECRET="$0}' >> .env

# (Optional) populate credentials for upstream MCP servers you intend to use.
# Each upstream expects its own env var; see .env.example for the list.
${EDITOR:-vi} .env

docker compose up -d
docker compose ps
# expect: context-forge-gateway   running   127.0.0.1:<port>->8080/tcp
```

### Seed the gateway

```bash
python seeds/seed.py
```

This pushes the catalog's server manifests into the gateway so it knows what
to route for. It's idempotent — safe to re-run.

### Wire Claude Code to the gateway

```bash
npx forge-kit setup-claude
```

This writes `~/.claude/mcp.json` pointing at your local gateway (not at
individual servers). Restart your Claude Code session after the file writes.

### Verify

```bash
curl -s http://127.0.0.1:<gateway-port>/health | jq
# {"status":"ok","servers_registered":10,...}

# In Claude Code:
claude
> list the MCP tools you currently have access to
```

You should see a list of tools from the servers you seeded. **Stage 2 is done.**

> **Binding discipline.** The gateway binds to `127.0.0.1`. If you need to
> access it from another machine on your network, **do not change the bind
> address** — use an SSH tunnel instead:
> `ssh -L 8080:127.0.0.1:8080 your-dev-box`. Exposing the gateway on a LAN is
> a credential-leak vector.

---

## Stage 3 — Install a working kit (≈ 30 min)

Pick the kit for your primary work mode. All three kits are ~5–8 entries;
install the whole kit, then live with it for a week before expanding.

### Kit A — backend / CLI development

```bash
npx forge-kit install adt-context
npx forge-kit install adt-plan
npx forge-kit install adt-code-reviewer
npx forge-kit install adt-systematic-debugger
npx forge-kit install adt-security-auditor
npx forge-kit install adt-rag
npx forge-kit install adt-verify
```

### Kit B — framework / frontend development

```bash
npx forge-kit install adt-context
npx forge-kit install adt-plan
npx forge-kit install adt-code-reviewer
npx forge-kit install adt-ui
npx forge-kit install adt-accessibility
npx forge-kit install adt-rag
# Plus MCP: context7 for live framework docs (seeded via gateway)
```

### Kit C — infra / MCP ops

```bash
npx forge-kit install adt-context
npx forge-kit install adt-mcp-doctor
npx forge-kit install adt-mcp-health
npx forge-kit install adt-mcp-readiness
npx forge-kit install adt-security-auditor
npx forge-kit install adt-verify
```

### Verify the installs

```bash
ls ~/.claude/skills/      # should show the IDs you installed
ls ~/.claude/agents/      # reviewer + auditor land here
```

---

## Stage 4 — Wire in hooks (≈ 40 min)

Hooks run deterministic checks at specific events — before/after tool use,
before session end, etc. They are the lowest-cost way to catch failure modes
you've already seen twice.

### Event mental model

| Event | Fires when | Good for |
|---|---|---|
| `PreToolUse` (matcher: `Bash`) | Before any shell command | block destructive commands |
| `PreToolUse` (matcher: `Write\|Edit`) | Before any file write | validate secrets aren't in the diff |
| `PostToolUse` (matcher: `Bash`) | After a shell command | capture output for later review |
| `UserPromptSubmit` | Before every user turn | inject context (current branch, current task) |
| `Stop` | Agent finishes a turn | run tests, typecheck, lint |
| `SubagentStop` | Sub-agent finishes | verify sub-agent output shape |
| `PreCompact` | Before context compaction | save state before data is lost |
| `SessionEnd` | Claude Code exits | write a handoff file |

### Install a starter pack

```bash
npx forge-kit install adt-hook-validate-tests   # Stop → test
npx forge-kit install adt-hook-validate-secrets # PreToolUse Write|Edit → scan
npx forge-kit install adt-hook-evaluate-response # SubagentStop → shape check
```

Each hook installs to `~/.claude/hooks/<id>.sh` + gets wired into `settings.json`
via the installer. Check:

```bash
ls ~/.claude/hooks/
cat ~/.claude/settings.json | jq '.hooks'
```

### Test a hook in dry-run

```bash
bash ~/.claude/hooks/adt-hook-validate-secrets.sh <<<'{"tool":"Write","path":"./foo"}'
# Expect: exit 0 and a pass message, or exit 1 with a blocking explanation.
```

### Common pitfalls

- **Always-on hooks that block real work.** A hook that blocks 5% of legitimate
  edits will be disabled inside a week. Tune matchers.
- **Hooks that run on `UserPromptSubmit` and take 2+ seconds.** They compound
  latency on every turn. Budget ≤ 200ms.
- **Hooks that shell out to network services without a timeout.** Add
  `timeout 2s` or equivalent. Network flakes shouldn't freeze Claude.
- **Hooks that mutate state.** Prefer read-only validations. Mutations belong
  in scripts, not hooks.

See **[Hooks](./hooks.md)** for the full pattern catalog and
**[Authoring a hook](./authoring-a-hook.md)** *(coming)* for the lifecycle.

---

## Stage 5 — CI integration (≈ 40 min)

Move the checks that protect you locally up into CI so the team benefits.

### 5a. Catalog validation in CI

If you're adding catalog entries in a fork/derived repo, run the validator
against your custom entries:

```yaml
# .github/workflows/catalog.yml
name: Validate catalog
on: [pull_request]
jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'pnpm' }
      - run: pnpm install --frozen-lockfile
      - run: pnpm --filter @forge-kit/catalog run validate
```

### 5b. Secret scanning

Forge Kit already runs TruffleHog + GitGuardian + Semgrep on its own PRs. Adopt
the same three in your repos — they're free for public repos and cheap for
private. The `Validate catalog, CLI, and web` job is the canonical reference
for how they're wired.

### 5c. Agent review loop in CI

Optional but powerful: run the `adt-code-reviewer` agent as a required check
on PRs. Pattern:

1. Install Claude Code in the CI job.
2. `claude --agent adt-code-reviewer --diff origin/main...HEAD`.
3. Post findings as a PR comment.
4. Block merge if any `CRITICAL` findings.

This is a weekend project, not a 5-minute wiring — budget accordingly and
read the agent's actual prompt in
`packages/catalog/catalog/agents/adt-code-reviewer.md` before trusting it
as a gate.

---

## Stage 6 — Observability and pruning (≈ 25 min)

### Keep track of what you actually use

Set a monthly reminder. Run:

```bash
# Skills last-used (crude heuristic: SKILL.md atime)
find ~/.claude/skills -name SKILL.md -exec stat -f '%a %N' {} \; | sort -n | head

# Hooks that fired last month (parse your shell history or Claude logs)
grep -c 'adt-hook-' ~/.claude/history.log  # if you have logging enabled
```

Anything you haven't used in 60 days: **uninstall** it. The mental cost of
holding an unused entry is non-zero — your next troubleshooting session will
wonder if it's the cause of a weird behaviour.

### Keep track of what's breaking

- **Agent sessions that drift** → look at whether your hooks are injecting
  outdated context on every turn.
- **MCP server flakes** → run `mcp-health --all`; watch for patterns.
- **Build / test / CI regressions from agent-written code** → log them. If
  a specific skill correlates with the regressions, that's your signal to
  retire or rewrite it.

### Pull the lever: the quarterly audit

Every three months, do a 30-minute sweep:

1. `pnpm --filter @forge-kit/catalog run validate` — proves nothing drifted.
2. `git log --since=90.days --pretty=format: --name-only ~/.claude | sort | uniq -c | sort -rn | head` — which skills/hooks you actually modified.
3. For each installed entry: ask "would I re-install this from zero today?"
   If no, uninstall.
4. Log what you pruned + why, in one sentence each. Future-you will thank
   you when the catalog grows.

---

## What a fully-tuned workstation looks like

Approximate target for someone 6 months into active use:

- **Gateway**: running, healthy, 8–15 MCP servers registered.
- **Skills**: ~12 installed — you can name a concrete win from each.
- **Agents**: 2–4 installed — never more. Each with a clear job.
- **Hooks**: 3–6 installed — each catches a failure mode you've seen at least
  twice before.
- **CI**: catalog validate + secret scan + (optional) agent review gate.
- **Documentation**: 1–2 pages of personal notes on your own workflow,
  stored in a private doc. Not in the Forge Kit repo — it's *your* setup.
- **Quarterly audit**: scheduled, 30 minutes, non-negotiable.

---

## Handoff — what to bring to a teammate

If you adopt Forge Kit and want to bring your team along, ship them this
minimum:

1. Link to **[Adoption (beginner)](./adoption-beginner.md)**.
2. The list of skills/agents/servers **you** use daily, annotated with the
   concrete wins ("caught X bug before merge", "saved Y min on Z").
3. Your CI gate config (the YAML from Stage 5).
4. A standing offer to pair for 45 minutes through Stages 1–3.

That's it. Don't try to enforce adoption — let the concrete wins do the
selling.

---

## See also

- **[Catalog schema reference](./catalog-schema-reference.md)** — field-by-field
  for everything you just installed.
- **[MCP servers](./mcp-servers.md)** — transport choice, gateway model,
  secrets.
- **[Hooks](./hooks.md)** — pattern catalog for the hooks you wired in Stage 4.
- **[Governance](./governance.md)** — compliance and audit material when
  bringing Forge Kit into a regulated environment.
