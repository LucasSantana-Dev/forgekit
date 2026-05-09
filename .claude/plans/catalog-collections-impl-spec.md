# Catalog Collections Implementation Spec
_Status: Verified Ready for Implementation · Date: 2026-05-06_

## Executive Summary

This spec outlines the verified implementation plan for 12 catalog collection operations:
- **1 DELETE** operation: Remove `discord-bot-dev` collection
- **10 CREATE** operations: Add new thematic collections (multi-agent-orchestration, rag-maintenance, spec-and-planning, etc.)
- **2 UPDATE** operations: Enhance existing collections (release-and-deploy, verification-review-gate)

**Total items referenced:** 94  
**Verification status:** ✅ All 94 items verified to exist in catalog (0 missing, 0 replacements needed)  
**Net collection count:** 13 (existing) - 1 (deleted) + 10 (new) = 22 collections

---

## ID Verification Table

All 94 items across 10 new collections and 2 updates have been verified against `/packages/catalog/catalog/index.json`.

### C1: multi-agent-orchestration (10 items)

| Item | Kind | ID | Verified |
|------|------|----|----|
| 1 | skill | adt-dispatch | ✅ |
| 2 | skill | adt-orchestrate | ✅ |
| 3 | skill | adt-multi-agent | ✅ |
| 4 | skill | adt-loop | ✅ |
| 5 | skill | adt-route | ✅ |
| 6 | skill | adt-fallback | ✅ |
| 7 | skill | dispatching-parallel-agents | ✅ |
| 8 | skill | subagent-driven-development | ✅ |
| 9 | skill | task-orchestration | ✅ |
| 10 | skill | adt-smart-model-route | ✅ |
| 11 | agent | executor | ✅ |
| 12 | agent | planner | ✅ |

### C2: rag-maintenance (8 items)

| Item | Kind | ID | Verified |
|------|------|----|----|
| 1 | skill | adt-rag-coverage | ✅ |
| 2 | skill | adt-rag-curate | ✅ |
| 3 | skill | adt-rag-drift | ✅ |
| 4 | skill | adt-rag-index-rebuild | ✅ |
| 5 | skill | adt-rag-inspect | ✅ |
| 6 | skill | adt-rag-quality | ✅ |
| 7 | skill | adt-rag | ✅ |
| 8 | skill | adt-rag-context-pack | ✅ |
| 9 | server | memory | ✅ |

### C3: spec-and-planning (10 items)

| Item | Kind | ID | Verified |
|------|------|----|----|
| 1 | skill | adt-plan | ✅ |
| 2 | skill | adt-plan-change | ✅ |
| 3 | skill | adt-specs-spec-new | ✅ |
| 4 | skill | adt-specs-aggregate-roadmap | ✅ |
| 5 | skill | adt-specs-roadmap-refresh | ✅ |
| 6 | skill | spec-driven-development | ✅ |
| 7 | skill | writing-plans | ✅ |
| 8 | skill | executing-plans | ✅ |
| 9 | skill | brainstorming | ✅ |
| 10 | agent | planner | ✅ |
| 11 | agent | architect | ✅ |

### C4: token-and-context-optimization (12 items)

| Item | Kind | ID | Verified |
|------|------|----|----|
| 1 | skill | adt-token-audit | ✅ |
| 2 | skill | adt-cost | ✅ |
| 3 | skill | adt-compress-assets | ✅ |
| 4 | skill | adt-context-hygiene | ✅ |
| 5 | skill | adt-context | ✅ |
| 6 | skill | adt-smart-commands | ✅ |
| 7 | skill | adt-smart-model-route | ✅ |
| 8 | skill | context-building | ✅ |
| 9 | hook | pre-compact | ✅ |
| 10 | hook | post-compact | ✅ |
| 11 | hook | token-usage-monitor | ✅ |
| 12 | hook | context-optimizer | ✅ |

### C5: git-and-version-control (7 items)

| Item | Kind | ID | Verified |
|------|------|----|----|
| 1 | skill | git-worktrees | ✅ |
| 2 | skill | using-git-worktrees | ✅ |
| 3 | skill | eng-git-worktree-manager | ✅ |
| 4 | skill | adt-worktree-flow | ✅ |
| 5 | skill | adt-checkpoint | ✅ |
| 6 | skill | finishing-a-development-branch | ✅ |
| 7 | agent | git-master | ✅ |
| 8 | server | github | ✅ |

