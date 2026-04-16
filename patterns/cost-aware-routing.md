# Cost-Aware Routing

> Token spend is a first-class observability signal. Treat cost as you would latency or error rate.

Model choice is now a cost/quality tradeoff, not a binary "do I need reasoning" decision. This pattern extends [`patterns/multi-model-routing.md`](./multi-model-routing.md) with explicit economics: token pricing, caching strategy, and output-format optimization that recovers 40-60% of spend.

## The Economics Problem

Three realities changed the game in Q1 2026:

1. **Frontier models have frontier pricing.** Opus 4 reasoning tokens cost 15x base Claude Haiku 4.5. o3-mini costs more than Sonnet per input token.
2. **Iterative workflows are expensive.** Generating prose, asking the model to reformat it, then parsing the output burns 3-5x tokens compared to schema-first design.
3. **Cache hits vary wildly by provider.** Anthropic prompt caching (TTL 5 min, automatic reuse) saves 90% of cached-segment cost; OpenAI cache hits reset on model/parameter changes; local Ollama has no cache.

The three-tier routing heuristic is still correct, but incomplete. You now need to ask: _for this task in this context, which model + format + cache strategy minimizes cost per quality unit?_

## Decision Tree: Choosing Your Model

```
Is this a one-off, low-stakes question (explain, brainstorm, summarize)?
  ├─ YES → Haiku 4.5 (1x cost, 5-10 ms latency)
  └─ NO  → continue

Does the task require extended reasoning (multi-step math, proof writing, hard logic)?
  ├─ YES → Claude Opus 4 w/ extended thinking OR o3-mini
  │         (reasoning tokens: 15-50x base cost, but 80%+ first-pass correctness)
  └─ NO  → continue

Is the task code generation, refactoring, test writing (needs context awareness)?
  ├─ YES → Claude Sonnet 4.6 or Haiku 4.5 depending on context size
  │         (Sonnet: 5-8x Haiku, better for >10 file scope; Haiku for small diffs)
  └─ NO  → continue

Is this embeddings, semantic search, or lightweight classification?
  ├─ YES → Haiku-small / Gemini Flash or local Ollama embed
  │         (10-100x cheaper than reasoning; use only if accuracy <97% acceptable)
  └─ NO  → Standard task: Sonnet 4.6
```

## Real-World Token Cost Breakdown

### Example: 7-Step SQL Refactor

**Path A: Iterative Sonnet (traditional)**
- Sonnet input: 4K tokens (schema + sample data + old query)
- Sonnet output: 800 tokens (refactored query)
- You ask: "Add index hints"
- Sonnet input: 5.5K (full conversation history)
- Sonnet output: 600 tokens
- You: "Format as Markdown table"
- Sonnet input: 6.3K
- Sonnet output: 400 tokens

**Total: 17.1K input tokens (Sonnet @ $3 per 1M input) = ~$0.051**

**Path B: Single Opus 4 with reasoning**
- Opus input: 4K tokens (same schema + query)
- Opus reasoning: 8K tokens (cost: 50x per token, but counts toward output limit)
- Opus output: 600 tokens (complete refactored query + hints + formatting)

**Total: 4K input + 8.6K reasoning (@$50/1M reasoning) = ~$0.28, BUT one-shot**

Verdict: Sonnet saves ~5.5x on tokens, but Opus finishes in one call (latency + certainty). Choose Sonnet for exploration, Opus for locked specs.

### Output-Format Optimization: -40% Token Spend

Asking a model to generate prose, then parsing it, burns tokens twice — generation + re-ingestion. Schema-first design cuts this in half:

**Bad (prose-first):**
```
User: Summarize this bug report.
Model: "The issue occurs when..." (800 tokens)
User: Extract as JSON: {"error": "...", "severity": "...", "workaround": "..."}
Model: Reformats prose into JSON (600 tokens)
Total: 1400 tokens + parsing latency
```

**Good (schema-first):**
```
User: Summarize as JSON {"error": "...", "severity": "...", "workaround": "..."}
Model: Direct JSON (400 tokens)
Total: 400 tokens, parser runs immediately
```

