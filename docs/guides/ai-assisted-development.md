---
status: draft
audience: all
primitive: mixed
---

# AI-Assisted Development (AAD)

**Context + Standards + Gates = Repeatable Quality**

The AAD pillar ensures every AI response respects your project's norms before the first word is written.

---

## Three Layers

### 1. Context Layer
What the AI tool *knows* before you ask.

- **Rules file** (`rules/CLAUDE.md`): Load-time config. Coding standards, testing expectations, security boundaries.
- **Best practices** (`best-practices/`): Checklists. Branching, commits, code review gates.
- **Patterns** (`patterns/`): Handbook. Multi-model routing, session management, memory systems, git workflows.

**Benefit**: No "remind me of the standard every session" overhead.

### 2. Standards Layer
What gets enforced *during* development.

- **Linting**: Pre-commit hooks catch style issues.
- **Testing**: Every PR requires test coverage.
- **Type checking**: TypeScript / mypy / go vet before merge.
- **Security scanning**: Sliced standards keep secrets out of the index.

**Benefit**: Fewer review cycles; gating is declarative, not tribal knowledge.

### 3. Gates Layer
What must pass *before* merge.

- **CI checks**: Lint ✓ type ✓ test ✓
- **Code review**: Human or AI-assisted (via agent).
- **Spec attachment**: Every feature has a decision record.

**Benefit**: Audit trail; no "I thought it was done" surprises.

---

## Workflow

1. **Setup** (5 min): Copy `rules/` file. Customize coding standards.
2. **Enable skills** (10 min): `/recall`, `/plan`, `/dispatch` on sprints.
3. **Iterate**: AI respects your standards in every response.
4. **Gate**: CI catches issues before human review.
5. **Record**: Spec `docs/specs/` folder feeds the roadmap.

---

## Related

- **Rules** in detail: [Conventions as Code](./conventions-as-code.md)
- **Skills** that support AAD: See `kit/core/skills/plan.md`, `kit/core/skills/review.md`
- **Governance** for teams: [Governance](./governance.md)

---

For full context, see [AI_ASSISTED_DEVELOPMENT_SUMMARY.md](../AI_ASSISTED_DEVELOPMENT_SUMMARY.md).
