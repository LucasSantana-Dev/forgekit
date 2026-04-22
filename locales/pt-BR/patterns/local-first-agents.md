> **Tradução pendente** — conteúdo em inglês, aguardando tradução para pt-BR. Contribute to [ai-dev-toolkit-pt-br](https://github.com/LucasSantana-Dev/ai-dev-toolkit-pt-br/issues).

# Local-First Agents

> Data stays on your machine. Latency drops to milliseconds. Cost drops to hardware amortization.

Running inference locally trades cloud vendor lock-in and subscription costs for hardware capex and operational complexity. This pattern calibrates when local LLMs win, which ones to run, and how to integrate them with your agent toolchain as of April 2026.

## Why Local?

**Cost.** A $2000 GPU pays for itself in 2-6 months if you're running Sonnet-scale reasoning 8 hours daily. After that, inference is free (amortized).

**Data sovereignty.** Code, queries, documents stay encrypted on your disk. No GDPR logs in Anthropic's backend. No surprise data use in model training.

**Latency.** Local models respond in 50-500 ms (no network round-trip). Embedding 1M documents takes hours locally, not days in cloud API batches.

**Interruptibility.** Kill the GPU job, modify the prompt, retry immediately. Cloud APIs have queue delays and rate limits.

**But: the tradeoff.** Local models lag frontier models by 3-6 months in capability (April 2026: Qwen3-Coder is production-ready; Llama 4 rumored, not shipped). Your hardware becomes a cost center; cloud APIs become elastic. Choose local only if you can justify the hardware or the workload is (latency/sovereignty)  critical.

## Model Landscape (April 2026)

| Model | Size | Best For | VRAM | Notes |
|-------|------|----------|------|-------|
| **Qwen3-Coder** | 14B/32B | Code generation, refactoring | 16GB / 32GB | Instruction-tuned, beats Sonnet on some tasks, Ollama native |
| **DeepSeek-R1-Distill** | 7B/14B/32B | Reasoning tasks, complex logic | 8GB / 16GB / 32GB | Reasoning model distilled; lower cost than raw o3 |
| **Llama 4** | 70B | General capability (if released) | 48GB+ | Rumored, not shipped as of April 2026; use Llama 3.3 (70B) instead |
| **Gemma 3** | 2B/7B/27B | Fast embeddings, routing | 8GB / 16GB | Google's model; lightweight, good for classification |
| **Mistral Large v3** | 123B | Dense reasoning, cross-domain | 80GB+ | Expert-dense model; overkill unless you have the VRAM |

**Recommendation:** Qwen3-Coder 14B for general work (16GB VRAM sweet spot); DeepSeek-R1-Distill 14B if you need reasoning (same VRAM, ~2x slower).

## Setup: Ollama vs LM Studio

### Ollama 0.4+

Native MCP support and OpenAI-compatible API. Simplest integration:

```bash
# Install
curl https://ollama.ai/install.sh | sh

# Pull model
ollama pull qwen3-coder:14b

# Run (listening on localhost:11434)
ollama serve

# In another terminal, test
curl http://localhost:11434/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"model":"qwen3-coder:14b","messages":[{"role":"user","content":"Say hello"}]}'
```

**Pros:** Drop-in replacement for OpenAI API; MCP support; automatic quantization (Q4/Q6).
**Cons:** Linux/Mac preferred (Windows via WSL2); no built-in web UI.

### LM Studio

Cross-platform GUI with manual model management. Lower-level control, but more friction:

```bash
# Download from https://lmstudio.ai
# Select model from Hugging Face Hub
# Click "Start Server" (default: localhost:1234)
# Test
curl http://localhost:1234/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"model":"qwen3-coder-14b","messages":[{"role":"user","content":"Say hello"}]}'
```

**Pros:** Web UI for model management; Windows-first; good monitoring.
**Cons:** Higher overhead; manual quantization; fewer integrations.

**Recommendation:** Use Ollama for production agents; LM Studio for exploration.

## Integration Patterns

### Claude Code (Conditional Support)

Claude Code doesn't natively support local models via UI, but you can route via environment variable (check current Claude Code version for local-model-env support):

```bash
# In Claude Code settings or session
export ANTHROPIC_BASE_URL="http://localhost:11434/v1"
export ANTHROPIC_API_KEY="not-needed-for-local"

# Run a task
claude "refactor this Python function" --model qwen3-coder:14b
```

Check your Claude Code version's documentation for `--local-model` or proxy-url flags.

### Aider (Integration Ready)

Aider explicitly supports local models via `--model` flag:

```bash
aider --model ollama/qwen3-coder:14b
```

Aider streams generation, tracks edits, and manages context — excellent for pair-programming with local models.

### Continue (IDE Plugin)

Continue.dev integrates with Ollama and LM Studio natively:

```json
{
  "models": [
    {
      "title": "Qwen3 Local",
      "provider": "ollama",
      "model": "qwen3-coder:14b",
      "apiBase": "http://localhost:11434/v1"
    }
  ]
}
```

Full IDE autocomplete, code refactoring, chat — all local.

### OpenCode (Provider Registration)

If using OpenCode with a local Ollama instance:

```bash
# Register local Ollama as a provider
opencode provider add ollama \
  --api-base http://localhost:11434/v1 \
  --model qwen3-coder:14b
```

Then use: `opencode "implement a schema validator" --provider ollama`

## Hybrid Workflows: Local + Cloud

The optimal strategy is neither pure-local nor pure-cloud, but routed:

```
User request
  ├─ Is this code generation / refactoring? → Local Qwen3 (fast, cost-free)
  ├─ Does it need extended reasoning? → Cloud Opus w/ thinking (one-shot better)
  ├─ Is this an embedding / semantic search? → Local Gemma 3 (2B, fast, free)
  └─ Do I need a second opinion on the result? → Cloud Sonnet for review
```

**Routing rule:** Use local-first for draft/iteration; escalate to cloud for final validation or when you're uncertain.

Implement this routing in your agent tool (see [`patterns/cost-aware-routing.md`](./cost-aware-routing.md) for full details):

```json
{
  "routing": {
    "drafting": { "provider": "local", "model": "qwen3-coder:14b" },
    "validation": { "provider": "cloud", "model": "claude-sonnet-4-6" },
    "reasoning": { "provider": "cloud", "model": "claude-opus-4" }
  }
}
```

## Hardware Reality: VRAM Tiers

| GPU VRAM | Max Model Size | Tokens/Sec | Use Case |
|----------|----------------|-----------|----------|
| 8 GB | 7B quantized (Q4) | 5-15 | Embedded, edge devices |
| 16 GB | 14B (Q4) or 7B (full precision) | 15-40 | Development, small teams |
| 24 GB | 14B (Q6) or 32B (Q4) | 30-80 | Workstation, local reasoning |
| 48 GB+ | 70B (Q4) or 120B (Q6) | 50-150 | Research, multi-user servers |

**Q4 vs Q6 trade-off:**
- **Q4 (quantized to 4-bit):** ~50% VRAM savings, 5-10% quality loss (acceptable for most code tasks).
- **Q6:** Closer to full precision, 20-30% VRAM overhead, rarely needed for local work.

**Practical recommendation:** Buy a 24GB GPU if you're doing this seriously (RTX 4090, RTX 6000 Ada, or AMD equivalent). Amortizes in 6-12 months.

## Function Calling & MCP Compatibility

### MCP Support

Ollama 0.4+ has native MCP server support. Define your tools in the MCP manifest, and Ollama agents can invoke them during reasoning:

```json
{
  "tools": [
    {
      "name": "run_tests",
      "description": "Run test suite",
      "inputSchema": { "type": "object", "properties": { "filter": { "type": "string" } } }
    }
  ]
}
```

The local model will call `run_tests` mid-reasoning and incorporate the result.

### Function-Calling Reliability

Local models are worse at structured tool calling than frontier models. If you need:
- **90%+ accuracy:** Cloud (Claude, GPT-5).
- **70-80% accuracy:** Qwen3-Coder, DeepSeek-R1-Distill (acceptable for code generation, risky for strict schema validation).
- **Fallback:** Always have a local fallback + cloud validation step. Local model drafts, cloud model validates.

## Context Window & Quantization Gotchas

**Context window mismatch.** Qwen3-Coder claims 128K context; loading it quantized (Q4) sometimes reduces effective context to 32K in practice. Always test your actual context size in the quantized version.

**Quantization breaks some tasks.** Math-heavy or proof-writing tasks degrade sharply under Q4. Use full-precision (16-bit) or higher quantization (Q6) for reasoning.

**Temperature tuning for local models.** Temperature=0 on local models is often too deterministic. Try 0.3-0.5 for code generation; Ollama defaults handle this well.

## Pitfalls

**Hallucinated capabilities.** Local models confidently claim to support features they don't (e.g., "I can call APIs"). Always ground local model outputs with validation.

**Deployment friction.** Running a 24GB GPU requires power, cooling, and a static IP. Cloud APIs scale elastically. Use local for development, keep cloud for production.

**Model drift.** Ollama auto-updates models. Quantization or Ollama version changes can subtly degrade performance. Pin your model version in CI.

**Cold-start latency.** First request after restart loads model into VRAM (10-30 sec). Subsequent requests are fast. Relevant for serverless workflows (use cloud instead).

## Related

- [`patterns/cost-aware-routing.md`](./cost-aware-routing.md) — when local is cheaper than cloud
- [`patterns/multi-model-routing.md`](./multi-model-routing.md) — routing by task, not cost
- [`best-practices/security.md`](../best-practices/security.md) — data sovereignty patterns beyond inference
