---
status: proposed
created: 2026-04-15
owner: lucassantana
pr: 
tags: docs,guides
---

> **Tradução pendente** — conteúdo em inglês, aguardando tradução para pt-BR. Ver `bilingual-readme-sync` skill.



# ai-guides-primitives-taxonomy

## Goal
Ship `docs/guides/primitives.md` — the blocking 4-primitive model (Rules / Skills / Agents / Hooks) with decision flowchart.

## Context
Peer repos formalize the taxonomy; ours conflates skills+agents. Reader must answer 'rule/skill/agent/hook?' in ≤1 min.

## Approach
One decision flowchart + table: input-event, lifecycle, example. Annotate existing catalog, don't rename.

## Verification
`rag_query 'primitives rules skills agents hooks'` returns primitives.md top-1.
