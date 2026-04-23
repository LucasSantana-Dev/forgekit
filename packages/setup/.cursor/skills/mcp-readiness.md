---
name: mcp-readiness
description: Check whether MCP-backed workflows are usable on this machine
triggers:
  - mcp ready
  - mcp setup check
  - mcp missing
  - check mcp config
  - mcp troubleshoot
---

# MCP Readiness

Verify that MCP config files exist and provider tokens are present — distinguish config problems from auth problems.

## Steps

1. **Check config files** — verify MCP configuration files exist in expected locations
2. **Check provider tokens** — confirm required environment variables or auth tokens are set
3. **Classify problems** — config missing vs auth missing vs both
4. **Report next fix** — smallest action to reach a working state

## Output

```text
Config:    found | missing (<path>)
Auth:      OK | missing (<provider>)
Status:    ready | blocked
Action:    <next fix>
```

## Rules

- Never expose secret values or tokens
- Never claim MCP readiness if auth is still missing
- Distinguish config problems from auth problems explicitly
- Report the smallest next fix, not a full setup guide
