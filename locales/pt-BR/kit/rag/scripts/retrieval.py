"""Shared retrieval logic: hybrid BM25 + cosine with Reciprocal Rank Fusion.

Loaded once per process (sqlite read + tokenize) and cached by scope signature.
"""
from __future__ import annotations

import os
import re
import sqlite3
import hashlib
from pathlib import Path
from typing import Any

import numpy as np
from rank_bm25 import BM25Okapi

from build import CURATED_REPOS

ROOT = Path.home() / ".claude" / "rag-index"
DB = ROOT / "index.sqlite"
QLOG = ROOT / "queries.sqlite"
MODEL_NAME = "all-MiniLM-L6-v2"
DIM = 384
RRF_K = 60

_TOKEN_RE = re.compile(r"[A-Za-z_][\w$]{1,}")
_model = None
_reranker = None
_cache: dict[tuple, tuple[list[dict], np.ndarray, BM25Okapi]] = {}
RERANK_MODEL = "cross-encoder/ms-marco-MiniLM-L-6-v2"


def _get_reranker():
    global _reranker
    if _reranker is None:
        from sentence_transformers import CrossEncoder

        _reranker = CrossEncoder(RERANK_MODEL)
    return _reranker


def _get_model():
    global _model
    if _model is None:
        from sentence_transformers import SentenceTransformer

        _model = SentenceTransformer(MODEL_NAME)
    return _model


def _tokenize(text: str) -> list[str]:
    return [t.lower() for t in _TOKEN_RE.findall(text)]


def cwd_repo(cwd: str | None = None) -> str | None:
    """Detect which curated repo the cwd lives in, returning the repo.name."""
    path = Path(cwd or os.getcwd()).resolve()
    for repo in CURATED_REPOS:
        try:
            path.relative_to(repo)
            return repo.name
        except ValueError:
            continue
    return None


def _load(scope_types: list[str] | None, scope_repos: list[str] | None) -> tuple:
    key = (
        DB.stat().st_mtime_ns if DB.exists() else 0,
        tuple(sorted(scope_types)) if scope_types else None,
        tuple(sorted(scope_repos)) if scope_repos else None,
    )
    if key in _cache:
        return _cache[key]
    conn = sqlite3.connect(DB)
    where: list[str] = []
    params: list[Any] = []
    if scope_types:
        where.append(f"source_type IN ({','.join('?' * len(scope_types))})")
        params.extend(scope_types)
    if scope_repos:
        where.append(f"repo IN ({','.join('?' * len(scope_repos))})")
        params.extend(scope_repos)
    sql = (
        "SELECT id, source_type, repo, language, symbol, path, start_line, end_line, text, embedding "
        "FROM chunks"
    )
    if where:
        sql += " WHERE " + " AND ".join(where)
    cur = conn.execute(sql, params)
    rows = cur.fetchall()
    conn.close()
    if not rows:
        empty_meta: list[dict] = []
        empty_embs = np.zeros((0, DIM), dtype=np.float32)
        bm25 = BM25Okapi([[""]])
        _cache[key] = (empty_meta, empty_embs, bm25)
        return _cache[key]
    embs = np.frombuffer(b"".join(r[9] for r in rows), dtype=np.float32).reshape(-1, DIM)
    meta = [
        {
            "id": r[0],
            "source_type": r[1],
            "repo": r[2],
            "language": r[3],
            "symbol": r[4],
            "path": r[5],
            "start_line": r[6],
            "end_line": r[7],
            "text": r[8],
        }
        for r in rows
    ]
    tokens = [_tokenize(f"{m['symbol']} {m['text']}") for m in meta]
    bm25 = BM25Okapi(tokens)
    _cache[key] = (meta, embs, bm25)
    return _cache[key]


