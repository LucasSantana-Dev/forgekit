# Catalog Collections — Full Backlog Map
_Repo: ai-dev-toolkit (forgekit) · Branch: feat/rag-maintenance-skills · Generated: 2026-05-06_

## Goal

Overhaul the 13-collection catalog to better reflect the full breadth of 103 skills, 15 agents, 26 hooks, and 10 servers. Remove overly narrow collections; add ~10 broad, theme-aligned ones to ensure every skill is reachable from at least one collection.

## In Scope

- Remove `discord-bot-dev` (too platform-specific; its skills are already in broader collections)
- Add 10 new collections covering uncovered skill clusters
- Refine 2 existing collections that now have better skill coverage available
- Write pt-BR translations for all new collections
- Validate catalog after each collection PR

## Out of Scope

- Changing skill manifests or adding new skills (tracked elsewhere)
- Changing the web UI for collections (tracked in backlog B5)
- Migrating the pt-BR locale rename (tracked in backlog B1)

## Replanning Triggers

- Catalog validation fails on a new collection → fix the manifest reference before continuing
- A planned collection ID conflicts with an existing one → rename before merging
- More than 2 skills in a new collection don't exist in catalog → pause and verify

---

## Current State

### Collections (13 total, 1 to remove, 2 to update, 10 to add)

| ID | Status | Action |
|----|--------|--------|
| `claude-code-power-user` | keep | no change |
| `context-rag-launchpad` | keep | add adt-rag-inspect, adt-rag-recall already present |
| `discord-bot-dev` | **REMOVE** | too platform-specific |
| `local-models-starter` | keep | no change |
| `mcp-ops-and-recovery` | keep | add adt-mcp-health |
| `production-debugging` | keep | no change |
| `professional-work-toolkit` | keep | no change |
| `release-and-deploy` | **UPDATE** | add adt-worktree-flow, adt-checkpoint |
| `research-and-writing` | keep | no change |
| `security-first-dev` | keep | no change |
| `solo-developer-starter` | keep | no change |
| `verification-review-gate` | **UPDATE** | add test-driven-development, adt-tdd |
| `web-app-development` | keep | no change |

### Skill Coverage Gaps (skills not in any current collection)

**ADT operational cluster (no collection):**
`adt-add`, `adt-auto-invoke`, `adt-bilingual-readme-sync`, `adt-checkpoint`,
`adt-compress-assets`, `adt-context-hygiene`, `adt-dispatch`, `adt-eval`,
`adt-fallback`, `adt-learn`, `adt-loop`, `adt-mcp-health`, `adt-memory`,
`adt-model-serving` (partial), `adt-multi-agent`, `adt-orchestrate`,
`adt-plan`, `adt-plan-change`, `adt-plugin-audit`, `adt-rag-coverage`,
`adt-rag-curate`, `adt-rag-drift`, `adt-rag-index-rebuild`, `adt-rag-inspect`,
`adt-rag-quality`, `adt-repo-intake`, `adt-route`, `adt-schedule`,
`adt-smart-commands`, `adt-smart-model-route`, `adt-specs-aggregate-roadmap`,
`adt-specs-roadmap-refresh`, `adt-specs-spec-new`, `adt-sync-pt-parity`,
`adt-tdd`, `adt-ticket`, `adt-token-audit`, `adt-toolkit-sync`, `adt-worktree-flow`

**Community/Anthropic skills (no collection):**
`claude-api`, `dispatching-parallel-agents`, `docx`, `eng-api-test-suite-builder`,
`eng-code-tour`, `eng-docker-development`, `eng-git-worktree-manager`,
`eng-mcp-server-builder`, `executing-plans`, `pdf`, `pptx`,
`skill-creator`, `skill-md-adoption`, `slack-gif-creator`,
`spec-driven-development`, `subagent-driven-development`,
`test-driven-development`, `using-git-worktrees`, `using-superpowers`,
`web-artifacts-builder`, `writing-skills`, `xlsx`

---

## Phase 1 — Remove `discord-bot-dev`

**Why:** Platform-specific (Discord/TypeScript). Every skill in it already exists in
`verification-review-gate`, `production-debugging`, or `security-first-dev`.
Removing it tightens the signal-to-noise ratio on the collections page.

**Action:** Delete `packages/catalog/catalog/collections/discord-bot-dev.yaml`

**Validation:** `pnpm --filter catalog validate` passes; collections page renders 12 collections.

---

## Phase 2 — Add 10 New Collections

### C1. `multi-agent-orchestration`

**Theme:** Dispatching work across multiple agents, parallel execution, routing decisions.
Targets users building or running multi-agent pipelines.

