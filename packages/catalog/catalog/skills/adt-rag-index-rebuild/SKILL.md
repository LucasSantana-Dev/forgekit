---
name: rag-index-rebuild
description: Trigger a full or incremental reindex of the RAG corpus
triggers:
  - rag rebuild
  - reindex
  - index rebuild
  - force reindex
---

# RAG Index Rebuild

Reindex the local RAG corpus to add new documents, update stale chunks, or recover from corruption. Choose between **full rebuild** (clean slate, slow) and **incremental** (fast, targets specific files).

## When to rebuild

| Scenario | Command | Time |
|----------|---------|------|
| First setup or full refresh | Full rebuild | ~5–10 min |
| Add new docs to corpus | Incremental | <1 min |
| Update stale chunks after editing files | Incremental | <1 min |
| Corpus corruption suspected | Full rebuild | ~5–10 min |
| Drift accumulation >50 chunks | Full rebuild | ~5–10 min |

## When NOT to rebuild

- **Just queried and got bad results.** Likely a curation/corpus gap, not an index bug. Try the `adt-rag-curate` skill first.
- **Index is <1 week old.** Drift detection runs automatically at session start. Manual rebuild only if you've made recent bulk edits.
- **Testing retrieval logic.** Use a static index; don't rebuild during active development.

## Full rebuild (clean slate)

Drops the index and reconstructs all chunks from source files.

```bash
cd ~/.claude/rag-index
venv/bin/python build.py
```

**What happens:**
- Scans all source repos and doc dirs configured in `build.py`
- Creates new `index.sqlite` with all chunks from scratch
- Embeds each chunk with `all-MiniLM-L6-v2`
- Outputs final chunk count and time

**Expected output:**
```
Index built successfully.
Total chunks: 14,355
Time: 7m 42s
```

## Incremental rebuild (targeted files)

Add new documents or refresh stale ones without rebuilding the entire index.

```bash
cd ~/.claude/rag-index
venv/bin/python build.py --incremental file1.md file2.md
```

**Examples:**

```bash
# Add a new skill
venv/bin/python build.py --incremental ~/.claude/skills/my-skill/SKILL.md

# Update multiple files
venv/bin/python build.py --incremental ~/.claude/plans/project.md ~/.claude/standards/code.md

# Update all Python files under a path
venv/bin/python build.py --incremental ~/Desenvolvimento/forgekit/src/*.py
```

**What happens:**
- Deletes any existing chunks from the named files
- Re-embeds and inserts new chunks for those files only
- Existing chunks from other files remain untouched
- Much faster than full rebuild

## Finding what needs reindexing

Run the report script to see stale/missing chunks:

```bash
cd ~/.claude/rag-index
venv/bin/python report.py
```

Check the output file for stale sections:

```bash
cat ~/.claude/rag-index/weekly.md | grep -A 20 "Stale chunks"
```

Look for:
- **Missing files:** chunks indexed from a file that no longer exists
- **Modified files:** files edited after the last index time (sha mismatch)

Incremental reindex those files:

```bash
venv/bin/python build.py --incremental ~/.claude/standards/updated-file.md
```

## Post-rebuild verification

Test a query against the fresh index:

```bash
cd ~/.claude/rag-index
venv/bin/python query.py "your test question" --top 5
```

Expected output shows `rrf`, `cos`, `bm25` scores for each result. Cosine >0.55 indicates good retrieval quality.

**Check chunk distribution:**

```bash
sqlite3 ~/.claude/rag-index/index.sqlite \
  "SELECT source_type, COUNT(*) FROM chunks GROUP BY source_type ORDER BY COUNT(*) DESC;"
```

Compare to baseline:
- `skills`: ≥500 chunks
- `handoffs`: ≥200 chunks
- `standards`, `codex`: ≥50 chunks combined

If counts drop significantly, the rebuild may have skipped a source. Check `build.py` configuration.

## Troubleshooting

**"No chunks added"** after incremental rebuild
- Verify the file path exists and is in a tracked source dir
- Check that the file extension matches the parser (`.md`, `.py`, `.json`, etc.)
- Run a full rebuild if unsure

**Index size unchanged** after full rebuild
- The corpus may not have changed. Check `weekly.md` for timestamps.
- Verify tracked repos/dirs in `build.py` exist and have recent commits

**Embedding fails** during rebuild
- Ensure `venv` is active and `all-MiniLM-L6-v2` model is downloaded: `venv/bin/python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('all-MiniLM-L6-v2')"`
- If model is missing, download it: the first run will auto-download (~100MB)

## See also

- `adt-rag-quality` — evaluate retrieval quality and find zero-hit gaps
- `adt-rag-drift` — detect and fix stale chunks
- `adt-rag-curate` — improve corpus coverage by adding missing docs
