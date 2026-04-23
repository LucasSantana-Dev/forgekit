---
name: plan
description: Analise a base de código e crie um plano estruturado de implementação antes de escrever código
triggers:
  - criar um plano
  - planeje isso
  - antes de implementar
  - qual a abordagem
---

# Plan

Antes de escrever código, reúna contexto e produza um plano estruturado.

## Steps

1. Leia arquivos relevantes — `CLAUDE.md` / `AGENTS.md`, git log recente, PRs abertos
2. Entenda o estado atual — o que existe, o que está parcial, o que falta
3. Quebre o trabalho em fases (cada uma concluível em ~1-2 horas)
4. Identifique dependências entre as fases
5. Escreva o plano em `.agents/plans/<task-name>.md` ou `.claude/plans/<task-name>.md`

## Plan Structure

```markdown
# <Task>

## Goal
Uma frase.

## Phases
### Phase 1: <name>
Passos, arquivos a tocar, check de verificação.

### Phase N: Ship
Lint + build + test + PR.
```

## Rules

- Explore antes de implementar — não assuma o estado atual
- Toda fase deve ter um passo de verificação
- Liste explicitamente o que está FORA DE ESCOPO
- Se o trabalho já estiver >40% pronto, documente o que está completo antes de continuar
