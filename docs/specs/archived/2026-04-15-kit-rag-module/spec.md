---
status: shipped
created: 2026-04-15
owner: lucassantana
pr: 54
tags: shipped
shipped: 2026-04-15
---

# kit-rag-module

## Goal
Port RAG system from `~/.claude/rag-index/` to portable `kit/rag/` module.

## Context
Personal index proven; others need to install via ai-dev-toolkit-setup.

## Approach
Factor RAG_HOME / RAG_CLAUDE_ROOT / RAG_REPOS env vars; preserve BM25+cosine+RRF+rerank.

## Verification
kit/rag/ runs standalone; `install-rag.sh` wires hooks; eval MRR ≥0.68.
