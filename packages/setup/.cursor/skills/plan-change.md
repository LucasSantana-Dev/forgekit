---
name: plan-change
description: Plan a code change before editing — identify files, sequence steps, set verification criteria
triggers:
  - plan change
  - plan before coding
  - what files to change
  - execution plan
  - change plan
---

# Plan Change

Restate the task, identify the minimum files involved, produce an ordered plan, and define how to verify each step.

## Steps

1. **Restate the task** — one sentence, no ambiguity
2. **Identify files** — minimum set of files and systems involved
3. **Sequence the plan** — ordered steps with dependencies marked
4. **Set verification** — what command or check proves each step worked
5. **Flag risks** — ambiguity, side effects, or unknowns before editing

## Output

```text
Task:    <one-sentence restatement>
Files:   <file list>
Plan:    1. <step> → verify: <check>
         2. <step> → verify: <check>
Risks:   <list or none>
```

## Rules

- Never jump into implementation if the request is ambiguous
- Never produce a huge abstract plan for a small task
- Include verification criteria for each meaningful step
- Call out risks before editing, not after
