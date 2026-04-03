---
name: secure
description: Security scan checklist — secrets, dependencies, inputs, permissions, injection paths
triggers:
  - security scan
  - check for secrets
  - audit security
  - before release
  - secure this
---

# Secure

Run before merge or release. Block on CRITICAL findings.

## Checks

1. **Secrets** — scan staged changes for API keys, tokens, passwords, .env files
2. **Dependencies** — audit for high/critical vulnerabilities
3. **Inputs** — verify user inputs validated at system boundaries
4. **Permissions** — ensure no overly broad file/network access
5. **Injection** — verify SQL, command, and template injection paths are safe

## Output

```text
Secrets:      ✓ clean | ✗ N findings
Dependencies: ✓ clean | ✗ N high/critical
Inputs:       ✓ validated | ✗ N unvalidated
Permissions:  ✓ minimal | ✗ N broad
Injection:    ✓ safe | ✗ N vulnerable

Overall: PASS | FAIL (N issues)
```

## Rules

- CRITICAL findings block merge — no exceptions
- HIGH findings need explicit acknowledgment
- Never commit .env, credentials, or secret patterns
- Prefer allowlists over blocklists for input validation
- Use parameterized queries — never string concatenation for SQL
