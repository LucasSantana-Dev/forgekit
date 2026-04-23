---
id: reasoning-model-prompting
title: Reasoning-Model Prompting
description: 'Reasoning models (Claude Opus 4 with extended thinking, o3/o3-mini)
  operate at a different cost and latency boundary than standard models. They trade
  2-10x latency and 3-5x token cost for dramatically higher first-pass quality on
  hard problems. This requires a different prompting discipline: less scaffolding,
  more constraints, explicit reasoning budgets.'
tags:
- skill-md
- claude
- prompting
- testing
- security
source:
  path: ai-dev-toolkit/packages/core/patterns/reasoning-model-prompting.md
  license: MIT
translations:
  pt-BR:
    title: Prompting de Modelos de Reasoning
    description: Modelos de reasoning (Claude Opus 4 com extended thinking, o3/o3-mini)
      operam em um regime diferente. Este guia detalha o que muda no prompt engineering.
---
> Extended-thinking models have different token economics and cognitive patterns. Let them think.

Reasoning models (Claude Opus 4 with extended thinking, o3/o3-mini) operate at a different cost and latency boundary than standard models. They trade 2-10x latency and 3-5x token cost for dramatically higher first-pass quality on hard problems. This requires a different prompting discipline: less scaffolding, more constraints, explicit reasoning budgets.

## Core Principle: Don't Force Chain-of-Thought

**Anti-pattern:**
```
User: Find the bug in this code. Think step by step:
1. First, list the function signature
2. Then, check for off-by-one errors
3. Finally, test with edge cases
```

**Why it fails:** Reasoning models already think in steps internally. Forcing them to output your prescribed steps wastes tokens (your format) and prevents them from thinking in ways that work for them.

**Better pattern:**
```
User: Find the bug in this code. Focus on edge cases and off-by-one errors.
```

Let the model's internal reasoning find the right breakdown. Enable extended thinking (`reasoning_effort: "high"` or `thinking` mode), and it will explore multiple paths internally, then output a concise answer.

## The Reasoning Budget Knob

Reasoning models expose a cost/quality tradeoff as an explicit parameter:

| Parameter | Cost | Latency | Use Case |
|-----------|------|---------|----------|
| `reasoning_effort: "low"` | 1x base cost | 2-3 sec | "Double-check my math" |
| `reasoning_effort: "medium"` | 3x base cost | 4-8 sec | "Find the subtle bug" |
| `reasoning_effort: "high"` | 5x+ base cost | 8-30 sec | "Prove this is correct" or "Redesign this system" |

**When to allocate:** Don't enable high reasoning by default. Allocate reasoning effort proportional to task difficulty and cost-of-failure:

- **Bug fix?** Medium (high effort wastes time on obvious bugs; low effort misses edge cases).
- **Security review?** High (cost of missing a vulnerability >> cost of 30-second wait).
- **Quick explanation?** Low (or skip reasoning entirely, use standard model).
- **Architecture decision?** High (reasoning output is your spec; revisit it many times).

## Tool Use During Reasoning

Claude Opus 4 and o3 can invoke tools (read files, run tests, query databases) during the thinking phase, not just after. This is powerful and distinct from sequential reasoning:

**Sequential (old way):**
```
Model thinks: "I need to check function signatures"
Model outputs: "Let me read util.ts"
Tool execution: Read util.ts
Model thinks again with new info
Model outputs answer
```
Cost: 2 round-trips, 2x latency.

**Integrated (reasoning models):**
```
Model's thinking phase:
  - "I need to check function signatures"
  - (calls read util.ts)
  - "Aha, the return type is wrong"
  - (calls run tests to confirm)
  - "Test fails at line 42"
  - (concludes)
Model output: Answer (with reasoning hidden or summarized)
```
Cost: 1 round-trip, 50% latency, same token cost but better quality.

Enable tool use in reasoning: set `budgetTokens` or `maxThinkingTokens` to allow the model to explore, then set your tool timeout high enough to not interrupt mid-thought.

## Prompt Style: Raw Task + Constraints

Reasoning models prefer minimalist prompts. Verbose scaffolding (e.g., "You are an expert architect") doesn't help; it fills tokens that could be reasoning.

**Verbose (wastes tokens on a reasoning model):**
```
You are a world-class security auditor with 20 years of experience.
Your task is to review this code for vulnerabilities.
Consider OWASP Top 10, injection attacks, and race conditions.
Output a detailed report with:
  - Severity level (critical/high/medium/low)
  - Location
  - Remediation steps
Think carefully.
```