**Evidence:** Braintrust (2025 LLM routing report) reports 40-60% spend recovery from output-format optimization alone. Validate with structured outputs (JSON schema validation in Claude API) to catch malformed replies early.

## Token Attribution & Observability

Tag every request with user, feature, and model choice. Route through OpenTelemetry or Honeycomb with these fields:

```json
{
  "gen_ai.request.model": "claude-opus-4-20250514",
  "gen_ai.request.input_tokens": 4200,
  "gen_ai.request.output_tokens": 850,
  "gen_ai.request.reasoning_tokens": 8500,
  "user.id": "org-12345/user-67890",
  "feature": "sql-refactor",
  "routing.decision": "opus-extended-thinking",
  "cache_hit": false,
  "cost_cents": 5.2
}
```

Use this data to:
- **Cost by feature**: Which features are expensive? (Migrate to cheaper model or optimize prompts.)
- **Cost by user tier**: Free users → Haiku only; paid → Sonnet; enterprise → Opus + reasoning.
- **Cache ROI**: If cached-segment hit rate >20%, evaluate prompt caching on that request type.
- **Model performance**: o3-mini vs Sonnet on the same task — which one had higher quality (lower retry rate)?

Link to [`patterns/opentelemetry-genai.md`](./opentelemetry-genai.md) for full instrumentation patterns (if added in this wave).

## Breakeven Math: When Reasoning Pays For Itself

Reasoning models are only economical if they reduce downstream cost:

| Task | Standard Path | Reasoning Path | Breakeven |
|------|--------------|-----------------|-----------|
| **SQL refactor** (3 iterations) | 3x Sonnet (~$0.05) | 1x Opus reasoning (~$0.28) | Loses $0.23, BUT faster |
| **Bug root-cause (6 iterations)** | 6x Sonnet (~$0.10) | 1x Opus reasoning (~$0.28) | Loses $0.18, BUT 1st-pass fix 80% of time |
| **Architecture decision** (10 back-and-forth) | 10x Sonnet (~$0.17) | 1x Opus reasoning (~$0.28) | **Breaks even** on iteration volume |

**When to use reasoning:** Tasks where you'd iterate ≥3 times, or where a first-pass miss is very costly (security review, financial computation).

**When to skip reasoning:** Routine tasks, exploration, drafting.

## Cache-First Strategy

Prompt caching saves 90% of cached-segment cost. Optimize for cache hits:

1. **Stable preamble first.** System prompt + coding guidelines (rarely change) → cached once, reused 50x.
2. **Stable context.** Large code blocks (your codebase reference) → once cached, free on next prompt.
3. **Variable data last.** This user's request + dynamic context → uncached, incurs full cost.

Example:

```
[Cached: 2500 tokens] System prompt + 50KB codebase reference
[Uncached: 300 tokens] User request + this-session context
Output: 200 tokens
Cost: (2500 * 0.9 discount) + 300 + 200 = 2800 input equivalent, saves ~$0.005
```

**Multi-request savings:** If the cached segment is reused 5 times: 5 * $0.005 = $0.025/day = $750/year for one user.

## Pitfalls

**Reasoning latency hides cost.** Opus with extended thinking takes 5-10x longer to respond. The token cost is high, but feels "worth it" when response arrives after 30 seconds. Compare cost-per-second, not cost-per-call.

**Cache-hit rate disparities.** Anthropic's prompt caching is automatic and reliable. OpenAI's cache resets if you change the model or temperature; local Ollama has no cache. Account for provider differences in your cost model.

**Prompt-caching TTL mismatches.** Anthropic caches for 5 minutes. If you're running a batch job every 2 minutes, you lose cache hits on the 6th request. Batch size matters.

**Ignoring retry cost.** A cheaper model that requires 3 retries costs more than an expensive model that gets it right the first time. Track accuracy (retry rate) alongside cost.

## Related

- [`patterns/multi-model-routing.md`](./multi-model-routing.md) — task-based routing without cost focus
- [`patterns/prompting-discipline.md`](./prompting-discipline.md) — prompt structure that reduces iterations
- [`standards/session-budget.md`](../standards/session-budget.md) — cost governance for long-running sessions
