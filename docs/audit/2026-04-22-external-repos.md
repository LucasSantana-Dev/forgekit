# External AI-dev repos audit — 2026-04-22

Scope: decide which artifacts from 8 public repos should port into
`ai-dev-toolkit` (mid-rebrand to "Forge Kit", spec #92),
`ai-dev-toolkit-library`, the user's `~/.claude/` workflow, or Lucky.

Methodology: read-only survey via `gh api` + WebFetch + two parallel
read-only subagents (Group A = prompt/skill-heavy; Group B =
agent/infra-heavy). License SPDX and dual-license details verified
directly against each repo's LICENSE file (the `gh api repos/<r>/license`
call returned `NOASSERTION` for 4 of 8 — actual licenses read below).
Star counts, last-push, and top-level trees verified directly.

---

## Phase 1 — Per-repo findings

### 1. x1xhlol/system-prompts-and-models-of-ai-tools

```yaml
purpose:       Aggregation of system prompts from 28+ AI tools (Cursor, v0, Lovable, Devin, Bolt, Windsurf, Perplexity, Manus, Comet, Anthropic, Augment Code, …).
license_spdx:  GPL-3.0 on the repo itself. Content provenance is the concern, not the repo license.
activity:      stars=135737, last_push=2026-04-17, archived=false
top_dirs:      Anthropic/, Augment Code/, Cursor Prompts/, Devin AI/, Comet Assistant/, …(28 vendor folders), .github/
port_candidates:
  - artifact:  "(pattern extraction only, no verbatim text)"
    target:    ai-dev-toolkit/patterns/reference-system-prompts.md
    why:       Reference of observed prompt-engineering techniques (step-by-step reasoning scaffolds, tool-use phrasing, guardrails) WITHOUT republishing content.
red_flags:     LEGALLY SENSITIVE. Much of the content was scraped/leaked from closed-source vendors. GPL-3.0 on the aggregation does not grant rights over the underlying prompts. Do NOT copy verbatim.
```

### 2. f/prompts.chat  (a.k.a. f/awesome-chatgpt-prompts)

```yaml
purpose:       Largest community prompt library + self-hostable platform. Rebranded from "Awesome ChatGPT Prompts" in 2026.
license_spdx:  Dual — MIT (code under src/, prisma/, scripts/, config) + CC0-1.0 (prompt data under prompts.csv, PROMPTS.md, user submissions). VERIFIED in LICENSE file.
activity:      stars=160344, last_push=2026-04-22, archived=false
top_dirs:      .claude/, .claude-plugin/, docker/, packages/, plugins/, messages/, .commandcode/, .windsurf/
port_candidates:
  - artifact:  prompts.csv (+ PROMPTS.md index)
    target:    ai-dev-toolkit/training/prompts-catalog.md  (REFERENCE-LINK ONLY, not bulk-copy)
    why:       CC0 lets us copy, but value is in curation — link from a small README index, pull only a vetted subset.
  - artifact:  .claude/settings.json + .claude-plugin/
    target:    workflow (compare against ~/.claude/)
    why:       A well-tested plugin configuration and MCP wiring we can cherry-pick from.
  - artifact:  packages/ (CLI + MCP server)
    target:    ai-dev-toolkit-library/catalog/  (inspiration, not import)
    why:       The library repo is building its own catalog/gateway; this is a reference impl of the same pattern.
red_flags:     None licensing-wise. Scale risk: bulk-importing all prompts adds maintenance debt — stay link-first.
```

### 3. affaan-m/everything-claude-code