**Concise (reasoning model preference):**
```
Security audit: check for OWASP Top 10, injection, race conditions.
Output: JSON {"issues": [{"severity": "high|medium|low", "location": "...", "fix": "..."}]}
```

The model's reasoning will handle the "what a good security audit looks like" without prompting. You just need the task + output format.

## Cost vs Latency vs Quality Tradeoff Matrix

| Scenario | Standard (Sonnet) | Reasoning (Opus) | Winner |
|----------|------------------|------------------|--------|
| **5-minute sprint refactor** | 1 sec, $0.01, 80% quality | 15 sec, $0.15, 95% quality | Sonnet (cost matters more) |
| **Shipping a new security rule** | 30 min of iteration, $0.50 total | 20 sec, $0.15, 99% quality | Opus (one-shot certainty) |
| **Root-causing a P1 bug** | 8 iterations, $0.40 | 1 attempt, $0.20 | Opus (time matters, cost < value) |
| **Explaining an algorithm** | 5 sec, $0.01, clear | 12 sec, $0.12, very clear | Sonnet (good enough, cheaper) |

**Heuristic:** Reasoning pays for itself when iteration count would exceed 2-3 standard model calls, or when first-pass correctness is critical (security, financial, multi-system impact).

## When NOT to Use Reasoning

- **Mechanical tasks:** formatting, renaming, moving files (Haiku is fine).
- **Fixed-schema extraction:** "Extract dates from this document" (structured output on Sonnet is sufficient).
- **Classification with clear rubric:** "Is this feedback positive or negative?" (Haiku with few-shot examples works).
- **Summarization:** "Summarize this article in 3 bullets" (Sonnet is fine; reasoning adds latency with no quality boost).

When in doubt, ask: "Would a human expert need to think hard about this?" If no, skip reasoning.

## Handling Reasoning Output

Reasoning models emit two parts:

1. **Thinking** (sometimes hidden from user): Internal exploration, dead ends, uncertainty.
2. **Response**: Final answer, formatted per your request.

In APIs that expose thinking:

```json
{
  "thinking": "Let me consider approach A... no, that has a race condition. Try B... yes, that works because...",
  "response": "Use approach B because of the race condition issue."
}
```

Use the thinking output for:
- **Debugging model behavior:** "Why did it choose that approach?" (check thinking).
- **Generating explanations:** Extract key steps from thinking for documentation.
- **Quality assessment:** Longer thinking ≈ harder problem ≈ higher confidence in answer.

Don't expose raw thinking to end users (it's verbose and includes dead ends).

## Prompt Caching + Reasoning

If you're reusing the same context repeatedly (code review guidelines, security checklist, test data), cache it:

```
System: [CACHED: 1000 tokens] "You are a security auditor. Check against these 20 rules: ..."
User: [UNCACHED: 100 tokens] "Audit this specific code snippet: ..."
Reasoning: [UNCACHED: 5000 tokens] Model thinks through the snippet
Response: [UNCACHED: 200 tokens] Final audit
```

Savings: The cached 1000-token preamble is reused 50x per day, saving ~$0.015/day per user = $5/year per user for stable, reusable guidance.

Reasoning models benefit from cached context because they can reason over it without re-reading it.

## Pitfalls

**Reasoning latency masks cost.** A model thinking for 20 seconds feels "worth the cost" even though you're spending 5x tokens. Set a latency budget and stick to it. If reasoning exceeds your budget (e.g., max 10 sec for customer-facing API), fall back to standard model.

**Tool-calling mid-reasoning can loop.** If the model calls a tool and gets an error mid-thinking, it may loop trying variations. Set `max_tokens` on the thinking budget to avoid runaway costs.

**Thinking token cost varies by provider.** Anthropic reasoning tokens cost the same as output tokens (reasonable). o3 reasoning tokens are extremely expensive. Always check your provider's cost model before enabling high reasoning.

**Overconfidence from reasoning.** A reasoning model outputs with high certainty, and you trust it. But reasoning ≠ correctness. Always validate critical outputs (security rules, financial calculations) with a second pass or external test.

## Related

- [`packages/core/patterns/cost-aware-routing.md`](./cost-aware-routing.md) — when to escalate to reasoning models
- [`packages/core/patterns/prompting-discipline.md`](./prompting-discipline.md) — general prompt structure that works across models
- [`packages/core/patterns/multi-model-routing.md`](./multi-model-routing.md) — task-based routing before you optimize for reasoning
