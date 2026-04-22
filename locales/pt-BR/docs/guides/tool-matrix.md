---
status: published
audience: technical
---

# Matriz de Ferramentas: Skills × Ferramentas × Primitivas

Quais skills funcionam com quais ferramentas de IA? Quais primitivas cada ferramenta suporta?

---

## Suporte de Primitivas por Ferramenta

| Ferramenta | Rules | Skills | Agents | Hooks | Notas |
|------|-------|--------|--------|-------|-------|
| Claude Code | ✓ (CLAUDE.md) | ✓ | ✓ (via agents.json) | ✓ (post-edit hooks) | Suporte completo |
| Codex CLI | ✓ (AGENTS.md) | ✓ | ✓ (agents.json) | ✗ | Sem hooks de momento de edição |
| GitHub Copilot | ✓ (COPILOT.md) | Parcial | ✗ (futuro) | ✗ | Skills apenas por prompting |
| Cursor | ✓ (CLAUDE.md) | ✓ | ✗ (ainda não) | ✗ | Usa rules do Claude |
| Gemini CLI | ✓ (GEMINI.md) | ✓ | ✗ (ainda não) | ✗ | Suporte parcial a multi-agent |
| Antigravity | ✓ (ANTIGRAVITY.md) | ✓ | ✗ | ✗ | Ferramenta gated por SSH; rules customizadas |

---

## Skills Representativas e Cobertura

| Skill | Categoria | Claude Code | Codex | Copilot | Cursor | Gemini | Notas |
|-------|----------|-------------|-------|---------|--------|--------|-------|
| **plan.md** | Planejamento | ✓ | ✓ | ✓ | ✓ | ✓ | Funciona em qualquer lugar; baseada em texto |
| **recall.md** | Contexto | ✓ | ✓ | ✓ | ✓ | ✓ | RAG-driven; portável |
| **dispatch.md** | Orquestração | ✓ | ✓ | ✗ | ✗ | Parcial | Precisa de suporte multi-agent |
| **review.md** | Qualidade | ✓ | ✓ | ✓ | ✓ | ✓ | Skill core, bem suportada |
| **route.md** | Orquestração | ✓ | ✓ | ✗ | ✗ | Parcial | Árvores de decisão; Copilot usa fallback |
| **auto-invoke.md** | Meta | ✓ | ✓ | ✗ | ✗ | ✗ | Requer integração no nível do harness |
| **eval.md** | Qualidade | ✓ | ✓ | ✓ | ✓ | ✓ | Benchmarking; baseada em texto |
| **context.md** | Contexto | ✓ | ✓ | ✓ | ✓ | ✓ | Montagem de arquivos; portável |
| **memory.md** | Estado | ✓ | ✓ | Parcial | Parcial | Parcial | Recall no nível da sessão |
| **multi-agent.md** | Padrões | ✓ | ✓ | ✗ | ✗ | Parcial | Padrões de roteamento avançado |
| **mcp-patterns.md** | Arquitetura | ✓ | ✓ | ✓ | ✓ | ✓ | Projeto de servidor MCP; referência |
| **schedule.md** | Automação | ✓ | ✓ | ✗ | ✗ | Parcial | Triggers baseados em cron |
| **debug.md** | Debugging | ✓ | ✓ | ✓ | ✓ | ✓ | Diagnóstico de erro; portável |
| **root-cause-debug.md** | Debugging | ✓ | ✓ | ✓ | ✓ | ✓ | Raciocínio profundo; suportado |
| **secure.md** | Segurança | ✓ | ✓ | ✓ | ✓ | ✓ | Verificações de segurança de segredos; portável |
| **cost.md** | Operações | ✓ | ✓ | ✓ | ✓ | ✓ | Análise de token / custo; referência |
| **learn.md** | Reflexão | ✓ | ✓ | ✗ | ✗ | Parcial | Aprendizado da sessão; requer MCP |
| **fallback.md** | Tratamento de erro | ✓ | ✓ | Parcial | ✗ | Parcial | Padrões de degradação graciosa |

---

## Como Ler Isto

- **✓**: Skill funciona nativamente com essa ferramenta (chamar via frase de ativação ou agent).
- **Parcial**: Skill funciona com limitações (ex: sem dispatch multi-agent no Copilot).
- **✗**: Skill não funciona ou ainda não foi integrada.

**Skills portáveis** (plan, recall, review, debug, eval, context, secure, cost) funcionam em todas as ferramentas. **Skills com muitos agents** (dispatch, route, auto-invoke) precisam de Claude Code ou Codex.

---

## Caminho de Migração

Se você está no **Copilot**, comece com:
- `rules/COPILOT.md`
- Skills: plan, recall, review, eval, context, debug

Migre para **Claude Code** para suporte a agents completo.

---

## Adicionando Novas Skills

Novas skills devem:
1. Documentar sua compatibilidade de ferramentas no frontmatter (`tools: [claude-code, codex, copilot]`)
2. Evitar padrões exclusivos de agents (use raciocínio baseado em texto em vez disso)
3. Fazer link desta matriz uma vez entregues

Veja o diretório `kit/core/skills/` para exemplos.