```yaml
purpose:       10-month production-curated Claude Code performance stack — 48 agents, 183+ skills, 29+ rules, 20+ hooks, multi-tool (Claude/Codex/Cursor/Gemini/Kiro/Opencode/Trae).
license_spdx:  MIT
activity:      stars=163413, last_push=2026-04-21, archived=false
top_dirs:      .claude/, .claude-plugin/, .agents/, .codex/, .cursor/, .gemini/, .kiro/, .opencode/, .trae/, .codebuddy/, .codex-plugin/, docs, plus top-level AGENTS.md / RULES.md / WORKING-CONTEXT.md / EVALUATION.md / REPO-ASSESSMENT.md
port_candidates:
  - artifact:  .claude/skills/ (183+)
    target:    (reconcile-first) ai-dev-toolkit/kit/ + workflow
    why:       Massive domain overlap with our own toolkit — merging or cross-referencing is higher-value than importing wholesale.
  - artifact:  .claude/rules/ (29+)
    target:    ai-dev-toolkit/best-practices/
    why:       Language-specific + universal guardrails; likely fills gaps in our rules/.
  - artifact:  .agents/ (48)
    target:    workflow (~/.claude/agents/)
    why:       Delegated task archetypes (architect/reviewer/auditor) we don't fully cover.
red_flags:     HEAVY OVERLAP with our own toolkit. Direct import without reconciliation = duplicate maintenance. Needs a skill-by-skill diff against ai-dev-toolkit/kit/ and ~/.claude/skills/ before any port. Good "source of truth to diff against" during Forge Kit rebrand.
```

### 4. opactorai/Claudable

```yaml
purpose:       Next.js-based natural-language app builder that uses Claude Code / Cursor / Codex / Qwen CLI / Z.AI under the hood; deploys to Vercel + Supabase.
license_spdx:  MIT
activity:      stars=3891, last_push=2026-04-11, archived=false
top_dirs:      app/, components/, lib/, hooks/, contexts/, prisma/, scripts/, types/, electron/
port_candidates:
  - artifact:  lib/ (agent orchestration + code-gen pipelines)
    target:    ai-dev-toolkit/implementations/claudable-reference-read.md  (description, not copy)
    why:       Closest public analog to our "Claude Code as a build engine" pattern; worth citing as a reference implementation.
  - artifact:  scripts/ (Vercel + Supabase scaffolding)
    target:    pass (gstack already covers the Supabase angle more directly)
red_flags:     App-specific (an end product, not a library). Little is lift-and-shift.
```

### 5. dyad-sh/dyad

```yaml
purpose:       Local, open-source alternative to Lovable/v0/Bolt — full-stack AI app builder as Electron app.
license_spdx:  Dual — Apache-2.0 for most of the repo, custom "fair-source" license for src/pro/. VERIFIED in LICENSE.
activity:      stars=20162, last_push=2026-04-22, archived=false
top_dirs:      .agents/, .claude/, src/, docs/, drizzle/, tests/, scripts/  (per subagent survey — not re-verified here)
port_candidates:
  - artifact:  (none worth the coupling)
    target:    pass
    why:       Electron + desktop runtime glue; no cleanly extractable patterns the toolkit doesn't already cover. `src/pro/` carries a non-OSS license.
red_flags:     src/pro/ is a license trap if someone naively copies from there. Large Electron footprint. Better as an "existence proof" reference than a port source.
```

### 6. refly-ai/refly

```yaml
purpose:       AI-native workspace / visual canvas with multi-threaded chat + agent skill builder.
license_spdx:  Apache-2.0 WITH ADDITIONAL CONDITIONS (custom restrictions layered on top; not vanilla Apache-2.0). VERIFIED in LICENSE.
activity:      stars=7236, last_push=2026-03-25, archived=false
top_dirs:      apps/, packages/, build/, config/, cypress/, deploy/, docs/, tests/  (per subagent survey)
port_candidates:
  - artifact:  skill schema / versioning model (docs-only reference)
    target:    ai-dev-toolkit/patterns/skill-registry.md  (describe only)
    why:       Their skill-export model might inform Forge Kit's catalog shape. But don't import.
red_flags:     The "additional conditions" on the Apache license make bulk-port unsafe — treat as inspiration only. Full-SPA monorepo, heavy.
```

### 7. Significant-Gravitas/AutoGPT

