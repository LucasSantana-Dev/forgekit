---
status: shipped
created: 2026-04-15
owner: lucassantana
pr: 58
tags: shipped
shipped: 2026-04-15
---

# remove-handoff-skills

## Goal
Strip handoff/resume skills from `main` (governance-sensitive; vendor-CLI handoff).

## Context
Work environments can't approve cross-vendor session handoff. Keep on `personal`.

## Approach
Delete handoff-related skills on main; confirm `personal` branch retains them.

## Verification
`git diff main..personal -- kit/core/skills/` shows only handoff + resume.
