---
status: shipped
created: 2026-04-15
owner: lucassantana
pr: 61
tags: docs,guides
shipped: 2026-04-18
---

# ai-guides-agents-migration

## Goal
Promote 5 persona skills to `kit/core/agents/` as first-class agent defs.

## Context
Skills conflate personas (code-reviewer) with workflows (commit). Ecosystem convention is separate agents/ dir.

## Approach
code-reviewer, security-auditor, database-reviewer, systematic-debugger, ultrathink-debugger. Remove skill counterpart same commit.

## Verification
kit/core/agents/ ≥5 dirs; migrated skills removed; agents.json updated.
