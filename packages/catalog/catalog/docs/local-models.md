---
id: local-models
title: Local Models
description: >-
  Run Llama, Qwen, Mistral, and other open-weight models directly on your
  machine via Ollama, LM Studio, or llama.cpp — private, offline-capable,
  zero per-token cost. Covers when local makes sense over the Claude API,
  the tradeoffs, and how to wire each runtime into Forge Kit workflows.
tags:
  - local
  - models
  - llm
  - ollama
  - lmstudio
  - llama-cpp
  - privacy
  - offline
source:
  path: ai-dev-toolkit/packages/catalog/catalog/docs/local-models.md
  upstream: >-
    https://github.com/LucasSantana-Dev/ai-dev-toolkit/tree/main/packages/catalog/catalog/docs/local-models.md
  license: MIT
translations:
  pt-BR:
    title: Modelos Locais
    description: >-
      Rode Llama, Qwen, Mistral e outros modelos open-weight direto na sua
      máquina via Ollama, LM Studio ou llama.cpp — privado, funciona
      offline, custo zero por token. Cobre quando faz sentido local em vez
      da API Claude, os tradeoffs e como conectar cada runtime aos fluxos
      do Forge Kit.
---
## Overview

"Local models" means open-weight LLMs (Llama 3, Qwen 2.5, Mistral,
DeepSeek, Gemma, etc.) running on your own hardware instead of a hosted
API. Three tools dominate the local-dev surface:

| Tool | Best for | Trade-off |
|---|---|---|
| **Ollama** | fast first install, CLI-forward, dozens of models on tap | model catalog is Ollama-curated; advanced quant options limited |
| **LM Studio** | GUI, side-by-side model comparison, polished UX | heavier desktop app; less scriptable |
| **llama.cpp** | lowest-level control, custom quant, embedded use cases | you configure more yourself |

All three expose an **OpenAI-compatible HTTP API**, which means anything
that speaks OpenAI can point at them with only a base-URL change.

## When to pick local over the Claude API

Reach for local when any of these matter more than model capability:

- **Privacy / compliance.** The data can't leave your machine. Medical,
  legal, internal-only code review, anything under NDA.
- **Offline work.** Plane, train, bad-wifi coffee shop. A local model
  keeps you productive without a round trip.
- **Per-token cost at scale.** Many small cheap tasks (log summarization,
  bulk labeling, embedding pipelines) beat the Claude API on cost once
  the hardware is paid for.
- **Latency floor.** Local round-trips can be sub-100ms. Useful for
  typeahead-style inline assistance.
- **Reproducibility.** The model doesn't change on you between runs.

Stay on the Claude API when any of these apply:

- You need frontier capability — reasoning, long context, agentic tool
  use. Local open-weight models have closed some of the gap but the best
  hosted model still wins on hard tasks.
- You need very long context (>128k tokens) — rare locally.
- You don't have the hardware (see "Hardware budget" below).

## Hardware budget

Rough guidance for "decent" quality on a dev laptop:

| Model size (quantized) | VRAM or unified memory |
|---|---|
| 3B–7B (Phi-3, Qwen 2.5 7B, Llama 3.1 8B) | 8 GB |
| 13B–14B (Qwen 2.5 14B) | 16 GB |
| 30B–34B (Qwen 2.5 32B, DeepSeek Coder 33B) | 24 GB |
| 70B+ (Llama 3.1 70B) | 48 GB+ (or CPU inference with patience) |

Apple Silicon (M1/M2/M3/M4) counts unified memory as both VRAM and RAM,
so 16 GB of RAM ≈ 16 GB of VRAM for inference. NVIDIA GPUs are faster
per token at the cost of a narrower model-size ceiling unless you have
24 GB+ cards.

## Ollama

**One-command install, one-command pull, stdin-friendly CLI.**

```bash
# macOS
brew install ollama
ollama serve &                         # starts the daemon on :11434

# pull + chat with a model
ollama pull qwen2.5-coder:7b
ollama run qwen2.5-coder:7b "refactor this function"
```

The daemon exposes:

- Native Ollama API at `http://localhost:11434/api/*`
- OpenAI-compatible API at `http://localhost:11434/v1/*`

## LM Studio

**GUI-first, great for side-by-side model comparison.**

1. Download from `https://lmstudio.ai/`.
2. Pick a model from the in-app search (ships with MLX-optimized builds
   on Apple Silicon).
3. Start the local server tab — it exposes `http://localhost:1234/v1/*`
   (OpenAI-compatible).

Strengths:

- Live chat UI while the server runs — good for poking at prompts.
- Model manager shows VRAM cost before loading.
- MLX backend on Apple Silicon is noticeably faster than GGUF on M-series
  chips.

Less good for: headless/server setups, scripting, CI.

## llama.cpp

**The lowest-level of the three. You get the most control and do the most
work.**

```bash
# macOS / Linux
git clone https://github.com/ggerganov/llama.cpp
cd llama.cpp
make -j                                # or `cmake -B build && cmake --build build -j`

# run a GGUF model
./llama-server -m /path/to/model.gguf --port 8080 --ctx-size 8192

# OpenAI-compatible endpoint is now at http://localhost:8080/v1/*
```

Use llama.cpp when:

- You need a specific quantization that Ollama doesn't ship.
- You're embedding inference inside a larger app.
- You want Metal/CUDA/ROCm build-flag control.

Skip when: Ollama does what you need — it's llama.cpp with a nicer
wrapper for 90% of use cases.

## Wiring local models into Forge Kit workflows

Three realistic patterns:

### 1. Per-task sidekick in the editor

Use an editor extension (Continue, Cursor, Codeium) pointed at the
local OpenAI-compatible endpoint for inline completions. Claude Code
handles the big-thinking turns; local handles typing assistance.

### 2. Batch/offline tasks

Route bulk, low-stakes, repetitive work (log summarization, test-data
generation, translation spot-checks) to the local endpoint through a
small wrapper script. Saves Claude API tokens for tasks that need the
capability.

### 3. Privacy-gated review

Run a pre-PR review pass against a local model before the diff ever
leaves the machine. Pair with `adt-code-reviewer` style prompts. Cheap
first-pass that catches the obvious before the real review.

## Relevant Forge Kit pieces

- **`adt-model-serving`** skill — production-tier side of this topic
  (vLLM, TGI, Ollama at scale).
- **`adt-eval`** skill — how to compare a local model's output quality
  against the Claude API on your actual tasks before trusting it.
- **`adt-cost`** skill — measure whether routing some traffic local
  actually saves you anything net of hardware wear and your time.

## MCP servers for local models

MCP wrappers for Ollama and LM Studio exist in the community (search
the [official MCP server list](https://github.com/modelcontextprotocol/servers)
and GitHub topic `mcp-server`). Stability varies — vet before relying
on one for an agent workflow. The common pattern is a thin stdio
wrapper that translates MCP tool calls into the runtime's
OpenAI-compatible REST endpoint.

No Forge-Kit-curated MCP entries ship for these runtimes yet. If you
find one that's solid, open a PR adding it to
`packages/catalog/catalog/servers/`.

## See also

- [Local models adoption guide](/docs/guides/local-models.md) — a
  practical walkthrough with concrete install steps.
