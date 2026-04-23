---
id: opentelemetry-genai
title: OpenTelemetry GenAI Semantic Conventions
description: Vendor lock-in to observability layers has cost you money. Decoupling
  telemetry collection from analysis backends lets you migrate from Datadog to Grafana
  without rewriting instrumentation. OpenTelemetry GenAI Semantic Conventions (GA
  March 2026) is the standard way forward.
tags:
- skill-md
- claude
- prompting
- agents
source:
  path: ai-dev-toolkit/packages/core/patterns/opentelemetry-genai.md
  license: MIT
translations:
  pt-BR:
    title: Convenções Semânticas OpenTelemetry GenAI
    description: Lock-in em vendors de observabilidade custou dinheiro. Desacoplar
      telemetria via OpenTelemetry GenAI conventions — padrões portáveis para observabilidade
      de LLM.
---
Vendor lock-in to observability layers has cost you money. Decoupling telemetry collection from analysis backends lets you migrate from Datadog to Grafana without rewriting instrumentation. OpenTelemetry GenAI Semantic Conventions (GA March 2026) is the standard way forward.

> _Reference: [OpenTelemetry GenAI Specifications](https://opentelemetry.io/docs/specs/semconv/gen-ai/). Implemented by Datadog, Grafana, Uptrace, and OTel Collector as first-class signal types._

## Why this matters

**Problem**: Vendor SDKs tie your instrumentation code to their platform. Switching providers means rewriting every telemetry point. Semantic Conventions decouple what you measure from how you analyze it.

**Solution**: Use standard span attributes (`gen_ai.request.model`, `gen_ai.usage.input_tokens`, etc.) via `opentelemetry-sdk`. Your code stays the same. Export to Datadog, Grafana, Uptrace, or any OTel Collector backend interchangeably.

**Scope**: LLM operations (requests, token usage, tool calls), not application-level metrics. For cost tracking across models, filtering by model/org, and debugging token-efficiency.

## Core span attributes

Standard attributes every LLM span should carry:

| Attribute | Type | Example | Required |
|-----------|------|---------|----------|
| `gen_ai.operation.name` | string | `"completion"`, `"embedding"` | Yes |
| `gen_ai.request.model` | string | `"gpt-4"`, `"claude-3-opus"` | Yes |
| `gen_ai.request.model.architecture` | string | `"transformer"` | No |
| `gen_ai.request.max_tokens` | int | `2048` | No |
| `gen_ai.response.model` | string | `"gpt-4-turbo"` (actual deployed) | No |
| `gen_ai.response.id` | string | `"chatcmpl-8c3i8..."` | No (see pitfalls) |
| `gen_ai.response.finish_reasons` | array | `["length"]`, `["tool_calls"]` | Yes |
| `gen_ai.usage.input_tokens` | int | `142` | Yes |
| `gen_ai.usage.output_tokens` | int | `418` | Yes |
| `gen_ai.usage.cache.creation_input_tokens` | int | `50` (prompt caching) | No |
| `gen_ai.usage.cache.read_input_tokens` | int | `92` (cache hit) | No |

Tool-specific spans (nested under LLM call):

```
gen_ai.client.operation
├── span: "tool_call_xyz" [gen_ai.request.function.name: "retrieve_docs"]
│   ├── start
│   └── end [status: ok/error]
└── span: "tool_response_parse" [status: ok/error]
```

## Python example: OpenAI with OTel

```python
from opentelemetry import trace, metrics
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import SimpleSpanProcessor
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
from opentelemetry.instrumentation.openai import OpenAIInstrumentor

# Initialize OTLP exporter (to local collector or cloud backend)
otlp_exporter = OTLPSpanExporter(endpoint="http://localhost:4317")
trace.set_tracer_provider(TracerProvider())
trace.get_tracer_provider().add_span_processor(SimpleSpanProcessor(otlp_exporter))

# Auto-instrument OpenAI calls
OpenAIInstrumentor().instrument()

# Your code — no changes needed
tracer = trace.get_tracer(__name__)

with tracer.start_as_current_span("app.llm_decision") as span:
    response = LLM_CLIENT.chat.completions.create(
        model="gpt-4",
        messages=[{"role": "user", "content": "Classify this: ..."}],
        temperature=0.0,
    )
    # OTel auto-captures: gen_ai.request.model, gen_ai.usage.input_tokens, gen_ai.usage.output_tokens, gen_ai.response.finish_reasons
```

The `OpenAIInstrumentor` automatically:
- Creates child spans for each LLM call
- Extracts `gen_ai.request.model`, `gen_ai.usage.*` from response metadata
- Records finish reasons, error codes, latency
- Does NOT capture request/response content (PII safe by default)

## TypeScript example: Generic vendor-neutral pattern

```typescript
import { NodeSDK } from "@opentelemetry/sdk-node";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { trace, context, SpanStatusCode } from "@opentelemetry/api";

const sdk = new NodeSDK({
  traceExporter: new OTLPTraceExporter({
    url: "http://localhost:4318/v1/traces",
  }),
  instrumentations: [getNodeAutoInstrumentations()],
});
sdk.start();

const tracer = trace.getTracer("app");

// Wrap any LLM call (vendor-agnostic)
async function callLLM(model: string, prompt: string) {
  const span = tracer.startSpan("llm.request");

  try {
    span.setAttributes({
      "gen_ai.operation.name": "completion",
      "gen_ai.request.model": model,
    });

    const response = await LLM_CLIENT.chat.completions.create({
      model,
      messages: [{ role: "user", content: prompt }],
    });

    span.setAttributes({
      "gen_ai.response.id": response.id,
      "gen_ai.usage.input_tokens": response.usage.prompt_tokens,
      "gen_ai.usage.output_tokens": response.usage.completion_tokens,
      "gen_ai.response.finish_reasons": [response.choices[0].finish_reason],
    });

    return response;
  } catch (err) {
    span.setStatus({ code: SpanStatusCode.ERROR, message: err.message });
    throw err;
  } finally {
    span.end();
  }
}
```

## OTel Collector routing

Collector config to parse OTel spans and route to backends:

```yaml
# otelcol-contrib configuration
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317
      http:
        endpoint: 0.0.0.0:4318

processors:
  # Filter out PII from gen_ai spans
  attributes:
    actions:
      - key: gen_ai.request.temperature
        action: delete  # Keep sensitive params out
      - key: gen_ai.system_fingerprint
        action: delete

  # Sampling: keep 100% of errors, 10% of successful calls
  probabilistic_sampler:
    sampling_percentage: 10

exporters:
  # Datadog
  datadog:
    api:
      key: ${DD_API_KEY}
    hostname_source: "config_or_system"
    tags:
      - "env:prod"
      - "service:agent"

  # Grafana Loki + Tempo
  otlp/grafana:
    endpoint: tempo.grafana.cloud:4317
    headers:
      authorization: "Bearer ${GRAFANA_TOKEN}"

  # Or local Grafana
  # otlp/local:
  #   endpoint: http://grafana-tempo:4317

service:
  pipelines:
    traces/genai:
      receivers: [otlp]
      processors: [attributes, probabilistic_sampler]
      exporters: [datadog, otlp/grafana]
```

## Pitfalls and defenses

### PII leakage in spans

**Risk**: Prompts and responses may contain user data. Captured in spans → exposed in observability dashboards.

**Defense**:
- Never capture request/response **content** in span attributes. Only metadata (model, token counts, finish reason).
- Use `http.request.body` redaction rules in Collector to strip sensitive headers/payloads.
- Inspect OTel attributes before exporting: if you see `gen_ai.request.prompt`, that's a misconfiguration.

```python
# BAD: DO NOT DO THIS
span.set_attribute("gen_ai.request.prompt", user_message)  # PII leak

# GOOD: Only metadata
span.set_attribute("gen_ai.request.model", "gpt-4")
span.set_attribute("gen_ai.usage.input_tokens", 142)
```

### High cardinality on `gen_ai.response.id`

**Risk**: Unique IDs (OpenAI's `chatcmpl-xxx`) are high-cardinality dimensions. Storing one per request = metric explosion in Datadog/Grafana.

**Defense**:
- Tag by `gen_ai.request.model` and `gen_ai.response.finish_reason` for aggregation.
- `gen_ai.response.id` is useful in tracing (link to logs), not metrics. Keep it in the span but don't index it as a metric dimension.

### Sampling strategies for cost

**High volume** → overwhelming observability costs. Sample smartly:

- **100% sampling on errors** — always capture failures.
- **Probabilistic 5–10% on success** — representative coverage without noise.
- **Tail-based sampling**: capture entire traces if any span contains an error.

```yaml
tail_sampling:
  policies:
    - name: error_traces
      http_status:
        status_codes: [400, 401, 403, 404, 500, 502, 503]
```

## When NOT to use OpenTelemetry GenAI

- **Single vendor, no migration planned**: If you're committed to Datadog's APM and moving is not in the roadmap, Datadog's proprietary instrumentation may be simpler.
- **Embedded or edge agents** with no observability infrastructure: A local SQLite log is cheaper.
- **Batch/offline processing** with no real-time queries: Structured logs in JSON are sufficient; you don't need distributed tracing.

Use OTel GenAI when:
- You want observability portability (future-proof).
- You have multi-model workflows (compare token efficiency across vendors).
- You're building agent orchestration (trace tool calls, retries, fallbacks).

## Rollout checklist

- [ ] Pin `opentelemetry-sdk` and instrumentation library versions in requirements.txt / package.json.
- [ ] Set OTLP exporter endpoint (local collector or cloud backend URL).
- [ ] Verify PII redaction in Collector config.
- [ ] Sample appropriately (100% errors, 5–10% success).
- [ ] Validate spans in local Jaeger UI before shipping to production.
- [ ] Monitor `gen_ai.usage.{input,output}_tokens` by model to catch cost anomalies.
- [ ] Document sampling policy in team runbook.

## Related

- [OpenTelemetry Instrumentation](https://opentelemetry.io/docs/instrumentation/python/) — language-specific setup
- [OTel Collector Configuration](https://opentelemetry.io/docs/collector/configuration/) — advanced exporter/processor recipes
- [NIST AI RMF: Measure (DO.2)](https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.100-2e2025.pdf) — measurement and monitoring practices
- [`packages/core/patterns/agent-observability.md`](./agent-observability.md) — agent-level tracing beyond LLM calls
