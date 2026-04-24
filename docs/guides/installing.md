---
status: active
audience: all
reading_time: 15 min
---

# Installing Forge Kit entries

Forge Kit deliberately has **no "install everything" button**. You install one
catalog entry at a time — a skill, an agent, an MCP server, a hook — and the
installer tells you exactly what file it touched.

This page is the reference for *what each install does*, *where files land*,
*how to verify it worked*, and *how to uninstall*. Bookmark it. Every command
below is safe to read before you run, and reversible after.

## Why no mega-install script?

Because a mega-install script:

- asks you to trust dozens of unrelated pieces of code in a single moment,
- leaves you unable to diagnose which piece broke if something goes wrong,
- blows past good adoption cadence (install → live with it → measure → add
  next) in a single command, and
- *looks exactly like a malicious one-liner* — "run this URL" installs are the
  standard attack pattern and we don't want Forge Kit to cosplay as one.

Selective installation is slower the first day and better the first month.

---

## Before you install anything

### Files Forge Kit can touch

| Install kind | Destination (default) |
|---|---|
| skill | `~/.claude/skills/<id>/` (directory) |
| agent | `~/.claude/agents/<id>.md` |
| hook | `~/.claude/hooks/<id>.sh` (+ you wire it in `~/.claude/settings.json`) |
| command | `~/.claude/commands/<id>.md` |
| tool | `~/.local/bin/<id>` (your `$PATH` must include this) |
| MCP server | `~/.claude/mcp.json` entry *or* registered in your local gateway |

Each path comes from `packages/cli/src/lib/claude-config.ts`. Override with
`install.copy_to` on the entry's manifest.

### Before your first install

1. Make sure `~/.claude/` exists. It's created on first login to Claude Code.
2. If you'll install tools, make sure `~/.local/bin` is on your `$PATH`.
   Check: `echo $PATH | tr ':' '\n' | grep -F ".local/bin"`.
3. Know your "uninstall": the installer always prints the destination path.
   Deleting that path + undoing any `settings.json` edit is the full
   uninstall. There is no package database behind `forge-kit`.

### How to preview what any install will do

```bash
# Read the entry manifest before installing
curl -s https://forgekit.lucassantana.tech/<kind>/<id>/ | less

# Or clone the repo and inspect the catalog source directly
git clone https://github.com/LucasSantana-Dev/ai-dev-toolkit
cd ai-dev-toolkit/packages/catalog/catalog/<kind>/<id>
cat manifest.json  # or the .yaml / .md for that kind
```

Nothing you install runs any code at install time — the installer just copies
files into `~/.claude/` or `~/.local/bin/`. The code runs when *you* invoke it
from Claude Code or your shell.

---

## Installing a skill

### What it does

Copies `manifest.json` + `SKILL.md` into `~/.claude/skills/<id>/`. No code runs
at install time. Claude Code discovers the skill on its next session start.

### Steps

```bash
# 1. Preview the skill
open https://forgekit.lucassantana.tech/skills/<id>/

# 2. Install it
npx forge-kit install <id>
# → ✓ installed skill '<id>'
#   → /Users/you/.claude/skills/<id>
#   Claude Code picks this up on next session start.

# 3. Verify
ls ~/.claude/skills/<id>/
# expect: manifest.json  SKILL.md

# 4. Restart Claude Code (quit any running `claude` session, start a fresh one)
# 5. Use the skill by its trigger description — each SKILL.md has its own
```

### Uninstall

```bash
rm -rf ~/.claude/skills/<id>/
```

### Common gotchas

- Skill not being picked up → you didn't restart Claude Code.
- Skill didn't trigger → the description on `SKILL.md` doesn't match what
  you typed. Read the front-matter description; rephrase your prompt.

---

## Installing an agent

### What it does

Copies a single `.md` file to `~/.claude/agents/<id>.md`. Discovered on next
session start.

### Steps

```bash
npx forge-kit install <id>       # kind: agent
# → ✓ installed agent '<id>'
#   → /Users/you/.claude/agents/<id>.md

# Verify
test -f ~/.claude/agents/<id>.md && echo "present"

# Restart Claude Code
# Invoke by name: "Run the <id> agent on …"
```

### Uninstall

```bash
rm ~/.claude/agents/<id>.md
```

### Common gotchas

- Agent model not allowed by your plan → open the file, change `model:` in
  the frontmatter, save. The installer is safe to re-run with `--force` to
  reset.

---

## Installing a hook

### What it does

Copies a shell or Python script to `~/.claude/hooks/<id>.sh`, `chmod +x`s it.
**You still need to wire it** into `~/.claude/settings.json` under the
`hooks` key — hooks don't auto-register.

### Steps

```bash
npx forge-kit install <id>       # kind: hook
# → ✓ installed hook '<id>'
#   → /Users/you/.claude/hooks/<id>.sh
#   Add a matching entry under `hooks` in ~/.claude/settings.json for it to fire.
```

Edit `~/.claude/settings.json`. Merge (don't replace) the `hooks` object:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [{ "type": "command", "command": "~/.claude/hooks/<id>.sh" }]
      }
    ]
  }
}
```

Event, matcher, and runtime come from the hook's `manifest.json`. The detail
page at `https://forgekit.lucassantana.tech/hooks/<id>/` shows the exact JSON
stanza for each hook.