```yaml
id: multi-agent-orchestration
name: Multi-Agent Orchestration
description: >
  Build and operate multi-agent workflows — dispatch parallel tasks, route
  sub-agents to the right tier, loop until convergence, and handle failures
  gracefully. For teams automating complex pipelines or maintaining autonomous
  Claude Code sessions.
tags: [orchestration, agents, automation, dispatch, multi-agent]
items:
  - {kind: skill, id: adt-dispatch}
  - {kind: skill, id: adt-orchestrate}
  - {kind: skill, id: adt-multi-agent}
  - {kind: skill, id: adt-loop}
  - {kind: skill, id: adt-route}
  - {kind: skill, id: adt-fallback}
  - {kind: skill, id: dispatching-parallel-agents}
  - {kind: skill, id: subagent-driven-development}
  - {kind: skill, id: task-orchestration}
  - {kind: skill, id: adt-smart-model-route}
  - {kind: agent, id: executor}
  - {kind: agent, id: planner}
```

---

### C2. `rag-maintenance`

**Theme:** Keep a RAG index healthy — audit coverage, curate chunks, detect drift,
rebuild after catalog changes. Targets users with an active local RAG index.

**Note:** This branch (`feat/rag-maintenance-skills`) just shipped 6 `adt-rag-*`
maintenance skills. This collection makes them discoverable.

```yaml
id: rag-maintenance
name: RAG Maintenance
description: >
  Keep your RAG index clean and high-quality — audit chunk coverage, inspect
  what's indexed, curate low-quality or stale entries, detect drift between
  source and index, and rebuild after large catalog changes. For anyone running
  the forgekit local RAG pipeline.
tags: [rag, maintenance, indexing, quality, context]
items:
  - {kind: skill, id: adt-rag-coverage}
  - {kind: skill, id: adt-rag-curate}
  - {kind: skill, id: adt-rag-drift}
  - {kind: skill, id: adt-rag-index-rebuild}
  - {kind: skill, id: adt-rag-inspect}
  - {kind: skill, id: adt-rag-quality}
  - {kind: skill, id: adt-rag}
  - {kind: skill, id: adt-rag-context-pack}
  - {kind: server, id: memory}
```

---

### C3. `spec-and-planning`

**Theme:** Spec-driven design → structured planning → executable roadmaps. From
greenfield ideation to a committed, validated plan file.

```yaml
id: spec-and-planning
name: Spec & Planning
description: >
  From rough idea to a committed, validated plan — write a spec, break it into
  phased work, aggregate across specs into a living roadmap, and execute with
  evidence-gated checkpoints. Stack-agnostic; pairs with any project type.
tags: [planning, spec-driven, roadmap, design, architecture]
items:
  - {kind: skill, id: adt-plan}
  - {kind: skill, id: adt-plan-change}
  - {kind: skill, id: adt-specs-spec-new}
  - {kind: skill, id: adt-specs-aggregate-roadmap}
  - {kind: skill, id: adt-specs-roadmap-refresh}
  - {kind: skill, id: spec-driven-development}
  - {kind: skill, id: writing-plans}
  - {kind: skill, id: executing-plans}
  - {kind: skill, id: brainstorming}
  - {kind: agent, id: planner}
  - {kind: agent, id: architect}
```

---

### C4. `token-and-context-optimization`

**Theme:** Reduce token spend and keep context lean — audit usage, compress assets,
hygiene passes, and smart routing to smaller models when appropriate.

```yaml
id: token-and-context-optimization
name: Token & Context Optimization
description: >
  Keep sessions lean and cheap — audit token usage, compress assets before
  context load, enforce context hygiene, route tasks to the right model tier,
  and automate pre-compact/post-compact maintenance. Extends any workflow
  without changing how you code.
tags: [tokens, context, performance, cost, optimization]
items:
  - {kind: skill, id: adt-token-audit}
  - {kind: skill, id: adt-cost}
  - {kind: skill, id: adt-compress-assets}
  - {kind: skill, id: adt-context-hygiene}
  - {kind: skill, id: adt-context}
  - {kind: skill, id: adt-smart-commands}
  - {kind: skill, id: adt-smart-model-route}
  - {kind: skill, id: context-building}
  - {kind: hook, id: pre-compact}
  - {kind: hook, id: post-compact}
  - {kind: hook, id: token-usage-monitor}
  - {kind: hook, id: context-optimizer}
```

---

### C5. `git-and-version-control`

**Theme:** Git worktrees, branch discipline, worktree-aware flows. For anyone who
manages parallel branches or uses isolated worktrees for AI-assisted work.

