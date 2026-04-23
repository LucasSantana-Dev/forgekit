# Prompt Engineering for Code Tasks

> Precise instructions produce precise code. Vague requests produce vague results.

## The Problem

AI coding agents are literal executors. They don't infer intent from context like human developers do. A prompt like "make this better" or "add error handling" produces generic, often incorrect changes because the agent has no constraints. The result: wasted time reviewing bad code, explaining what you actually meant, and fixing hallucinated features.

The core issue: AI agents optimize for completing the task as stated, not the task you intended. Without explicit constraints, they fill gaps with assumptions.

## The Pattern

### The SCOPE Framework

Structure every non-trivial prompt using SCOPE:

| Component | Purpose | Example |
|-----------|---------|---------|
| **Situation** | Current state + problem | "The auth middleware crashes on missing JWT tokens" |
| **Constraints** | Limits, rules, standards | "Must preserve backward compatibility, use existing error types" |
| **Output** | Expected format/structure | "Return 401 with {error, code} JSON body" |
| **Positive examples** | Show what good looks like | "Like the rate limiter middleware at @middleware/rate-limit.ts" |
| **Edge cases** | Failure modes to handle | "Handle: expired token, malformed token, missing header, revoked token" |

**Bad prompt:**
```
Add validation to the user endpoint
```

**Good prompt using SCOPE:**
```
Situation: POST /api/users accepts any payload, crashes on invalid email
Constraints: Use Zod schema, match validation pattern in @api/teams/route.ts, <50 lines
Output: Return 400 with {field, message}[] on validation errors, 201 with user object on success
Positive example: @api/teams/validation.ts shows the error format
Edge cases: Missing fields, invalid email format, duplicate email, empty strings, null values
```

### Task Decomposition

Break large tasks into 5-20 minute chunks. AI agents lose coherence on multi-step work.

**Instead of:**
```
Build a user authentication system with JWT, refresh tokens, password reset, and email verification
```

**Break into:**
```
1. Add JWT generation function to @lib/auth.ts (signature, expiry, claims)
2. Add JWT verification middleware to @middleware/auth.ts (token parsing, signature check, expiry)
3. Add refresh token rotation to @api/auth/refresh route
4. Add password reset flow (token generation, email, verification)
5. Add email verification (send token, verify endpoint)
```

Each step is independently testable and reviewable.

### Context Injection Patterns

Give agents exactly what they need, nothing more.

**File references:**
```
Update the validation logic in @lib/validators/user.ts to match the pattern in @lib/validators/team.ts
```

**Error messages:**
```
Fix this error:
```
TypeError: Cannot read property 'id' of undefined at UserService.getUser (line 42)
```
The user object is undefined when auth middleware runs before database initialization.
```

**Code snippets:**
```
Refactor this function to async/await:

```javascript
function fetchUser(id) {
  return db.users.findById(id)
    .then(user => validateUser(user))
    .then(validated => enrichProfile(validated))
    .catch(err => handleError(err));
}
```

Target: same behavior, handle errors with try/catch, <20 lines
```

**Diff context (for fixes):**
```
This change broke the user deletion flow:
```diff
- await db.users.delete(id);
+ await db.users.softDelete(id);
```

Now the cascade delete on user_sessions doesn't trigger. Fix the softDelete to clean up sessions.
```

### Specificity Over Vagueness

| Vague | Specific | Why Better |
|-------|----------|------------|
| "Write clean code" | "Functions <50 lines, cyclomatic complexity <10" | Measurable constraints |
| "Add error handling" | "Catch errors, log with context, return 500 with {error, requestId}" | Defines exact behavior |
| "Make it faster" | "Reduce response time from 800ms to <200ms by caching user lookups" | Measurable goal + strategy |
| "Improve the UI" | "Change button color to #7C3AED, add 2px border, 12px border-radius" | Exact design specs |
| "Fix the bug" | "Users can't delete teams they own. TeamService.delete() returns 403. Should return 200 if user is owner." | Describes symptom, expected behavior |

### Progressive Refinement

For complex tasks, use a two-step process:

**Step 1: Plan Request**
```
I need to add rate limiting to the API. Before implementing:
1. Analyze existing middleware in @middleware/
2. Identify which routes need rate limiting
3. Propose a rate limiting strategy (token bucket vs sliding window)
4. List edge cases (bypass for admins, different limits per endpoint)
```

**Step 2: Implementation Request (after reviewing plan)**
```
Implement the rate limiting plan:
- Use token bucket algorithm
- 100 requests/minute for authenticated, 20/minute for anonymous
- Store state in Redis using existing client from @lib/redis.ts
- Bypass for admin role
- Return 429 with Retry-After header
- Follow error format from @api/errors.ts
```

## Anti-Patterns

