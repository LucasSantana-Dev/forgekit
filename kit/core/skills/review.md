---
name: review
description: Review code changes for bugs, security issues, test coverage, and style
triggers:
  - review this
  - check my code
  - code review
  - look for issues
---

# Review

Systematic code review covering correctness, security, tests, and style.

## Checklist

### Correctness
- [ ] Logic handles all branches (null, empty, edge cases)
- [ ] Error paths are handled and propagated correctly
- [ ] No silent failures (catch blocks that swallow errors)
- [ ] Async/await used correctly — no forgotten await

### Security
- [ ] No secrets, credentials, or PII in code
- [ ] User inputs validated at system boundaries
- [ ] SQL/command injection not possible
- [ ] Dependencies: no new high/critical vulnerabilities

### Tests
- [ ] New behavior is tested
- [ ] Edge cases covered
- [ ] Tests would catch a regression if the code broke

### Style
- [ ] Functions under 50 lines
- [ ] No speculative code added beyond what was asked
- [ ] No commented-out code left behind

## Output Format

For each issue found:
```text
[SEVERITY] file:line — description
  Why: <why this is a problem>
  Fix: <specific suggestion>
```

Severities: `CRITICAL` | `HIGH` | `MEDIUM` | `LOW` | `INFO`

Only report issues you are confident about. No noise.