```yaml
id: git-and-version-control
name: Git & Version Control
description: >
  Worktree-aware git workflows — spin up isolated branches for each feature,
  manage multiple Claude Code sessions in parallel, finish branches cleanly,
  and checkpoint state before long-running sessions. Works for solo devs and
  team repos alike.
tags: [git, worktrees, version-control, branching, flow]
items:
  - {kind: skill, id: git-worktrees}
  - {kind: skill, id: using-git-worktrees}
  - {kind: skill, id: eng-git-worktree-manager}
  - {kind: skill, id: adt-worktree-flow}
  - {kind: skill, id: adt-checkpoint}
  - {kind: skill, id: finishing-a-development-branch}
  - {kind: agent, id: git-master}
  - {kind: server, id: github}
```

---

### C6. `document-generation`

**Theme:** Create structured office documents and artifacts directly from the editor —
PDFs, Word docs, spreadsheets, slides, web artifacts.

```yaml
id: document-generation
name: Document Generation
description: >
  Generate polished documents without leaving the editor — Word docs, PDFs,
  spreadsheets, slide decks, and web artifacts from structured data or prose.
  Pairs with research-and-writing for the full cycle: draft → format → export.
tags: [documents, productivity, export, office, artifacts]
items:
  - {kind: skill, id: pdf}
  - {kind: skill, id: docx}
  - {kind: skill, id: pptx}
  - {kind: skill, id: xlsx}
  - {kind: skill, id: doc-coauthoring}
  - {kind: skill, id: web-artifacts-builder}
  - {kind: skill, id: internal-comms}
  - {kind: agent, id: document-specialist}
```

---

### C7. `infrastructure-and-devops`

**Theme:** Containerised environments, CI/CD pipelines, secrets management,
dependency hygiene. For teams shipping to production on any cloud.

```yaml
id: infrastructure-and-devops
name: Infrastructure & DevOps
description: >
  Container-first development and automated pipelines — build Docker environments,
  design CI/CD workflows, manage secrets safely, and audit dependencies before
  they reach production. Stack-agnostic; pairs well with security-first-dev.
tags: [docker, ci-cd, infra, devops, containers, secrets]
items:
  - {kind: skill, id: eng-docker-development}
  - {kind: skill, id: eng-ci-cd-pipeline-builder}
  - {kind: skill, id: eng-env-secrets-manager}
  - {kind: skill, id: eng-dependency-auditor}
  - {kind: skill, id: adt-toolkit-sync}
  - {kind: server, id: docker}
  - {kind: server, id: kubernetes}
  - {kind: server, id: github}
  - {kind: hook, id: validate-secrets}
  - {kind: hook, id: pre-commit-validation}
  - {kind: agent, id: adt-systematic-debugger}
```

---

### C8. `api-and-mcp-development`

**Theme:** Build HTTP APIs, MCP servers, and Claude integrations from scratch or
extend existing ones. Includes testing patterns and the Claude API SDK.

```yaml
id: api-and-mcp-development
name: API & MCP Development
description: >
  Design, build, and test APIs and MCP servers — from contract-first API design
  and automated test suites to full MCP server construction and Claude API
  integration. Use when building the surface that agents and clients depend on.
tags: [api, mcp, sdk, integration, development, claude-api]
items:
  - {kind: skill, id: eng-api-design-reviewer}
  - {kind: skill, id: eng-api-test-suite-builder}
  - {kind: skill, id: eng-mcp-server-builder}
  - {kind: skill, id: mcp-builder}
  - {kind: skill, id: claude-api}
  - {kind: skill, id: adt-mcp-patterns}
  - {kind: skill, id: adt-eval}
  - {kind: server, id: context7}
  - {kind: server, id: github}
  - {kind: agent, id: architect}
```

---

### C9. `codebase-onboarding`

**Theme:** Orient to an unfamiliar codebase fast — map the structure, understand key
abstractions, walk through the code with a guide, and identify the right entry points.

```yaml
id: codebase-onboarding
name: Codebase Onboarding
description: >
  Get productive in an unfamiliar codebase quickly — map the project structure,
  walk through core abstractions with a code tour, identify entry points, and
  pull live docs for the libraries in use. Useful for new hires, OSS contributors,
  and anyone inheriting a legacy project.
tags: [onboarding, exploration, codebase, learning, architecture]
items:
  - {kind: skill, id: eng-codebase-onboarding}
  - {kind: skill, id: eng-code-tour}
  - {kind: skill, id: adt-repo-intake}
  - {kind: skill, id: adt-learn}
  - {kind: skill, id: brainstorming}
  - {kind: skill, id: using-superpowers}
  - {kind: server, id: context7}
  - {kind: server, id: serena}
  - {kind: server, id: github}
  - {kind: agent, id: architect}
  - {kind: agent, id: document-specialist}
```

---

### C10. `skill-authoring`

**Theme:** Create, adopt, and maintain Claude Code skills — write the SKILL.md, test
the skill, maintain parity between locales, and publish to the catalog.

