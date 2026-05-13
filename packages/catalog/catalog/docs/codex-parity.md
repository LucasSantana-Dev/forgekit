---
id: codex-parity
title: Codex–Claude Parity Setup
description: Bring an OpenAI Codex CLI installation into full parity with Claude Code on the same machine — share the skill catalog via symlink, mirror per-project memory into the repo, add a composite-first principle to AGENTS.md, and verify the shared RAG index works from both tools.
tags:
- best-practice
- ai-dev-toolkit
- codex
- claude-code
- setup
source:
  path: ai-dev-toolkit/packages/catalog/catalog/docs/codex-parity.md
  license: MIT
translations:
  pt-BR:
    title: Setup de Paridade Codex–Claude
    description: Coloque uma instalação do OpenAI Codex CLI em paridade total com o Claude Code na mesma máquina — compartilhe o catálogo de skills via symlink, espelhe a memória por projeto dentro do repo, adicione um princípio composite-first ao AGENTS.md, e verifique que o índice RAG compartilhado funciona dos dois lados.
---

# Codex–Claude Parity Setup

> Goal: a Codex CLI session in any repo behaves like a Claude Code session there — same skills, same project memory, same composite-skill routing, same RAG recall.

## Why parity matters

When you switch between Claude Code and Codex on the same workstation, a parity gap creates friction:

- A skill that works in one tool is invisible to the other.
- Project memory written from one tool isn't read by the other on session start.
- A composite skill (`/merge-confidently`, `/ship-it`, `/research-and-decide`) fires in Claude but Codex falls back to running sub-skills individually, breaking the auto-chain contract.
- A `rag_query` recall hits in Claude but Codex's MCP isn't wired the same way.

Each gap forces context re-discovery and wastes tokens. Parity closes them with four pieces of plumbing that each take ten minutes.

## The four pieces

### 1. Share the skill catalog

`~/.codex/skills` becomes a symlink to `~/.agents/skills` (or vice versa — pick whichever you've already invested in). Both tools then enumerate the exact same SKILL.md files.

```bash
# One-shot fold + symlink (back up first)
mkdir -p ~/.agents/skills/_imported-backup
cp -R ~/.codex/skills/. ~/.agents/skills/_imported-backup/

# Move any codex-only skills you want to keep into ~/.agents/skills/
# (each skill should be its own directory with a SKILL.md at minimum)

mv ~/.codex/skills ~/.codex/skills.pre-symlink-bak
ln -s ~/.agents/skills ~/.codex/skills
```

Verify:

```bash
find ~/.codex/skills -maxdepth 2 -name SKILL.md | wc -l
```

The count should match `find ~/.agents/skills -maxdepth 2 -name SKILL.md | wc -l`.

### 2. Mirror per-project memory

Claude Code stores per-project memory at `~/.claude/projects/<slug>/memory/`. Codex's startup sequence inspects `<repo>/.agents/memory/` instead. Bridge them with symlinks inside the repo, gitignored:

```bash
cd <repo>
mkdir -p .agents/memory
for f in ~/.claude/projects/<slug>/memory/*.md; do
  ln -s "$f" .agents/memory/$(basename "$f")
done

# Confirm .agents/ is gitignored
grep -q '^\.agents/' .gitignore || echo '.agents/' >> .gitignore
```

Now both tools load the same `MEMORY.md` index and the same individual memory files. Edits propagate immediately because symlinks resolve to the canonical Claude path.

### 3. Add the composite-first principle to AGENTS.md

`AGENTS.md` is to Codex what `CLAUDE.md` is to Claude Code. Without an explicit directive, Codex will split user intent into individual sub-skills instead of using composites.

Add a section like this to `~/.codex/AGENTS.md`:

```markdown
<!-- section: composite-first -->
## Composite-first principle (mandatory)

When the user's intent matches a composite skill, ALWAYS invoke the composite — never the individual sub-skills.

The full trigger map lives in `~/.agents/skills/standards/skill-auto-invoke.md`. Composites take precedence over individual skills:

- "merge this PR" → `/merge-confidently` (NOT `/ship`, `/pr-merge-readiness`, `/ci-watch` separately)
- "test suite is bad" → `/fix-the-suite`
- "deploy to prod" → `/ship-it`
- "build this page" → `/design-build`
- "should we use X or Y" → `/research-and-decide`
- "prod is down" → `/production-incident`
- "audit my site" → `/seo-a11y-audit`

Bailing out of a composite at one of its phases violates the contract — the composite exists specifically to enforce the chain.
<!-- /section -->
```

Verify by asking Codex `"merge this PR"` — it should propose `/merge-confidently`, not `/ship` + `/ci-watch` separately.

### 4. Verify the shared RAG index

Both tools should query the same RAG corpus. Wire the MCP server in `~/.codex/config.toml`:

```toml
[mcp_servers.rag-index]
command = "/Users/<you>/.claude/rag-index/venv/bin/python"
args = ["/Users/<you>/.claude/rag-index/mcp_server.py"]

[mcp_servers.rag-index.env]
HF_HUB_OFFLINE = "1"
TRANSFORMERS_OFFLINE = "1"
```

Sanity-check from any session:

```bash
~/.claude/rag-index/venv/bin/python -c "import mcp_server; print('ok')"
ls -lh ~/.claude/rag-index/index.sqlite  # should be modified within last 24h
```

From inside Codex, invoke `rag_query` with a known-good query (e.g. a memory topic you wrote recently) and confirm the corresponding file surfaces in the top results.

## Project-scoped vs global memory priority

Once `.agents/memory/` exists, AGENTS.md should instruct Codex to read it **before** the global memory index:

```markdown
## User Context
Read memory in this order — project-scoped first, global second:

1. `./.agents/memory/MEMORY.md` (if present in CWD)
2. `~/.claude/projects/-Users-<you>/memory/MEMORY.md` (fallback)
```

Without the explicit ordering, Codex tends to surface global memory hits first, missing the more relevant project-scoped entries.

## Verification checklist

After all four pieces land, from a fresh Codex session in your repo:

| Check | Expected |
|-------|----------|
| `ls ~/.codex/skills \| wc -l` | matches `ls ~/.agents/skills \| wc -l` |
| `readlink ~/.codex/skills` | points to your shared skill directory |
| `ls .agents/memory/` (in the repo) | shows symlinks to the Claude memory files |
| `grep -c 'composite-first' ~/.codex/AGENTS.md` | ≥ 1 |
| Ask Codex `"merge this PR"` | proposes `/merge-confidently` |
| Ask Codex a recall question | answer cites a `.agents/memory/` file |

## Rollback

Each piece is independently reversible:

```bash
# Skills
rm ~/.codex/skills && mv ~/.codex/skills.pre-symlink-bak ~/.codex/skills

# Project memory
find .agents/memory -type l -delete

# AGENTS.md
cp ~/.codex/AGENTS.md.bak-<timestamp> ~/.codex/AGENTS.md
```

The RAG MCP wiring is purely additive — removing the `[mcp_servers.rag-index]` block from `config.toml` reverts it.

## When NOT to use this pattern

- You're only ever in one tool. Don't add Codex parity if you never run Codex.
- Your machine is shared and you don't want both tools reading the same secrets. Memory files can contain sensitive context — review what `.agents/memory/` resolves to before symlinking.
- Your skill catalog is small enough (<20 entries) that maintaining two copies costs less than the parity setup.

Otherwise: this pattern saves hours of duplicated work and prevents the slow drift where one tool quietly becomes more capable than the other.
