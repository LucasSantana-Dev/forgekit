# External AI-dev repos audit — Wave 2 (19 repos) — 2026-04-22

Sibling to [`2026-04-22-external-repos.md`](./2026-04-22-external-repos.md)
(Wave 1). Same methodology: read-only survey via `gh api` + parallel
subagents, every SPDX verified against the actual LICENSE body.

## Relationship to Wave 1

- Wave 1 landed: Lucky PR #770 (gstack Supabase reference) and
  ai-dev-toolkit PR #93 (prompt-catalogs-external pattern).
- Wave 1 retired Port #3 after discovering gstack skills were tightly
  coupled to a private runtime (`gstack-config`, `gstack-slug`, etc.).
  Wave 2 inherits this lesson: every skill/agent-shaped port candidate
  gets an explicit coupling check.
- Wave 2 does **not** supersede Wave 1; the two audits land together
  when the `audit/external-repos-2026-04-22` branch is pushed.

## Pre-decided (no survey)

- **`MemPalace/mempalace`** — previously DECLINED per
  `MEMORY.md:7` (project_mcp_audit_2026-04-19.md): current RAG +
  markdown + memory-graph stack is sufficient. Not re-evaluated.
- **`f/prompts.chat`** — already landed as ai-dev-toolkit PR #93 via
  Wave 1. Not re-evaluated. DAIR-AI's Prompt-Engineering-Guide (Wave 2
  below) is the natural extension target.

Net repos surveyed: **17**.

## License reality check (verified via `gh api repos/<r>/license`)

Six of the 17 returned `NOASSERTION` — LICENSE bodies were read. Three
carry real porting risk:

| Repo                             | Actual license                                                                      | Port impact                                                      |
| -------------------------------- | ----------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| forrestchang/andrej-karpathy-skills | **NO LICENSE FILE** — GitHub API returns 404 on `/license`. All rights reserved. | Cite-only. Cannot copy or adapt.                                 |
| thedotmack/claude-mem            | AGPL-3.0 (Alex Newman copyright preamble on top of the GPL text)                    | Cite-only. AGPL would force downstream toolkit to become AGPL.  |
| firecrawl/firecrawl              | AGPL-3.0                                                                            | Cite-only. Same reasoning.                                       |
| pathwaycom/pathway               | BSL 1.1 (Business Source License; reverts to Apache after change date)              | Cite-only. Engine not portable; docs-as-reference OK.            |
| langgenius/dify                  | Modified Apache-2.0: no multi-tenant SaaS, no LOGO/copyright removal on frontend    | Cite-only. Anything from `web/` is frontend-restricted.           |
| OpenHands/OpenHands              | MIT outside `enterprise/`, proprietary inside `enterprise/`                         | MIT portions are licensable; rest of coupling blocks any port.   |
| rasbt/LLMs-from-scratch          | Apache-2.0 (subagent claimed "custom"; verified as plain Apache-2.0)                | Portable, but it's pedagogical book code — cite-only is right.   |

---

## Phase 1 — Per-repo findings

### Group A — Memory / context / skills (6)

```yaml
## forrestchang/andrej-karpathy-skills
purpose:       Single CLAUDE.md + a `skills/` dir codifying Andrej Karpathy's
               coding principles (think before code, simplicity, surgical changes).
license_spdx:  NONE (no LICENSE file — default is "all rights reserved")
activity:      stars=73255, last_push=2026-04-20, archived=false
top_dirs:      skills/, .claude-plugin/, .cursor/, CLAUDE.md, EXAMPLES.md, README.md
port_candidates:
  - artifact:  (pass — cannot legally port without explicit license)
    target:    cite-only
    why:       Reference the philosophy in our own words; any direct copy would infringe.
red_flags:     No license file. Popularity (73k stars) does not create a license grant.

## davidkimai/Context-Engineering
purpose:       Book-scale handbook on context engineering (course, templates, agents)
               backed by a 1400-paper survey.
license_spdx:  MIT
activity:      stars=8757, last_push=2026-02-27, archived=false
top_dirs:      00_COURSE/, 00_EVIDENCE/, 10_guides_zero_to_hero/, 20_templates/, 30_examples/, .claude/, 70_agents/
port_candidates:
  - artifact:  (pass)
    target:    cite-only
    why:       Reference-shaped; templates are essay-style, not lifted snippets. Cite from patterns/context-building.md.
red_flags:     none (MIT; clean)

## Lum1104/Understand-Anything
purpose:       Claude Code plugin that builds knowledge graphs from codebases via multi-agent analysis.
license_spdx:  MIT
activity:      stars=8665, last_push=2026-04-20, archived=false
top_dirs:      .claude-plugin/, .cursor-plugin/, docs/, homepage/, understand-anything-plugin/
port_candidates:
  - artifact:  (pass)
    target:    cite-only
    why:       Plugin-shaped, plugin-SDK + browser-UI coupled. Not individually portable.
red_flags:     runtime-coupled (plugin SDK, UI frontend)

## mem0ai/mem0
purpose:       Production memory layer for AI agents (multi-level memory, retrieval, personalization).
license_spdx:  Apache-2.0
activity:      stars=53757, last_push=2026-04-21, archived=false
top_dirs:      mem0/, mem0-ts/, cli/, server/, examples/, cookbooks/, .agents/, skills/
port_candidates:
  - artifact:  (pass)
    target:    cite-only
    why:       Library/service, not toolkit-shaped. Wrong artifact scale; user already owns a memory stack (MEMORY.md, .claude-mem/, memory-graph). Cite as a reference for "when to reach for mem0".
red_flags:     none; right answer is external reference, not integration

## thedotmack/claude-mem
purpose:       Persistent memory compression system for Claude Code (agent logic, plugin, CLI).
license_spdx:  AGPL-3.0 (verified in LICENSE body, Alex Newman copyright preamble)
activity:      stars=65310, last_push=2026-04-21, archived=false
top_dirs:      src/, .claude/, .claude-plugin/, plugin/, docs/, scripts/
port_candidates:
  - artifact:  (pass)
    target:    cite-only
    why:       AGPL copyleft makes port unsafe. Runtime-coupled anyway.
red_flags:     AGPL-3.0 network-copyleft; deep claude-code runtime assumptions

## github/spec-kit
purpose:       Spec-driven development toolkit (CLI `specify`) that generates implementations from specifications.
license_spdx:  MIT
activity:      stars=90003, last_push=2026-04-21, archived=false
top_dirs:      src/, specs/, extensions/, integrations/, templates/, presets/, docs/, scripts/, pyproject.toml
port_candidates:
  - artifact:  Methodology reference (describe the spec-first loop; don't import the CLI)
    target:    ai-dev-toolkit/patterns/spec-driven-development.md  (new, OR extend patterns/context-building.md)
    why:       Aligns with our existing `.claude/plans/` + `docs/specs/` practice. MIT-clean cite.
    coupling_check: n/a (CLI, not skill/agent)
red_flags:     none
```

