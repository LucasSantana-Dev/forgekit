---
id: claude-code-cloud-review-plan
title: Cloud Code Review & Planning — Ultrareview & Ultraplan
description: "RESEARCH PREVIEW: Comprehensive code review and interactive planning in the cloud. Run /ultrareview for multi-agent bug hunting; /ultraplan to draft plans collaboratively and execute remotely."
tags:
- claude-code
- verification
- code-review
- planning
- research-preview
translations:
  pt-BR:
    title: Análise de Código e Planejamento em Nuvem — Ultrareview & Ultraplan
    description: "PREVIEW DE PESQUISA: Análise de código abrangente e planejamento interativo na nuvem. Execute /ultrareview para caça de bugs multi-agente; /ultraplan para elaborar planos colaborativamente e executar remotamente."
---

# Cloud Code Review & Planning — Ultrareview & Ultraplan

Claude Code now brings comprehensive code review and interactive planning to the cloud. Both features are in **research preview** and may change as feedback arrives.

---

## /ultrareview — Fleet Code Review

**Research preview since Week 17 (April 2026).**

Run a fleet of bug-hunting agents in the cloud against your branch or PR. Findings land back in your CLI or Desktop automatically.

### When to Use

- **Before merging critical changes**: auth rewrites, data migrations, schema changes, payment flows.
- **Large refactors**: when you want a second pair of eyes on 500+ lines of changes.
- **CI is passing but you're not confident**: ultrareview finds logical bugs, security issues, and performance pitfalls that tests miss.

### How It Works

```text
claude> /ultrareview
```

Or point it at a specific PR:

```text
claude> /ultrareview 1234
```

Claude spawns parallel agents to:
1. **Pattern-match bugs** — common security issues, null dereferences, resource leaks.
2. **Check logic** — do the changes do what the PR claims? Are there off-by-one errors, race conditions?
3. **Adversarial review** — assume the code is under attack; what could break it?
4. **Merge the findings** — one consolidated report.

### Output

```
Ultrareview findings:

[CORRECTNESS] Database migration (line 42): Missing null check on user_id before insert
  → Could cause cascading failures if user_id is undefined

[SECURITY] Auth handler (line 88): Session token hardcoded in error message
  → Leaks token to logs; use redaction wrapper instead

[PERFORMANCE] Query loop (line 156): N+1 query in list view
  → Add .include(:author) to prevent extra queries per item
```

### Cost & Trade-offs

- **Higher per-run cost** — fleet review uses more tokens than local review.
- **Good for high-stakes merges** — use before landing auth, payments, migrations.
- **Not for every PR** — use `/ultrareview` on risky PRs; use local `/code-review` for routine PRs.
- **Wall-clock time**: Parallel agents complete in minutes; local review might be faster for small changes.

---

## /ultraplan — Distributed Planning

**Research preview since Week 15 (April 2026).**

Draft a plan in the cloud from your CLI, review and comment on it in a web editor, then run it remotely or pull it back to your terminal.

### Workflow

1. **Request a plan from CLI:**

   ```text
   claude> /ultraplan migrate the auth service from sessions to JWTs
   ```

   Claude drafts the plan in a Claude Code on the web session; your terminal stays free.

2. **Review in browser:**

   Open the link in your browser. The plan appears as structured phases with commentary. You can:
   - Comment on individual sections
   - Ask for revisions ("add a rollback step here")
   - Accept and execute remotely

3. **Execute:**

   - **Run remotely**: Click "Execute" and Claude runs the plan on the cloud, sending you a summary.
   - **Pull local**: Send the plan back to your terminal and execute it there.

### When to Use

- **Large, risky migrations** — get buy-in before executing.
- **Cross-team coordination** — share the plan link with teammates to review before you run it.
- **Complex sequencing** — when the right order of steps is unclear; plan mode makes dependencies explicit.
- **Documenting decisions** — the plan becomes an artifact for future maintenance.

### Cost Considerations

- **Plan drafting is cheaper than execution** — model planning is fast; executing the plan runs the actual work.
- **Review loop adds turns** — each comment-and-revise cycle adds a turn; batch feedback before revising.
- **Remote execution costs tokens** — be aware that running remotely multiplies token cost (cloud session context).
- **Pull local to save cost** — if you have capacity, pull the plan back to your terminal and execute it there.

---

## Combining Ultrareview + Ultraplan

A high-confidence workflow:

1. **Ultraplan**: Draft the migration plan in the cloud, get team feedback, then pull it local.
2. **Execute**: Run the plan locally in your session, make incremental commits.
3. **Ultrareview**: Before merging, run `/ultrareview` on the PR to catch bugs the plan didn't catch.

---

## Research Preview Caveats

Both features are in **research preview**. Expect:
- **Breaking changes**: command syntax or behavior may change without notice.
- **Feature gaps**: some workflows may not be supported yet.
- **Performance variability**: cloud infrastructure may introduce latency or occasional failures.
- **Staleness**: this doc reflects Week 17–22 2026 behavior; future weeks may ship breaking changes.

Check `/release-notes` for updates, and report issues via your Claude Code support channel.

---

## Tips

1. **Ultrareview is not a replacement for tests** — it finds logical bugs, but automated tests are still essential.
2. **Ultraplan benefits from structure** — the more you specify upfront (acceptance criteria, constraints, success metrics), the better the plan.
3. **Pull plans local when you can** — reviewing and executing locally costs less and gives you more control.
4. **Use `/usage` to track costs** — both features may consume significant tokens; monitor your usage.
5. **Batch your reviews** — don't run `/ultrareview` on every PR; reserve it for critical changes.
