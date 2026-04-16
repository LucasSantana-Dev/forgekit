---
status: draft
audience: technical
---

# Tool Matrix: Skills × Tools × Primitives

Which skills work with which AI tools? What primitives does each tool support?

---

## Primitive Support by Tool

| Tool | Rules | Skills | Agents | Hooks | Notes |
|------|-------|--------|--------|-------|-------|
| Claude Code | ✓ (CLAUDE.md) | ✓ | ✓ (via agents.json) | ✓ (post-edit hooks) | Full support |
| Codex CLI | ✓ (AGENTS.md) | ✓ | ✓ (agents.json) | ✗ | No edit-moment hooks |
| GitHub Copilot | ✓ (COPILOT.md) | Partial | ✗ (future) | ✗ | Skills via prompting only |
| Cursor | ✓ (CLAUDE.md) | ✓ | ✗ (not yet) | ✗ | Uses Claude rules |
| Gemini CLI | ✓ (GEMINI.md) | ✓ | ✗ (not yet) | ✗ | Partial multi-agent support |
| Antigravity | ✓ (ANTIGRAVITY.md) | ✓ | ✗ | ✗ | SSH-gated tool; custom rules |

---

## Representative Skills & Coverage

| Skill | Category | Claude Code | Codex | Copilot | Cursor | Gemini | Notes |
|-------|----------|-------------|-------|---------|--------|--------|-------|
| **plan.md** | Planning | ✓ | ✓ | ✓ | ✓ | ✓ | Works everywhere; text-based |
| **recall.md** | Context | ✓ | ✓ | ✓ | ✓ | ✓ | RAG-driven; portable |
| **dispatch.md** | Orchestration | ✓ | ✓ | ✗ | ✗ | Partial | Needs multi-agent support |
| **review.md** | Quality | ✓ | ✓ | ✓ | ✓ | ✓ | Core skill, well-supported |
| **route.md** | Orchestration | ✓ | ✓ | ✗ | ✗ | Partial | Decision trees; Copilot uses fallback |
| **auto-invoke.md** | Meta | ✓ | ✓ | ✗ | ✗ | ✗ | Requires harness-level integration |
| **eval.md** | Quality | ✓ | ✓ | ✓ | ✓ | ✓ | Benchmarking; text-based |
| **context.md** | Context | ✓ | ✓ | ✓ | ✓ | ✓ | File assembly; portable |
| **memory.md** | State | ✓ | ✓ | Partial | Partial | Partial | Session-level recall |
| **multi-agent.md** | Patterns | ✓ | ✓ | ✗ | ✗ | Partial | Advanced routing patterns |
| **mcp-patterns.md** | Architecture | ✓ | ✓ | ✓ | ✓ | ✓ | MCP server design; reference |
| **schedule.md** | Automation | ✓ | ✓ | ✗ | ✗ | Partial | Cron-based triggers |
| **debug.md** | Debugging | ✓ | ✓ | ✓ | ✓ | ✓ | Error diagnosis; portable |
| **root-cause-debug.md** | Debugging | ✓ | ✓ | ✓ | ✓ | ✓ | Deep reasoning; supported |
| **secure.md** | Security | ✓ | ✓ | ✓ | ✓ | ✓ | Secret-safety checks; portable |
| **cost.md** | Operations | ✓ | ✓ | ✓ | ✓ | ✓ | Token / cost analysis; reference |
| **learn.md** | Reflection | ✓ | ✓ | ✗ | ✗ | Partial | Session-learning; requires MCP |
| **fallback.md** | Error handling | ✓ | ✓ | Partial | ✗ | Partial | Graceful degradation patterns |

---

## How to Read This

- **✓**: Skill works natively with that tool (call via activation phrase or agent).
- **Partial**: Skill works with limitations (e.g., no multi-agent dispatch on Copilot).
- **✗**: Skill doesn't work or not yet integrated.

**Portable skills** (plan, recall, review, debug, eval, context, secure, cost) work on all tools. **Agent-heavy skills** (dispatch, route, auto-invoke) need Claude Code or Codex.

---

## Migration Path

If you're on **Copilot**, start with:
- `rules/COPILOT.md`
- Skills: plan, recall, review, eval, context, debug

Migrate to **Claude Code** for full agent support.

---

## Adding New Skills

New skills should:
1. Document their tool compatibility in frontmatter (`tools: [claude-code, codex, copilot]`)
2. Avoid agent-only patterns (use text-based reasoning instead)
3. Link from this matrix once shipped

See `kit/core/skills/` directory for examples.