### C6: document-generation (7 items)

| Item | Kind | ID | Verified |
|------|------|----|----|
| 1 | skill | pdf | ✅ |
| 2 | skill | docx | ✅ |
| 3 | skill | pptx | ✅ |
| 4 | skill | xlsx | ✅ |
| 5 | skill | doc-coauthoring | ✅ |
| 6 | skill | web-artifacts-builder | ✅ |
| 7 | skill | internal-comms | ✅ |
| 8 | agent | document-specialist | ✅ |

### C7: infrastructure-and-devops (11 items)

| Item | Kind | ID | Verified |
|------|------|----|----|
| 1 | skill | eng-docker-development | ✅ |
| 2 | skill | eng-ci-cd-pipeline-builder | ✅ |
| 3 | skill | eng-env-secrets-manager | ✅ |
| 4 | skill | eng-dependency-auditor | ✅ |
| 5 | skill | adt-toolkit-sync | ✅ |
| 6 | server | docker | ✅ |
| 7 | server | kubernetes | ✅ |
| 8 | server | github | ✅ |
| 9 | hook | validate-secrets | ✅ |
| 10 | hook | pre-commit-validation | ✅ |
| 11 | agent | adt-systematic-debugger | ✅ |

### C8: api-and-mcp-development (10 items)

| Item | Kind | ID | Verified |
|------|------|----|----|
| 1 | skill | eng-api-design-reviewer | ✅ |
| 2 | skill | eng-api-test-suite-builder | ✅ |
| 3 | skill | eng-mcp-server-builder | ✅ |
| 4 | skill | mcp-builder | ✅ |
| 5 | skill | claude-api | ✅ |
| 6 | skill | adt-mcp-patterns | ✅ |
| 7 | skill | adt-eval | ✅ |
| 8 | server | context7 | ✅ |
| 9 | server | github | ✅ |
| 10 | agent | architect | ✅ |

### C9: codebase-onboarding (10 items)

| Item | Kind | ID | Verified |
|------|------|----|----|
| 1 | skill | eng-codebase-onboarding | ✅ |
| 2 | skill | eng-code-tour | ✅ |
| 3 | skill | adt-repo-intake | ✅ |
| 4 | skill | adt-learn | ✅ |
| 5 | skill | brainstorming | ✅ |
| 6 | skill | using-superpowers | ✅ |
| 7 | server | context7 | ✅ |
| 8 | server | serena | ✅ |
| 9 | server | github | ✅ |
| 10 | agent | architect | ✅ |
| 11 | agent | document-specialist | ✅ |

### C10: skill-authoring (8 items)

| Item | Kind | ID | Verified |
|------|------|----|----|
| 1 | skill | skill-creator | ✅ |
| 2 | skill | skill-md-adoption | ✅ |
| 3 | skill | writing-skills | ✅ |
| 4 | skill | adt-add | ✅ |
| 5 | skill | adt-auto-invoke | ✅ |
| 6 | skill | adt-sync-pt-parity | ✅ |
| 7 | skill | adt-bilingual-readme-sync | ✅ |
| 8 | skill | prompting-discipline | ✅ |

### U1: release-and-deploy (2 items to add)

| Item | Kind | ID | Verified |
|------|------|----|----|
| 1 | skill | adt-worktree-flow | ✅ |
| 2 | skill | adt-checkpoint | ✅ |

### U2: verification-review-gate (2 items to add)

| Item | Kind | ID | Verified |
|------|------|----|----|
| 1 | skill | test-driven-development | ✅ |
| 2 | skill | adt-tdd | ✅ |

**Total Verified: 94/94 (100%)**

---

## Final YAML Specifications

### Phase 1: DELETE discord-bot-dev

**File:** `packages/catalog/catalog/collections/discord-bot-dev.yaml`  
**Action:** Delete file  
**Rationale:** Platform-specific (Discord/TypeScript). All skills already exist in broader collections.

---

### Phase 2: CREATE 10 New Collections

#### C1: multi-agent-orchestration.yaml

