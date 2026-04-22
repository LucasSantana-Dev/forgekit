---
name: model-serving
description: Choose and configure inference servers (vLLM, TGI, Ollama) — quantization, batching, scaling, and serving patterns
triggers:
  - model serving
  - vllm
  - tgi
  - ollama
  - model deployment
  - inference server
  - quantization
  - batching
---

# Model Serving Architecture

Choosing the right inference server is critical for production AI systems. This skill guides the decision between vLLM, TGI, and Ollama based on throughput, latency, and operational requirements.

## vLLM

**Best for**: High-throughput, multi-GPU clusters, latency-sensitive systems.

vLLM is a high-throughput inference engine with:
- **Continuous batching**: requests don't wait for full batches; served dynamically
- **PagedAttention**: KV cache block management reduces memory fragmentation by 20-50%
- **Quantization support**: AWQ, GPTQ (INT4/INT8), FP8, with <1% quality loss at INT4 AWQ
- **Distributed inference**: tensor parallelism across multiple GPUs
- **Dynamic SLO scheduling**: prioritize low-latency requests, batch latency-tolerant ones

**Use when**:
- Throughput >100 RPS or large models (70B+)
- Multi-GPU or multi-node setup available
- SLOs: P95 latency <500ms with high throughput
- Cost is secondary to performance

**Example**: `vllm serve meta-llama/Llama-2-70b --gpu-memory-utilization 0.9 --enable-prefix-caching`

## TGI (Text-Generation-Inference)

**Best for**: Mid-scale deployments, streaming responses, simpler operational burden.

TGI from HuggingFace provides:
- **Flash Attention 2**: faster attention computation (10-30% latency improvement)
- **Continuous batching**: similar to vLLM but simpler API
- **Streaming**: native OpenAI-compatible streaming
- **Quantization support**: bitsandbytes INT8, GPTQ
- **Single-GPU deployment**: works efficiently on A100 or L40

**Use when**:
- Single GPU or 2-4 GPU setup
- Streaming responses important (chat, real-time generation)
- Moderate throughput (10-50 RPS)
- Prefer simplicity over maximum optimization

**Example**: `text-generation-launcher --model-id meta-llama/Llama-2-7b --max-batch-size 32 --quantize bitsandbytes`

## Ollama

**Best for**: Local development, edge deployment, single-user serving, quick experimentation.

Ollama abstracts model management and serving:
- **Automatic quantization**: INT4 GGUF models with near-baseline quality
- **Model library**: `ollama pull llama2:13b` (pulls pre-quantized models)
- **HTTP API**: simple REST interface
- **Multi-format support**: GGUF, GGML, safetensors
- **CPU and GPU support**: seamless fallback if GPU unavailable

**Use when**:
- Development or local testing
- Edge deployment (laptop, RPi, Jetson)
- Single-user or small-scale (1-5 QPS)
- Operational simplicity valued over performance

**Example**: `ollama pull mistral:7b` → `curl http://localhost:11434/api/generate -d '{"model":"mistral:7b","prompt":"Hello"}'`

## Comparison Table

| Criterion | vLLM | TGI | Ollama |
|-----------|------|-----|--------|
| **Throughput** | >100 RPS | 10-50 RPS | <5 RPS |
| **P99 Latency** | 200-500ms | 300-800ms | 1-5s |
| **GPU Memory Efficiency** | 70-90% util | 60-80% util | 40-60% util |
| **Ease of Setup** | Complex (cluster) | Moderate | Simple (single cmd) |
| **Streaming Support** | No native | Yes (OpenAI-compat) | Yes (HTTP streaming) |
| **Quantization Support** | AWQ, GPTQ, FP8, INT4 | INT8, GPTQ | INT4 GGUF (automatic) |
| **Horizontal Scaling** | Multi-node tensor-parallel | Replica behind LB | Not supported |
| **Best for Model Size** | 70B+ | 7B-30B | 7B or smaller |

## Serving Decision Tree

```
┌─ Is this local/edge deployment?
│  ├─ YES → Use Ollama
│  └─ NO ─┐
│         ├─ Do you have >1 GPU or expect >50 RPS?
│         │  ├─ YES → Use vLLM
│         │  └─ NO ─┐
│         │         ├─ Is streaming response required?
│         │         │  ├─ YES → Use TGI
│         │         │  └─ NO → Use vLLM (higher perf) or TGI (simpler)
```

**Decision**: Match infrastructure and SLOs to the server's sweet spot. Avoid over-provisioning with vLLM for <10 RPS or under-provisioning with Ollama for >100 RPS.

## Quantization Guide

Quantization reduces model size and memory footprint with minimal quality loss.

### Baselines

- **FP32** (full precision): 4 bytes per param; 70B model = 280 GB
- **FP16** (half precision): 2 bytes per param; 70B model = 140 GB; no quality loss

### Quantization Levels

