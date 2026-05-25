# MCP Server Implementation Patterns — Reference

## TypeScript Interfaces and Config Schemas

### Tool Definition

```typescript
interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: JSONSchema;
  handler: (input: unknown, context?: ToolContext) => Promise<unknown>;
}

interface JSONSchema {
  type: "object" | "string" | "number" | "boolean" | "array";
  properties?: Record<string, JSONSchema>;
  required?: string[];
  items?: JSONSchema;
  enum?: unknown[];
  default?: unknown;
  description?: string;
}
```

### Structured Error

```typescript
interface StructuredError {
  type: string;
  message: string;
  details?: Record<string, unknown>;
  retryable?: boolean;
}

// Common error types
type ErrorType = 
  | "invalid_input"
  | "unauthorized"
  | "forbidden"
  | "not_found"
  | "conflict"
  | "rate_limited"
  | "service_unavailable"
  | "internal_error";

const ERROR_RETRYABLE: Record<ErrorType, boolean> = {
  invalid_input: false,
  unauthorized: false,
  forbidden: false,
  not_found: false,
  conflict: false,
  rate_limited: true,
  service_unavailable: true,
  internal_error: true,
};
```

### Session Context

```typescript
interface SessionContext {
  sessionId: string;
  userId?: string;
  token?: string;
  authenticated: boolean;
  createdAt: Date;
  lastActivity: Date;
  data: Record<string, unknown>;
  history: Array<{
    tool: string;
    input: unknown;
    output: unknown;
    timestamp: Date;
    durationMs: number;
  }>;
}

interface ToolContext {
  sessionId?: string;
  userId?: string;
  requestId: string;
  timestamp: Date;
  breadcrumbs: string[];
}
```

## Async Patterns

### Streaming Results (Buffered)

Since MCP doesn't support streaming in real-time, buffer results and return as array:

```typescript
interface StreamedResult<T> {
  items: T[];
  totalItems: number;
  hasMore: boolean;
  pageToken?: string;
}

async function fetchLargeDataset(input: { limit: number; offset: number }): Promise<StreamedResult<DataItem>> {
  const items: DataItem[] = [];
  let totalCount = 0;
  
  for await (const batch of db.query({ limit: input.limit, offset: input.offset })) {
    items.push(...batch.items);
    totalCount = batch.total;
    
    if (items.length >= input.limit) break;
  }
  
  return {
    items,
    totalItems: totalCount,
    hasMore: input.offset + items.length < totalCount,
    pageToken: input.offset + items.length > 0 ? String(input.offset + items.length) : undefined,
  };
}
```

### Progress Tracking

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
  
  for (let i = 0; i < totalChunks; i++) {
    const chunk = await file.getChunk(i);
    const processed = await process(chunk);
    
    // Log progress (client will poll)
    const progress = Math.round(((i + 1) / totalChunks) * 100);
    console.log(`[${input.fileId}] Progress: ${progress}%`);
  }
  
  return { status: "completed", progress: 100, message: "File processing complete" };
}
```

### Cancellation Support

```typescript
const activeOperations = new Map<string, AbortController>();

async function startLongOperation(input: { operationId: string }): Promise<unknown> {
  const controller = new AbortController();
  activeOperations.set(input.operationId, controller);
  
  try {
    const result = await longRunningTask(controller.signal);
    return { success: true, result };
  } catch (err) {
    if ((err as Error).name === "AbortError") {
      return { success: false, cancelled: true };
    }
    throw err;
  } finally {
    activeOperations.delete(input.operationId);
  }
}

async function cancelOperation(input: { operationId: string }): Promise<void> {
  const controller = activeOperations.get(input.operationId);
  if (!controller) {
    throwStructuredError("not_found", `Operation ${input.operationId} not found`);
  }
  controller.abort();
}
```

## Error Handling Patterns

### Input Validation

```typescript
function validateEmail(email: string): string {
  const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!pattern.test(email)) {
    throwStructuredError("invalid_input", "Invalid email format", { provided: email });
  }
  return email.toLowerCase().trim();
}

function validateRange(value: number, min: number, max: number): number {
  if (value < min || value > max) {
    throwStructuredError("invalid_input", `Value must be between ${min} and ${max}`, {
      provided: value,
      min,
      max,
    });
  }
  return value;
}