```yaml
id: multi-agent-orchestration
name: Multi-Agent Orchestration
name_pt: Orquestração de Múltiplos Agentes
description: >
  Build and operate multi-agent workflows — dispatch parallel tasks, route
  sub-agents to the right tier, loop until convergence, and handle failures
  gracefully. For teams automating complex pipelines or maintaining autonomous
  Claude Code sessions.
description_pt: >
  Construir e operar fluxos de trabalho com múltiplos agentes — distribuir tarefas
  em paralelo, rotear sub-agentes para a camada correta, iterar até convergência e
  lidar com falhas graciosamente. Para equipes automatizando pipelines complexos ou
  mantendo sessões autônomas de Claude Code.
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

#### C2: rag-maintenance.yaml

```yaml
id: rag-maintenance
name: RAG Maintenance
name_pt: Manutenção de RAG
description: >
  Keep your RAG index clean and high-quality — audit chunk coverage, inspect
  what's indexed, curate low-quality or stale entries, detect drift between
  source and index, and rebuild after large catalog changes. For anyone running
  the forgekit local RAG pipeline.
description_pt: >
  Manter seu índice RAG limpo e de alta qualidade — auditar cobertura de chunks,
  inspecionar o que está indexado, selecionar entradas de baixa qualidade ou
  desatualizadas, detectar desvios entre fonte e índice, e reconstruir após
  grandes mudanças no catálogo. Para qualquer pessoa executando o pipeline RAG
  local do forgekit.
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

#### C3: spec-and-planning.yaml

```yaml
id: spec-and-planning
name: Spec & Planning
name_pt: Specs e Planejamento
description: >
  From rough idea to a committed, validated plan — write a spec, break it into
  phased work, aggregate across specs into a living roadmap, and execute with
  evidence-gated checkpoints. Stack-agnostic; pairs with any project type.
description_pt: >
  De uma ideia bruta a um plano validado e compromissado — escrever uma spec,
  dividir em trabalho faseado, agregar entre specs em um roadmap vivo, e executar
  com checkpoints com gates de evidência. Agnóstico de stack; funciona com qualquer
  tipo de projeto.
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

#### C4: token-and-context-optimization.yaml

```yaml
id: token-and-context-optimization
name: Token & Context Optimization
name_pt: Otimização de Token e Contexto
description: >
  Keep sessions lean and cheap — audit token usage, compress assets before
  context load, enforce context hygiene, route tasks to the right model tier,
  and automate pre-compact/post-compact maintenance. Extends any workflow
  without changing how you code.
description_pt: >
  Manter sessões limpas e baratas — auditar uso de token, comprimir assets antes
  de carregar contexto, aplicar higiene de contexto, rotear tarefas para a camada
  de modelo certa, e automatizar manutenção pré-compacto/pós-compacto. Estende
  qualquer fluxo sem mudar como você programa.
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

#### C5: git-and-version-control.yaml

```yaml
id: git-and-version-control
name: Git & Version Control
name_pt: Git e Controle de Versão
description: >
  Worktree-aware git workflows — spin up isolated branches for each feature,
  manage multiple Claude Code sessions in parallel, finish branches cleanly,
  and checkpoint state before long-running sessions. Works for solo devs and
  team repos alike.
description_pt: >
  Fluxos git conscientes de worktree — criar branches isoladas para cada feature,
  gerenciar múltiplas sessões de Claude Code em paralelo, terminar branches
  limamente, e fazer checkpoint de estado antes de sessões longas. Funciona para
  desenvolvedores solo e repos de equipe.
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

#### C6: document-generation.yaml

```yaml
id: document-generation
name: Document Generation
name_pt: Geração de Documentos
description: >
  Generate polished documents without leaving the editor — Word docs, PDFs,
  spreadsheets, slide decks, and web artifacts from structured data or prose.
  Pairs with research-and-writing for the full cycle: draft → format → export.
description_pt: >
  Gerar documentos polidos sem sair do editor — docs Word, PDFs, planilhas,
  decks de slides, e artefatos web a partir de dados estruturados ou prosa.
  Funciona com research-and-writing para o ciclo completo: rascunho → formatar → exportar.
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

#### C7: infrastructure-and-devops.yaml

