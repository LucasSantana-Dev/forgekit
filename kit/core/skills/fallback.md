---
name: fallback
description: Handle model and provider failures with automatic fallback chains
triggers:
  - fallback
  - model failed
  - provider down
  - rate limited
  - switch model
  - retry with different model
---

# Fallback

When a model or provider fails, follow the fallback chain instead of stopping.

## Failure Types

| Type | Detection | Action |
|---|---|---|
| Rate limit | 429 / "rate limited" | Wait and retry, then fallback |
| Auth failure | 401 / 403 | Switch provider immediately |
| Model unavailable | 404 / "model not found" | Switch to fallback model |
| Timeout | No response in 60s | Retry once, then fallback |
| Context overflow | "context too long" | Compact context (use context skill), retry |
| Output quality | Broken/empty output | Escalate to next tier |

## Fallback Chain

```text
1. Retry same model (handles transient errors)
2. Switch to fallback model at same tier
3. Switch to fallback provider at same tier
4. Escalate to next tier with primary provider
5. Escalate to next tier with fallback provider
6. STOP — report failure with full chain attempted
```

## Provider Priority

Read from `.forge-setup.json` or `routing.json`:

```text
Primary: <user-selected provider>
Fallback: <user-selected fallback>
Local: ollama (if enabled)
```

## Rules

- Never silently degrade — always log which model/provider is active
- Rate limits: exponential backoff (1s → 2s → 4s → 8s → stop)
- Auth failures skip retry — switch provider immediately
- Context overflow triggers compaction before retry
- Track total cost/tokens per session for awareness
- After fallback activates, continue on fallback — do not switch back mid-task

## Output on Fallback

```text
⚠ Fallback activated
  Reason: <rate limit | auth | unavailable | timeout | overflow | quality>
  From: <provider/model>
  To: <provider/model>
  Attempt: N/5
```