```yaml
purpose:       Mature autonomous-agent platform with graph/block orchestration.
license_spdx:  Dual — MIT for everything OUTSIDE `autogpt_platform/`; Polyform Shield for everything INSIDE `autogpt_platform/`. VERIFIED in LICENSE.
activity:      stars=183653, last_push=2026-04-22, archived=false
top_dirs:      autogpt_platform/, classic/, docs/, .agents/, .claude/, .github/
port_candidates:
  - artifact:  (none)
    target:    pass
    why:       The block-graph subsystem lives inside autogpt_platform/ — Polyform Shield is non-commercial/anti-compete; safer to skip entirely. The MIT-licensed `classic/` is the legacy agent codebase, too coupled to its own runtime.
red_flags:     Polyform Shield is the key risk. The temptation is to copy a block template; resist it.
```

### 8. garrytan/gstack

```yaml
purpose:       Garry Tan's opinionated Claude Code stack — 50+ skill dirs spanning CEO/design/eng/release/QA + Supabase infra bundle.
license_spdx:  MIT. Cleanest license of any in-scope repo.
activity:      stars=79741, last_push=2026-04-22, archived=false
top_dirs:      agents/, autoplan/, supabase/, ship/, qa/, qa-only/, review/, devex-review/, design/, design-review/, design-consultation/, land-and-deploy/, plan-{ceo,design,devex,eng}-review/, guard/, freeze/, unfreeze/, retro/, benchmark/, codex/, openclaw/, pair-agent/, extension/, context-{save,restore}/, browse/, scripts/, bin/, lib/, docs/  — VERIFIED (50+ dirs)
port_candidates:
  - artifact:  supabase/  (migrations, RLS patterns, edge-function scaffolds)
    target:    Lucky/docs/references/gstack-supabase.md  + reference-cite in the Supabase migration plan
    why:       Lucky PR #764 is actively migrating to Supabase (sa-east-1, lucky-prod + lucky-staging per MEMORY.md:21). A proven MIT-licensed reference is worth its weight.
  - artifact:  Selected skills — autoplan/, ship/, qa/, land-and-deploy/, retro/, context-save/, context-restore/
    target:    workflow (~/.claude/skills/) — only the ones that fill gaps
    why:       We already have plan/loop/ship/handoff/resume etc., but `autoplan`, `retro`, and `context-{save,restore}` patterns may augment them. Needs per-skill diff before port.
  - artifact:  lib/ (reusable primitives for multi-stage agent workflows)
    target:    ai-dev-toolkit/kit/gstack-primitives.md  (reference, not bulk-copy)
    why:       Small amount of genuinely reusable skill-plumbing; let patterns inform `kit/`, don't mirror directory.
red_flags:     None on licensing. Scale risk: 50+ dirs — bulk-import creates support burden. Cherry-pick only.
```

---

## Phase 2 — Scoring (Impact − Effort − Risk, each 1–3)

Score interpretation: higher = better ROI. Anything < 0 is a "pass or defer"
unless it's uniquely strategic.