def search(
    query: str,
    top: int = 5,
    scope_types: list[str] | None = None,
    scope_repos: list[str] | None = None,
    cwd: str | None = None,
    rerank: bool | None = None,
) -> list[dict]:
    if not query.strip():
        return []
    if scope_repos == ["all"]:
        scope_repos = None
    elif scope_repos is None:
        detected = cwd_repo(cwd)
        if detected:
            scope_repos = [detected]
    meta, embs, bm25 = _load(scope_types, scope_repos)
    if not meta:
        return []

    # Cosine
    qv = _get_model().encode(
        [query], normalize_embeddings=True, convert_to_numpy=True, show_progress_bar=False
    ).astype(np.float32)[0]
    cos = embs @ qv
    cos_order = np.argsort(-cos)

    # BM25
    q_tokens = _tokenize(query)
    bm_scores = bm25.get_scores(q_tokens) if q_tokens else np.zeros(len(meta))
    bm_order = np.argsort(-bm_scores)

    # Reciprocal Rank Fusion — take top (top*4) from each to bound work.
    fusion_window = min(len(meta), max(top * 8, 40))
    rrf: dict[int, float] = {}
    for rank, idx in enumerate(cos_order[:fusion_window]):
        rrf[int(idx)] = rrf.get(int(idx), 0.0) + 1.0 / (RRF_K + rank + 1)
    for rank, idx in enumerate(bm_order[:fusion_window]):
        rrf[int(idx)] = rrf.get(int(idx), 0.0) + 1.0 / (RRF_K + rank + 1)

    if rerank is None:
        rerank = os.environ.get("RAG_RERANK", "off").lower() in ("on", "1", "true")

    if rerank:
        candidate_k = min(len(meta), max(top * 4, 20))
        candidate_order = sorted(rrf.items(), key=lambda kv: -kv[1])[:candidate_k]
        pairs = [(query, meta[idx]["text"][:1500]) for idx, _ in candidate_order]
        try:
            ce_scores = _get_reranker().predict(pairs, show_progress_bar=False)
        except Exception:
            ce_scores = [0.0] * len(pairs)
        ce_map = {idx: float(score) for (idx, _), score in zip(candidate_order, ce_scores)}
        reranked = sorted(
            zip(candidate_order, ce_scores), key=lambda x: -float(x[1])
        )[:top]
        fused = [(idx_score[0][0], idx_score[0][1]) for idx_score in reranked]
    else:
        ce_map = {}
        fused = sorted(rrf.items(), key=lambda kv: -kv[1])[:top]

    results: list[dict] = []
    for rank, (idx, score) in enumerate(fused, 1):
        m = meta[idx]
        results.append(
            {
                "rank": rank,
                "rrf": round(float(score), 4),
                "cos": round(float(cos[idx]), 3),
                "bm25": round(float(bm_scores[idx]), 2),
                "ce": round(ce_map[idx], 4) if idx in ce_map else None,
                "reranked": rerank,
                "source_type": m["source_type"],
                "repo": m["repo"],
                "language": m["language"],
                "symbol": m["symbol"],
                "path": m["path"],
                "start_line": m["start_line"],
                "end_line": m["end_line"],
                "text": m["text"],
            }
        )
    if os.environ.get("RAG_QLOG", "off").lower() in ("on", "1", "true"):
        _log_query(query, scope_types, scope_repos, cwd, rerank, results)
    return results


def _log_query(
    query: str,
    scope_types: list[str] | None,
    scope_repos: list[str] | None,
    cwd: str | None,
    rerank: bool,
    results: list[dict],
) -> None:
    try:
        conn = sqlite3.connect(QLOG)
        conn.execute(
            """CREATE TABLE IF NOT EXISTS queries (
                ts REAL NOT NULL,
                cwd_hash TEXT, query_hash TEXT, scope_types TEXT, scope_repos TEXT,
                rerank INTEGER, top_score REAL, top_path TEXT, n_results INTEGER
            )"""
        )
        top_score = float(results[0]["cos"]) if results else 0.0
        top_path = results[0]["path"] if results else ""
        query_hash = hashlib.sha256(query[:500].encode()).hexdigest()
        cwd_hash = hashlib.sha256((cwd or os.getcwd()).encode()).hexdigest()
        conn.execute(
            "INSERT INTO queries VALUES (?,?,?,?,?,?,?,?,?)",
            (
                __import__("time").time(),
                cwd_hash,
                query_hash,
                ",".join(scope_types or []),
                ",".join(scope_repos or []),
                1 if rerank else 0,
                top_score,
                top_path,
                len(results),
            ),
        )
        conn.commit()
        conn.close()
    except Exception:
        pass
