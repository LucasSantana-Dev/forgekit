---
name: secure
description: Run a security-first pass for config, credentials, dependency risk, and unsafe operational shortcuts. Use when touching secrets, auth, config, deployment, or risky dependencies.
triggers:
  - secure
  - security review
  - secret hygiene
  - auth change
  - scan for vulns
---

# secure

Use for any work touching secrets, auth, config, deployment, or risky dependencies.

## Check list

- Inline tokens, API keys, bearer headers, or credentials
- Secret-bearing files accidentally modified
- Overbroad permissions or unsafe defaults
- Dependency vulnerabilities introduced or left unresolved
- Auth or validation regressions
- Dangerous release shortcuts

## Output

Signal-first: verdict on the first line, then findings by severity.

```
CLEAR — no risks found

RISK FOUND:
  P0 (blocks merge): [what, where, why it blocks]
  P1 (must fix before merge): [what]
  P2+ (should fix, non-blocking): [what]

Safe to merge: [explicit list, or "nothing yet"]
Containment steps: [exact commands if credential exposure found]
```

## Failure / Stop Conditions

- If a live credential or secret is found exposed in tracked files: halt immediately. Surface the secret type (not value), the file/line, and containment steps. Do not proceed until contained.
- Do not clear a RISK FOUND verdict without confirming the fix was applied and re-checked.
