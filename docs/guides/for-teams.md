---
status: draft
audience: team
---

# For Teams: Adoption, Governance & Compliance

Pitch this to your team: productivity gains, quality gates, and compliance clarity in one toolkit.

## The Three Pillars

### 1. Productivity — AI-Assisted Development (AAD)
Codify your standards once; AI respects them in every session.

- **Context**: Rules files load automatically. No "remind me of the coding standard" every session.
- **Standards**: Linting, testing, security gates baked into the rule file.
- **Gates**: Every commit passes: lint ✓ test ✓ type-check ✓ before merge.

**Time saved**: 30–60 min/week per dev (fewer "just write it again" loops).

See [AI-Assisted Development](./ai-assisted-development.md).

### 2. Quality — Agent-Driven Development (ADD)
Route complex tasks to the right tool, not the right chat prompt.

- **Agents**: Persona-based (code-reviewer, security-auditor, systematic-debugger).
- **Skills**: Verb-named tasks (plan, dispatch, recall, route).
- **Auto-invoke**: Agent picks the right skill; you just state the problem.

**Result**: Fewer hallucinations, deeper reasoning, audit trails.

See [Agent-Driven Development](./agent-driven-development.md).

### 3. Governance — Conventions as Code
Compliance questions have single-link answers. No hand-waving.

- **Data**: Rules live in Git, versioned, reviewed like code.
- **Secrets**: Sliced standards keep sensitive config separate (`.claude/standards/security.md` is private).
- **Audit**: Specs auto-generate roadmap; decision log is searchable.
- **Deps**: Hook system validates tool versions and flags deprecated patterns.

**For your security team**: See [Governance](./governance.md) Q&A and compliance checklist.

---

## Adoption Path

### Week 1: Baseline (4 hours)
1. Copy `rules/CLAUDE.md` (or COPILOT.md / GEMINI.md for your tools) into root.
2. Run `install-rag.sh` in one shell.
3. Team tries `/recall "feature X"` on one sprint task.

### Week 2-3: Skill Expansion (8 hours)
- Enable `/plan` for refactors.
- Enable `/dispatch` for parallel code review.
- Author team-specific patterns in `patterns/team-X.md`.

### Week 4+: Governance (ongoing, ≤2 hours setup)
- Add `--with-hooks` for optional CI gates.
- Set up spec template in `docs/specs/TEMPLATE.md`.
- Integrate roadmap into sprint planning (pull from auto-generated `docs/roadmap.md`).

---

## Compliance Q&A

**Q: Does this phone home?**  
A: No. RAG index is local SQLite. MCP server runs on localhost:7429. All data stays on-disk.

**Q: Can I restrict skills?**  
A: Yes. In `rules/CLAUDE.md`, add `## Permitted Skills` section. AI tool will enforce it.

**Q: What about secrets in the index?**  
A: Index never contains `.env` or credential files. RAG excludes sensitive paths by default. `sliced-standards` keep secrets in a separate, private rules file.

**Q: Does this require vendor lock-in?**  
A: No. Rules work on Claude Code, Codex, Copilot, Cursor, Gemini, Antigravity. Export the skill catalog anytime.

**Q: What's the cost?**  
A: Zero for the toolkit. Cost comes from your AI tool subscriptions. Skills don't add API calls; they structure your existing calls better.

---

See [Governance](./governance.md) for the full compliance checklist.
