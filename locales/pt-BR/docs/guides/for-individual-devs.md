---
status: published
audience: individual
---

# Para Desenvolvedores Individuais

Workflow pessoal: Planejar → Entregar → Especificar. Como ferramentas de dev assistido por IA se integram ao seu ciclo diário.

## O Ciclo de Workflow

```
┌─────────────┐       ┌──────────┐       ┌──────────┐       ┌────────┐
│   Planejar  │──────▶│ Entregar │──────▶│Especificar──────▶│ Revisar│
│ (CLAUDE.md) │       │ (Skills) │       │(Handoff) │       │(Tools) │
└─────────────┘       └──────────┘       └──────────┘       └────────┘
      ▲                                                           │
      └───────────────────────────────────────────────────────────┘
```

## Estágio 1: Planejar — Configure Suas Regras

Copie um arquivo de regra para seu projeto:
- `rules/CLAUDE.md` → Claude Code, Codex
- `rules/COPILOT.md` → GitHub Copilot
- `rules/GEMINI.md` → Gemini CLI
- `rules/AGENTS.md` para fluxos multi-agente

**O arquivo sempre é carregado.** Você escreve apenas uma vez, reutiliza para sempre. Veja [Convenções como Código](./conventions-as-code.md) para saber como regras se sobrepõem aos padrões de ferramenta.

## Estágio 2: Entregar — Use Skills

Skills são ferramentas com nome de verbo, propósito único. Ative-as em seu prompt:

- `/recall "feature name"` — encontre padrões de código relevantes
- `/context-pack "module path"` — assemble contexto de API
- `/plan "5-step refactor"` — quebre mudanças grandes
- `/dispatch "2 subagents"` — paralelise análise

Veja [Kit Overview](../AI_ASSISTED_DEVELOPMENT_SUMMARY.md) para o catálogo completo de skills. Vincule uma skill em seu prompt; a ferramenta de IA a chama automaticamente.

## Estágio 3: Especificar — Documente Decisões

Ao entregar para produção, confirme uma spec:

```bash
echo "### New Feature X

- What: Async timeout for connections
- Why: Prevent resource leaks
- How: Thread timeout param through pool, add circuit breaker
" > docs/specs/2026-04-15-feature-x/spec.md
```

Specs alimentam o `docs/roadmap.md` gerado automaticamente. Com o tempo, elas se tornam sua trilha de auditoria de decisões do projeto. Veja [Benchmarks](./benchmarks.md) para saber por que isso importa.

## Estágio 4: Revisar — Governança

Conforme você escala:
- Ative hooks: `bash install-rag.sh --with-hooks` (opcional)
- Verifique a checklist de governança: [Governança](./governance.md)
- Compartilhe [Para Times](./for-teams.md) com seu líder se estiver entrando em trabalho de time

---

**Dúvidas?** Veja [Primitivos](./primitives.md) para a árvore de decisão "deveria ser uma skill, agente ou hook?"
