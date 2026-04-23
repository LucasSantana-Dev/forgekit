> **Tradução pendente** — conteúdo em inglês, aguardando tradução para pt-BR. Contribute to [ai-dev-toolkit-pt-br](https://github.com/LucasSantana-Dev/ai-dev-toolkit-pt-br/issues).

# MCP Tool Lazy-Loading

Eager loading of MCP tool schemas burns context. Claude Code manages 50+ MCP tools across Anthropic plugins, GitHub, Vercel, and custom integrations. Loading all schemas upfront (even filtered to `name` and `description`) consumes 15-25K tokens. For agentic flows with 1-5 target tools per request, lazy schema retrieval trades context efficiency for discovery latency.

> _Pattern informed by Claude Code's ToolSearch implementation, which queries MCP registries by keyword and retrieves only matched tool schemas on demand._

## When to lazy-load

**Lazy-load required**: You integrate 30+ MCP tools or tool instances across multiple servers. The union of all schemas exceeds your context budget.

**Eager-load is fine**: You have <10 tools total, or context budget is unconstrained.

**Hybrid**: Eager-load tool metadata (name + 1-line description), lazy-load full schemas + parameter details.

Empirically, agentic loops that lazy-load save 40-60% context vs. eager all-in-one approach, at the cost of ~500ms per ToolSearch query.

## Schema overload: the problem

```python
# Eager loading: all schemas loaded upfront
mcp_tools = [
  {"name": "web_search", "schema": {...1200 tokens...}},
  {"name": "calculator", "schema": {...800 tokens...}},
  # ... 48 more tools
]
# Total: ~50K tokens, 5% of a 1M-token context window alone
```

Worse: if you're doing few-shot examples (CoT, chain-of-thought) or multi-turn agentic loops, you're re-sending these schemas every turn. Cumulative waste grows fast.

## Lazy-loading approach

1. **Load tool registry metadata only**: name, one-line description, tags.
   ```json
   {"name": "web_search", "description": "Search the web", "tags": ["search", "web"]}
   ```

2. **User query arrives.** Embed it or use keyword matching to find relevant tool(s).
   ```
   User: "What's the latest Claude model?"
   → Keywords: ["latest", "Claude", "model", "LLM"]
   → Matched tools: [web_search, github_search]
   ```

3. **Retrieve only matched tool schemas.**
   ```python
   # Only web_search and github_search schemas sent to LLM (~2K tokens)
   selected_tools = ["web_search", "github_search"]
   full_schemas = mcp_client.get_tool_schemas(tool_names=selected_tools)
   ```

4. **LLM calls the tool.** Tool execution provides results.

### Keyword/semantic matching

Use simple keyword overlap or lightweight embedding:

```python
def match_tools(query: str, tool_registry: list[dict], top_k: int = 5) -> list[str]:
    """Match query to tools by keyword or embedding."""
    query_words = set(query.lower().split())
    
    scores = []
    for tool in tool_registry:
        tool_words = set(tool["description"].lower().split())
        # Jaccard similarity: intersection / union
        overlap = len(query_words & tool_words)
        union = len(query_words | tool_words)
        score = overlap / union if union > 0 else 0
        scores.append((tool["name"], score))
    
    # Sort by score, return top_k
    return [name for name, score in sorted(scores, key=lambda x: -x[1])[:top_k]]
```

### Query syntax for multi-tool selection

Offer users syntax to explicitly select tools:

```
"Search for Claude Opus news" 
  (system selects tools automatically)

"@web_search,@github_search for Claude Opus news"
  (user explicit; no matching needed)

"@web_search(max_results=3) OR @github_search"
  (explicit + parameters)
```

Parse and respect explicit tool selections to avoid "wrong tools" errors.

## Trade-offs

**Pros**:
- 40-60% context savings vs. eager-load.
- Scales to 100+ tools without bloating context.
- Encourages precise tool selection (fewer hallucinated tool calls).

**Cons**:
- Matching latency: 100-500ms per query (embedding + retrieval).
- Cold starts: First query pays full discovery cost; cached registry helps.
- Discovery gaps: Keyword matching misses tools for unfamiliar tasks.

**Mitigation**:
- Cache the tool registry locally for 1 hour.
- If match confidence < 0.6, offer the user top 3 options: "Did you mean tool X, Y, or Z?"
- Maintain an FAQ or tag system: tag web_search as ["web", "search", "information", "current-events"].

## Hybrid strategy: metadata + lazy schemas

Load all tool metadata upfront (~2-5K tokens for 50 tools):

```json
[
  {"name": "web_search", "description": "Search the web", "provider": "tavily", "tags": ["search"]},
  {"name": "github_search", "description": "Search GitHub repos", "provider": "github", "tags": ["code"]},
  // ...
]
```

User query → filter to relevant tools (name + description match) → retrieve only filtered tool schemas.

This balances discovery UX (no explicit `@tool` needed) against context efficiency.

## Integration checklist

- [ ] Build a lightweight tool registry (name, description, tags, provider).
- [ ] Implement keyword/semantic matching function.
- [ ] Retrieve full schemas only for matched tools.
- [ ] Handle edge case: no tools match → offer fallback or ask for clarification.
- [ ] Cache registry and matched schemas for 5-60 min.
- [ ] Log which tools were selected per request for observability.
- [ ] Document the tool selection heuristic for users.

## Anti-patterns

- **Hardcoding tool names in prompts** — "Always use web_search first" breaks when tools change. Use registry queries instead.
- **Matching on tool name only** — "calc" won't match a tool named "calculator". Use descriptions and tags.
- **Loading all schemas, then filtering in the LLM** — defeats the purpose; the LLM still consumes all schemas.
- **Never updating the registry** — if tools change, user experience degrades silently. Refresh registry daily or on-demand.

## Related

- [`patterns/agent-sandboxing.md`](./agent-sandboxing.md) — Constraining agent tool access
- [`patterns/permission-boundaries.md`](./permission-boundaries.md) — Fine-grained tool permissions
- [MCP Specification](https://modelcontextprotocol.io/introduction) — Tool schema format and discovery

Tags: `[mcp, context, tool-design, optimization, agentic]`