function validateRequired<T>(value: T | null | undefined, fieldName: string): T {
  if (value === null || value === undefined) {
    throwStructuredError("invalid_input", `${fieldName} is required`);
  }
  return value;
}
```

### Wrapping External Errors

```typescript
async function callExternalAPI(url: string, options: unknown): Promise<unknown> {
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      throwStructuredError(
        response.status === 429 ? "rate_limited" : "service_unavailable",
        `External API returned ${response.status}`,
        { status: response.status, url }
      );
    }
    return response.json();
  } catch (err) {
    if (err instanceof TypeError) {
      // Network error
      throwStructuredError("service_unavailable", "Network error connecting to external API", {
        originalError: (err as Error).message,
      });
    }
    // Rethrow StructuredError
    throw err;
  }
}
```

### Error Recovery

```typescript
async function executeWithFallback<T>(
  primary: () => Promise<T>,
  fallback: () => Promise<T>,
  name: string
): Promise<T> {
  try {
    return await primary();
  } catch (err) {
    const se = err as StructuredError;
    if (!se.retryable) throw err; // Non-recoverable, fail fast
    
    console.warn(`[${name}] Primary failed, attempting fallback`, { error: se.type });
    try {
      return await fallback();
    } catch (fallbackErr) {
      console.error(`[${name}] Both primary and fallback failed`);
      throw fallbackErr;
    }
  }
}
```

## Tool Composition Patterns

### Sequential Tool Chaining

```typescript
async function researchFlow(topic: string): Promise<unknown> {
  // Step 1: Search for sources
  const searchResult = await callTool("search", { query: topic });
  if (!searchResult.results?.length) {
    throwStructuredError("not_found", `No sources found for topic: ${topic}`);
  }
  
  // Step 2: Analyze each source
  const analyses = await Promise.all(
    searchResult.results.map((source: unknown) =>
      callTool("analyze_source", { source })
    )
  );
  
  // Step 3: Synthesize findings
  return callTool("synthesize", { analyses });
}
```

### Parallel Tool Execution

```typescript
async function aggregateUserProfile(userId: string): Promise<unknown> {
  const [profile, activity, settings, permissions] = await Promise.all([
    callTool("get_profile", { userId }),
    callTool("get_activity", { userId, days: 30 }),
    callTool("get_settings", { userId }),
    callTool("get_permissions", { userId }),
  ]);
  
  return {
    profile,
    activitySummary: {
      events: activity.events?.length || 0,
      lastActive: activity.events?.[0]?.timestamp,
    },
    settings,
    permissions,
  };
}
```

### Conditional Tool Flow

```typescript
async function paymentFlow(
  userId: string,
  amount: number,
  forceRetry: boolean = false
): Promise<unknown> {
  // Step 1: Verify user exists
  const user = await callTool("fetch_user", { userId });
  
  // Step 2: Check permissions (conditional)
  if (amount > 1000) {
    const permissions = await callTool("get_permissions", { userId });
    if (!permissions.canTransferLarge) {
      throwStructuredError("forbidden", "User cannot transfer amounts > $1000");
    }
  }
  
  // Step 3: Check balance
  const account = await callTool("check_balance", { userId });
  if (account.balance < amount) {
    if (!forceRetry) {
      throwStructuredError("insufficient_funds", "Account balance too low");
    }
    // Attempt to refund pending transactions first
    await callTool("process_refunds", { userId });
  }
  
  // Step 4: Execute charge with idempotency
  return callTool("create_charge", {
    userId,
    amount,
    idempotencyKey: crypto.randomUUID(),
  });
}
```

## Rate Limiting Implementation

### Per-User Rate Limiting

```typescript
class RateLimiter {
  private limits = new Map<string, { count: number; resetAt: number }>();
  
  check(key: string, limitsPerMinute: number): void {
    const now = Date.now();
    let record = this.limits.get(key);
    
    if (!record || now > record.resetAt) {
      record = { count: 0, resetAt: now + 60000 };
      this.limits.set(key, record);
    }
    
    record.count++;
    
    if (record.count > limitsPerMinute) {
      throwStructuredError("rate_limited", "Too many requests", {
        retryAfter: Math.ceil((record.resetAt - now) / 1000),
        limit: limitsPerMinute,
        current: record.count,
      });
    }
  }
}

const limiter = new RateLimiter();

async function expensiveOperation(userId: string, input: unknown): Promise<unknown> {
  limiter.check(`expensiveOp:${userId}`, 10); // 10 per minute
  // Execute operation
}
```

### Sliding Window Rate Limiting

```typescript
class SlidingWindowLimiter {
  private windows = new Map<string, number[]>();
  
