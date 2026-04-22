---
id: streaming-orchestration
title: Streaming Orchestration
description: You send a prompt and wait. You don't know if the agent is stuck, hallucinating,
  or burning through tokens on the wrong task. When something goes wrong, you can't
  tell where. Budget overruns happen silently.
tags:
- skill-md
- claude
- mcp
- prompting
- testing
- agents
source:
  path: ai-dev-toolkit/patterns/streaming-orchestration.md
  license: MIT
translations:
  pt-BR:
    title: Orquestração de Streaming
    description: Você envia um prompt e espera. Não sabe se o agente travou, alucinou
      ou está progredindo. Streaming de progresso conserta isso.
---
> Event-driven turn loops let you observe and control agent execution in real time.

## The Problem

You send a prompt and wait. You don't know if the agent is stuck, hallucinating, or burning through tokens on the wrong task. When something goes wrong, you can't tell where. Budget overruns happen silently.

## The Pattern

Replace fire-and-wait with a **typed event stream**. Every meaningful state transition emits a structured event. Your harness consumes events, enforces budgets, compacts history, and halts cleanly when limits are hit.

### Turn Event Types

```
message_start       → agent received the prompt, turn begins
command_match       → agent identified a slash command to run
tool_match          → agent identified a tool call
permission_denial   → a tool call was blocked by permission context
message_delta       → streaming text output chunk
message_stop        → turn complete, reason included
```

Handle only what you need. Ignore the rest.

### Minimal Turn Loop

```python
def run_turn(session, prompt):
    for event in session.stream_submit_message(prompt):
        match event["type"]:
            case "tool_match":
                if session.permissions.blocks(event["name"]):
                    log_denial(event)
                    continue
                dispatch_tool(event)
            case "message_delta":
                print(event["text"], end="", flush=True)
            case "message_stop":
                session.record_turn(event)
                return event["stop_reason"]
```

### Turn Budgeting

Set hard limits before the turn starts. Check them after each event. Stop cleanly rather than letting the model run indefinitely.

```python
@dataclass
class TurnBudget:
    max_turns: int = 10
    max_input_tokens: int = 50_000
    max_output_tokens: int = 20_000

    def exhausted(self, usage: TokenUsage) -> bool:
        return (
            usage.turns >= self.max_turns
            or usage.input_tokens >= self.max_input_tokens
            or usage.output_tokens >= self.max_output_tokens
        )
```

When the budget is exhausted, emit a synthetic `message_stop` with `stop_reason: budget_exceeded` before cutting the loop.

### Transcript Compaction

Long sessions degrade model performance and hit context limits. Compact proactively.

**Trigger**: When accumulated input tokens exceed a threshold (e.g., 70% of context window).

**Strategy**:
1. Preserve the system prompt and the last N turns verbatim.
2. Summarize older turns into a single `[Compacted: N turns]` assistant message.
3. Continue with the compacted transcript — the model sees the summary, not raw history.

```python
COMPACTION_THRESHOLD = 0.70  # fraction of max context

def maybe_compact(session):
    ratio = session.usage.input_tokens / session.max_context_tokens
    if ratio >= COMPACTION_THRESHOLD:
        summary = summarize_turns(session.history[:-KEEP_LAST_N])
        session.history = [session.system_prompt, summary] + session.history[-KEEP_LAST_N:]
        session.usage.reset_input_tokens()
```

### Session Persistence

Persist turn results to disk so sessions can resume after interruption.

```json
{
  "session_id": "abc123",
  "created_at": "2026-03-31T10:00:00Z",
  "turns": [
    {
      "turn": 1,
      "prompt": "...",
      "stop_reason": "end_turn",
      "input_tokens": 1200,
      "output_tokens": 340,
      "tool_calls": ["read_file", "write_file"],
      "permission_denials": []
    }
  ]
}
```

Store sessions in `.sessions/{session_id}.json`. Load by ID for resumption.

### Stop Reasons to Handle

| Reason | Meaning | Action |
|--------|---------|--------|
| `end_turn` | Model finished naturally | Mark turn complete |
| `max_tokens` | Output token limit hit | Compact history, retry |
| `budget_exceeded` | Your turn budget triggered | Surface to user |
| `permission_denial` | All tool calls blocked | Expand permissions or abort |
| `error` | Model or infrastructure error | Retry with backoff |

## Tool-Specific Notes

### Claude Code

Claude Code handles streaming internally. Use hooks (`PostToolUse`, `Stop`) to observe turn events rather than reimplementing the loop. The `stop_hook_active` field in `Stop` events tells you if a stop hook is running.

### Custom Harnesses (Python/TypeScript)

Use the event loop above directly. The Anthropic SDK exposes `stream()` on `client.messages` which yields typed events matching this pattern.

### MCP Servers

MCP tool calls are synchronous from the model's perspective. Wrap async MCP calls to resolve before the next event is emitted — don't yield `tool_match` without a `tool_result` following it in the same turn.

## When to Use This Pattern

- Building a custom agent harness outside of Claude Code
- Long-running autonomous agents where budget control matters
- Any workflow where you need real-time visibility into tool dispatch and token usage
- Testing and replay: persist event streams, replay for regression verification
