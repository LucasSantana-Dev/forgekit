---
name: bilingual-readme-sync
description: Keep EN/PT README.md pairs in parity across a repo (and across twin repos like ai-dev-toolkit + ai-dev-toolkit-pt-br).
triggers:
  - "readme parity"
  - "sync readme translation"
  - "mirror pt-br readme"
  - "update README.pt-BR"
---

# bilingual-readme-sync

Keep `README.md` and `README.pt-BR.md` structurally aligned in any repo that uses the 2-file bilingual pattern.

## When to run

- After any edit to `README.md` in a repo that has a `README.pt-BR.md` sibling.
- After any edit to the canonical EN README in a repo pair (e.g. `ai-dev-toolkit` → mirror into `ai-dev-toolkit-pt-br`).
- Before release cuts, to guarantee the PT reader sees the same content the EN reader does.

## Invariants

1. **Line-count parity** (±5%). A stub PT file next to a 300-line EN file is the trigger to ship a full translation.
2. **Structural parity**: same number of H1/H2/H3 headings, same table rows, same code blocks in the same order.
3. **Language-switch header** as line 1: `[English](README.md) | [Português](README.pt-BR.md)`.
   - In a **PT-primary repo** (e.g. `ai-dev-toolkit-pt-br`): the English link points to the canonical EN repo URL, not a local file.
4. **Code blocks, URLs, file paths, badges, shell commands**: verbatim identical between EN and PT.
5. **Technical terms** kept in English: `forge-kit`, `Claude Code`, `Codex`, `OpenCode`, `Cursor`, `Windsurf`, `GitHub Copilot`, `MCP`, `MIT`, `TypeScript`, `ESLint`, `CI`, `PR`, skill/rule/agent/hook/pattern, skill names (`loop`, `route`, `dispatch`, `tdd`, `secure`, `resume`).

## Diff heuristic (quick audit)

```bash
wc -l README.md README.pt-BR.md
# If the two differ by more than ~5%, parity is broken.
```

For a deeper audit, compare heading structure:

```bash
grep -c "^#" README.md README.pt-BR.md
grep -c "^##" README.md README.pt-BR.md
grep -c "^\`\`\`" README.md README.pt-BR.md  # code block openers
```

## Workflow

### Scenario A — EN-primary repo (e.g. `ai-dev-toolkit`)

1. Read current `README.md` and `README.pt-BR.md`.
2. If line-count parity is broken or new sections exist in EN but not PT, dispatch a translation subagent (see prompt template below).
3. Ensure both files start with:
   ```
   [English](README.md) | [Português](README.pt-BR.md)

   # <Title>
   ```
4. Commit as `docs(readme): sync PT translation with EN`.

### Scenario B — PT-primary repo (e.g. `ai-dev-toolkit-pt-br`)

1. Pull canonical EN README from the EN repo; treat as source of truth.
2. PT repo's `README.md` **is** the PT version — mirror structure from canonical EN.
3. Language-switch header uses absolute URL for the EN link:
   ```
   [English](https://github.com/<org>/<en-repo>) | [Português](README.md)

   # <Título>
   ```
4. If repo currently has a redundant `README.pt-BR.md` (duplicate of `README.md`), `git rm` it.
5. Commit as `docs: parity with <canonical-repo> README`.

### Scenario C — repo pair (EN canonical ↔ PT fork)

Do both A and B in one session. Use git worktrees so the two commits land on separate feature branches, one PR per repo.

## Translation subagent prompt template

When dispatching a translation task to `executor`:

```
Translate the English README at <path> (<N> lines) to Brazilian Portuguese, and write the result to <destination>.

Rules:
- Preserve ALL code blocks verbatim (commands, JSON, file lists).
- Preserve ALL URLs, badge markdown, file paths.
- Preserve markdown structure (headings levels, tables, lists).
- Keep technical terms in English: forge-kit, Claude Code, Codex, OpenCode, Cursor, Windsurf, GitHub Copilot, MCP, MIT, ESLint, TypeScript, CI, PR, skill, agent, hook, rule, pattern, skill names.
- Translate: headings, body prose, table description columns, troubleshooting text.
- Start output with language-switch header (exact form depends on EN-primary vs PT-primary repo).
```

Include a curated "section title translations" table in the dispatched prompt so the subagent matches existing PT terminology.

## Cross-repo propagation (ai-dev-toolkit ecosystem)

When shipping README changes in this ecosystem, update **3 locations**:

1. `ai-dev-toolkit/packages/core/README.md` + `README.pt-BR.md` (EN-primary)
2. `ai-dev-toolkit-pt-br/README.md` (PT-primary, points back to canonical EN repo)
3. `ai-dev-toolkit-setup/README.md` + `README.pt-BR.md` (independent, but same pattern)

All three must carry the language-switch header. Parity is ratcheted by running this skill after any README edit.

## Non-goals

- This skill does **not** translate entire `docs/` trees automatically. Use a separate translation pipeline for `docs/guides/` etc. This skill is scoped to README parity.
- It does not lint prose quality or fix typos in existing translations — it only enforces structural + code-block parity.

## Related

- `spec-new` — for larger content additions that warrant a spec record.
- `aggregate-roadmap` — for propagating roadmap state across repo pairs.
