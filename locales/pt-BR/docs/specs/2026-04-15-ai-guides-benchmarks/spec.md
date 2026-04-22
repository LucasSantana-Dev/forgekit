---
status: proposed
created: 2026-04-15
owner: lucassantana
pr: 
tags: docs,guides
---

> **Tradução pendente** — conteúdo em inglês, aguardando tradução para pt-BR. Ver `bilingual-readme-sync` skill.



# ai-guides-benchmarks

## Goal
Ship `docs/guides/benchmarks.md` with eval numbers + reproduction steps.

## Context
Presenting at work needs reproducible numbers; MRR 0.68 / Hit@3 0.70 / Hit@5 0.76 baseline from `~/.claude/rag-index/eval/baseline.json`.

## Approach
Copy baseline JSON summary; document methodology (50 cases); show how to re-run locally.

## Verification
Baseline numbers match `eval/baseline.json`; reproduction command runs to completion.