| Level | Bytes/Param | Size (70B) | Quality Loss | When to Use |
|-------|-------------|------------|--------------|-------------|
| FP16 | 2 | 140 GB | 0% | Baseline for all production models |
| INT8 | 1 | 70 GB | <1% | Acceptable when memory is tight |
| INT4 (AWQ) | 0.5 | 35 GB | <5% | Standard for cost-sensitive; >10% speed-up |
| NF4 (QLoRA) | 0.4 | 28 GB | <3% | LoRA fine-tuning; not for inference |
| **INT4 (GPTQ)** | 0.5 | 35 GB | 1-3% | Aggressive; benchmark first |

### Quantization Strategies

1. **Start with FP16**: establish baseline quality and latency
2. **Try INT8** first: 2× compression, <1% loss, supported by most servers
3. **INT4 (AWQ)** if needed: 4× compression, still <5% loss; supports streaming
4. **Avoid sub-INT4**: quality cliff (>10% loss) not justified by marginal size savings

### Tool Support

- **vLLM**: `--quantization awq` or `--quantization gptq`
- **TGI**: `--quantize bitsandbytes` (INT8 only)
- **Ollama**: automatic; specify `mistral:7b-q4_K_M` for INT4 GGUF

## Batching Patterns

### Dynamic Batching (vLLM Default)

Requests enter a pool and are batched dynamically without waiting. Best for throughput.

```
Time │ Request A    (500 tokens)
     │ Request B  (300 tokens, enters 100ms later)
     │ Request C  (400 tokens, enters 150ms later)
     ↓
     Batch [A, B, C] serves all three simultaneously
     No request waits for a full batch.
```

**Advantage**: No artificial latency; P95 latency remains low even under high load.

**When to use**: High throughput, latency-tolerant workloads (batch inference, backfill).

### Continuous Batching (vLLM with PagedAttention)

Similar to dynamic batching but with block-based KV cache management. Reduces fragmentation.

```
KV cache blocks: [A, B, C] mapped to logical sequences
Can reuse blocks even if sequence lengths change mid-flight.
Result: 20-50% better GPU utilization.
```

**When to use**: Always, if using vLLM. It's the default.

### Static Batching (Avoid)

Wait for a fixed batch size before serving. Introduces artificial latency.

```
Batch size = 32
Request 1-31 arrive; wait.
Request 32 arrives.
Serve all 32.
Requests 1-31 waited even though they could be served at request 10.
```

**Never use**: Kills tail latency. Only acceptable in batch jobs (nightly reranking), not interactive services.

## Scaling Rules

### Vertical Scaling (Single GPU, Optimize Before Scaling Out)

1. **Increase batch size** until GPU memory is 85-90% utilized
2. **Enable continuous batching** (vLLM): reduces fragmentation by 20-50%
3. **Quantize** (INT4 AWQ): 4× compression, <5% quality loss
4. **Enable prefix caching** (vLLM): deduplicate KV blocks across requests with shared prefixes
5. **Lower precision** (FP16 instead of FP32): 2× memory savings

**Metric**: Monitor `GPU memory %`, `P99 latency`, `tokens/sec`. Stop when P99 latency degrades or memory hits 95%.

### Horizontal Scaling (Multi-GPU or Multi-Node)

1. **Before scaling out**: use tensor parallelism on a single node (shard model across GPUs)
   - 70B model: tensor parallelism across 2× A100 80GB GPUs
   - 70B model: tensor parallelism across 8× H100 80GB GPUs for <100ms latency
2. **When to scale out**: tensor parallelism exhausted OR latency SLOs unmet
   - Replicate behind a load balancer (nginx, Kubernetes service)
   - Each replica handles independent requests
3. **Monitoring**: watch `GPU memory %` and `queue depth` per replica
   - If queue depth >10 requests: add replica
   - If GPU utilization <60% AND latency is good: consolidate replicas

### KV Cache Monitoring

Monitor KV cache memory pressure to detect when to scale:

```
available_KV_cache = (GPU_memory_total - model_weights - activations)
cache_pressure = KV_cache_used / available_KV_cache

If cache_pressure > 0.9 for 5 min → add GPU or reduce batch size
If cache_pressure > 0.95 → drop low-priority requests or return error
```

For streaming: KV cache grows as output tokens are generated. If a request generates 1000+ output tokens, reserve space.

## Production Checklist

- [ ] **Inference server chosen**: vLLM (>100 RPS or 70B+), TGI (mid-scale or streaming), Ollama (local/edge)
- [ ] **Quantization strategy**: FP16 baseline, INT8 or INT4 AWQ evaluated and benchmarked
- [ ] **Batching**: dynamic/continuous batching enabled; static batching avoided
- [ ] **GPU utilization monitored**: <85% baseline, 90%+ with quantization, alert at 95%
- [ ] **KV cache monitoring**: cache pressure tracked; alerts at 90% and 95% thresholds
- [ ] **Vertical scaling complete**: batch size, precision, prefix caching tuned before horizontal scaling
- [ ] **Load balancer configured**: multiple replicas behind nginx/K8s service with health checks
- [ ] **SLOs defined**: P95 latency, error rate, availability targets
- [ ] **Cost baseline**: cost per inference, cost per token, monthly spend estimate
- [ ] **Failover tested**: replica failure, GPU OOM, model load timeout all have graceful degradation