### Group B — LLM app / agent frameworks (7)

All default to `cite-only` per framework-scale. No free-standing
portable pattern found in any of them.

```yaml
## langchain-ai/langchain
license_spdx:  MIT
activity:      stars=134432, last_push=2026-04-21
port_candidates: cite-only; runtime-coupled (serialization + execution context).

## langgenius/dify
license_spdx:  Modified Apache-2.0 (no multi-tenant SaaS; no LOGO/copyright removal on frontend)
activity:      stars=138697, last_push=2026-04-22
port_candidates: cite-only; modified-Apache is a porting hazard.

## infiniflow/ragflow
license_spdx:  Apache-2.0 (vanilla, verified)
activity:      stars=78702, last_push=2026-04-22
port_candidates: cite-only; RAG engine coupled to GraphRAG subsystem + ingestion pipeline.

## pathwaycom/pathway
license_spdx:  BSL 1.1 (reverts to Apache after change date; source-available)
activity:      stars=63439, last_push=2026-04-21
port_candidates: cite-only; engine-bound. BSL disqualifies even pattern copies today.

## hiyouga/LlamaFactory
license_spdx:  Apache-2.0
activity:      stars=70446, last_push=2026-04-21
port_candidates: cite-only; fine-tuning framework, not a pattern source.

## OpenHands/OpenHands
license_spdx:  MIT (outside enterprise/) + proprietary (inside enterprise/)
activity:      stars=71684, last_push=2026-04-22
port_candidates: cite-only; agent platform, same scope class as AutoGPT from Wave 1.

## firecrawl/firecrawl
license_spdx:  AGPL-3.0 (verified)
activity:      stars=111428, last_push=2026-04-22
port_candidates: cite-only; AGPL blocks the port, and no standalone MCP server was found
                 (the "discoverable MCP" prior was wrong — it's a web service).
```

### Group C — Reference catalogs / books / lists (4)

```yaml
## rasbt/LLMs-from-scratch
license_spdx:  Apache-2.0 (verified — subagent's "custom book license" claim was wrong)
activity:      stars=91210, last_push=2026-04-16
port_candidates: cite-only; pedagogical book-companion code, link to pinned SHA.

## dair-ai/Prompt-Engineering-Guide
license_spdx:  MIT (verified)
activity:      stars=73653, last_push=2026-03-11
port_candidates:
  - artifact:  guides/ (prompting techniques reference)
    target:    ai-dev-toolkit/patterns/prompt-catalogs-external.md  (EXTEND the Wave 1 file, don't create a sibling)
    why:       Natural complement to the f/prompts.chat catalog already listed; same pattern shape.
    coupling_check: n/a
red_flags:     none

## punkpeye/awesome-mcp-servers
license_spdx:  MIT (verified)
activity:      stars=85306, last_push=2026-04-15
port_candidates: cite-only; user already has MCP audit (MEMORY.md:6). Discovery value only.

## Shubhamsaboo/awesome-llm-apps
license_spdx:  Apache-2.0 (verified)
activity:      stars=106808, last_push=2026-04-19
port_candidates: cite-only; aggregator of runnable cookbooks. Link-first; mirror creates debt.
```

---

## Phase 2 — Scoring (Impact − Effort − Risk, each 1–3)

