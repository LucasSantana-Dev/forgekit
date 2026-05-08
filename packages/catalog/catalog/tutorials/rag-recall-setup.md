---
id: rag-recall-setup
title: "Set up RAG recall in your Claude Code session"
description: "How to install and configure the adt-rag skill suite so Claude can retrieve project knowledge without re-reading files on every prompt."
tags:
  - rag
  - skill-md
  - setup
difficulty: beginner
time_estimate: "~10 min"
relates_to:
  - kind: skill
    id: adt-rag
  - kind: skill
    id: adt-rag-recall
  - kind: skill
    id: adt-rag-context-pack
translations:
  pt-BR:
    title: "Configurar RAG recall na sua sessão do Claude Code"
    description: "Como instalar e configurar o conjunto de skills adt-rag para que o Claude recupere conhecimento do projeto sem reler arquivos a cada prompt."
---

## Overview

The `adt-rag` skill suite gives Claude persistent memory across prompts in a session. Instead of re-reading the same files repeatedly, Claude retrieves relevant context from a local vector index — keeping your context window lean and responses faster.

This tutorial covers:
1. Installing the three RAG skills
2. Indexing your project
3. Using `adt-rag-recall` in a prompt
4. Packing context for a dense, focused session

## Prerequisites

- Claude Code CLI installed (`npm i -g @anthropic-ai/claude-code`)
- A project with at least a few source files or docs

---

## Step 1 — Install the skills

```bash
npx forge-kit install adt-rag
npx forge-kit install adt-rag-recall
npx forge-kit install adt-rag-context-pack
```

Each command copies the skill markdown into `~/.claude/skills/`.

Verify:
```bash
ls ~/.claude/skills/ | grep rag
```

You should see `adt-rag.md`, `adt-rag-recall.md`, `adt-rag-context-pack.md`.

---

## Step 2 — Index your project

In your project directory, run:

```bash
npx forge-kit rag index .
```

This walks the repo, embeds relevant files, and writes a `.rag/` index alongside your project. Indexing a typical mid-size repo takes 30–60 seconds.

**Tip:** Add `.rag/` to `.gitignore` — the index is ephemeral and machine-specific.

---

## Step 3 — Use recall in a prompt

Open Claude Code in your project:

```bash
cd my-project
claude
```

Then in a prompt:

```
/adt-rag-recall What does the auth middleware do?
```

Claude retrieves the most relevant files from the index and answers without reading every source file.

---

## Step 4 — Pack context for a focused session

Before starting a complex task, run:

```
/adt-rag-context-pack Refactor the payment flow
```

Claude builds a dense context pack — a ranked summary of the files most relevant to the task — and loads it into the session. This reduces back-and-forth for tasks that touch multiple files.

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| `index not found` error | Run `npx forge-kit rag index .` from the project root |
| Stale results after big refactor | Re-run the index command |
| Index too large | Add irrelevant dirs to `.ragignore` (same syntax as `.gitignore`) |

---

## Next steps

- Combine with `adt-context` to give Claude a curated view of the codebase before indexing
- Use `adt-rag-context-pack` at the start of each new session for long-running projects