### 1. Vague Instructions

**Bad:**
```
Improve error handling in the auth flow
```

**Why:** Agent doesn't know which errors, what "improve" means, or where in the flow.

**Fix:**
```
In @api/auth/login.ts, add specific error messages for:
- Invalid email format → "Email must be valid (user@domain.com)"
- Wrong password → "Invalid credentials"
- Account locked → "Account locked. Contact support."
Return 400 for validation, 401 for auth, 403 for locked.
```

### 2. Missing Constraints

**Bad:**
```
Add caching to the user profile endpoint
```

**Why:** Agent might cache forever, cache in memory (doesn't scale), or cache sensitive data.

**Fix:**
```
Add Redis caching to GET /api/users/:id:
- Cache key: user:{id}
- TTL: 5 minutes
- Invalidate on user update/delete
- Don't cache if user.role === 'admin'
- Use existing Redis client from @lib/redis.ts
```

### 3. Too Much Context

**Bad:**
```
Fix the user deletion bug. Here's the entire codebase: [dumps 50 files]
```

**Why:** Agent drowns in irrelevant context, misses the actual issue.

**Fix:**
```
Fix user deletion bug in @services/user.ts line 142. When deleteUser() runs:
- Cascade delete fails on user_sessions table (foreign key constraint)
- Error: "update or delete on table users violates foreign key constraint"

Relevant files:
- @services/user.ts (deletion logic)
- @models/user.ts (schema)
- @models/session.ts (foreign key definition)

Solution should delete sessions first, then user.
```

### 4. No Examples

**Bad:**
```
Add logging to the payment processing flow
```

**Why:** Agent doesn't know your logging format, level, or what to log.

**Fix:**
```
Add logging to @services/payment.ts matching the pattern in @services/auth.ts:

```typescript
logger.info('Payment processed', {
  userId,
  amount,
  currency,
  paymentId,
  duration: Date.now() - startTime
});
```

Log at: payment start, success, failure, refund. Include user ID, amount, payment provider.
```

### 5. Assuming Context

**Bad:**
```
Update it to use the new API
```

**Why:** Agent doesn't know what "it" is or what "new API" means.

**Fix:**
```
Update @lib/payments/stripe.ts to use Stripe API v2024-03-15:
- Replace stripe.charges.create() with stripe.paymentIntents.create()
- Update response handling (response.id → response.payment_intent)
- Migration guide: https://stripe.com/docs/upgrades#2024-03-15
```

### 6. Underspecified Output

**Bad:**
```
Return an error if validation fails
```

**Why:** Doesn't specify error format, status code, or error content.

**Fix:**
```
Return 400 JSON response on validation failure:
```json
{
  "error": "Validation failed",
  "details": [
    {"field": "email", "message": "Invalid email format"},
    {"field": "password", "message": "Must be at least 8 characters"}
  ]
}
```
Match error format from @lib/errors.ts
```

## Checklist

Before sending a prompt, verify:

- [ ] Clear success criteria (how do you know it worked?)
- [ ] Explicit constraints (length, format, dependencies, compatibility)
- [ ] Examples of desired output (code, format, style)
- [ ] Edge cases listed (what can go wrong?)
- [ ] File references use @ syntax or absolute paths
- [ ] No assumptions about "obvious" requirements
- [ ] Measurable over subjective ("< 50 lines" not "concise")

## Real-World Examples

### Example 1: API Endpoint

**Effective prompt:**
```
Add POST /api/teams endpoint:

Request body:
```json
{"name": "Engineering", "description": "Engineering team"}
```

Response:
- 201 + {id, name, description, createdAt} on success
- 400 + {error, details[]} on validation failure
- 401 if not authenticated
- 403 if user.role !== 'admin'

Validation:
- name: required, 3-50 chars, alphanumeric + spaces
- description: optional, max 500 chars

Implementation:
- Use Zod schema (pattern from @api/users/schema.ts)
- Save to teams table via @db/teams.ts
- Match error format from @lib/errors.ts
- Function < 50 lines

Tests: valid creation, missing name, unauthorized, non-admin
```

### Example 2: Refactoring

**Effective prompt:**
```
Refactor @services/user.ts to extract duplicate error handling.

Current pattern (repeated 8 times):
```typescript
try {
  // operation
} catch (err) {
  logger.error('Operation failed', {error: err, userId});
  throw new AppError('Operation failed', 500);
}
```

Extract to:
- handleServiceError(operation: string, userId: string, err: Error)
- Log with operation context
- Preserve original error types (ValidationError → 400, NotFoundError → 404)
- Don't catch errors that should propagate (AuthError)

After refactor: <100 lines total (currently 180)
```

These patterns produce precise, reviewable, testable code in 1-2 iterations instead of 5-10.
