# kit/rag — Personal RAG engine

Local-first retrieval over markdown memory, session plans, skill docs, codex rules, curated repo docs/CHANGELOGs, source code (TS/JS/Python/Shell, language-aware chunkers), and git commit subjects. Hybrid BM25 + cosine with Reciprocal Rank Fusion; cross-encoder rerank on by default for explicit calls.

Reference deployment lives at `~/.claude/rag-index/`. The files in `scripts/` are that reference, unmodified. They use `Path.home()` internally so the same scripts work for any user — the only thing to customize is the `CURATED_REPOS` list in `build.py` and the `SOURCES` list (memory / plans / handoffs paths).

## One-time setup

```bash
python3 -m venv ~/.claude/rag-index/venv
~/.claude/rag-index/venv/bin/pip install sentence-transformers rank-bm25
cp -r kit/rag/scripts/* ~/.claude/rag-index/
cp -r kit/rag/skills/* ~/.claude/skills/
~/.claude/rag-index/venv/bin/python ~/.claude/rag-index/build.py   # first full index
```

## Customize for your machine

Edit these constants in `scripts/build.py`:

- `CURATED_REPOS` — list of repo paths to index (code + docs + git log).
- `SOURCES` — globs for markdown memory/plans/handoffs/skills specific to your setup.

Everything else is language-agnostic and works as-is.

## Daily use

```bash
~/.claude/rag-index/venv/bin/python ~/.claude/rag-index/query.py "<question>"
~/.claude/rag-index/venv/bin/python ~/.claude/rag-index/pack.py "<task>" --diff --budget 4000
```

Or via MCP: wire `mcp_server.py` into your Claude Code `settings.json` under `mcpServers.rag-index`.

## Components

| File                     | Role                                                                  |
| ------------------------ | --------------------------------------------------------------------- |
| `build.py`               | Chunk + embed + write sqlite. `--incremental <file>` for hot updates. |
| `query.py`               | CLI: top-K ranked chunks. `--fast` disables reranker.                 |
| `pack.py`                | Task-aware bundle for `plan`/`ship`/`pr-flow` skills.                 |
| `retrieval.py`           | Shared search (BM25 + cosine + RRF + rerank + cwd-scope + query log). |
| `chunkers.py`            | Language-aware splitters (`ast` for Python, regex for TS/JS/shell).   |
| `mcp_server.py`          | Stdio MCP server exposing `rag_query` tool.                           |
| `aggregate_roadmap.py`   | Cross-repo roadmap synthesizer.                                       |
| `autorecall-hook.sh`     | UserPromptSubmit hook — conservative top-hit injection.               |
| `reindex-hook.sh`        | PostToolUse hook — incremental reindex on Write/Edit.                 |
| `sessionstart-report.sh` | SessionStart hook — refreshes `weekly.md`.                            |
| `report.py`              | Weekly observability (index stats + zero-hit queries + stale chunks). |

## Benchmarks (reference deployment, 17k chunks, MiniLM-L6-v2)

- Full rebuild: ~55 s
- Incremental single-file: ~0.3 s
- Query p50: ~200 ms (rerank off); ~800 ms (rerank on)
- Eval baseline: MRR 0.72 · Hit@3 0.80 · Hit@5 0.80

## When NOT to use this

- You just want grep → use grep.
- You need code symbols in your current repo → use Serena.
- Your knowledge lives in a hosted notion/Obsidian → this stays local-MD-first on purpose.


## Portable configuration

All paths are env-overridable. See `.env.example` for the full list.

### Quick profiles

**Personal (default)** — indexes Claude memory/plans/handoffs/skills + any repos in `RAG_REPOS`.

**Work laptop** — `export RAG_WORK_MODE=1 RAG_REPOS=$HOME/work/repo-a:$HOME/work/repo-b` before running `install-rag.sh`. Skips personal memory entirely; only indexes your work repos and their specs/roadmap/docs.

**Friend on Cursor/Codex-only** — same as above with `RAG_CLAUDE_ROOT` empty or pointing at their AI tool's root. Everything else (MCP server, reranker, hooks) works identically.

### Common vars
| Var | Effect |
|---|---|
| `RAG_HOME` | Where index + scripts live (default `~/.claude/rag-index`) |
| `RAG_CLAUDE_ROOT` | Claude Code root for memory/skills (default `~/.claude`) |
| `RAG_REPOS` | Colon-separated extra repo paths |
| `RAG_WORK_MODE=1` | Skip all personal memory/plans/handoffs sources |
| `RAG_EXTRA_MD_GLOBS` | Colon-separated extra markdown globs to index |
| `RAG_RERANK=on\|off` | Toggle cross-encoder reranker |
| `HF_HUB_OFFLINE=1` | Never hit the Hugging Face Hub after first cache warm |
