---
id: ai-observability
title: AI Observability in Production
description: Production AI systems require deep observability into model performance,
  cost, and data quality. This pattern covers instrumentation, alerting, and data
  quality monitoring for LLM-powered applications.
tags:
- skill-md
- claude
- prompting
- testing
source:
  path: ai-dev-toolkit/packages/core/patterns/ai-observability.md
  license: MIT
translations:
  pt-BR:
    title: Observabilidade de IA em Produção
    description: Sistemas de IA em produção exigem observabilidade profunda sobre
      performance de modelo, custo e consistência de saída. Aborda latência, taxa
      de erro, deriva de modelo e padrões de observabilidade.
---
Production AI systems require deep observability into model performance, cost, and data quality. This pattern covers instrumentation, alerting, and data quality monitoring for LLM-powered applications.

## Key Metrics

| Metric | Measures | Healthy | Alert |
|--------|----------|---------|-------|
| **TTFT** (Time to First Token) | Model latency before streaming begins | <500ms | >2s |
| **TPS** (Tokens Per Second) | Throughput of model inference | >50 | <20 |
| **E2E Latency** | Full request roundtrip (network + model + retrieval) | <2s | >5s |
| **Prompt Tokens** | Input token count per request | <4k | >8k |
| **Completion Tokens** | Output token count per request | <2k | >4k |
| **Cost Per Request** | USD spent per inference | track baseline | 3× baseline |
| **Error Rate** | % of requests that fail or timeout | <1% | >5% |
| **Cache Hit Rate** | Requests served from cache (semantic cache, KV cache, or response cache) | >40% | <20% |

Track these metrics per model, per endpoint, and aggregated. Set up dashboards that update every 60s for real-time visibility.

## Data Quality Monitoring

### Input Drift Detection

Monitor whether input embeddings or feature distributions shift over time, indicating data quality degradation or out-of-distribution requests.

1. **Baseline**: embed a sample of requests from the first week; compute centroid and covariance matrix
2. **Monitor**: every 24 hours, compute KL divergence or Kolmogorov-Smirnov test statistic between current day's embeddings and baseline
3. **Alert threshold**: KS test p-value < 0.05 (statistically significant drift) or cosine similarity of daily centroid to baseline < 0.95
4. **Root cause**: check for new user cohorts, seasonal patterns, or degraded upstream data quality

### Output Quality Scoring

Use an LLM-as-judge to automatically score a sample of outputs (10% of production traffic, capped at 100 evals/day to manage cost).

```
Sample Request
├─ Criteria: relevance, factuality, tone, safety
├─ Scoring Prompt: judge response against rubric (1-5 scale)
├─ Store: score, rubric used, model version, date
└─ Alert: if median score drops >20% from 7-day baseline
```

Re-score baseline weekly to account for drift in what "good" means.

### Token Budget Warnings

For systems with bounded context windows, monitor cumulative token usage per request:

- **80% threshold**: warn in logs (observable but not blocking)
- **95% threshold**: block new turns, return error explaining context exhaustion
- **Per-user hard limits**: optional rate limiting if cost-aware

## Cost Tracking

### Request-Level Instrumentation

Log every model call with this schema:

```json
{
  "timestamp": "2025-04-10T14:23:45Z",
  "model": "claude-3-5-sonnet",
  "prompt_tokens": 850,
  "completion_tokens": 145,
  "cost_usd": 0.00847,
  "user_id": "usr_abc123",
  "feature": "semantic-search",
  "endpoint": "/api/query",
  "latency_ms": 1240,
  "error": null
}
```

Use this to compute:

- **Per-request cost**: `(input_tokens × input_price + output_tokens × output_price) / 1M`
- **Daily cost**: sum all requests in 24-hour window
- **Monthly projection**: daily cost × 30
- **Cost per feature**: group by feature name, compute mean + P95 cost per request
- **Cost per user**: useful for usage-based billing or identifying heavy users

### Budget Alerts

1. **Daily burn**: IF today's spend > 1.2 × avg(last 7 days) → warn team
2. **Weekly projection**: IF current week on pace for >120% of budget → escalate
3. **Cost anomaly**: IF P95(cost per request) > 3 × median → investigate model call parameters
4. **Monthly threshold**: set hard limit; when 80% consumed, notify; at 95%, throttle low-priority endpoints

## Alerting Rules

| Condition | Severity | Action |
|-----------|----------|--------|
| P99 latency > 5s for 2 min | Page | Wake oncall engineer; check model availability, load balancer health, network |
| Error rate > 5% for 5 min | Page | Check logs for error pattern (rate limits, model downtime, invalid inputs) |
| Cost spike > 200% of 7-day avg | Warn | Investigate token explosion (e.g., retrieval returned 50 documents instead of 5) |
| Quality score drop > 20% from baseline | Warn | Manual review of sample outputs; check for model version drift, prompt changes, input distribution shift |
| Cache hit rate < 20% for 1 hour | Warn | May indicate cache key mismatch or legitimate increase in diverse queries |
| TTFT > 2s (sustained for 5 min) | Page | Model queueing or slow time-to-first-byte; scale up or reduce batch size |

## Instrumentation Patterns

Use OpenTelemetry spans to instrument:

### Model Call Span

```python
with tracer.start_as_current_span("llm.call") as span:
    span.set_attribute("llm.model", "claude-3-5-sonnet")
    span.set_attribute("llm.prompt_tokens", prompt_token_count)
    span.set_attribute("llm.system", "anthropic")
    span.set_attribute("gen_ai.request.temperature", 0.7)

    response = client.messages.create(...)

    span.set_attribute("llm.completion_tokens", response.usage.output_tokens)
    span.set_attribute("llm.cost_usd", compute_cost(...))
```

### Tool Execution Span

```python
with tracer.start_as_current_span("tool.call") as span:
    span.set_attribute("tool.name", "search_db")
    span.set_attribute("tool.duration_ms", 45)
    span.set_attribute("tool.status", "success")
    span.set_attribute("tool.result_size_bytes", 1024)
```

### Retrieval Span

```python
with tracer.start_as_current_span("retrieval.query") as span:
    span.set_attribute("retriever.name", "semantic_search")
    span.set_attribute("retrieval.query", user_query)
    span.set_attribute("retrieval.top_k", 5)
    span.set_attribute("retrieval.latency_ms", 230)
    span.set_attribute("retrieval.result_count", 5)
```

Export to a backend (Datadog, New Relic, Grafana Loki) for long-term retention and alerting.

## Production Checklist

- [ ] **Metrics**: TTFT, TPS, E2E latency, token counts, cost per request, error rate, cache hit rate all being logged
- [ ] **Dashboards**: real-time dashboard with 60s refresh rate; separate cost, latency, and quality dashboards
- [ ] **Alerts**: PagerDuty/OpsGenie integration for P99 latency > 5s and error rate > 5%
- [ ] **Cost tracking**: per-request logging with model, tokens, USD cost; daily budget alerts in place
- [ ] **Data quality**: input drift detection running; LLM-as-judge sampling 10% of traffic or 100 evals/day (whichever is lower)
- [ ] **Token budgets**: 80% warning + 95% block implemented for context window limits
- [ ] **Instrumentation**: OpenTelemetry spans exported to backend for model calls, tool execution, retrieval
- [ ] **Baseline established**: 7-day historical baseline for latency, cost, quality before serving production traffic
- [ ] **On-call runbook**: documented for top 5 alert types; oncall can trace from alert to relevant logs in <2 min
- [ ] **Capacity planning**: forecast next 30/90 days of token usage and cost based on growth trajectory