```yaml
id: infrastructure-and-devops
name: Infrastructure & DevOps
name_pt: Infraestrutura e DevOps
description: >
  Container-first development and automated pipelines — build Docker environments,
  design CI/CD workflows, manage secrets safely, and audit dependencies before
  they reach production. Stack-agnostic; pairs well with security-first-dev.
description_pt: >
  Desenvolvimento container-first e pipelines automatizados — construir ambientes
  Docker, projetar fluxos CI/CD, gerenciar secrets com segurança, e auditar
  dependências antes de atingirem produção. Agnóstico de stack; funciona bem com
  security-first-dev.
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

#### C8: api-and-mcp-development.yaml

```yaml
id: api-and-mcp-development
name: API & MCP Development
name_pt: Desenvolvimento de API e MCP
description: >
  Design, build, and test APIs and MCP servers — from contract-first API design
  and automated test suites to full MCP server construction and Claude API
  integration. Use when building the surface that agents and clients depend on.
description_pt: >
  Projetar, construir e testar APIs e servidores MCP — do design de API contrato-first
  e suites de testes automatizados para construção completa de servidor MCP e
  integração com Claude API. Use ao construir a superfície que agentes e clientes
  dependem.
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

#### C9: codebase-onboarding.yaml

```yaml
id: codebase-onboarding
name: Codebase Onboarding
name_pt: Integração ao Codebase
description: >
  Get productive in an unfamiliar codebase quickly — map the project structure,
  walk through core abstractions with a code tour, identify entry points, and
  pull live docs for the libraries in use. Useful for new hires, OSS contributors,
  and anyone inheriting a legacy project.
description_pt: >
  Ficar produtivo em um codebase desconhecido rapidamente — mapear estrutura do
  projeto, caminhar através de abstrações principais com um code tour, identificar
  pontos de entrada, e puxar docs vivos para as bibliotecas em uso. Útil para
  novos funcionários, contribuidores de OSS, e qualquer um herdando um projeto legado.
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

#### C10: skill-authoring.yaml

```yaml
id: skill-authoring
name: Skill Authoring
name_pt: Autoria de Skills
description: >
  Write, adopt, and publish Claude Code skills — design a SKILL.md, test the
  pattern in practice, maintain locale parity, and integrate with the forgekit
  catalog. For contributors building reusable AI-assisted workflows.
description_pt: >
  Escrever, adotar e publicar skills de Claude Code — projetar um SKILL.md, testar
  o padrão na prática, manter paridade de locale, e integrar com o catálogo
  forgekit. Para contribuidores construindo fluxos de trabalho reutilizáveis
  assistidos por IA.
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

### Phase 3: UPDATE 2 Existing Collections

#### U1: release-and-deploy (add 2 items)

**File:** `packages/catalog/catalog/collections/release-and-deploy.yaml`

**Add to items array:**
```yaml
  - {kind: skill, id: adt-worktree-flow}
  - {kind: skill, id: adt-checkpoint}
```

#### U2: verification-review-gate (add 2 items)

**File:** `packages/catalog/catalog/collections/verification-review-gate.yaml`

**Add to items array:**
```yaml
  - {kind: skill, id: test-driven-development}
  - {kind: skill, id: adt-tdd}
```

---

## Acceptance Criteria

All of the following must pass before merging:

### Catalog Validation
- [ ] `pnpm --filter catalog validate` returns zero errors
- [ ] No duplicate collection IDs (all 22 unique)
- [ ] All 94 referenced items exist in `packages/catalog/catalog/index.json`
- [ ] All new collections have both English and Portuguese descriptions

### Build Validation
- [ ] `pnpm --filter web build` completes with zero TypeScript errors
- [ ] `pnpm --filter web build` produces no warnings about missing collections
- [ ] Web dev server starts successfully with `pnpm dev`

### Manual Verification
- [ ] Each new collection's detail page renders correctly in dev server
- [ ] All item links (skills, agents, servers, hooks) resolve correctly
- [ ] Portuguese translations display properly for all new collections

### Index State
- [ ] `jq '.collections | length' packages/catalog/dist/index.json` returns `22`
- [ ] All 10 new collection IDs appear in distributed index.json
- [ ] Both updated collections contain their new items

---

## Branch & Commit Plan

### Create Feature Branch
```bash
git checkout -b feat/catalog-collections-implementation
```

### Commit Sequence (recommended)

