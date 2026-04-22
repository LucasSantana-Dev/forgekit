---
id: rag-architecture
title: RAG Architecture Patterns
description: Retrieval-Augmented Generation (RAG) connects LLMs to external knowledge.
  This guide covers production-ready patterns for building, debugging, and scaling
  RAG pipelines.
tags:
- skill-md
- prompting
- agents
- rag
source:
  path: ai-dev-toolkit/patterns/rag-architecture.md
  license: MIT
translations:
  pt-BR:
    title: Padrões de Arquitetura RAG
    description: Retrieval-Augmented Generation (RAG) conecta LLMs a conhecimento
      externo. Este guia cobre os padrões arquiteturais — chunking, embeddings, reranking,
      hybrid search.
---
Retrieval-Augmented Generation (RAG) connects LLMs to external knowledge. This guide covers production-ready patterns for building, debugging, and scaling RAG pipelines.

---

## Core Pipeline

```
Documents
  ↓
[1] Chunk        — split into retrievable units
  ↓
[2] Embed        — convert to vector representations
  ↓
[3] Index        — store in vector database
  ↓
              [Query]
                ↓
[4] Retrieve     — find top-K candidates
  ↓
[5] Rerank       — score and filter candidates
  ↓
[6] Augment      — inject context into prompt
  ↓
[7] Generate     — LLM produces grounded response
```

---

## Pattern 1: Naive RAG (Baseline)

The simplest working implementation. Use as a baseline before optimizing.

**Flow:** chunk → embed → cosine similarity → top-K → prompt stuffing

**When to use:** prototyping, small corpora (<10K docs), high retrieval tolerance

**Limitations:**

- Fixed chunk size loses semantic coherence
- Single retrieval pass misses paraphrased queries
- No reranking — noisy candidates reach the LLM

```text
Implementation:
- Chunk size: 512 tokens, 10% overlap
- Embedding: text-embedding-3-small (1536 dims)
- Retrieval: cosine similarity, K=5
- Prompt: system context block + user query
```

---

## Pattern 2: Advanced RAG

Adds query expansion, hybrid retrieval, and reranking. Use in production.

**Flow:** query expansion → hybrid retrieval → cross-encoder reranking → prompt with citations

### Query Expansion

Generate 2–3 variants before retrieval to improve recall:

```text
Original: "how do I reset my password"
Expanded:
  - "password reset instructions"
  - "forgot password recovery steps"
  - "change account password"
```

Retrieve for all variants, deduplicate, then rerank the merged pool.

### Hybrid Retrieval (Dense + Sparse)

```text
Dense:  embedding similarity (semantic matching)
Sparse: BM25 keyword matching (exact term matching)
Merge:  RRF (Reciprocal Rank Fusion) — no weights to tune
```

RRF formula: `score(doc) = Σ 1 / (k + rank_i)` where k=60

### Cross-Encoder Reranking

1. Dense + sparse retrieval returns K=20 candidates
2. Cross-encoder scores each `(query, candidate)` pair for relevance
3. Keep top-N=5 for the LLM

Cross-encoders are slow (O(K) inference calls) but significantly improve precision.

---

## Pattern 3: Hierarchical RAG

For large, nested document structures (books, wikis, codebases).

**Two-level index:**

- **Parent chunks** (1000–2000 tokens): summaries, section headers, overview passages
- **Child chunks** (128–256 tokens): specific facts, code snippets, definitions

**Retrieval flow:**

1. Embed the query
2. Retrieve from parent index (summary level) — find relevant sections
3. Retrieve from child index (detail level) — find specific passages within those sections
4. Combine: pass parent context + child detail to LLM

**Benefit:** avoids returning isolated fragments with no surrounding context.

---

## Pattern 4: Agentic RAG

Let the agent decide when and what to retrieve. Use for complex multi-hop queries.

**Loop:**

```
Query → plan retrieval → retrieve → evaluate sufficiency → retrieve again? → answer
```

**Sufficiency check prompt:**

```
Given the query and retrieved context, can you fully answer the question?
If not, what specific information is still missing?
```

If insufficiency detected: generate a follow-up query targeting the gap, retrieve again (max 3 rounds).

---

## Chunking Strategies

| Strategy        | Chunk size      | Overlap    | Best for                        |
| --------------- | --------------- | ---------- | ------------------------------- |
| Fixed-size      | 256–512 tokens  | 10–20%     | Logs, transcripts, uniform docs |
| Sentence-window | 3–5 sentences   | 1 sentence | QA, dense factual text          |
| Semantic        | Variable        | None       | Articles, structured documents  |
| Hierarchical    | 128–2000 tokens | None       | Books, wikis, codebases         |

**Always include metadata:**

```json
{
  "content": "...",
  "source": "docs/api.md",
  "section": "Authentication",
  "page": 12,
  "timestamp": "2026-04-10"
}
```

---

## Embedding Model Selection

| Model                  | Dims | Strength         | Use when                   |
| ---------------------- | ---- | ---------------- | -------------------------- |
| text-embedding-3-small | 1536 | Cost-efficient   | Most use cases             |
| text-embedding-3-large | 3072 | Highest accuracy | Critical retrieval         |
| all-MiniLM-L6-v2       | 384  | Fast, local      | Privacy-sensitive, offline |
| BGE-M3                 | 1024 | Multi-lingual    | Non-English corpora        |

**Critical:** use the same model for indexing and querying. Different models produce incompatible vector spaces.

---

## Evaluation

### Retrieval Quality

- **Recall@K**: what fraction of relevant docs are in top-K? Target > 0.85
- **MRR (Mean Reciprocal Rank)**: rank of first relevant result
- **NDCG**: normalized discounted cumulative gain

### Generation Quality

- **Faithfulness**: does the answer stay grounded in the retrieved context?
- **Answer relevance**: does it actually answer the query?
- **Context precision**: how much of the retrieved context was used?

### Tools

- **RAGAS** — automated RAG evaluation framework
- **TruLens** — tracing + evaluation for LLM pipelines
- **LangSmith** — tracing, evaluation, dataset management

---

## Common Failure Modes

| Symptom          | Likely cause                         | Fix                                                                 |
| ---------------- | ------------------------------------ | ------------------------------------------------------------------- |
| Hallucination    | LLM ignoring retrieved context       | Add grounding instruction: "Answer ONLY using the provided context" |
| Low recall       | Wrong embedding model or too-small K | Increase K, try hybrid retrieval                                    |
| Noisy context    | No reranking                         | Add cross-encoder reranker                                          |
| Slow retrieval   | No ANN index                         | Use FAISS/Pinecone, not brute-force cosine                          |
| Stale results    | Index not updated                    | Add incremental indexing pipeline                                   |
| Truncated chunks | Fixed-size splitting mid-sentence    | Use sentence-aware chunker                                          |

---

## Production Checklist

- [ ] Chunking: semantic coherence verified by sampling 20 chunks manually
- [ ] Embedding: same model for indexing and querying
- [ ] Index: approximate nearest neighbor (FAISS, Pinecone, Weaviate) — not brute-force
- [ ] Retrieval: K=20, rerank to 3–5 before LLM
- [ ] Grounding instruction: "Use only the provided context"
- [ ] Citations: each chunk includes source metadata
- [ ] Latency: P95 retrieval < 200ms, total pipeline < 3s
- [ ] Evaluation: RAGAS scores measured before each release
- [ ] Monitoring: log query + retrieved chunks + answer for every request
- [ ] Refresh: pipeline to re-embed when source docs change
