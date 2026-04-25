---
status: draft
audience: all
---

# Getting Started: 10-Minute Setup

Clone, install RAG, run your first query. No config required.

## 1. Clone (2 min)

```bash
git clone https://github.com/LucasSantana-Dev/forgekit.git
cd forgekit
```

## 2. Install RAG Index (5 min)

The toolkit ships with a **RAG (Retrieval-Augmented Generation) index** — a local SQLite database of all skills, rules, and patterns indexed by semantic similarity.

From the Forge Kit monorepo root, the setup script lives at `packages/setup/scripts/install-rag.sh`.

```bash
bash packages/setup/scripts/install-rag.sh
```

This:

- Creates `~/.claude/rag-index/` with 18k+ chunks
- Installs MCP server (port 7429 by default)
- Wires up the `/recall` and `/context-pack` skills

**Verify**:

```bash
rag_query "skill for automated code review"
```

You should see `code-review.md` (or similar) at the top.

## 3. First Query (3 min)

Pick a primitive task: "How do I add a timeout to an async function?"

```bash
rag_query "timeout async function"
```

Results are **skill files, pattern docs, and rules** sorted by relevance. Click the top result and adapt the example to your project.

## Next Steps

- **Extend**: Copy a rule file (`rules/CLAUDE.md`) into your project.
- **Learn**: Read [Primitives](./primitives.md) to understand Rules / Skills / Agents / Hooks.
- **Adopt**: See [For Individual Devs](./for-individual-devs.md) for workflow integration.
- **Team**: See [For Teams](./for-teams.md) for work governance.

---

**Having issues?** Check `AI_ASSISTED_DEVELOPMENT_SUMMARY.md` for the overview, or run `rag_query "troubleshooting"`.
