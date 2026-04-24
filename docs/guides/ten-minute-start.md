---
status: active
audience: newcomers
reading_time: 10 min
---

# Get productive with AI in 10 minutes

This is a plain-language walkthrough for anyone curious about using AI to help with their work — whether you write code daily, write code sometimes, or only touch code through scripts and config.

No jargon. No "install 14 tools first." Ten minutes, three decisions, one useful result.

## The three decisions

### 1. What are you trying to do, really?

Be honest with yourself. "Use AI" is not a goal — it's a lever. The goal is on the other side of it. Pick one:

- **Write or edit text** — code, docs, emails, configs, specs.
- **Understand something you didn't write** — a codebase, a log, a config file, an error.
- **Make a repetitive task go away** — renaming across files, reformatting data, turning 12 pasted rows into a table.
- **Get a second opinion** — on a design, a decision, a pull request.

If none of these fit, stop here. AI is not magic. Come back with a concrete task.

### 2. Where will you work?

You have three realistic options. Pick one — don't shop around.

| If you… | Use |
|---|---|
| Already live in a terminal | **Claude Code** or **Codex CLI** |
| Already live in VS Code / JetBrains / Cursor | **Cursor** or the **Claude VS Code extension** |
| Want a web chat with a file attached | **claude.ai** or **chatgpt.com** |

Don't overthink this. You can switch later. The decision matters less than starting.

### 3. What's one thing you'd try first?

Not ten things. **One**. Examples that are boring enough to actually finish:

- "Help me write a commit message for this diff."
- "Explain what this `systemd` unit file does."
- "Take this CSV and give me 5 rows of realistic test data."
- "Read this pull request and tell me what I'd push back on."

The key is: you already know roughly what "good" looks like, so you'll recognize bad output when you see it. That's the feedback loop. Start there.

## The next 10 minutes

1. **Minute 0–2.** Install one tool from the table above. If it asks for a credit card, stop and pick a free tier — you don't need to pay to start.
2. **Minute 2–4.** Open your one concrete task. Paste it in. Don't explain "you are an expert…" — the modern tools don't need it.
3. **Minute 4–8.** Read the answer **critically**. Did it assume something false? Did it skip your real question? Type back: "Actually, the constraint is X — try again." Iterate.
4. **Minute 8–10.** Decide one of: **keep it**, **throw it away**, or **ask a colleague** who's done the real task to sanity-check. All three are valid outcomes.

That's it. You have now used AI end-to-end for one real task. You've earned the right to try a second one.

## What to avoid for the first week

- **Don't wire it into your shell startup, your CI, your editor keybindings, and three MCP servers on day one.** Every integration is a new thing to debug. Start with one surface.
- **Don't judge it by the first answer.** The useful skill is iterating — pushing back, adding constraints, asking "why?". If you never push back, you're getting average answers.
- **Don't let it write code you can't read.** If the output is too clever to explain back, delete it. Future-you will not thank past-you for a black-box regex.
- **Don't trust it on things that need to be *precisely right*** — legal, security, medical, financial numbers. Verify every claim that will cost you if it's wrong.

## Where to go after 10 minutes

- Pick your next focus with **[Pick your first tool](./pick-your-first-tool.md)** — it maps five common situations to the right Forge Kit pieces (skills, agents, servers).
- Decide whether it's actually helping you with **[Is it working?](./is-it-working.md)** — a pragmatic check before you adopt more.
- If you write code for work, skim **[For individual devs](./for-individual-devs.md)** — the personal workflow loop.

You are not behind. Most people talking about AI online are not shipping with it. Ten minutes spent on one real task beats ten hours of reading.
