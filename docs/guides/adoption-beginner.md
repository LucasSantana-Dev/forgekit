---
status: active
audience: newcomers
reading_time: 15 min
---

# Adopting Forge Kit — the beginner walkthrough

A step-by-step, copy-paste-able guide for someone who has **never installed an AI
dev tool before**, or has tried once and bounced off. Every step has a "how do
I know it worked?" check. No assumptions about Docker, Node, Python, or shell
fluency beyond "I can paste a line into a terminal and hit enter."

If you already run your own Docker gateway and write skills for breakfast, skip
to the **[Advanced adoption](./adoption-advanced.md)** guide instead.

**Time budget:** about 45 minutes, split across 7 steps. You can stop at any
step and come back — each one leaves your setup in a usable state.

---

## Before you start

You'll need exactly three things:

1. A terminal. On macOS: **Terminal.app** (built in). On Windows: **Windows
   Terminal** or **PowerShell**. On Linux: whichever you already use.
2. A **Claude** subscription or API key. The free tier is enough for this
   walkthrough — you can upgrade later.
3. About 45 minutes of focused time. Break that up if you need to.

You do **not** need Docker, Node.js, Python, or a specific editor for this
walkthrough. We'll add those later only if a step needs them.

---

## Step 1 — Install Claude Code (≈ 5 min)

Claude Code is the CLI that reads from the Forge Kit catalog. One command:

```bash
npm install -g @anthropic-ai/claude-code
```

If you don't have `npm`: install Node.js first. Go to [nodejs.org](https://nodejs.org),
grab the LTS installer for your OS, run it. Then retry the line above.

**Check it worked:**

```bash
claude --version
# → claude-code 0.x.y
```

If you see a version number, you're good. If you see "command not found" —
close your terminal, open a new one, try again. (Installers usually don't
update the current shell.)

### Log in

```bash
claude login
```

A browser window opens. Log in with your Claude account. When it closes, you're
authenticated. The token is saved locally.

### Try it

```bash
mkdir ~/forgekit-test && cd ~/forgekit-test
claude
```

You're now inside the CLI. Type: `what files are in this directory?` and hit
enter. You should get back a sensible answer like "The directory is empty."
If that works, **Step 1 is done.** Type `/exit` to leave.

---

## Step 2 — Install one skill (≈ 5 min)

A **skill** is a named, reusable procedure. We'll start with `adt-context` — the
single most useful skill for day-to-day work. It teaches the agent to keep
long sessions focused without running out of memory.

```bash
npx forge-kit install adt-context
```

First run will download the forge-kit CLI through `npx` — takes 10–20 seconds.
It'll ask "is this OK to install?" — type `y` and press enter.

**Check it worked:**

```bash
ls ~/.claude/skills/adt-context/
```

You should see at least `manifest.json` and `SKILL.md`. If you see "No such
file," the install didn't land in the expected location — re-run with
`DEBUG=1` in front and check the printed path.

### Use it

Back in Claude Code (`claude` in a project directory), just work normally. The
skill auto-invokes when context gets heavy. You don't need to type anything
special. **Step 2 is done.**

---

## Step 3 — Browse the catalog (≈ 3 min)

Open the web catalog in your browser:

> **https://forgekit.lucassantana.tech**

Click through a few entries to see what exists. Read their **descriptions**
and **Usage** sections — especially the "Use when" and "Skip when" cards. The
catalog is opinionated; the descriptions tell you whether a given entry fits
*your* work.

Note three entries that sound useful for your actual job. Don't install them
yet. We're just looking.

**Step 3 is done** when you've read at least three entry detail pages.

---

## Step 4 — Register one MCP server (≈ 10 min)

MCP servers give the agent access to things outside your terminal: GitHub,
Sentry, your docs, live web search. We'll register **`context7`** because it
fixes the single most common failure mode in AI-assisted dev: the agent
inventing APIs that don't exist.

### 4a. Find the config file

- **macOS / Linux:** `~/.claude/mcp.json`
- **Windows:** `%USERPROFILE%\.claude\mcp.json`

If the file doesn't exist, create it. If it does, we'll add to it.

### 4b. Paste this config

Minimal version — just context7:

```json
{
  "mcpServers": {
    "context7": {
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp"]
    }
  }
}
```