### Verify

```bash
# Syntax
bash -n ~/.claude/hooks/<id>.sh

# Dry-run with a fake tool payload
bash ~/.claude/hooks/<id>.sh <<<'{"tool":"Bash","command":"echo hi"}'
# exit 0 = pass, non-zero = block, anything stderr = warning
```

### Uninstall

1. `rm ~/.claude/hooks/<id>.sh`
2. Remove the matching entry from `~/.claude/settings.json`.

### Common gotchas

- Hook silently not firing → wrong `event` or `matcher`. Read
  [the hooks guide](./hooks.md).
- Hook runs forever → no timeout. Wrap shelled-out commands in
  `timeout 2s …`.

---

## Installing a slash command

### What it does

Copies `command.md` to `~/.claude/commands/<id>.md`. Available as `/<id>` in
Claude Code after restart.

### Steps

```bash
npx forge-kit install <id>       # kind: command
# → ✓ installed command '<id>'
#   → /Users/you/.claude/commands/<id>.md
#   Restart Claude Code; the slash command will be available.

# Test
/<id>    # inside Claude Code after restart
```

### Uninstall

```bash
rm ~/.claude/commands/<id>.md
```

---

## Installing a tool

### What it does

Copies the executable (`.sh`, `.py`, `.mjs`, etc.) to `~/.local/bin/<id>`,
`chmod +x`s it. Available as a plain shell command on `$PATH`.

### Steps

```bash
# Prerequisite: ~/.local/bin on PATH
echo $PATH | grep -F ".local/bin" || \
  echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.zshrc

npx forge-kit install <id>       # kind: tool
# → ✓ installed tool '<id>'
#   → /Users/you/.local/bin/<id>
#   Ensure ~/.local/bin is on your $PATH.

# Verify
which <id>
<id> --help
```

### Uninstall

```bash
rm ~/.local/bin/<id>
```

### Common gotchas

- `command not found: <id>` after install → `~/.local/bin` isn't on `$PATH`.
  Restart your shell after adding it.
- Permission denied → installer didn't set exec bit. `chmod +x
  ~/.local/bin/<id>` manually, file a bug.

---

## Adding an MCP server

MCP servers don't ship executable code — they're **declarations** that your
agent or gateway consumes. Two install modes:

### Mode A — direct MCP config (beginner)

Edit `~/.claude/mcp.json`. Merge the server definition from the detail page:

```bash
# 1. Preview
open https://forgekit.lucassantana.tech/servers/<id>/

# 2. Copy the JSON snippet shown on that page into ~/.claude/mcp.json
# (merge under the existing "mcpServers" key — don't replace the whole file)

# 3. Set any required env vars in your shell profile
export GITHUB_PERSONAL_ACCESS_TOKEN=ghp_…   # example for the github server

# 4. Restart Claude Code
```

### Mode B — via the local gateway (advanced)

Register the server with your running `mcp-context-forge` gateway so every
agent sees one aggregated endpoint instead of one-per-server.

```bash
# 1. Run the gateway (one-time)
cd ai-dev-toolkit/infra/gateway
cp .env.example .env
# edit .env: set GATEWAY_ADMIN_TOKEN and any upstream server secrets
docker compose up -d

# 2. Register the server
python seeds/seed.py --server <id>       # adds that one
#   — or —
python seeds/seed.py                     # seed every catalog server

# 3. Wire your editor to the gateway (editor config, not an install)
npx forge-kit setup claude-code
# This is the *only* command that touches an editor config file.
# It writes ~/.claude/mcp.json to point at http://127.0.0.1:<port>/servers/library/mcp
# and that's it. Read the source: packages/cli/src/commands/setup.ts.
```

The gateway binds to **`127.0.0.1` only**. See
[MCP servers](./mcp-servers.md) for the full gateway model and security
posture.

### Uninstall

- **Mode A:** remove the entry from `~/.claude/mcp.json`, restart Claude Code.
- **Mode B:** deregister via gateway API or remove from the seed file, then
  re-run `seed.py`.

---

## Installing a collection

A collection is a bundle: a YAML list of `{ kind, id }` pairs. You install
the pieces, not the bundle file.

```bash
# Preview what's in the bundle
open https://forgekit.lucassantana.tech/collections/<id>/

# Install each item individually (cut-and-paste from the detail page)
npx forge-kit install <item-1>
npx forge-kit install <item-2>
# …
```

A future CLI command `forge-kit install-collection <id>` is planned but not
shipped — the explicit loop above is the supported path today.

---

## Verification checklist (after any install)

- [ ] The installer printed a path. That path exists.
- [ ] You restarted Claude Code if the entry needs it (skills, agents,
      commands, MCP servers — yes; tools, hooks — no).
- [ ] You ran the entry once and saw the expected behaviour.
- [ ] You can explain to yourself in one sentence what just happened.
- [ ] You noted the uninstall command somewhere you can find again.

If any of these is "no," stop before installing the next thing.

---

## If you're ever unsure

1. `npx forge-kit list` — see what's already installed locally.
2. `npx forge-kit doctor` — sanity-check your local config.
3. Read the source of the installer itself:
   `packages/cli/src/commands/install.ts`. It's ~200 lines; you can read it
   in five minutes and confirm it only copies files.

That transparency is the point. You're expected to read.
