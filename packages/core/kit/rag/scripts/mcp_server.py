#!/usr/bin/env python3
"""MCP stdio server exposing rag_query over the hybrid BM25+cosine index.

JSON-RPC 2.0. Supports: initialize, tools/list, tools/call (rag_query).
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from retrieval import search

TOOL_SCHEMA = {
    "name": "rag_query",
    "description": (
        "Hybrid semantic + BM25 search over the user's personal corpus: memory, "
        "plans, handoffs, skill definitions, codex rules, curated repo docs + "
        "README + CHANGELOG, and source code (TS/JS/Python/Shell) from 8 "
        "whitelisted repos. Returns top-K chunks with path:line + symbol + "
        "repo citations. Auto-scopes to the current repo when cwd is inside "
        "one. Use instead of grep for fuzzy or cross-file recall."
    ),
    "inputSchema": {
        "type": "object",
        "properties": {
            "query": {"type": "string"},
            "top": {"type": "integer", "default": 5, "minimum": 1, "maximum": 20},
            "scope_types": {
                "type": "array",
                "items": {"type": "string"},
                "description": "source types: memory, plans, handoffs, skills, codex, changelog, repo-docs, repo-readme, code",
            },
            "scope_repos": {
                "type": "array",
                "items": {"type": "string"},
                "description": "repo names configured via RAG_REPOS env var or .forge-kit.env, or pass ['all'] to disable auto-scoping",
            },
            "cwd": {"type": "string", "description": "working dir to drive auto-scoping (defaults to server cwd)"},
            "rerank": {
                "type": "boolean",
                "default": True,
                "description": "whether to rerank retrieved results",
            },
        },
        "required": ["query"],
    },
}


def _bool_arg(value, default: bool = True) -> bool:
    if value is None:
        return default
    if isinstance(value, str):
        return value.strip().lower() not in {"false", "0", "off", "no", "n"}
    return bool(value)


def _render(results: list[dict]) -> str:
    if not results:
        return "No matches."
    lines = []
    for r in results:
        tag = r["source_type"]
        if r.get("repo"):
            tag += f"/{r['repo']}"
        if r.get("symbol"):
            tag += f"::{r['symbol']}"
        lines.append(
            f"#{r['rank']}  rrf={r['rrf']} cos={r['cos']} bm={r['bm25']}  [{tag}]  {r['path']}:{r['start_line']}-{r['end_line']}"
        )
        snippet = r["text"][:500].replace("\n", " ")
        lines.append(f"  {snippet}")
    return "\n".join(lines)


def _respond(msg_id, result=None, error=None):
    out = {"jsonrpc": "2.0", "id": msg_id}
    if error is not None:
        out["error"] = error
    else:
        out["result"] = result
    sys.stdout.write(json.dumps(out) + "\n")
    sys.stdout.flush()


def main() -> int:
    for line in sys.stdin:
        line = line.strip()
        if not line:
            continue
        try:
            msg = json.loads(line)
        except json.JSONDecodeError:
            continue
        method = msg.get("method")
        msg_id = msg.get("id")
        params = msg.get("params") or {}

        if method == "initialize":
            _respond(
                msg_id,
                result={
                    "protocolVersion": "2024-11-05",
                    "capabilities": {"tools": {}},
                    "serverInfo": {"name": "rag-index", "version": "0.2.0"},
                },
            )
        elif method == "notifications/initialized":
            continue
        elif method == "tools/list":
            _respond(msg_id, result={"tools": [TOOL_SCHEMA]})
        elif method == "tools/call":
            tool = params.get("name")
            args = params.get("arguments") or {}
            if tool != "rag_query":
                _respond(msg_id, error={"code": -32601, "message": f"unknown tool: {tool}"})
                continue
            try:
                scope_types = args.get("scope_types") or None
                scope_repos_raw = args.get("scope_repos") or None
                if scope_repos_raw == ["all"]:
                    scope_repos = None
                    cwd = args.get("cwd")  # respect cwd hint but ignore repo match
                elif scope_repos_raw:
                    scope_repos = scope_repos_raw
                    cwd = None
                else:
                    scope_repos = None
                    cwd = args.get("cwd")
                results = search(
                    query=args.get("query", ""),
                    top=int(args.get("top") or 5),
                    scope_types=scope_types,
                    scope_repos=scope_repos,
                    cwd=cwd,
                    rerank=_bool_arg(args.get("rerank"), True),
                )
                _respond(
                    msg_id,
                    result={
                        "content": [{"type": "text", "text": _render(results)}],
                        "isError": False,
                    },
                )
            except Exception as e:  # noqa: BLE001
                _respond(msg_id, error={"code": -32000, "message": str(e)})
        elif msg_id is not None:
            _respond(msg_id, error={"code": -32601, "message": f"unknown method: {method}"})
    return 0


if __name__ == "__main__":
    sys.exit(main())
