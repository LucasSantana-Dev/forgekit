---
status: published
audience: all
---

# Primeiros Passos: Setup em 10 Minutos

Clone, instale RAG, execute sua primeira query. Nenhuma configuração necessária.

## 1. Clone (2 min)

```bash
git clone https://github.com/LucasSantana-Dev/ai-dev-toolkit.git
cd ai-dev-toolkit
```

## 2. Instale o Índice RAG (5 min)

O toolkit vem com um **índice RAG (Retrieval-Augmented Generation)** — um banco de dados SQLite local de todas as skills, regras e padrões indexados por similaridade semântica.

```bash
bash ai-dev-toolkit-setup/scripts/install-rag.sh
```

Isso:
- Cria `~/.claude/rag-index/` com 18k+ chunks
- Instala servidor MCP (porta 7429 por padrão)
- Conecta as skills `/recall` e `/context-pack`

**Verifique**: 

```bash
rag_query "skill for automated code review"
```

Você deve ver `code-review.md` (ou similar) no topo.

## 3. Primeira Query (3 min)

Escolha uma tarefa primitiva: "Como adiciono um timeout em uma função assíncrona?"

```bash
rag_query "timeout async function"
```

Os resultados são **arquivos de skill, documentos de padrão e regras** ordenados por relevância. Clique no resultado do topo e adapte o exemplo para seu projeto.

## Próximos Passos

- **Estender**: Copie um arquivo de regra (`rules/CLAUDE.md`) para seu projeto.
- **Aprender**: Leia [Primitivos](./primitives.md) para entender Rules / Skills / Agents / Hooks.
- **Adotar**: Veja [Para Desenvolvedores Individuais](./for-individual-devs.md) para integração de workflow.
- **Time**: Veja [Para Times](./for-teams.md) para governança de trabalho.

---

**Tendo problemas?** Verifique `AI_ASSISTED_DEVELOPMENT_SUMMARY.md` para a visão geral, ou execute `rag_query "troubleshooting"`.
