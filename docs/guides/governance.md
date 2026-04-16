---
status: draft
audience: team
---

# Governance: Compliance & Data Safety

Single link for work adoption. Q&A format for security / compliance teams.

---

## Data & Privacy

**Q: Does the toolkit send data to external servers?**  
A: No. All indexing, skills, and agent logic run on your machine. RAG index is local SQLite.

**Q: What about the AI tool itself (Claude, Copilot, etc.)?**  
A: The toolkit is vendor-neutral. Your choice of AI tool determines data flow (e.g., Copilot may send to Microsoft; Claude to Anthropic). The toolkit itself is zero-phone-home.

**Q: Can I audit what gets indexed?**  
A: Yes. See `kit/rag/scripts/reindex.sh` for indexing logic. Exclude patterns: `.env`, `*.pem`, `node_modules/`, secrets paths. Customize in `~/.claude/rag-index/config.json`.

---

## Secrets & Credentials

**Q: Can the AI tool see my `.env` file?**  
A: Only if you paste it into a prompt. The RAG index explicitly excludes `.env`, `.pem`, and credential files by default.

**Q: What if I want stricter secret isolation?**  
A: Use sliced standards. Private rules live in `~/.claude/standards/security.md` (not versioned). Reference them from public rules via include directive.

**Q: Does this work with credential managers?**  
A: Yes. Use environment variables instead of files. The toolkit avoids reading secrets; you control what context you paste.

---

## Dependencies & Supply Chain

**Q: How do you vet skills and agents?**  
A: Skills are **code-reviewed before landing**. Each PR requires reviewer sign-off. No auto-merge of tooling changes.

**Q: What if a skill has a security issue?**  
A: Deprecated skills are marked `status: deprecated` in frontmatter. Newer versions are highlighted in search. See `kit/core/skills/*/skill.md` metadata.

**Q: Can I fork and customize skills for my team?**  
A: Yes. Skills are MIT-licensed. Copy into your private repo, customize, commit. The RAG index can index your local skills too (see setup docs).

---

## Audit & Compliance

**Q: Does this generate audit logs?**  
A: The toolkit doesn't. Your AI tool does (Copilot, Claude logs API calls; Gemini has audit trails). Pair with specs (`docs/specs/`) to create a **decision audit trail** (what changed, why, who approved).

**Q: Can I enforce which skills are allowed?**  
A: Yes. In your rule file, add a `## Permitted Skills` section listing allowed activation phrases. The AI tool will enforce it.

**Q: How do I prove compliance at an audit?**  
A: Share:
1. `rules/` file(s) — your standards as code
2. `docs/specs/` folder — decisions and approvals
3. `docs/roadmap.md` — auto-generated from specs
4. Git history — commits with linked issues/PRs

---

## Dual-Branch vs Chezmoi

**Q: Why do you use `main` vs `personal` branches instead of chezmoi?**  
A: Both approaches work. Chezmoi templates are standard in the open-source ecosystem (used by `wshobson/agents`, others). We chose dual-branch for:
- Simpler for single-maintainer repos
- Explicit visibility (diff shows what's added for personal use)
- No template syntax overhead

**If your team prefers chezmoi**: Migrate by converting rule sections to `chezmoi:role="personal"` conditionals. Open an issue if you'd like a migration script.

---

## Governance Checklist

Before adopting in your team:

- [ ] Rule file copied and customized for your codebase
- [ ] No secrets in rule file or specs
- [ ] `.env.example` in place (no real values)
- [ ] Sliced standards setup for private governance
- [ ] RAG index reindex hook running (weekly via cron or CI)
- [ ] Spec template created (`docs/specs/TEMPLATE.md`)
- [ ] CI green on markdown-links and lint
- [ ] At least one team member tested `/recall` and `/plan`
- [ ] Security team reviewed rule file and data-flow diagram
- [ ] Handoff / session management documented (see `patterns/session-management.md`)

---

## More Help

- **Data flow diagram**: See `patterns/multi-repo-work.md`
- **Private rules setup**: `~/.claude/standards/` folder structure
- **MCP health checks**: `kit/core/skills/mcp-health.md`
- **Secrets scanning**: `kit/core/skills/secure.md`

---

Share this doc at work. It answers the most common governance questions.
