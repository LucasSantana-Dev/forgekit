---
name: mcp-patterns
description: Build robust MCP servers — tool schemas, stateful interactions, error handling, tool composition. Use when defining schemas, implementing flows, composing tools, or testing.
triggers:
  - mcp server
  - mcp tool
  - tool schema
  - stateful tool
  - tool composition
---

# MCP Server Implementation Patterns

## What It Does

Patterns for reliable MCP tool handlers: clear schemas, stateful interactions, structured errors, tool composition, and security.

## When to Use

- Tool schemas (clear names, typed inputs/outputs)
- Stateful interactions (session context, multi-step flows)
- Error handling (structured errors, retryable flags)
- Tool composition (chaining, parallel execution)
- Security (input validation, rate limiting)
- Testing (unit, integration, mocking)

## Tool Schema Pattern

Clear names, typed inputs, validate, execute, wrap errors.

```typescript
const schema = {
  name: "fetch_user_by_email",
  description: "Fetch user by email. Example: fetch_user_by_email(email='alice@example.com')",
  inputSchema: {
    type: "object",
    properties: { email: { type: "string" }, includeInactive: { type: "boolean", default: false } },
    required: ["email"],
  },
};

async function handler(input: { email: string; includeInactive?: boolean }) {
  if (!isValidEmail(input.email)) throwStructuredError("invalid_input", "Invalid email");
  const user = await db.users.findByEmail(input.email);
  if (!user) throwStructuredError("not_found", "User not found");
  return user;
}

server.tool("fetch_user_by_email", schema, handler);
```

## Stateful Interactions: Session Context

Store state by session ID; pass through tool calls.

```typescript
async function updateRole(input: { userId: string; role: string }, sessionId: string) {
  const session = sessionStore.get(sessionId);
  if (!session?.token) throwStructuredError("unauthorized", "Not authenticated");
  await db.users.update(input.userId, { role: input.role });
  session.history.push({ tool: "updateRole", input, output: { success: true } });
  return { success: true, sessionId };
}
```

## Error Handling: Structured Errors

Return `{type, message, details, retryable}`. Never throw raw exceptions.

```typescript
function throwStructuredError(type: string, message: string, details?: unknown): never {
  const retryable = ["rate_limited", "service_unavailable"].includes(type);
  throw { type, message, details, retryable };
}

// Error types: invalid_input, unauthorized, forbidden, not_found, rate_limited, service_unavailable
```

## Tool Composition: Chaining

Execute sequentially, validate state. Use idempotency keys.

```typescript
async function paymentFlow(userId: string, amount: number) {
  const user = await callTool("fetch_user", { userId });
  const acct = await callTool("check_balance", { userId });
  if (acct.balance < amount) throwStructuredError("insufficient_funds", "Low balance");
  return callTool("create_charge", { userId, amount, idempotencyKey: crypto.randomUUID() });
}
```

## Rules

1. Clear names — action verb + object
2. Typed schemas — use JSON Schema
3. Structured errors — type + message + retryable
4. Validate all inputs
5. Rate-limit high-impact tools
6. Explicit contracts
7. Session context, not globals
8. Fail open for reads, closed for writes
9. Test composition — unit + integration
10. Async cancellable

See REFERENCE.md for examples, async patterns, testing, and schemas.
