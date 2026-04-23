#!/usr/bin/env python3
"""Weekly RAG observability report. Zero-hit queries + stale chunks.

Reads ~/.claude/rag-index/queries.sqlite + index.sqlite, writes
~/.claude/rag-index/weekly.md. Safe to run frequently; idempotent.
"""
from __future__ import annotations

import sqlite3
import time
from pathlib import Path

ROOT = Path.home() / ".claude" / "rag-index"
QLOG = ROOT / "queries.sqlite"
DB = ROOT / "index.sqlite"
OUT = ROOT / "weekly.md"

WINDOW_DAYS = 7
ZERO_HIT_THRESHOLD = 0.25
SINCE = time.time() - WINDOW_DAYS * 86400


def section(title: str, body: str) -> str:
    return f"## {title}\n\n{body}\n\n"


def has_table(conn: sqlite3.Connection, table: str) -> bool:
    row = conn.execute(
        "SELECT name FROM sqlite_master WHERE type='table' AND name=?", (table,)
    ).fetchone()
    return row is not None


def zero_hits() -> list[tuple]:
    if not QLOG.exists():
        return []
    with sqlite3.connect(QLOG) as conn:
        if not has_table(conn, "queries"):
            return []
        cols = {r[1] for r in conn.execute("PRAGMA table_info(queries)").fetchall()}
        query_col = "query" if "query" in cols else "query_hash"
        return conn.execute(
            f"SELECT {query_col}, top_score, top_path, ts FROM queries WHERE ts >= ? AND top_score < ? ORDER BY ts DESC LIMIT 50",
            (SINCE, ZERO_HIT_THRESHOLD),
        ).fetchall()


def freq_queries() -> list[tuple]:
    if not QLOG.exists():
        return []
    with sqlite3.connect(QLOG) as conn:
        if not has_table(conn, "queries"):
            return []
        cols = {r[1] for r in conn.execute("PRAGMA table_info(queries)").fetchall()}
        query_col = "query" if "query" in cols else "query_hash"
        return conn.execute(
            f"SELECT {query_col}, COUNT(*) c, AVG(top_score) s FROM queries WHERE ts >= ? GROUP BY {query_col} ORDER BY c DESC LIMIT 15",
            (SINCE,),
        ).fetchall()


def stale_chunks() -> list[str]:
    if not DB.exists():
        return []
    with sqlite3.connect(DB) as conn:
        if not has_table(conn, "chunks"):
            return []
        rows = conn.execute("SELECT DISTINCT path FROM chunks").fetchall()
    missing = [r[0] for r in rows if not Path(r[0]).exists()]
    return missing[:50]


def index_stats() -> dict:
    if not DB.exists():
        return {"total": 0, "by_type": [], "by_repo": []}
    with sqlite3.connect(DB) as conn:
        if not has_table(conn, "chunks"):
            return {"total": 0, "by_type": [], "by_repo": []}
        total = conn.execute("SELECT COUNT(*) FROM chunks").fetchone()[0]
        by_type = conn.execute(
            "SELECT source_type, COUNT(*) FROM chunks GROUP BY source_type ORDER BY 2 DESC"
        ).fetchall()
        by_repo = conn.execute(
            "SELECT repo, COUNT(*) FROM chunks WHERE repo IS NOT NULL GROUP BY repo ORDER BY 2 DESC"
        ).fetchall()
    return {"total": total, "by_type": by_type, "by_repo": by_repo}


def main() -> int:
    stats = index_stats()
    zh = zero_hits()
    fq = freq_queries()
    stale = stale_chunks()

    parts = [f"# RAG Weekly Report — {time.strftime('%Y-%m-%d')}\n"]

    type_lines = "\n".join(f"- {t}: {n}" for t, n in stats["by_type"])
    repo_lines = "\n".join(f"- {r}: {n}" for r, n in stats["by_repo"])
    parts.append(
        section(
            "Index stats",
            f"Total chunks: **{stats['total']}**\n\nBy source type:\n{type_lines}\n\nBy repo:\n{repo_lines}",
        )
    )

    if fq:
        parts.append(
            section(
                "Most-run queries (last 7d)",
                "\n".join(f"- `{q[:80]}`  ×{c}  top_cos={s:.2f}" for q, c, s in fq),
            )
        )
    else:
        parts.append(section("Most-run queries (last 7d)", "_no queries logged yet_"))

    if zh:
        lines = [
            f"- `{q[:100]}`  top_cos={score:.2f}  at {time.strftime('%m-%d %H:%M', time.localtime(ts))}"
            for q, score, _, ts in zh
        ]
        parts.append(
            section(
                f"Zero-hit queries (cos < {ZERO_HIT_THRESHOLD}, last 7d) — corpus gaps to close",
                "\n".join(lines),
            )
        )
    else:
        parts.append(
            section(
                f"Zero-hit queries (cos < {ZERO_HIT_THRESHOLD})",
                "_none — corpus covers all recent queries_",
            )
        )

    if stale:
        parts.append(
            section(
                "Stale chunks (file no longer on disk)",
                "\n".join(f"- {p}" for p in stale) + "\n\nRebuild to purge.",
            )
        )
    else:
        parts.append(section("Stale chunks", "_none_"))

    OUT.write_text("\n".join(parts))
    print(f"wrote {OUT}")
    return 0


if __name__ == "__main__":
    import sys

    sys.exit(main())
