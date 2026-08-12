# kit/rag — moved to shelfmark

This module was a snapshot of a private retrieval engine and has stopped
tracking upstream. The engine now lives as a standalone, maintained project:

**https://github.com/LucasSantana-Dev/shelfmark**

shelfmark ships the current version of everything that was here (hybrid
BM25 + embedding retrieval, MCP server, incremental reindex, Claude Code hook
examples) plus the eval harness, a frozen-holdout regression gate, and a
reproducible public benchmark that this snapshot never had.

The files in this directory are kept for existing consumers but are frozen;
no fixes or features will land here. Migrate by following shelfmark's README
quickstart — sources.yaml replaces the env-var source configuration.
