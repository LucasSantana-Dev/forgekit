# Contributing a Doc

A **Doc** is reference material — renders on the catalog site, has no install verb. Pick this over a Skill when the content is something you *read*, not something you *run*.

## 1. Write the markdown

`catalog/docs/<id>.md` — one file per doc.

```markdown
---
id: my-doc-id
title: Human-readable title
description: One sentence on what this doc covers and who should read it.
tags:
  - category
  - topic
source:
  path: optional/path/to/upstream-source.md
  license: MIT
---

# Human-readable title

Markdown body.
```

Schema: [`schemas/doc.schema.json`](../schemas/doc.schema.json).

## 2. Validate + PR

```bash
pnpm run validate
pnpm run index
```

Commit: `feat(catalog): add <id> doc`.

## Skill vs Doc — decision rule

- Can someone **run** it or **apply** it mechanically? → Skill.
- Do they just **read** it for mental models, context, or reference? → Doc.
- Unsure? Default to Doc. Skills should be sparse and actionable.