| # | Port candidate                                        | Target                                                   | I | E | R | Score | Verdict           |
| - | ----------------------------------------------------- | -------------------------------------------------------- | - | - | - | ----- | ----------------- |
| A | gstack `supabase/` as reference                       | Lucky/docs/references/ + cite in Supabase migration plan | 3 | 1 | 1 | **+1**| **SHORTLIST**     |
| B | gstack selected skills (autoplan/retro/ctx-save)      | workflow (`~/.claude/skills/`)                            | 2 | 2 | 1 | **−1**| SHORTLIST-small   |
| C | f/prompts.chat CC0 catalog — link index, curated subset | ai-dev-toolkit/training/prompts-catalog.md             | 2 | 1 | 1 | **0** | **SHORTLIST**     |
| D | everything-cc skills — diff, absorb gaps only         | ai-dev-toolkit/kit/ (+ workflow)                         | 3 | 3 | 2 | **−2**| Defer to Forge Kit|
| E | everything-cc .agents/ (48 subagents)                 | workflow (`~/.claude/agents/`)                           | 2 | 2 | 1 | **−1**| Defer (same)      |
| F | sysprompts — technique-level patterns                 | ai-dev-toolkit/patterns/reference-system-prompts.md      | 2 | 2 | 3 | **−3**| Defer; legal risk |
| G | Claudable lib/ — cite as reference impl               | ai-dev-toolkit/implementations/*.md                      | 1 | 1 | 1 | **−1**| Pass              |
| H | refly skill schema — describe only                    | ai-dev-toolkit/patterns/skill-registry.md                | 1 | 2 | 2 | **−3**| Pass              |
| I | dyad — any lift                                       | —                                                        | 1 | 3 | 2 | **−4**| Pass              |
| J | AutoGPT — any lift                                    | —                                                        | 1 | 3 | 3 | **−5**| Pass (Polyform)   |
| K | gstack `lib/` primitives                              | ai-dev-toolkit/kit/gstack-primitives.md (reference)      | 1 | 2 | 1 | **−2**| Defer             |

---

## Phase 3 — Shortlist (awaiting user gate)

**Top 3 ports, in order of ROI:**

### 1. gstack `supabase/` → Lucky reference (score +1)

- **What:** Add `docs/references/gstack-supabase.md` to Lucky (or cite in
  `.claude/plans/supabase-migration-2026-04-21.md`) summarizing RLS
  policies, migration shape, and edge-function scaffold patterns that
  `garrytan/gstack` has shipped and battle-tested.
- **What it is NOT:** a copy of gstack's `supabase/` dir. It's a
  short reference doc that links to specific files by permalink and
  pulls out the 3–5 decisions that matter for Lucky's migration.
- **License:** MIT. Attribution in the doc footer.
- **Estimated diff:** ~100–150 LOC of markdown. No code changes.
- **Why first:** Lucky PR #764 is the single most active delivery lane;
  this is priority-1 "ship ready work" adjacent.

### 2. f/prompts.chat CC0 catalog index → toolkit training dir (score 0)

- **What:** Add `ai-dev-toolkit/training/prompts-catalog.md` — a small
  index linking to `f/prompts.chat`, plus a curated 10–20 prompt
  excerpt set (CC0 lets us) chosen for relevance to engineering /
  code-review / planning workflows.
- **What it is NOT:** a bulk import of `prompts.csv`. That's unmaintainable.
- **License:** CC0 for prompt content, MIT attribution for the code
  we link to but don't copy.
- **Estimated diff:** ~80 LOC of markdown.
- **Why:** Zero-risk leverage. Reference-first, not maintenance-heavy.

### 3. gstack selected skills → workflow (score −1, small)

- **What:** Diff gstack's `autoplan/`, `retro/`, `context-save/`,
  `context-restore/` against our existing `~/.claude/skills/`. Port only
  the ones that fill a clear gap. Likely 1–3 new skills.
- **What it is NOT:** mirroring gstack's 50+ skill dirs. That's a separate,
  larger decision.
- **License:** MIT.
- **Estimated diff:** 3 new SKILL.md files max, ~300 LOC total, plus an
  entry in `~/.claude/skills/README.md` if present.
- **Why:** Direct workflow leverage; bounded scope; easy rollback.

**Passes / defers (for the record):**

- AutoGPT (Polyform Shield blocks the interesting parts).
- dyad (dual-license trap + Electron coupling).
- refly (custom license conditions).
- Claudable (cite-only value, not worth a PR alone).
- sysprompts (legal gray zone; pattern extraction can happen later as a
  standalone write-up when Forge Kit has a "patterns" section ready).
- everything-cc (huge overlap with our own toolkit; defer to the
  Forge Kit rebrand #92 — that's the right moment to reconcile 183+
  skills in one pass, not via a small audit PR).

---

## Phase 3 — User gate (cleared 2026-04-22)

User cleared the gate with "Sequentially" — proceed on all three ports,
one PR at a time.

## Phase 4 — Execution outcomes

### Port #1 — Lucky PR [#770](https://github.com/LucasSantana-Dev/Lucky/pull/770) ✅ opened

`docs(references): add gstack Supabase patterns reference`

- Lands `docs/references/gstack-supabase.md` in Lucky (off `origin/main` via worktree,
  not on the active feature branch). 155 LOC markdown, zero code changes.
- Five patterns cited with SHA-pinned permalinks: RLS-first client auth,
  progressive RLS tightening, column-level GRANT, edge-function cached reads,
  deploy-time RLS smoke test.
- Reads cleanly into the in-flight Supabase migration (PR #764).

### Port #2 — ai-dev-toolkit PR [#93](https://github.com/LucasSantana-Dev/ai-dev-toolkit/pull/93) ✅ opened

`feat(patterns): add external prompt-catalogs index`

- Lands `patterns/prompt-catalogs-external.md` (re-targeted from the
  originally-proposed `training/` — that dir is fine-tuning-specific,
  not prompt-catalog-shaped).
- 98 LOC. Curated 10-row table of classic engineering prompts with
  permalinks to `f/prompts.chat@a4632f1a`. CC0 + MIT attribution.

### Port #3 — REVISED: no port, finding captured (this doc)

The original scope ("port 4 gstack skills — autoplan, retro,
context-save, context-restore") does not survive close inspection. Two
coupled findings:

1. **gstack skills are not individually portable.** Each SKILL.md
   (verified on `retro/SKILL.md` at `54d4cde`) ships a large bash
   preamble that calls private gstack binaries —
   `gstack-update-check`, `gstack-config`, `gstack-repo-mode`,
   `gstack-slug`, `gstack-telemetry-log` — plus a per-session tracking
   system under `~/.gstack/`. Extracting a single SKILL.md without the
   surrounding bin/ and runtime would leave a broken skill. Porting
   the runtime in full is a much bigger decision than "add one file".

2. **The user's skill layout already distinguishes core vs custom.**
   `~/.claude/skills/` holds 17 primitives (add, ci-watch, context-pack,
   dispatch, fallback, handoff, loop, next-priority, orchestrate, plan,
   resume, route, secure, ship, skill-maintainer, smart-model-select,
   verify). `LucasSantana-Dev/dotfiles/dot_claude/skills/` (chezmoi
   source) holds 27 custom utilities (add, auto-ship,
   bilingual-readme-sync, build-fix, **checkpoint**, compress-assets,
   coverage-gap, dev-assets-sync, fallback, handoff-diet, mac-optimize,
   mcp-doctor, monorepo-dockerfile, orchestrate, plugin-audit,
   pr-snapshot, prod-rebuild, route, safe-merge, secure, sync-ai-tools,
   sync-pt-parity, ticket, toolkit-version-check, version-bump,
   warp-ai-setup). The existing `checkpoint` already covers gstack's
   `context-save`/`context-restore` territory; the existing `plan`
   skill already covers `autoplan`. The only real gap was `retro` —
   and per finding #1, gstack's `retro` can't be lifted.

**Honest next step (not this audit):** if retrospective is worth having
as a skill, write a fresh `dotfiles/dot_claude/skills/retro/SKILL.md`
from scratch, inspired by gstack's *purpose* but using the user's own
chezmoi-sourced SKILL.md conventions. That's a separate "add a skill"
task, not an external-repos port.

**Phase 4 validation:**

- Ports #1, #2 opened as PRs with pinned-SHA permalinks, license
  attribution, and matching test plans.
- Port #3 retired with documented reasoning; no speculative code landed.

## Where this file lives

Committed to branch `audit/external-repos-2026-04-22` in worktree
`/Volumes/External HD/Desenvolvimento/.worktrees/aidtk-audit-2026-04-22`
(rooted at `origin/main` 98673ae — isolated from the in-flight
`feature/forge-kit-monorepo` rebrand on the main toolkit checkout).
Phase 5 ships this doc as a separate PR once Wave 2 appends its own
findings in the same file (or a sibling `…-wave2.md`).
