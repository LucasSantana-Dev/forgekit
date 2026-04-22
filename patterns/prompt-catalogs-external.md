# External prompt catalogs — when to reach for them before writing your own

Most engineering prompts don't need to be designed from scratch. Community
catalogs have battle-tested prompts for common developer personas (code
reviewer, regex generator, SQL terminal, debugger, prompt optimizer).
Before spending time crafting one, check if it already exists.

This document is an **index**, not a mirror. Copying the full catalog
into the toolkit would be unmaintainable — these sources change weekly.
Link to them at a pinned SHA and copy only the individual prompt you
need.

---

## Primary sources

### f/prompts.chat (formerly awesome-chatgpt-prompts)

- Repo: [`f/prompts.chat`](https://github.com/f/prompts.chat) — pinned at
  [`a4632f1a`](https://github.com/f/prompts.chat/tree/a4632f1a55bab49a298571efee170366a88e986d) for this index.
- License: **dual** —
  [MIT](https://github.com/f/prompts.chat/blob/a4632f1a/LICENSE-MIT) for
  the code (platform, CLI, MCP server) and
  [CC0 1.0](https://github.com/f/prompts.chat/blob/a4632f1a/LICENSE-CC0)
  for every prompt in `prompts.csv` and `PROMPTS.md`. Prompt content is
  in the public domain — you can copy any single prompt freely.
- Shape of the data: one CSV file with columns
  `act, prompt, for_devs, type, contributor` and ~99k lines total
  (multiline prompt bodies; not 99k distinct prompts, but hundreds).
- Web UI: [`prompts.chat`](https://prompts.chat) — searchable, deep-linkable.
- Hosted MCP server for Claude Code / Codex / Cursor: check the repo's
  `.claude-plugin/` + `SELF-HOSTING.md`.

### Classic engineering-relevant prompts

The ten below cover ~80% of the recurring "I need a prompt that can do X"
cases in day-to-day engineering work. Search for each title in the
upstream [`PROMPTS.md`](https://github.com/f/prompts.chat/blob/a4632f1a/PROMPTS.md)
or on [prompts.chat](https://prompts.chat) to grab the current body.

| Prompt title                                                          | Useful when you need…                                                              |
| --------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| Linux Terminal                                                        | a deterministic shell-output simulator for docs, tests, or example sessions.       |
| JavaScript Console                                                    | explain-and-evaluate behavior over snippets without running them.                  |
| SQL Terminal / SQL Query Generator                                    | write or explain queries against a given schema.                                   |
| Regex Generator                                                       | build a regex from a spec + test cases, with reasoning.                            |
| Senior Frontend Debugger for SPA Websites                             | diagnose production-looking React/Vue/Angular bugs from a stack trace and context. |
| Python Code Generator — Clean, Optimized & Production-Ready           | scaffolding a Python module to the "idiomatic + typed + tested" bar.               |
| Python Unit Test Generator — Comprehensive, Coverage-Mapped           | expand thin test coverage without hand-writing each case.                          |
| Code Translator — Idiomatic, Version-Aware & Production-Ready         | port a block between languages with attention to idiom, not just syntax.           |
| White-Box Web Application Security Audit                              | a structured checklist pass over your own code (not a pentest of strangers).       |
| Prompt Generator / Prompt Optimizer                                   | turn a vague intent into a repeatable, well-structured prompt.                     |

### dair-ai/Prompt-Engineering-Guide

Complementary to `f/prompts.chat`: less a prompt catalog, more a
structured reference on **techniques** (few-shot, chain-of-thought, ReAct,
tree-of-thoughts, self-consistency, self-refine, …) with worked examples.
Reach for this when you don't yet know *which* prompt shape fits your
problem — it explains the shapes.

- Repo: [`dair-ai/Prompt-Engineering-Guide`](https://github.com/dair-ai/Prompt-Engineering-Guide)
  — pinned at [`57673726`](https://github.com/dair-ai/Prompt-Engineering-Guide/tree/57673726396dd94acb23bdb1e67f27c78ee85a8e)
  for this index.
- License: [MIT](https://github.com/dair-ai/Prompt-Engineering-Guide/blob/57673726/LICENSE.md).
- Shape: long-form markdown guides + Jupyter notebooks + a Next.js docs site.
  The **`guides/`** directory is the most reusable part — each file is a
  self-contained essay on a technique.
- Web site: [promptingguide.ai](https://www.promptingguide.ai) — same content, searchable.

Useful entry points inside `guides/`:

| Guide                                                                                                                                     | Useful when you need…                                                        |
| ----------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| [`prompts-basic-usage.md`](https://github.com/dair-ai/Prompt-Engineering-Guide/blob/57673726/guides/prompts-basic-usage.md)               | a shared baseline vocabulary before a prompting discussion with someone new. |
| [`prompts-advanced-usage.md`](https://github.com/dair-ai/Prompt-Engineering-Guide/blob/57673726/guides/prompts-advanced-usage.md)         | few-shot / CoT / ReAct / self-consistency / self-refine patterns.            |
| [`prompts-adversarial.md`](https://github.com/dair-ai/Prompt-Engineering-Guide/blob/57673726/guides/prompts-adversarial.md)               | to guard against prompt injection / jailbreaks in tool-calling LLMs.         |
| [`prompts-reliability.md`](https://github.com/dair-ai/Prompt-Engineering-Guide/blob/57673726/guides/prompts-reliability.md)               | techniques for grounding and hallucination reduction.                        |
| [`prompts-applications.md`](https://github.com/dair-ai/Prompt-Engineering-Guide/blob/57673726/guides/prompts-applications.md)             | concrete applied examples (code gen, data extraction, math).                 |

When to reach for which source:
- Need a *drop-in prompt* for a known persona/task → **f/prompts.chat**.
- Need to understand *why* a prompt shape works / compare options →
  **dair-ai/Prompt-Engineering-Guide**.
- Both at once (e.g., "I want a good CoT-flavored code reviewer") → read
  the DAIR-AI CoT section, then grab the Code Reviewer from prompts.chat
  and fold in the CoT scaffold.

---

## How to use this catalog with Claude Code / ai-dev-toolkit

Three sensible options, in order of recommended:

1. **Link-and-copy-once.** Find the prompt upstream, paste the body into
   the relevant command/skill/agent file in this toolkit, add a one-line
   attribution comment (`# adapted from f/prompts.chat @ <sha> — CC0`).
   This is the default.
2. **Drop-in as a Claude Code subagent.** For multi-turn prompts (e.g.
   debugger, code reviewer), wrap the prompt body as an agent definition
   under `~/.claude/agents/` or a plugin's `agents/` dir. Lets you invoke
   with `@agent-name`.
3. **Run the upstream MCP server.** If you want live access to the full
   catalog inside Claude Code, use the repo's MCP server (see
   `SELF-HOSTING.md`). More moving parts; preferable only when you
   actually browse the catalog frequently.

## What NOT to do

- **Don't bulk-import `prompts.csv` or `PROMPTS.md` into this toolkit.**
  4.7 MB of CSV / 119k lines of markdown will rot fast and add no
  retrieval value beyond "ctrl-F on the upstream file".
- **Don't drop attribution** even though CC0 technically doesn't require
  it. The norm in this toolkit is to keep provenance so readers can
  trace a prompt to the version they wanted.
- **Don't assume every community prompt is high-quality.** The catalog
  is community-contributed; plenty of entries are joke personas,
  single-use novelty, or oversized. Skim the body before using.

## Related internal references

- [`patterns/context-building.md`](./context-building.md) — on assembling
  context for Claude Code that works alongside a well-chosen prompt.
- [`patterns/code-review.md`](./code-review.md) — if you're reaching for
  a prompt because you want a review, check this pattern first.
- [`best-practices/ai-skill-stewardship.md`](../best-practices/ai-skill-stewardship.md)
  — on deciding whether to wrap a prompt as a new Skill.

## Attribution

- Prompts cited by name only; their bodies live upstream in
  [`f/prompts.chat`](https://github.com/f/prompts.chat)
  (CC0 1.0 for prompt content, MIT for platform code).
- Technique-guide links point to
  [`dair-ai/Prompt-Engineering-Guide`](https://github.com/dair-ai/Prompt-Engineering-Guide)
  (MIT); no content reproduced here.
- This pattern doc is © the ai-dev-toolkit authors, MIT-licensed with
  the toolkit.