If the file already had servers, merge carefully — don't replace the whole
`"mcpServers"` object. Paste *inside* it as a new key.

### 4c. Restart Claude Code

Quit any running `claude` session and start a new one. MCP server changes
need a fresh process.

### 4d. Verify

In Claude Code, type: `use context7 to look up the latest React useEffect
docs.` The response should cite current React docs (not a training-data
guess). If it says "I don't have a context7 tool available" — the config
didn't take. Re-check JSON syntax (commas, matching braces) and restart.

**Step 4 is done** when the agent can actually call `context7`.

---

## Step 5 — Use your first agent (≈ 5 min)

An **agent** is a named sub-persona with a focused job. We'll try the
code-reviewer agent on a real piece of code.

### 5a. Install it

```bash
npx forge-kit install adt-code-reviewer
```

Same "y to confirm" prompt as before.

### 5b. Use it on something you wrote recently

Navigate to any code repository you have locally (doesn't need to be big —
even a personal project with one commit works). Run:

```bash
cd /path/to/your/repo
claude
```

Inside the CLI, type:

```
Run the code-reviewer agent on the changes in the last commit.
```

You'll get back a structured report with severity-rated findings (CRITICAL,
HIGH, MEDIUM, LOW) — if any exist. If the commit is clean, you'll get
"PASS ✓ Ready to merge."

This is the habit that pays off: every PR-shaped piece of work gets a
second-opinion pass before you hit "merge."

**Step 5 is done** when you've run the agent on real code and read its
output.

---

## Step 6 — Measure whether it's helping (≈ 10 min)

Right now you've adopted three things: a skill, a server, and an agent. Don't
add more yet. For the next **7 days**, just use these three on your normal
work.

At the end of the week, run the 5-question honest check from
**[Is it working?](./is-it-working.md)**:

1. Am I shipping more finished work per week than before?
2. Has my time shifted toward thinking vs. typing?
3. Am I producing work I understand and could debug?
4. Am I catching the agent's mistakes before they land?
5. Do I still enjoy the job?

If the answer is mostly "yes" or "unsure": proceed to Step 7.

If the answer is mostly "no": stop adding tools. Either narrow what you have,
step away for a month, or check whether your work is a fit for AI assistance
at all. All three are valid outcomes.

**Step 6 is done** when you've answered the five questions honestly on paper.

---

## Step 7 — Add your second batch (≈ 5 min to decide, days to live with)

Only after Step 6 returns a positive signal.

Browse the web catalog again, with fresh eyes from a week of real use. Pick
**one** next piece — not three, not five. One. Suggestions by theme:

- **You lose context in long sessions** → install the context-rag-launchpad
  collection (when PR #100 merges): `npx forge-kit install-collection
  context-rag-launchpad`.
- **You waste time on setup across machines** → install
  `adt-dev-assets-sync`.
- **You want hooks that catch mistakes automatically** → read
  [Hooks](./hooks.md) and pick one hook to start with (not a pack).
- **You want a security review habit** → install `adt-security-auditor`.

The pattern that works: install, use for a week, measure with **[Is it
working?](./is-it-working.md)**, decide whether to expand further. Treat the
catalog like a pantry, not a shopping spree.

---

## What success looks like after 30 days

- You have **5–8** catalog entries installed, not 30.
- You can name a **concrete win** from each one ("caught X bug before merge,"
  "saved Y minutes per week on Z").
- You can **name the one you'd uninstall** if forced to — and that honesty
  means your setup is tuned to *your* work, not someone else's.
- Your first-hour-of-the-day workflow has shifted slightly. Not dramatically.

If after 30 days you have 30 installed entries and no concrete wins, you over-
adopted. Reset: uninstall everything, redo Steps 1–5, live with those for
a month.

---

## Where to go next

- **[Pick your first tool](./pick-your-first-tool.md)** — situation-based map
  from 5 common frustrations to specific catalog pieces.
- **[Is it working?](./is-it-working.md)** — the honest-check template to use
  at the end of weeks 1, 4, and 12.
- **[Adoption (advanced)](./adoption-advanced.md)** — for when you're ready to
  wire hooks, manage the gateway, and tune the kit for a real workflow.
