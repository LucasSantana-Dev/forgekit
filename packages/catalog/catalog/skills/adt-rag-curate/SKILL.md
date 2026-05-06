---
name: rag-curate
description: Manually improve corpus quality by adding missing docs and filling retrieval gaps
triggers:
  - rag curate
  - curate corpus
  - improve rag
  - add to rag
  - rag coverage gaps
---

# RAG Curate

After inspection and quality audits identify gaps, manually add missing documentation or improve existing chunks. Curation is the bridge between diagnostics and index rebuilds.

## When to curate

Use this skill after you have:
1. **Run `adt-rag-inspect`** — found coverage gaps (e.g., <50 chunks for a source type)
2. **Run `adt-rag-quality`** — discovered zero-hit queries or weak retrievals
3. **Run `adt-rag-coverage`** — identified underindexed repos or topics

Curation adds missing content without a full rebuild (faster and more surgical).

## Curate the corpus

The corpus lives in tracked source directories. Edit or add files, then reindex them.

**Corpus directories:**

| Type | Path | Command |
|------|------|---------|
| Skills | ~/.claude/ | See your skill collection |
| Standards | ~/.claude/standards/ | Project style guides, conventions |
| Plans | ~/.claude/plans/ | Long-term roadmaps, architecture |
| Codex | ~/.claude/codex/ | How-to guides, patterns, templates |
| Code | Tracked repos | Source files in your projects |
| Handoffs | ~/.claude/handoffs/ | Transition notes, context summaries |

## Add missing documentation

If a topic or repo has zero chunks but should be indexed:

1. **Write the doc** in the appropriate directory:

```bash
cat > ~/.claude/standards/new-pattern.md << 'EOF'
# New Pattern Name

Description, usage guidelines, examples.
EOF
```

2. **Incremental reindex** the new file:

```bash
cd ~/.claude/rag-index
venv/bin/python build.py --incremental ~/.claude/standards/new-pattern.md
```

3. **Verify it indexed:**

```bash
sqlite3 ~/.claude/rag-index/index.sqlite \
  "SELECT COUNT(*) FROM chunks WHERE path LIKE '%new-pattern.md%';"
```

Expected: >0 chunks.

## Improve weak retrievals

If a query returns results with cosine <0.40 (weak or zero-hit), rewrite the relevant chunks for clarity:

1. **Find the weak chunk:**

```bash
cd ~/.claude/rag-index
venv/bin/python query.py "your weak query" --top 3
```

Note the returned path and chunk id.

2. **View and edit the source:**

```bash
# Example: ~/.claude/standards/auth.md
cat ~/.claude/standards/auth.md
# Edit to add keywords, clarify context, improve structure
```

3. **Reindex that file:**

```bash
cd ~/.claude/rag-index
venv/bin/python build.py --incremental ~/.claude/standards/auth.md
```

4. **Re-run the query** to verify improvement:

```bash
venv/bin/python query.py "your weak query" --top 3
```

Expect cosine scores to increase.

## Expand undercovered repos

If a code repo has <50 chunks but >10 source files:

1. **Check what's indexed:**

```bash
sqlite3 ~/.claude/rag-index/index.sqlite << 'EOF'
SELECT repo, COUNT(*) as chunk_count
FROM chunks
WHERE repo = 'your-repo'
GROUP BY repo;
EOF
```

2. **Find the repo path** in ~/.claude/rag-index/build.py:

```bash
grep -n "your-repo" ~/.claude/rag-index/build.py
```

3. **Add or extend source globs** in build.py to include more files:

```python
# Example: index more TypeScript modules
"https://github.com/LucasSantana-Dev/your-repo": [
    "src/**/*.ts",       # Already indexed
    "src/**/*.tsx",      # Add this
    "lib/**/*.ts",       # Add this
],
```

4. **Reindex incrementally** or trigger a full rebuild:

```bash
cd ~/.claude/rag-index
venv/bin/python build.py --incremental /path/to/repo/src/**/*.tsx
```

## Gap-filling workflow

| Gap Type | Detection | Cure | Time |
|----------|-----------|------|------|
| Missing doc | rag-coverage: zero chunks for topic | Write doc + incremental reindex | 10 min |
| Weak retrieval | rag-quality: score <0.40 | Rewrite chunk for clarity + reindex | 15 min |
| Undercovered repo | rag-coverage: <50 chunks but many files | Add source globs + incremental reindex | 20 min |
| Dead code in index | rag-drift: orphaned chunks | Delete via SQLite + incremental reindex | 5 min |
| Stale content | rag-drift: sha mismatch | Reindex modified file | 5 min |

## When NOT to curate

- **Too many gaps (>100 chunks missing)**: Run full rebuild instead.
- **Widespread drift (>20 stale chunks)**: Run full rebuild.
- **Structural issues (many chunks <100 chars)**: Run full rebuild with new chunk-size config.

## After curation

1. **Run quality check:**

```bash
cd ~/.claude/rag-index
venv/bin/python query.py "original weak query" --top 5
```

2. **Generate weekly report** to track improvement:

```bash
venv/bin/python report.py
```

3. **Archive changes** in your codebase (commit doc edits, doc new standards, etc.)

## See also

- `adt-rag-coverage` — audit gaps before curating
- `adt-rag-quality` — test if curation worked
- `adt-rag-inspect` — verify chunks after curation
- `adt-rag-index-rebuild` — full rebuild if curation is insufficient