  check(key: string, limitsPerMinute: number): void {
    const now = Date.now();
    const windowSize = 60000; // 1 minute
    
    let timestamps = this.windows.get(key) || [];
    
    // Remove old entries outside the window
    timestamps = timestamps.filter(t => now - t < windowSize);
    
    if (timestamps.length >= limitsPerMinute) {
      const oldestTimestamp = timestamps[0];
      const retryAfter = Math.ceil((oldestTimestamp + windowSize - now) / 1000);
      throwStructuredError("rate_limited", "Too many requests", { retryAfter });
    }
    
    timestamps.push(now);
    this.windows.set(key, timestamps);
  }
}
```

## Testing Strategy

### Unit Testing Tool Handlers

```typescript
describe("Tool: fetch_user_by_email", () => {
  it("returns user when found", async () => {
    const mockDb = {
      users: {
        findByEmail: jest.fn().mockResolvedValue({ id: "123", name: "Alice" }),
      },
    };
    
    const result = await handleFetchUser({ email: "alice@example.com" }, mockDb);
    expect(result).toEqual({ id: "123", name: "Alice" });
  });
  
  it("throws structured error when not found", async () => {
    const mockDb = {
      users: {
        findByEmail: jest.fn().mockResolvedValue(null),
      },
    };
    
    await expect(handleFetchUser({ email: "unknown@example.com" }, mockDb))
      .rejects.toEqual(expect.objectContaining({
        type: "not_found",
        retryable: false,
      }));
  });
  
  it("validates email format", async () => {
    await expect(handleFetchUser({ email: "not-an-email" }, {} as any))
      .rejects.toEqual(expect.objectContaining({
        type: "invalid_input",
      }));
  });
});
```

### Integration Testing Tool Chains

```typescript
describe("Payment Flow", () => {
  it("completes successful payment", async () => {
    const userId = "test-user-123";
    
    // Setup: create user with sufficient balance
    await setupTestUser(userId, { balance: 1000 });
    
    // Execute flow
    const result = await paymentFlow(userId, 500);
    
    // Verify: charge created and balance updated
    expect(result.status).toBe("completed");
    const updatedUser = await db.users.findById(userId);
    expect(updatedUser.balance).toBe(500);
  });
  
  it("rejects payment with insufficient balance", async () => {
    const userId = "poor-user-456";
    await setupTestUser(userId, { balance: 100 });
    
    await expect(paymentFlow(userId, 500))
      .rejects.toEqual(expect.objectContaining({
        type: "insufficient_funds",
      }));
  });
});
```

### Mocking Patterns

```typescript
// Mock external API
jest.mock("./externalApi", () => ({
  fetchFromAPI: jest.fn().mockResolvedValue({
    status: 200,
    data: { id: "ext-123", value: "test" },
  }),
}));

// Mock database
const mockDb = {
  users: {
    findByEmail: jest.fn(),
    update: jest.fn().mockResolvedValue({ success: true }),
  },
};

// Mock tools
const mockCallTool = jest.fn()
  .mockImplementation((name, input) => {
    if (name === "fetch_user") return Promise.resolve({ id: "user-123" });
    if (name === "check_balance") return Promise.resolve({ balance: 1000 });
    throw new Error(`Unexpected tool: ${name}`);
  });
```

## Resource and Prompt Patterns

### Resources (Static Content)

```typescript
server.resource(
  "file:///docs/api-reference",
  {
    uri: "file:///docs/api-reference",
    mimeType: "text/markdown",
    name: "API Reference",
  },
  async () => ({
    contents: [
      {
        uri: "file:///docs/api-reference",
        mimeType: "text/markdown",
        text: `# API Reference\n\n## Endpoints\n\n...`,
      },
    ],
  })
);
```

### Prompts (Reusable Templates)

```typescript
server.prompt(
  "code_review",
  {
    description: "Review code for bugs and style",
    arguments: [
      { name: "language", description: "Programming language" },
      { name: "style", description: "Strict or lenient", optional: true },
    ],
  },
  async (args: Record<string, string>) => ({
    messages: [
      {
        role: "user",
        content: `Review the following ${args.language} code for bugs and style${
          args.style ? ` (${args.style} mode)` : ""
        }:\n\n[CODE WILL BE PROVIDED BY CLIENT]`,
      },
    ],
  })
);
```

## Transport Selection

| Transport | Use Case | Trade-offs |
|-----------|----------|-----------|
| **stdio** | Local development | Simplest, single process, no network |
| **HTTP** | Cloud/remote access | Firewall-friendly, easy debugging via curl |
| **SSE** | Server-sent events | One-way from server, good for updates |

Example HTTP transport:

```typescript
const express = require("express");
const { Server } = require("@modelcontextprotocol/sdk/server/index.js");
const { StdioServerTransport } = require("@modelcontextprotocol/sdk/server/stdio.js");

const app = express();
const server = new Server({ name: "my-mcp" });

app.post("/mcp", express.json(), async (req, res) => {
  // Handle MCP requests
  const response = await server.handleRequest(req.body);
  res.json(response);
});

app.listen(3000, () => console.log("MCP server on port 3000"));
```
