---
name: mcp-patterns
description: Build robust, secure MCP servers — tool schemas, stateful interactions, async patterns, error handling, and testing
triggers:
  - mcp server
  - mcp tool
  - tool schema
  - function calling
  - stateful tool
  - mcp implementation
  - tool composition
---

# MCP Server Implementation Patterns

## When to Use

Apply this skill when:
- Building or extending an MCP server with new tools
- Designing tool schemas and input/output types
- Implementing stateful tool interactions (session, context, multi-step flows)
- Adding async or streaming tools (long-running operations, progress tracking)
- Composing tools (chaining, parallel execution, result aggregation)
- Adding security checks (input validation, rate limiting, authorization)
- Writing tests for tool handlers and integration flows

## When to Use

**This skill applies to:**
- MCP tool definitions (schema, constraints, error types)
- Tool handler implementations (stateless vs stateful, composition patterns)
- Security boundaries (input sanitization, rate limiting, access control)
- Async patterns (streaming, progress updates, cancellation)
- Error handling (structured errors, exception safety, debugging info)
- Testing strategy (unit, integration, mock external deps)

**Do NOT use this for:**
- General MCP server architecture (that's in `mcp-gateway` phase docs)
- Client-side tool consumption (that's a client skill)
- Prompting LLMs to use tools (that's prompt engineering)

---

## 1. Tool Schema Design

Clear tool schemas reduce ambiguity and enable LLM agents to use tools reliably.

### Core Principles

| Principle | Why | Example |
|-----------|-----|---------|
| **Clear names** | Names are hints to the LLM. Use action verbs + object. | `fetch_user_by_email`, not `get_data` |
| **Typed inputs/outputs** | JSON Schema enforces contracts. Prevents type coercion bugs. | `{email: string, limit: number}` not `{data: any}` |
| **Enum constraints** | Restrict to valid values; LLMs respect enums better than docs. | `status: ["pending", "active", "archived"]` |
| **Required vs Optional** | Mark only truly required fields as required. Optional fields need defaults. | `retries: {type: "integer", default: 3}` |
| **Examples in description** | LLMs learn from examples in description text. | `"example: fetch_user(email='alice@example.com')"` |

### Schema Template

```typescript
{
  name: "tool_name",
  description: "One-line purpose. Example: fetch_user(email='alice@example.com')",
  inputSchema: {
    type: "object",
    properties: {
      email: {
        type: "string",
        description: "User email address",
      },
      includeInactive: {
        type: "boolean",
        description: "Include inactive users",
        default: false,
      },
      roles: {
        type: "array",
        items: {
          type: "string",
          enum: ["admin", "user", "guest"],
        },
        description: "Filter by roles",
      },
    },
    required: ["email"],
  },
}
```

### Anti-Patterns

- ❌ `{type: "object", properties: {...}, required: []}` — no required fields means the schema is unclear
- ❌ `{email: {type: "any"}}` — `any` type defeats validation; use `unknown` + type guards in handler
- ❌ `description: "Fetches data"` — too vague; include examples
- ❌ Putting business logic in schema (e.g., "email must match regex XYZ") — move validation to handler

---

## 2. Stateful Tool Interactions

Tools often need context from previous tool calls (e.g., user ID from a lookup, conversation history).

### Session-Scoped State

Store state in a session object keyed by a session ID. Pass the session ID through tool invocations.

```typescript
// Session store (in-memory or Redis)
const sessionStore = new Map<string, SessionContext>();

interface SessionContext {
  userId?: string;
  token?: string;
  history: ToolCall[];
  createdAt: Date;
}

// Tool handler: read/update session
async function fetchUserById(input: { userId: string }, sessionId: string) {
  const session = sessionStore.get(sessionId);
  if (!session) throw new StructuredError("session_not_found", "Session expired");
  
  const user = await db.users.findById(input.userId);
  session.userId = input.userId; // Update session context
  session.history.push({ tool: "fetchUserById", input, output: user });
  
  return { user, sessionId }; // Include sessionId in response
}
```

### Context Passing Between Tool Calls

Tools accept a context object. Each tool enriches and passes context forward.

```typescript
interface ToolContext {
  user?: User;
  auth?: AuthToken;
  requestId: string;
  breadcrumbs: string[];
}

async function updateUserRole(
  input: { userId: string; role: string },
  context: ToolContext
) {
  // Verify authorization from context
  if (!context.auth || !context.auth.canEditUsers) {
    throw new StructuredError("forbidden", "User cannot edit roles");
  }
  
  // Update context breadcrumbs for debugging
  context.breadcrumbs.push(`updateUserRole(${input.userId})`);
  
  await db.users.update(input.userId, { role: input.role });
  return { success: true, context };
}
```

### Multi-Step Flows

Chain tools and validate state transitions.

```typescript
// Example: payment flow
async function paymentFlow(userId: string, amount: number) {
  // Step 1: Load user
  const userContext = await fetchUser(userId);
  if (!userContext.user) throw new StructuredError("user_not_found");
  
  // Step 2: Check balance
  const balanceContext = await checkBalance(userContext);
  if (balanceContext.balance < amount) {
    throw new StructuredError("insufficient_funds");
  }
  
  // Step 3: Create charge (idempotent key prevents double-charge)
  const chargeId = crypto.randomUUID();
  const result = await createCharge(userId, amount, chargeId, balanceContext);
  
  return { chargeId, status: result.status };
}
```

---

## 3. Error Handling in Tools

Structured errors enable LLMs to recover or escalate intelligently.

### Structured Error Pattern

```typescript
interface StructuredError {
  type: string;           // Machine-readable error type
  message: string;        // Human-readable message
  details?: Record<string, unknown>; // Context for debugging
  retryable?: boolean;    // Can LLM retry this?
}

// Create structured errors instead of throwing raw exceptions
function throwStructuredError(
  type: string,
  message: string,
  details?: Record<string, unknown>
): never {
  const error = { type, message, details };
  console.error(`[StructuredError] ${type}: ${message}`, details);
  throw error;
}

// In tool handlers
async function fetchUser(input: { id: string }) {
  const user = await db.users.findById(input.id);
  
  if (!user) {
    // Structured error, not generic Error
    throwStructuredError(
      "user_not_found",
      `User ${input.id} not found`,
      { userId: input.id, searched: new Date().toISOString() }
    );
  }
  
  return user;
}
```

### Error Codes by Category

| Category | Type | Retryable | Example |
|----------|------|-----------|---------|
| **Validation** | `invalid_input` | No | Missing required field |
| **Auth** | `unauthorized` | No | Invalid API key |
| **Permission** | `forbidden` | No | User lacks permission |
| **Not Found** | `not_found` | No | Resource doesn't exist |
| **Rate Limit** | `rate_limited` | Yes (exponential backoff) | Too many requests |
| **Temporary** | `service_unavailable` | Yes (exponential backoff) | Database timeout |
| **Conflict** | `conflict` | No | Duplicate key |
| **Internal** | `internal_error` | Yes (exponential backoff) | Unexpected server error |

### Error Handling in Tool Handlers

```typescript
async function toolHandler(input: ToolInput): Promise<ToolOutput> {
  try {
    // Validate input
    if (!input.email || !isValidEmail(input.email)) {
      throwStructuredError(
        "invalid_input",
        "Email is required and must be a valid email address",
        { provided: input.email }
      );
    }
    
    // Attempt operation
    const result = await operation(input);
    return result;
    
  } catch (err) {
    // Catch external errors and wrap in structured format
    if (err instanceof DatabaseError) {
      throwStructuredError(
        "service_unavailable",
        "Database temporarily unavailable",
        { originalError: err.message }
      );
    }
    
    // Don't catch StructuredError — let it propagate
    throw err;
  }
}
```

---

## 4. Async Tool Patterns

Async patterns handle long-running operations and streaming results.

### Streaming Results

For tools that return large datasets or continuous results:

```typescript
async function* streamLargeDataset(
  input: { limit: number; offset: number }
): AsyncGenerator<DataChunk> {
  let processed = 0;
  
  for await (const batch of db.query(input)) {
    // Yield chunks as they become available
    yield {
      data: batch,
      processed,
      total: await db.estimateTotal(),
    };
    processed += batch.length;
    
    if (processed >= input.limit) break;
  }
}

// In tool handler, collect stream into array (MCP doesn't support streaming yet)
async function fetchLargeDataset(input: ToolInput) {
  const chunks = [];
  for await (const chunk of streamLargeDataset(input)) {
    chunks.push(chunk);
  }
  return { chunks, totalBytes: chunks.reduce((s, c) => s + JSON.stringify(c).length, 0) };
}
```

### Progress Updates for Long-Running Tools

Return progress info incrementally:

```typescript
interface ProgressUpdate {
  status: "running" | "completed" | "failed";
  progress: number; // 0-100
  message: string;
  eta?: number; // Seconds remaining
}

async function processLargeFile(input: { fileId: string }): Promise<ProgressUpdate> {
  const file = await storage.get(input.fileId);
  const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
  
  const results = [];
  for (let i = 0; i < totalChunks; i++) {
    const chunk = await file.getChunk(i);
    const processed = await process(chunk);
    results.push(processed);
    
    const progress = Math.round((i / totalChunks) * 100);
    console.log(`[${input.fileId}] Processing: ${progress}%`);
    
    // In real MCP, push progress updates via a channel
    // For now, include final progress in response
    if (i === totalChunks - 1) {
      return {
        status: "completed",
        progress: 100,
        message: "File processing complete",
      };
    }
  }
}
```

### Cancellation

Provide a way to cancel long-running tools:

```typescript
const activeOperations = new Map<string, AbortController>();

async function startLongOperation(input: { operationId: string }) {
  const controller = new AbortController();
  activeOperations.set(input.operationId, controller);
  
  try {
    const result = await longRunningTask(controller.signal);
    return { success: true, result };
  } finally {
    activeOperations.delete(input.operationId);
  }
}

// Cancel an operation
async function cancelOperation(input: { operationId: string }) {
  const controller = activeOperations.get(input.operationId);
  if (controller) {
    controller.abort();
    return { success: true, cancelled: input.operationId };
  }
  throwStructuredError("not_found", `Operation ${input.operationId} not found`);
}
```

---

## 5. Tool Composition

Combine multiple tools to solve complex problems.

### Tool Chaining

Execute tools sequentially, passing outputs to inputs:

```typescript
async function chainedFlow(input: { email: string; action: string }) {
  // Tool 1: Fetch user by email
  const userResult = await callTool("fetch_user", { email: input.email });
  if (userResult.type === "error") {
    throwStructuredError(userResult.type, userResult.message);
  }
  const userId = userResult.userId;
  
  // Tool 2: Get user permissions
  const permsResult = await callTool("get_permissions", { userId });
  const permissions = permsResult.permissions;
  
  // Tool 3: Execute action if permitted
  if (permissions.includes(input.action)) {
    const actionResult = await callTool("execute_action", { userId, action: input.action });
    return { success: true, userId, action: input.action };
  }
  
  throwStructuredError("forbidden", `User lacks permission for ${input.action}`);
}
```

### Parallel Execution

Execute independent tools concurrently:

```typescript
async function parallelFetch(userId: string) {
  // Fetch user profile, permissions, and audit log in parallel
  const [profile, permissions, auditLog] = await Promise.all([
    callTool("get_user_profile", { userId }),
    callTool("get_permissions", { userId }),
    callTool("get_audit_log", { userId, limit: 100 }),
  ]);
  
  return { profile, permissions, auditLog };
}
```

### Result Aggregation

Combine results from multiple tools:

```typescript
async function aggregateUserData(userId: string) {
  const [profile, activity, settings] = await Promise.all([
    callTool("get_profile", { userId }),
    callTool("get_recent_activity", { userId, days: 30 }),
    callTool("get_settings", { userId }),
  ]);
  
  return {
    profile: profile.data,
    activitySummary: {
      totalEvents: activity.events.length,
      lastActive: activity.events[0]?.timestamp,
    },
    settings: settings.preferences,
  };
}
```

---

## 6. Security Patterns

Protect tool execution from abuse and unauthorized access.

### Input Sanitization

Validate and sanitize all inputs:

```typescript
function sanitizeEmail(email: string): string {
  // Whitelist valid characters, reject obvious injection attempts
  if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
    throwStructuredError("invalid_input", "Invalid email format", { email });
  }
  return email.toLowerCase().trim();
}

function sanitizeQuery(query: string): string {
  // Prevent SQL injection: use parameterized queries, not string concat
  if (query.includes(";") || query.includes("--") || query.includes("/*")) {
    throwStructuredError("invalid_input", "Query contains forbidden characters");
  }
  return query;
}

async function searchUsers(input: { query: string }) {
  const safe = sanitizeQuery(input.query);
  // Use parameterized query, not string interpolation
  return db.query("SELECT * FROM users WHERE name LIKE ?", [safe]);
}
```

### Rate Limiting per Tool

Prevent abuse via excessive calls:

```typescript
const rateLimits = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(toolName: string, userId: string, limitsPerMinute: number): void {
  const key = `${toolName}:${userId}`;
  const now = Date.now();
  const record = rateLimits.get(key) || { count: 0, resetAt: now + 60000 };
  
  if (now > record.resetAt) {
    // Window expired, reset
    record.count = 0;
    record.resetAt = now + 60000;
  }
  
  record.count++;
  rateLimits.set(key, record);
  
  if (record.count > limitsPerMinute) {
    throwStructuredError("rate_limited", `Too many calls to ${toolName}`, {
      resetAt: record.resetAt,
      retryAfter: Math.ceil((record.resetAt - now) / 1000),
    });
  }
}

// In tool handler
async function expensiveTool(input: ToolInput, userId: string) {
  checkRateLimit("expensiveTool", userId, 10); // Max 10 per minute per user
  // ... rest of handler
}
```

### Authorization Checks

Verify permissions before execution:

```typescript
interface AuthContext {
  userId: string;
  roles: string[];
  permissions: string[];
}

function requirePermission(auth: AuthContext, permission: string): void {
  if (!auth.permissions.includes(permission)) {
    throwStructuredError("forbidden", `Missing permission: ${permission}`, {
      required: permission,
      available: auth.permissions,
    });
  }
}

async function deleteUser(input: { userId: string }, auth: AuthContext) {
  requirePermission(auth, "users:delete");
  // ... proceed with deletion
}

async function viewSensitiveData(input: { userId: string }, auth: AuthContext) {
  // Verify both permission AND that they're not viewing their own account
  requirePermission(auth, "data:view");
  
  if (input.userId === auth.userId && !auth.permissions.includes("data:view_own")) {
    throwStructuredError("forbidden", "Cannot view own data without explicit permission");
  }
  
  return getSensitiveData(input.userId);
}
```

---

## 7. Testing Strategy for MCP Servers

### Unit Testing Tool Handlers

Test each tool handler in isolation:

```typescript
describe("Tool: fetchUserById", () => {
  it("returns user when found", async () => {
    const user = { id: "123", name: "Alice" };
    jest.spyOn(db.users, "findById").mockResolvedValue(user);
    
    const result = await fetchUserById({ userId: "123" });
    expect(result).toEqual(user);
  });
  
  it("throws structured error when not found", async () => {
    jest.spyOn(db.users, "findById").mockResolvedValue(null);
    
    await expect(fetchUserById({ userId: "999" })).rejects.toEqual(
      expect.objectContaining({
        type: "user_not_found",
        message: expect.stringMatching("not found"),
      })
    );
  });
  
  it("validates input email", async () => {
    await expect(
      fetchUserByEmail({ email: "not-an-email" })
    ).rejects.toEqual(
      expect.objectContaining({
        type: "invalid_input",
      })
    );
  });
});
```

### Integration Testing Tool Chains

Test realistic multi-tool workflows:

```typescript
describe("Payment Flow", () => {
  it("completes successful payment", async () => {
    // Setup: create user with sufficient balance
    const userId = await createTestUser({ balance: 1000 });
    
    // Execute flow
    const result = await paymentFlow(userId, 500);
    
    // Verify: charge created, balance updated
    expect(result.status).toBe("completed");
    const updatedUser = await db.users.findById(userId);
    expect(updatedUser.balance).toBe(500);
  });
  
  it("rejects payment when insufficient balance", async () => {
    const userId = await createTestUser({ balance: 100 });
    
    await expect(paymentFlow(userId, 500)).rejects.toEqual(
      expect.objectContaining({
        type: "insufficient_funds",
      })
    );
  });
});
```

### Mocking External Dependencies

Mock only external services, not your tool logic:

```typescript
describe("Tool: fetchFromExternalAPI", () => {
  beforeEach(() => {
    // Mock HTTP client, not the tool handler
    jest.spyOn(httpClient, "get").mockResolvedValue({
      status: 200,
      data: { id: "ext123", value: "test" },
    });
  });
  
  it("transforms external API response", async () => {
    const result = await fetchFromExternalAPI({ externalId: "ext123" });
    expect(result).toEqual({ id: "ext123", value: "test" });
  });
  
  it("handles API errors gracefully", async () => {
    jest.spyOn(httpClient, "get").mockRejectedValue(new Error("API timeout"));
    
    await expect(fetchFromExternalAPI({ externalId: "ext123" })).rejects.toEqual(
      expect.objectContaining({
        type: "service_unavailable",
      })
    );
  });
});
```

---

## Debugging Checklist

When a tool behaves unexpectedly:

- [ ] Is the schema clear? Check input/output examples in description
- [ ] Are you validating input types? Add assertions at handler start
- [ ] Is state being shared correctly? Log session/context at key points
- [ ] Are errors structured? Check for raw `throw new Error()`
- [ ] Are async operations awaited? Check for unhandled promise rejections
- [ ] Is rate limiting working? Check timestamp windows
- [ ] Are permissions enforced? Trace authorization flow
- [ ] Are mocks in tests matching real behavior? Run integration tests against real deps

---

## Rules

1. **Never surface raw exceptions** — wrap in StructuredError with type + message + details
2. **Validate all inputs** — sanitize strings, check types, reject unknowns
3. **Keep tool schemas focused** — one tool per action, not multi-purpose tools
4. **Pass context explicitly** — don't rely on global state or thread-local storage
5. **Make errors recoverable** — set `retryable` flag, include retry hints
6. **Test composition patterns** — unit test handlers, integration test chains
7. **Log structured data** — include timestamps, user IDs, request IDs for debugging
8. **Rate limit high-impact tools** — especially external API calls, write operations, deletions
9. **Fail open for reads, closed for writes** — reads can be cached; writes need authorization
10. **Keep async operations cancellable** — provide a way to abort long-running tools
