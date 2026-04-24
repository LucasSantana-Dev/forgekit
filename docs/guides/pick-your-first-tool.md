---
status: active
audience: newcomers
reading_time: 6 min
---

# Pick your first tool

Forge Kit has a lot of surface area — skills, agents, MCP servers, hooks, commands, tools. Most people don't need most of it. This guide maps **five common situations** to the **one or two pieces** that actually help.

If your situation isn't listed, pick the closest match. The wrong first choice is fixable; analysis paralysis isn't.

---

## Situation 1 — "I keep repeating the same prompt"

You find yourself typing the same 3-sentence setup ("you are a careful reviewer, use X style, return Y format…") over and over. You tweak it each time and forget what worked.

**Use:** a **skill**.

A skill is a named, reusable procedure. Write it once (or copy one from the catalog), and the agent invokes it by name whenever the situation matches. You stop writing the setup; you start writing just the variable part.

- Start with **[`adt-context`](../../packages/catalog/catalog/skills/adt-context/)** — it keeps sessions focused.
- Browse all skills at `/skills` on the catalog site.

Skip this if: your prompts are one-offs. Skills only earn back their authoring cost at ~5+ reuses.

---

## Situation 2 — "The agent keeps inventing APIs that don't exist"

Classic hallucination. You ask for a Stripe / React / Django snippet and get an API that looks plausible but isn't in the actual library.

**Use:** an **MCP server for live documentation**.

The [`context7`](../../packages/catalog/catalog/servers/context7.yaml) server gives the agent a way to fetch *current* docs for a library instead of guessing. One tool, zero config on the user side, free.

- Add it to your MCP config. Takes seconds.
- Trigger phrase in your prompt: "use context7 to check the actual API first."

Skip this if: you work in an obscure codebase not well-covered by public docs. An MCP docs server can't help.

---

## Situation 3 — "I want a second opinion before I merge"

You finish a PR. You know it works, but "works" is a low bar. You want another set of eyes to flag bugs, missing tests, or security smells before a teammate sees it.

**Use:** an **agent**.

Agents are sub-personas with a fixed job. [`adt-code-reviewer`](../../packages/catalog/catalog/agents/adt-code-reviewer.md) reads a diff, emits severity-rated findings, and refuses to edit on its own. You get structured feedback you can accept, push back on, or ignore.

- Invoke it with something like: "Run the code-reviewer agent on this diff."
- Pair it with [`adt-security-auditor`](../../packages/catalog/catalog/agents/adt-security-auditor.md) if the diff touches auth, input handling, or dependencies.

Skip this if: you don't have a diff yet. Agents review — they don't prototype.

---

## Situation 4 — "My agent session runs out of context halfway through"

Long sessions forget the early conversation. The agent starts re-reading files it already read, or loses track of a decision made 30 turns ago.

**Use:** the **[`adt-context`](../../packages/catalog/catalog/skills/adt-context/) skill** + a **compaction hook**.

The skill teaches the agent to summarize and discard stale content. A hook can automate it before you bump into the limit. Combined, a 100-turn session stays coherent.

- Free, no extra cost.
- Trade-off: compaction is lossy. If you need every detail of the earlier conversation, split the work into smaller sessions instead.

Skip this if: all your tasks finish in under 20 turns. This is infrastructure for long work.

---

## Situation 5 — "I want to teach my team a new workflow"

Someone on the team figured out a great way to do X. You want it to not be tribal knowledge that dies when they leave.

**Use:** a **collection**.

Collections bundle skills + agents + servers + hooks that belong together for a specific workflow. Add a YAML under `packages/catalog/catalog/collections/` listing the IDs; anyone can install the whole bundle instead of learning the individual pieces.

- Look at [`claude-code-power-user`](../../packages/catalog/catalog/collections/claude-code-power-user.yaml) as a worked example.
- Collections pay off at ~3+ shared pieces. If it's one skill, just share the skill.

Skip this if: only you will use it. Collections are for handoff, not solo work.

---

## Situation 6 — "None of the above"

You're exploring. No concrete task yet. Here's a ranked "first three" if you want to just start adopting things:

1. **[`adt-context`](../../packages/catalog/catalog/skills/adt-context/)** — the one skill nearly everyone benefits from.
2. **[`context7`](../../packages/catalog/catalog/servers/context7.yaml)** server — stops the hallucinated-API failure mode cold.
3. **[`adt-code-reviewer`](../../packages/catalog/catalog/agents/adt-code-reviewer.md)** agent — gives you a scheduled second-opinion habit.

Install those three, use them for a week, *then* browse the catalog for your next additions. Adding five things at once will leave you unable to diagnose which one helped.

---

## The honest answer when you're stuck

Ask **one** human who already uses AI tools: "I want to start. What's the one thing you'd install first?" Their answer is usually better than a generic recommendation — they know your work.

If you don't have that human yet, pick from this page. Start.
