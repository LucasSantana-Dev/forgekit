---
status: shipped
created: 2026-04-15
owner: lucassantana
pr: 48
tags: shipped
shipped: 2026-04-15
---

> **Tradução pendente** — conteúdo em inglês, aguardando tradução para pt-BR. Ver `bilingual-readme-sync` skill.



# skill-auto-invocation

## Goal
Document full automation rules: when agents auto-fire skills without explicit ask.

## Context
Agents waiting for 'use recall' defeats the productivity pitch.

## Approach
Hook-level table + agent-level auto-invoke decision protocol. Destructive ops still confirm.

## Verification
`~/.claude/standards/skill-auto-invoke.md` loaded via standards index; referenced by agent-routing.md.
