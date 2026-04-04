---
name: root-cause-debug
description: Debug systematically before changing code — reproduce, gather evidence, form a hypothesis, test the smallest fix
triggers:
  - debug
  - root cause
  - why is this failing
  - bug investigation
  - systematic debug
---

# Root Cause Debug

Reproduce the problem, gather evidence, form one hypothesis, and test the smallest fix that proves or disproves it.

## Steps

1. **Reproduce** — run the failing command or scenario
2. **Gather evidence** — logs, error output, stack traces, state diffs
3. **Compare** — expected behavior vs actual behavior
4. **Hypothesize** — form one root-cause hypothesis from the evidence
5. **Test minimal fix** — apply the smallest change that validates the hypothesis

## Output

```text
Reproduction: <command or scenario>
Evidence:     <key finding>
Root cause:   <hypothesis>
Fix:          <minimal change>
Verified:     <pass/fail after fix>
```

## Rules

- Never bundle multiple unrelated fixes
- Never claim root cause without evidence
- Reproduce before theorizing
- Test the smallest fix first, not the most thorough refactor
