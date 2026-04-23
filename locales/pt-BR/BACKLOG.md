# Mapa de Backlog do ai-dev-toolkit

_Última atualização: 2026-04-18_

## Snapshot

- Branch inspecionado: `main`
- Branch padrão: `main`
- Última versão lançada: `v0.16.0`
- PRs abertos: `0`
- Issues abertos: `0`
- Fonte primária de backlog: `backlog.json`
- Fonte de roadmap estratégico: `docs/roadmap.md` (regenerado a partir de `docs/specs/`)

## Resumo de Evidências

### Envios recentes confirmados

- `v0.16.0` lançado (PR #79).
- Skill de backup de workspace dev-assets-sync enviada (PR #81).
- Padrão de adoção `SKILL.md` agnóstico de vendor enviado (PR #80).
- Skills de roteamento autônomo (`loop`, `route`, `orchestrate`, `dispatch`, `fallback`, `add`, `secure`) enviadas (PR #78).
- Lazy-loading de ferramentas MCP + padrões de agent-evals-como-CI enviados (PR #76).
- Padrão de lacuna realidade-benchmark enviado (PR #77).
- Skill EN→PT sync enviada (PR #72).
- Onda 1 de AI Guides — primitivos, pacote de hooks, governança, benchmarks, playbook de adoção, migração de agentes, índice — enviado (PR #61).
- Kit RAG + kit specs enviado.
- Manifesto portável de hooks (`kit/core/hooks.json`) + schema enviado.
- Registro de ferramentas MCP (`kit/core/mcp.json`) enviado com 10 servidores em 3 perfis.
- `parity-audit-script` (`scripts/parity-audit.js`) enviado.
- `memory-skill`, `dispatch-skill`, `schedule-skill` enviados.
- Schemas JSON formais para todos os configs de kit/core enviados.

### Lacunas remanescentes confirmadas

- `kit/plugins/` ausente (apenas fase de design — não enfileirado para curto prazo).
- Templates de empresa adicionais além de `fullstack-forge` (adiado até a paridade de core se estabilizar).

---

## Agora

### 1. Cortar `v0.17.0`

**Por que agora**

- Skill de resume, teste de tier-governance de agentes e reconciliação de estado estão prontos para envio.
- PRs #80 (padrão de adoção SKILL.md) e #81 (dev-assets-sync) estão sem lançamento desde v0.16.0.

**Primeira ação**

- Promover `CHANGELOG.md [Não lançado]` → `[0.17.0]`; fazer bump de `package.json`; taggear e lançar.

---

## Próximo

_(nenhum — todos os itens Now/Next entram em v0.17.0)_

---

## Depois

### 2. Design do sistema de plugins

**Por que depois**

- Superfície de arquitetura ampla; depende de paridade + maturidade de config de core estar estável.
- `backlog.json → plugin-system` é `low+backlog`, gated em `hooks-manifest` (agora concluído).

**Primeira ação**

- Escrever uma nota de arquitetura curta esclarecendo limites de plugin: skills, hooks, config de MCP, providers.

### 3. Amplitude de template de empresa

Expandir além de `companies/fullstack-forge` para cobrir caminhos de adoção `solopreneur` e `startup-mvp` uma vez que a superfície core está estável.

---

## Limpeza / Mitigação de Risco

### A. Detecção de drift

Action GitHub semanal `backlog-triage` executa `npm run backlog:check`. Qualquer drift entre `backlog.json` e artefatos enviados deve ser reconciliado no mesmo ciclo.

### B. Guarda de release-gate

Pipeline de release já falha se:

- nome da branch implica em versão mais alta do que `package.json`
- conteúdo não lançado em `CHANGELOG.md` existe para branch de release com tag
- estado de release/tag do GitHub não corresponde à versão pretendida

### C. Manter ruído de instalação local fora do planejamento

Manter trabalho de planejamento e backlog em uma worktree limpa para evitar ruído de `node_modules/`.

---

## Ordem de execução recomendada

1. Cortar `v0.17.0` (envia skill de resume, governança de tier, reconciliação de estado)
2. Nota de design do sistema de plugins
3. Templates de empresa adicionais

---

## Próxima tarefa recomendada imediata

Promover `CHANGELOG.md [Não lançado]` para `[0.17.0]` e cortar o lançamento — trabalho enfileirado está verde e testes passam em 25/25.

- GitHub latest release → `v0.11.0`
- `backlog.json` still carries multiple governance and parity items as the active next work
- Human-readable backlog context was missing before this document

**First action**

- Keep `backlog.json` and the human-readable backlog in sync:
  1. reconcile shipped work to `done`
  2. add drift detection and recurring triage
  3. prioritize the next governance lanes for shipment

### 2. Formalize JSON schemas for forge-kit core config

**Why now**

- The repo already treats `agents.json`, `routing.json`, and `mcp.json` as structured contracts.
- Missing schemas are the clearest DX + governance gap after release readiness.

**Evidence**

- `backlog.json` → `json-schemas` is `high` + `ready`
- `kit/schema/` is currently missing
- Existing config files already reference schema paths (`agents.json`, `routing.json`)

**First action**

- Define the minimal schema set and validation contract for:
  - `agents.json`
  - `routing.json`
  - `mcp.json`
  - `autopilot.json`
  - `loop.json`
  - `token-optimization.json`
  - `hooks.json`

### 3. Close the highest-value adapter parity gaps

**Why now**

- The toolkit promise is cross-tool portability; parity gaps undermine the headline value proposition.
- This work is already explicitly queued and tightly coupled to the installer story.

**Evidence**

- `backlog.json` → `adapter-parity-close` is `high` + `ready`
- README and `kit/` position forge-kit as multi-tool, but parity work remains open

**First action**

- Re-run or reconstruct a parity matrix and convert it into adapter-specific subtasks.

---

## Próximos

### 4. Fill missing implementation docs/adapters

**Why next**

- These are concrete, bounded gaps that improve trust and adoption after the release and core schema work.

**Evidence**

- `implementations/antigravity/` missing
- `implementations/windsurf/README.md` missing
- `implementations/cursor/README.md` already present

**First action**

- Define a minimum implementation-doc contract and apply it to Antigravity + Windsurf.

### 5. Expand company templates beyond `fullstack-forge`

**Why next**

- Template breadth is an adoption multiplier, but it depends on the core forge-kit surface stabilizing first.

**Evidence**

- `backlog.json` → `company-templates` exists
- Only `companies/fullstack-forge/` is currently present

**First action**

- Pick the first two templates with the highest adoption leverage:
  - `solopreneur`
  - `startup-mvp`

### 6. Stabilize backlog governance itself

**Why next**

- There are no open GitHub issues/PRs, so backlog visibility currently lives inside the repo.
- Without a clear human-readable map, backlog.json alone is easy to ignore.

**Evidence**

- `gh pr list` → `[]`
- `gh issue list` → `[]`
- `backlog.json` exists, but there was no canonical markdown backlog before this map

**First action**

- Decide whether `backlog.json` remains the source of truth with `BACKLOG.md` as a human-readable projection.

---

## Depois

### 7. Add schedule / heartbeat automation

**Why later**

- Important for autonomous workflows, but not a release blocker.
- Best done after the core config/schema story is stable.

**Evidence**

- `backlog.json` → `heartbeat-schedule`
- `kit/core/schedules.json` is missing

**First action**

- Define 3 concrete schedule use cases before inventing schema shape.

### 8. Design the plugin system

**Why later**

- It is a broad architecture surface and should not outrun parity + core config maturity.

**Evidence**

- `backlog.json` → `plugin-system`
- `kit/plugins/` is missing

**First action**

- Write a short architecture note clarifying plugin boundaries: skills, hooks, MCP config, providers.

### 9. Align the repo backlog with the broader forge-kit roadmap

**Why later**

- `.claude/plans/universal-toolkit-installer.md` suggests a larger initiative than the current backlog.json expresses.
- This should become an epic map once the release line is stable.

**Evidence**

- `.claude/plans/universal-toolkit-installer.md`

**First action**

- Extract roadmap milestones from that plan and link them to backlog epics.

---

## Limpeza / Redução de Risco

### A. Separar “ausente por design” de “ausente por omissão”

Para cada caminho ausente, adicione uma classificação:

- `required-now`
- `planned-next`
- `deferred`
- `intentionally-out-of-scope`

### B. Tornar impossível o estado de release se desalinhar silenciosamente

Adicione um gate de release que falhe se:

- o nome da branch implicar uma versão maior do que a de `package.json`
- existir conteúdo em `CHANGELOG.md` na seção unreleased para uma branch de release já tagueada
- o estado de release/tag no GitHub não corresponder à versão pretendida

### C. Manter ruído de instalação local fora do planejamento

Se o seu checkout contiver ruído local de workspace, como `node_modules/`, mantenha o planejamento e o trabalho de backlog em um worktree limpo para evitar sinais falsos no backlog.

---

## Ordem de execução recomendada

1. Entregar `v0.11.0`
2. Adicionar JSON schemas + enforcement de validação
3. Fechar gaps de parity entre adapters
4. Preencher a documentação de implementação de Antigravity/Windsurf
5. Expandir templates de companies
6. Adicionar a camada de schedules
7. Projetar o sistema de plugins
8. Incorporar o roadmap do instalador universal aos épicos de longo prazo

---

## Próxima tarefa recomendada imediatamente

**Entregar a próxima frente de governança pós-release** com checklist explícito e gates de verificação.