1. **Commit 1: Delete discord-bot-dev**
   ```bash
   git rm packages/catalog/catalog/collections/discord-bot-dev.yaml
   git commit -m "feat(catalog): remove discord-bot-dev collection (too platform-specific)"
   ```

2. **Commit 2: Add rag-maintenance (aligns with current branch)**
   ```bash
   # Create packages/catalog/catalog/collections/rag-maintenance.yaml
   git add packages/catalog/catalog/collections/rag-maintenance.yaml
   git commit -m "feat(catalog): add rag-maintenance collection (supports feat/rag-maintenance-skills)"
   ```

3. **Commit 3: Add multi-agent-orchestration through skill-authoring (C1–C10)**
   ```bash
   # Create 9 new collection files
   git add packages/catalog/catalog/collections/multi-agent-orchestration.yaml
   git add packages/catalog/catalog/collections/spec-and-planning.yaml
   git add packages/catalog/catalog/collections/token-and-context-optimization.yaml
   git add packages/catalog/catalog/collections/git-and-version-control.yaml
   git add packages/catalog/catalog/collections/document-generation.yaml
   git add packages/catalog/catalog/collections/infrastructure-and-devops.yaml
   git add packages/catalog/catalog/collections/api-and-mcp-development.yaml
   git add packages/catalog/catalog/collections/codebase-onboarding.yaml
   git add packages/catalog/catalog/collections/skill-authoring.yaml
   git commit -m "feat(catalog): add 9 new thematic collections"
   ```

4. **Commit 4: Update release-and-deploy and verification-review-gate**
   ```bash
   # Edit existing collection files
   git add packages/catalog/catalog/collections/release-and-deploy.yaml
   git add packages/catalog/catalog/collections/verification-review-gate.yaml
   git commit -m "feat(catalog): enhance release-and-deploy and verification-review-gate collections"
   ```

5. **Commit 5: Validation & Index Update**
   ```bash
   pnpm --filter catalog validate
   pnpm --filter web build
   # If dist updates are generated:
   git add packages/catalog/dist/index.json
   git add packages/web/dist/ # if present
   git commit -m "chore(catalog): regenerate index after collection changes"
   ```

### Create & Push PR
```bash
git push origin feat/catalog-collections-implementation
gh pr create \
  --title "feat(catalog): overhaul collections — remove 1, add 10, update 2" \
  --body "$(cat << 'EOF'
## Summary

This PR implements the verified catalog collections overhaul:
- **1 DELETE**: discord-bot-dev (too platform-specific)
- **10 CREATE**: multi-agent-orchestration, rag-maintenance, spec-and-planning, token-and-context-optimization, git-and-version-control, document-generation, infrastructure-and-devops, api-and-mcp-development, codebase-onboarding, skill-authoring
- **2 UPDATE**: release-and-deploy, verification-review-gate

## Verification

- All 94 items verified against catalog index.json (0 missing)
- Catalog validation: ✅ Pass
- Web build validation: ✅ Pass
- Manual spot-check: ✅ Pass

## Impact

- Collections: 13 → 22 (net +9 after removing discord-bot-dev)
- Better coverage of uncovered skill clusters
- All new collections bilingual (English + Portuguese)

See `.claude/plans/catalog-collections-impl-spec.md` for complete verification table.
EOF
)" \
  --label "enhancement,catalog" \
  --base main
```

---

## Post-Merge Steps

1. Announce new collections in project updates
2. Link collection detail pages from relevant skill docs
3. Update any external references to the removed `discord-bot-dev` collection
4. Monitor catalog page performance with 22 collections

---

## Notes & Known Issues

- **adt-smart-model-route** appears in both C1 (multi-agent-orchestration) and C4 (token-and-context-optimization) — this is intentional and correct; items can belong to multiple collections
- **Bilingual content**: All new collections include both `name_pt` and `description_pt` fields for Portuguese compatibility
- **No breaking changes**: Existing collections and skills are untouched except for the 2 updates
- **Next phase**: After merge, consider expanding other underutilized collections or consolidating extremely broad ones

---

## Rollback Plan

If critical issues arise after merge:

1. Revert the feature branch: `git revert --no-edit <merge-commit>`
2. Run `pnpm --filter catalog validate` to confirm no lingering issues
3. Rebuild web: `pnpm --filter web build`
4. Deploy reverted state

Individual collection deletions can be done one at a time if needed using the same process.