| # | Port candidate                                                                  | Target                                                           | I | E | R | Score | Verdict         |
| - | ------------------------------------------------------------------------------- | ---------------------------------------------------------------- | - | - | - | ----- | --------------- |
| a | Consolidated reference index (the WAVE-2 cite-only entries)                     | This audit doc itself, committed + pushed in Phase 5             | 2 | 1 | 0 | **+1**| **SHORTLIST**   |
| b | DAIR-AI Prompt-Engineering-Guide entry                                          | EXTEND `patterns/prompt-catalogs-external.md` (Wave 1 file)      | 2 | 1 | 1 | **0** | **SHORTLIST**   |
| c | spec-kit pattern doc                                                            | `ai-dev-toolkit/patterns/spec-driven-development.md` (new)       | 2 | 2 | 1 | **−1**| Defer           |
| d | mem0 reference in a "memory systems" pattern doc                                | EXTEND existing `patterns/memory-systems.md`                      | 1 | 1 | 1 | **−1**| Defer           |
| e | andrej-karpathy-skills / Context-Engineering paraphrased principles             | `best-practices/` or `rules/`                                    | 1 | 2 | 2 | **−3**| Pass            |
| f | Everything else (frameworks + aggregators)                                      | cite-only, no PR                                                 | — | — | — | —     | Reference index |

Legend: Impact = leverage gained. Effort = hours to integrate. Risk =
license / maintenance / rot.

---

## Phase 3 — Wave-2 shortlist (awaiting user gate)

**Top 2 ports:**

### a. Consolidated reference index (score +1)

- **What:** This audit doc itself. It already functions as the
  reference index — every cite-only repo is listed with license, stars,
  last push, and a one-line purpose.
- **Ship as:** part of the Phase-5 audit PR on `ai-dev-toolkit` that
  bundles Wave 1 + Wave 2 docs (branch `audit/external-repos-2026-04-22`,
  already committed locally).
- **License:** n/a — it's our own summary.
- **Diff:** this file (~4 KB) + Wave 1 file (already committed, 307 LOC).

### b. Extend `patterns/prompt-catalogs-external.md` with DAIR-AI guide (score 0)

- **What:** Add one section to the existing Wave 1 file (landed as PR
  #93) citing `dair-ai/Prompt-Engineering-Guide` (MIT, 73k stars) as a
  second high-signal external catalog alongside `f/prompts.chat`.
  Update the "Primary source" heading to "Primary sources" plural.
- **Ship as:** a follow-up PR on `ai-dev-toolkit` (depends on PR #93
  merging first, otherwise rebase).
- **License:** MIT. Clean attribution.
- **Diff:** ~30 LOC added to the existing file.

### Explicit passes / defers

- **c. spec-kit pattern doc** — defer. The value is real but it's a
  fresh net-new pattern, not an extension; better shipped as a
  standalone initiative when spec-driven dev is actually being used in
  Lucky/toolkit work, not speculatively.
- **d. mem0 reference in memory-systems pattern** — defer. The existing
  `patterns/memory-systems.md` already covers our territory; adding
  mem0 as a cite is low-priority.
- **e. Karpathy / Context-Engineering principles** — pass. Karpathy
  repo has no license; Context-Engineering is MIT but the content is
  essay-shaped, not snippet-shaped. Not worth the extraction effort.
- **All frameworks + aggregators** — cite-only in this audit doc; no
  PRs.

---

## Decision needed from user (Phase 3 gate)

Two options:

1. **Ship both (a) and (b).** (a) is the Phase-5 combined audit PR;
   (b) is a small follow-up PR to extend the already-open PR #93's file.
   Total: 1 new PR on top of what's already open.
2. **Ship only (a).** Land the audit as the Phase-5 PR and stop.
   (b) can wait for a future trigger.

Default suggestion: **option 1** — (b) is ~30 LOC and cleanly composable
with the Wave 1 landing; deferring it is pure friction cost.

## Replan triggers

- User says "pass on both" → Phase 5 still happens (audit doc lands)
  but no follow-up PR.
- PR #93 gets closed/rejected → (b) becomes invalid, remove from scope.
- `dair-ai/Prompt-Engineering-Guide` MIT changes or repo gets archived
  before we land (b) → re-verify license + activity.

## Out-of-band findings worth noting

- **Five repos that were on the survey list are genuinely
  non-portable** for legal reasons: Karpathy skills (no license),
  claude-mem (AGPL), firecrawl (AGPL), pathway (BSL), dify (modified
  Apache restricts frontend). A Wave-3 batch should auto-exclude any
  repo with AGPL/BSL/custom-commercial in the top-level LICENSE —
  saves one round-trip.
- **Subagents mis-reported license on 4/17 this wave** (Karpathy MIT
  → none; LLMs-from-scratch "custom" → Apache-2.0; Pathway BSL
  characterization was right directionally but imprecise; Dify
  restrictions were caught correctly). Direct `gh api .../license`
  verification remains mandatory.
- **OpenHands was correctly identified as AutoGPT-shaped**: same
  "agent platform, too big to port" conclusion as Wave 1's AutoGPT.
  Confirms the Wave 2 plan's prior that "frameworks default to cite-only".