```yaml
id: skill-authoring
name: Skill Authoring
description: >
  Write, adopt, and publish Claude Code skills — design a SKILL.md, test the
  pattern in practice, maintain locale parity, and integrate with the forgekit
  catalog. For contributors building reusable AI-assisted workflows.
tags: [skills, authoring, community, catalog, contribution]
items:
  - {kind: skill, id: skill-creator}
  - {kind: skill, id: skill-md-adoption}
  - {kind: skill, id: writing-skills}
  - {kind: skill, id: adt-add}
  - {kind: skill, id: adt-auto-invoke}
  - {kind: skill, id: adt-sync-pt-parity}
  - {kind: skill, id: adt-bilingual-readme-sync}
  - {kind: skill, id: prompting-discipline}
```

---

## Phase 3 — Update 2 Existing Collections

### U1. `release-and-deploy` — add worktree and checkpoint skills

**Add:**
- `{kind: skill, id: adt-worktree-flow}` — isolate release work in a clean worktree
- `{kind: skill, id: adt-checkpoint}` — save state before long release steps

### U2. `verification-review-gate` — add TDD/test-authoring entry points

**Add:**
- `{kind: skill, id: test-driven-development}` — write tests first
- `{kind: skill, id: adt-tdd}` — forgekit TDD skill

---

## Collection Coverage After Changes

| Collection | Items (est.) | New? |
|-----------|-------------|------|
| claude-code-power-user | 15 | no |
| context-rag-launchpad | 11 | no |
| ~~discord-bot-dev~~ | ~~removed~~ | **deleted** |
| local-models-starter | 6 | no |
| mcp-ops-and-recovery | 13 | no |
| production-debugging | 11 | no |
| professional-work-toolkit | 20 | no |
| release-and-deploy | 11+2 | updated |
| research-and-writing | 9 | no |
| security-first-dev | 12 | no |
| solo-developer-starter | 9 | no |
| verification-review-gate | 15+2 | updated |
| web-app-development | 14 | no |
| **multi-agent-orchestration** | 12 | **NEW** |
| **rag-maintenance** | 9 | **NEW** |
| **spec-and-planning** | 11 | **NEW** |
| **token-and-context-optimization** | 12 | **NEW** |
| **git-and-version-control** | 8 | **NEW** |
| **document-generation** | 8 | **NEW** |
| **infrastructure-and-devops** | 11 | **NEW** |
| **api-and-mcp-development** | 10 | **NEW** |
| **codebase-onboarding** | 11 | **NEW** |
| **skill-authoring** | 8 | **NEW** |

**Total: 22 collections (was 13, net +9 after removal)**

---

## Skills Still Uncovered After All Changes

After applying this plan, the following skills remain without a collection (low priority, niche use):
- `adt-plugin-audit` — plugin governance (deferred until plugin system lands)
- `adt-memory` — overlaps with context-rag-launchpad; could be merged later
- `adt-schedule` — could go in multi-agent-orchestration if needed
- `adt-ticket` — could go in professional-work-toolkit; verify overlap
- `slack-gif-creator` — entertainment tool; intentionally out of any serious collection
- `prompt-injection-defense` — already in security-first-dev and professional-work-toolkit

---

## Execution Order (recommended)

1. **Phase 1** (delete `discord-bot-dev`) — 5 min, no risk, single file delete
2. **C2** (`rag-maintenance`) — directly relevant to the current branch work
3. **C1** (`multi-agent-orchestration`) — high demand, skills already confirmed
4. **C3** (`spec-and-planning`) — foundational, broad appeal
5. **C5** (`git-and-version-control`) — frequently requested pattern
6. **C4** (`token-and-context-optimization`) — large skill cluster, clear theme
7. **C6** (`document-generation`) — Anthropic-official skills, zero risk
8. **C7** (`infrastructure-and-devops`) — Docker + Kubernetes cluster
9. **C8** (`api-and-mcp-development`) — MCP/API builders audience
10. **C9** (`codebase-onboarding`) — exploration pattern cluster
11. **C10** (`skill-authoring`) — contributor audience, catalog contributors
12. **Phase 3** (`release-and-deploy` + `verification-review-gate` updates) — low risk additions

---

## Validation per Step

Each collection addition:
1. `pnpm --filter catalog validate` — zero errors
2. `pnpm --filter web build` — zero TypeScript/build errors
3. Manual spot-check of the collection detail page in dev server

Final state check:
- `jq '.collections | length' packages/catalog/dist/index.json` → 22
- All new collection IDs appear in `index.json`
- pt-BR translations present for all new collections

---

## Notes

- All new skills referenced in this plan have confirmed `manifest.json` files in the catalog
- `adt-smart-model-route` was added in C1 and C4 — check for duplicate references at validation time (catalog deduplicates per collection, but two collections referencing same skill is fine)
- `slack-gif-creator` intentionally excluded from all collections (entertainment, not professional)
- `adt-plugin-audit` deferred until the plugin system spec progresses
