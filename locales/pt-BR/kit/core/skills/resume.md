---
name: resume
description: Recupere o estado da sessão a partir de git, planos e trabalho recente para continuar de onde parou
triggers:
  - resume
  - continuar
  - o que eu estava fazendo
  - retomar de onde parei
  - iniciar sessão
---

# Resume

Carregue o estado atual e sugira a próxima ação.

## Steps

1. Verifique o git status e o log recente (últimos 5 commits)
2. Verifique se há PRs abertos na branch atual
3. Procure arquivos de plano em `.agents/plans/` ou `.claude/plans/`
4. Procure marcadores TODO/FIXME nos arquivos alterados recentemente
5. Resuma o estado e recomende a próxima ação

## Priority Order

1. PR aberto com feedback de review → trate comentários primeiro
2. CI quebrado na branch atual → corrija antes de novo trabalho
3. Existe arquivo de plano ativo → continue da última fase incompleta
4. Há mudanças não commitadas → decidir: commit, stash ou descarte
5. Sem trabalho em andamento → verifique backlog ou peça direção

## Output

```text
## Session State
Branch: <nome>
Last commit: <mensagem> (<tempo atrás>)
Open PRs: <count>
Active plan: <path or none>
## Anti-Pattern: False Completion

**Symptom**: Resume finds clean git and all plan phases marked done → archives handoff without implementing anything.

### Root Causes

1. **Handoff captured already-done phases** — grep extracted plan header including completed phases
   - Fix: Only extract phases without `✅`, `DONE`, or `complete` markers

2. **No explicit action directive** — handoff says "review state" instead of "implement X"
   - Fix: Require `## ⚡ IMPLEMENT THIS` section with checkboxes in every handoff

3. **Plan phases not marked complete** — completed phases show as pending to the next agent
   - Fix: Immediately after merging/shipping, update plan: `## Phase 1 ✅ SHIPPED`

### Checklist Before Archiving

- [ ] Read the `## ⚡ IMPLEMENT THIS` section (not just task description)
- [ ] Is there uncompleted work in that section?
  - Yes → implement first, then archive
  - No → archive (work was done before handoff was created)
- [ ] Is git clean because work shipped, or because work was never started?

## Rules

- Sempre verifique o estado do git antes de sugerir trabalho
- Se existir PR aberto, priorize feedback de review acima de novo trabalho
- Nunca inicie novo trabalho sem reconhecer o que já está em andamento
- Se existir um arquivo de plano, continue de onde ele parou
