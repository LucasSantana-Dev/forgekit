---
status: shipped
created: 2026-04-15
owner: lucassantana
pr: 61
tags: docs,guides
shipped: 2026-04-18
---

# ai-guides-hooks-pack

## Goal
Ship `kit/hooks/` with 3 edit-moment hooks + `--with-hooks` install flag.

## Context
No public repo ships edit-time hooks — signature feature per github-ai-workflow-research.md.

## Approach
post-edit-format.sh, post-edit-typecheck.sh, evaluate-response.sh. Default OFF, opt-in. `command -v X >/dev/null || exit 0` guards.

## Verification
`install-rag.sh --with-hooks` creates symlinks; advisory output only, no file writes.
