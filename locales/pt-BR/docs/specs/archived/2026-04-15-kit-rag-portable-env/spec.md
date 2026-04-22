---
status: shipped
created: 2026-04-15
owner: lucassantana
pr: 55
tags: shipped
shipped: 2026-04-15
---

> **Tradução pendente** — conteúdo em inglês, aguardando tradução para pt-BR. Ver `bilingual-readme-sync` skill.



# kit-rag-portable-env

## Goal
Add `.env.example` + env-sourcing for kit/rag so adopters run without editing code.

## Context
PR #54 shipped module; adopters hit hardcoded paths. Follow-up PR #55.

## Approach
kit/rag/.env.example with RAG_HOME, RAG_REPOS, RAG_WORK_MODE. install-rag.sh seeds + sources.

## Verification
Fresh-clone install works on blank mac without manual env edits.
