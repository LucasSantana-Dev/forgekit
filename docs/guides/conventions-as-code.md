---
status: draft
audience: all
primitive: rule
---

# Conventions as Code

**Rules as Git-tracked, vendor-agnostic instruction files**

Your coding standards, testing gates, security policies—all in one file that loads automatically.

---

## What's a Rule?

A **rule** is a Markdown file that lives in your project root (`rules/CLAUDE.md`, `rules/COPILOT.md`, etc.) and is **always loaded** by the AI tool at session start.

Rule files contain:
- Coding standards (naming, style, patterns)
- Testing expectations (coverage gates, test kinds)
- Security boundaries (secrets handling, audit requirements)
- Workflow gates (commit hygiene, review process)
- Delivery guardrails (version bumping, changelog updates)

**Once written, reusable forever.** No "repeat the standard every session."

---

## The Tool-Overlay Model

Rules are **vendor-neutral at the core**, with vendor-specific overlays:

```
rules/
├── TEMPLATE.md          ← Universal best practices
├── CLAUDE.md            ← Claude Code / Codex specifics
├── COPILOT.md           ← GitHub Copilot specifics
├── GEMINI.md            ← Gemini CLI specifics
└── AGENTS.md            ← Multi-agent orchestration (vendor-neutral)
```

You:
1. Copy the matching file into your project root.
2. Customize the standards section for your codebase.
3. Tool loads it automatically every session.

**Result**: Same standards enforced across Claude, Copilot, Gemini, Cursor, etc.

---

## Rule Anatomy

Typical sections:

```markdown
# Project Rules

## Identity
Who the AI is: "You are a backend specialist..."

## Coding Standards
- TypeScript, functional components, strict null checks
- No classes, no mutable state
- Const-first immutability

## Testing
- Every feature needs a unit test
- Coverage gates: ≥80% for new code
- Types: unit, integration, E2E per component

## Security
- No secrets in Git
- Environment variables in `.env.example`
- Audit-log every write to the database

## Workflow
- Trunk-based, feature branches off `main`
- PR requires 2 approvals before merge
- Commit message: `type(scope): description`

## Delivery
- Before merge: lint, typecheck, test pass
- Version bump: semantic versioning
- Changelog: one entry per PR
```

---

## Sliced Standards

Private rules go in `~/.claude/standards/` (user's machine, not Git):

```bash
~/.claude/standards/
├── security.md       ← Private: API keys, credentials
├── compliance.md     ← Private: company audit rules
└── performance.md    ← Private: org-specific thresholds
```

Git-tracked rules include a line:
```markdown
## Compliance
Also load `~/.claude/standards/compliance.md` for work-specific governance.
```

**Benefit**: Public repo stays governance-safe; private rules stay secret.

---

## Related

- **Tool support**: See [Tool Matrix](./tool-matrix.md) for which tools support custom rules.
- **Governance at scale**: [Governance](./governance.md)

---

See [AI_ASSISTED_DEVELOPMENT_SUMMARY.md](../AI_ASSISTED_DEVELOPMENT_SUMMARY.md) for the full `rules/` directory.
