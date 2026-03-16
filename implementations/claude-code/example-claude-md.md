# TaskFlow - Project Management SaaS

## Quick Reference

**Stack:**
- Frontend: Next.js 15, React 19, TypeScript 5.7, TailwindCSS
- Backend: Next.js API Routes, Supabase (PostgreSQL, Auth, Realtime)
- State: TanStack Query, Zustand
- Testing: Vitest, Playwright, React Testing Library
- Build: Turbo, pnpm workspaces

**Commands:**
```bash
pnpm dev              # Start dev server (localhost:3000)
pnpm build            # Production build
pnpm test             # Run unit tests
pnpm test:e2e         # Run E2E tests
pnpm lint             # ESLint check
pnpm type-check       # TypeScript check
pnpm db:push          # Push schema to Supabase
pnpm db:seed          # Seed development data
```

**Key Paths:**
- `apps/web/` - Next.js app
- `packages/ui/` - Shared React components
- `packages/db/` - Supabase schema & migrations
- `packages/api/` - API client & types

## Architecture

TaskFlow is a monorepo using Turborepo for task orchestration. The architecture follows Feature-Sliced Design principles:

```
apps/web/src/
  app/              # Next.js App Router pages
  features/         # Feature modules (tasks, projects, teams)
  entities/         # Business entities (user, workspace)
  shared/           # Shared utilities, hooks, components
  widgets/          # Composite UI blocks
```

**Data Flow:**
1. UI components call React Query hooks
2. Hooks use API client from `@taskflow/api`
3. API routes validate with Zod schemas
4. Supabase RLS enforces permissions
5. Realtime subscriptions for live updates

**Authentication:**
- Supabase Auth with SSR (server components + middleware)
- Row-Level Security (RLS) policies on all tables
- Session stored in httpOnly cookies

**State Management:**
- Server state: TanStack Query (cache + sync)
- Client state: Zustand (UI toggles, filters)
- Form state: React Hook Form + Zod

**Key Design Decisions:**
- Server Components by default, Client Components only when needed
- Optimistic updates for all mutations
- Real-time subscriptions for collaborative features
- Static generation for marketing pages, ISR for dashboard

## Code Standards

### General Rules

- **Function size:** Max 50 lines per function
- **Cyclomatic complexity:** Max 10 per function
- **Line width:** Max 100 characters
- **No comments** unless explaining complex business logic or external constraints
- **Early returns:** Prefer guard clauses over nested conditionals

### TypeScript

```typescript
// ✅ DO: Explicit return types for public APIs
export async function fetchTasks(
  workspaceId: string
): Promise<Task[]> {
  // ...
}

// ✅ DO: Use branded types for IDs
type TaskId = string & { readonly brand: unique symbol };

// ✅ DO: Prefer unknown over any
function parseJson(str: string): unknown {
  return JSON.parse(str);
}

// ❌ DON'T: Use any
function process(data: any) { }

// ❌ DON'T: Implicit any in function params
function calculate(a, b) { }
```

### React

```tsx
// ✅ DO: Functional components with TypeScript
interface ButtonProps {
  variant: 'primary' | 'secondary';
  onClick: () => void;
  children: React.ReactNode;
}

export function Button({ variant, onClick, children }: ButtonProps) {
  return (
    <button
      onClick={onClick}
      className={clsx('btn', `btn-${variant}`)}
    >
      {children}
    </button>
  );
}

// ✅ DO: Use React Server Components by default
// app/tasks/page.tsx
export default async function TasksPage() {
  const tasks = await fetchTasks(); // Direct data fetching
  return <TaskList tasks={tasks} />;
}

// ✅ DO: Mark Client Components explicitly
'use client';
export function TaskFilters() {
  const [filter, setFilter] = useState('all');
  // ...
}

// ❌ DON'T: Use default exports for components
export default function MyComponent() { } // Avoid

// ❌ DON'T: Fetch data in Client Components
'use client';
export function Tasks() {
  useEffect(() => {
    fetch('/api/tasks'); // Use React Query instead
  }, []);
}
```

### API Routes

```typescript
// ✅ DO: Validate with Zod
import { z } from 'zod';

const createTaskSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  dueDate: z.string().datetime().optional(),
});

export async function POST(request: Request) {
  const body = await request.json();
  const data = createTaskSchema.parse(body); // Throws on invalid
  // ...
}

// ✅ DO: Use consistent error responses
return NextResponse.json(
  { error: 'Task not found' },
  { status: 404 }
);

// ✅ DO: Check auth in all protected routes
const session = await getServerSession();
if (!session) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

### Database (Supabase)

```sql
-- ✅ DO: Enable RLS on all tables
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- ✅ DO: Create policies for each role
CREATE POLICY "Users can view tasks in their workspace"
  ON tasks FOR SELECT
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid()
    )
  );

-- ✅ DO: Use proper indexes
CREATE INDEX idx_tasks_workspace_id ON tasks(workspace_id);
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);

-- ❌ DON'T: Use SELECT * in application code
-- Use explicit column lists
```

### Testing

```typescript
// ✅ DO: Test business logic and user interactions
describe('TaskList', () => {
  it('displays empty state when no tasks', () => {
    render(<TaskList tasks={[]} />);
    expect(screen.getByText(/no tasks yet/i)).toBeInTheDocument();
  });

  it('allows creating a new task', async () => {
    const user = userEvent.setup();
    render(<TaskBoard />);

    await user.click(screen.getByRole('button', { name: /new task/i }));
    await user.type(screen.getByLabelText(/title/i), 'Buy groceries');
    await user.click(screen.getByRole('button', { name: /create/i }));

    expect(await screen.findByText('Buy groceries')).toBeInTheDocument();
  });
});

// ❌ DON'T: Test implementation details
it('updates state correctly', () => {
  const { result } = renderHook(() => useState(0));
  act(() => result.current[1](1)); // Testing React internals
});
```

## Workflow

### Branch Strategy

Trunk-based development with short-lived feature branches:

```bash
# Feature branch (1-3 days max)
git checkout -b feature/task-filters

# Bug fix
git checkout -b fix/date-picker-timezone

# Refactor
git checkout -b refactor/api-client

# Chore (deps, config)
git checkout -b chore/update-dependencies
```

**Branch naming:** `<type>/<short-kebab-description>`

### Commit Messages

Follow Conventional Commits:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:** feat, fix, refactor, chore, docs, style, ci, test, perf

**Examples:**
```
feat(tasks): add drag-and-drop reordering

Implemented drag-and-drop using dnd-kit library.
Tasks can now be reordered within columns and across columns.

Closes #142

fix(auth): handle expired session redirect

Previously, expired sessions showed error page.
Now redirects to login with return URL.

refactor(api): simplify error handling

Extracted common error handling into middleware.
Reduced duplication across 15 API routes.
```

### Pull Request Process

1. **Create feature branch** from `main`
2. **Implement feature** with tests
3. **Run quality gates:**
   ```bash
   pnpm lint && pnpm type-check && pnpm test && pnpm build
   ```
4. **Commit changes** with conventional format
5. **Push branch** and create PR
6. **Wait for CI** (all checks must pass)
7. **Request review** (min 1 approval required)
8. **Address feedback** and push updates
9. **Squash merge** to main
10. **Delete branch** after merge

**PR Template:**

```markdown
## Summary
- Bullet point summary of changes

## Changes
- Technical details
- Files modified
- Dependencies added/removed

## Test Plan
- [ ] Unit tests added/updated
- [ ] E2E tests pass
- [ ] Manual testing completed
- [ ] Tested on mobile/desktop

## Screenshots
[If UI changes]

## Breaking Changes
[If any]

## Related Issues
Closes #123
```

### Development Workflow

**Daily workflow:**
```bash
# 1. Start of day
git checkout main
git pull
pnpm install  # Update dependencies

# 2. Create feature branch
git checkout -b feature/my-feature

# 3. Start dev server
pnpm dev

# 4. Make changes, test locally
# 5. Run quality checks frequently
pnpm test

# 6. Commit often (small, focused commits)
git add .
git commit -m "feat: add X"

# 7. Before PR
pnpm lint
pnpm type-check
pnpm test
pnpm test:e2e
pnpm build

# 8. Create PR
git push -u origin feature/my-feature
gh pr create
```

**When switching tasks:**
```bash
# Commit work in progress
git add .
git commit -m "wip: partial implementation"

# Switch to different task
git checkout -b feature/other-task

# Return later
git checkout feature/my-feature
```

## Testing Strategy

### Coverage Targets

- **Overall:** >80%
- **Business logic:** >90%
- **UI components:** >70%
- **Utils/helpers:** 100%

### What to Test

**DO test:**
- User workflows (E2E)
- Business logic functions
- API route validation
- Error conditions
- Edge cases (empty arrays, null values, boundary conditions)
- Integration points (API client, Supabase calls)
- Accessibility (keyboard navigation, screen reader labels)

**DON'T test:**
- Trivial getters/setters
- Third-party library internals
- UI styling/layout details
- Framework features (React, Next.js)

### Test Organization

```
src/
  features/
    tasks/
      __tests__/
        TaskList.test.tsx        # Component tests
        useTaskMutations.test.ts # Hook tests
        task-utils.test.ts       # Unit tests
      TaskList.tsx
      useTaskMutations.ts
      task-utils.ts
```

### Test Patterns

**Component tests:**
```typescript
import { render, screen } from '@testing-library/react';
import { TaskCard } from './TaskCard';

describe('TaskCard', () => {
  const mockTask = {
    id: '1',
    title: 'Write tests',
    status: 'todo',
  };

  it('renders task title', () => {
    render(<TaskCard task={mockTask} />);
    expect(screen.getByText('Write tests')).toBeInTheDocument();
  });

  it('shows completed state', () => {
    render(<TaskCard task={{ ...mockTask, status: 'done' }} />);
    expect(screen.getByRole('checkbox')).toBeChecked();
  });
});
```

**API tests:**
```typescript
import { POST } from './route';

describe('POST /api/tasks', () => {
  it('creates task with valid data', async () => {
    const request = new Request('http://localhost/api/tasks', {
      method: 'POST',
      body: JSON.stringify({
        title: 'New task',
        workspaceId: 'ws_123',
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(201);

    const data = await response.json();
    expect(data.title).toBe('New task');
  });

  it('returns 400 for invalid data', async () => {
    const request = new Request('http://localhost/api/tasks', {
      method: 'POST',
      body: JSON.stringify({ title: '' }), // Invalid: empty title
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });
});
```

**E2E tests:**
```typescript
import { test, expect } from '@playwright/test';

test('user can create and complete task', async ({ page }) => {
  // Login
  await page.goto('/login');
  await page.fill('[name=email]', 'test@example.com');
  await page.fill('[name=password]', 'password');
  await page.click('button[type=submit]');

  // Create task
  await page.click('text=New Task');
  await page.fill('[name=title]', 'Buy groceries');
  await page.click('button:has-text("Create")');

  // Verify created
  await expect(page.locator('text=Buy groceries')).toBeVisible();

  // Complete task
  await page.click('text=Buy groceries');
  await page.check('[aria-label="Mark complete"]');

  // Verify completed
  await expect(page.locator('text=Buy groceries')).toHaveClass(/completed/);
});
```

## Gotchas

### Supabase

1. **RLS policies must match client filters**
   ```typescript
   // ❌ Client filter won't work if RLS blocks it
   const { data } = await supabase
     .from('tasks')
     .select('*')
     .eq('workspace_id', 'other-workspace'); // RLS blocks this

   // ✅ Only query data allowed by RLS
   const { data } = await supabase
     .from('tasks')
     .select('*'); // RLS auto-filters to user's workspaces
   ```

2. **Session refresh in middleware**
   - Supabase sessions expire after 1 hour
   - Middleware must call `supabase.auth.getSession()` to refresh
   - Redirect to login if refresh fails

3. **Realtime subscriptions require auth**
   ```typescript
   // ✅ Pass authenticated client to subscription
   const channel = supabase
     .channel('tasks')
     .on('postgres_changes', {
       event: '*',
       schema: 'public',
       table: 'tasks'
     }, handler)
     .subscribe();

   // Clean up on unmount
   return () => { channel.unsubscribe(); };
   ```

### Next.js

1. **Server Components can't use hooks**
   ```tsx
   // ❌ Error: Can't use useState in Server Component
   export default function Page() {
     const [count, setCount] = useState(0);
     return <div>{count}</div>;
   }

   // ✅ Mark as Client Component
   'use client';
   export default function Page() {
     const [count, setCount] = useState(0);
     return <div>{count}</div>;
   }
   ```

2. **Cookies in Server Actions**
   ```typescript
   // ✅ Use cookies() from next/headers
   import { cookies } from 'next/headers';

   export async function updateUser() {
     'use server';
     const cookieStore = cookies();
     const session = cookieStore.get('session');
   }
   ```

3. **Environment variables**
   - `NEXT_PUBLIC_*` → exposed to browser
   - Others → server-only
   - Never put secrets in `NEXT_PUBLIC_*`

### TypeScript

1. **Inferred types from Supabase**
   ```typescript
   // ✅ Generate types from database
   // pnpm supabase gen types typescript --local > packages/db/types.ts

   import type { Database } from '@taskflow/db';

   type Task = Database['public']['Tables']['tasks']['Row'];
   ```

2. **Form data typing**
   ```typescript
   // ✅ Use Zod for runtime validation + type inference
   const schema = z.object({
     title: z.string(),
     dueDate: z.string().datetime().optional(),
   });

   type FormData = z.infer<typeof schema>;
   ```

### Testing

1. **Mock Supabase client**
   ```typescript
   // vitest.setup.ts
   vi.mock('@supabase/supabase-js', () => ({
     createClient: vi.fn(() => ({
       from: vi.fn(() => ({
         select: vi.fn(() => ({ data: [], error: null })),
       })),
     })),
   }));
   ```

2. **E2E test isolation**
   - Each test uses a fresh database state
   - Seed test data in `beforeEach`
   - Clean up in `afterEach`
   ```typescript
   beforeEach(async () => {
     await db.seed(); // Seed test workspace + user
   });

   afterEach(async () => {
     await db.reset(); // Clean all test data
   });
   ```

3. **Avoid flaky tests**
   - Use `waitFor` instead of `sleep`
   - Mock time-dependent functions
   - Set explicit timeouts for async operations

### pnpm Workspace

1. **Cross-package imports**
   ```json
   // apps/web/package.json
   {
     "dependencies": {
       "@taskflow/ui": "workspace:*",
       "@taskflow/api": "workspace:*"
     }
   }
   ```

2. **Shared dependencies**
   - Install shared deps in root: `pnpm add -w <package>`
   - Install package-specific: `pnpm add --filter web <package>`

3. **Build order matters**
   ```json
   // turbo.json
   {
     "pipeline": {
       "build": {
         "dependsOn": ["^build"] // Build dependencies first
       }
     }
   }
   ```

## Security

### Authentication

- **Never trust client-side auth state**
- Always verify session on server (API routes, Server Components)
- Use Supabase RLS for authorization
- Rotate secrets monthly

### Input Validation

```typescript
// ✅ Validate all user input with Zod
const userInput = createUserSchema.parse(body); // Throws on invalid

// ✅ Sanitize HTML if rendering user content
import DOMPurify from 'isomorphic-dompurify';
const clean = DOMPurify.sanitize(userHtml);

// ❌ Never trust user input
const query = `SELECT * FROM users WHERE id = ${req.body.id}`; // SQL injection!
```

### Secrets Management

1. **Never commit secrets**
   - Add `.env` to `.gitignore`
   - Use `.env.example` for template
   - Store secrets in Vercel/environment

2. **Secret scanning**
   - GitGuardian in CI
   - Pre-commit hooks check for patterns
   - Rotate immediately if leaked

3. **Least privilege**
   - Database users have minimal permissions
   - API keys scoped to specific resources
   - Service accounts for CI/CD only

### Content Security

```typescript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};
```

### Dependency Security

```bash
# Run audit on every PR
pnpm audit --audit-level=high

# Update vulnerable deps
pnpm update

# Check for outdated packages
pnpm outdated
```

## Performance

### Database

- Use indexes on frequently queried columns
- Limit result sets (pagination)
- Use `select()` with explicit columns, not `SELECT *`
- Enable Postgres connection pooling (Supabase does this)

### React Query

```typescript
// ✅ Stale-while-revalidate pattern
const { data } = useQuery({
  queryKey: ['tasks', workspaceId],
  queryFn: () => fetchTasks(workspaceId),
  staleTime: 30_000, // 30s
  gcTime: 5 * 60 * 1000, // 5min
});

// ✅ Optimistic updates
const mutation = useMutation({
  mutationFn: updateTask,
  onMutate: async (newTask) => {
    await queryClient.cancelQueries({ queryKey: ['tasks'] });
    const previous = queryClient.getQueryData(['tasks']);

    queryClient.setQueryData(['tasks'], (old) =>
      old.map(t => t.id === newTask.id ? newTask : t)
    );

    return { previous };
  },
  onError: (err, newTask, context) => {
    queryClient.setQueryData(['tasks'], context.previous);
  },
});
```

### Next.js

```typescript
// ✅ Use Static Generation for marketing pages
export const dynamic = 'force-static';

// ✅ Use ISR for frequently-changing data
export const revalidate = 60; // Revalidate every 60s

// ✅ Lazy load heavy components
const Chart = dynamic(() => import('./Chart'), {
  loading: () => <Skeleton />,
  ssr: false,
});

// ✅ Optimize images
import Image from 'next/image';

<Image
  src="/hero.png"
  alt="Hero"
  width={800}
  height={600}
  priority // Above fold
/>
```

### Bundle Size

- Monitor bundle with `@next/bundle-analyzer`
- Lazy load non-critical code
- Tree-shake unused exports
- Keep total bundle <300KB (gzipped)

## Deployment

**Platform:** Vercel

**Environments:**
- Production: `main` branch → `https://your-app.vercel.app`
- Preview: All PRs → `https://your-app-git-<branch>.vercel.app`

**Environment Variables:**
- Set in Vercel dashboard
- Separate values for production/preview
- Never commit `.env` to git

**Deployment Process:**
1. Merge PR to `main`
2. Vercel auto-deploys
3. Runs build + tests
4. Deploys if all pass
5. Notifies in Slack

**Rollback:**
```bash
# Via Vercel CLI
vercel rollback

# Or redeploy previous commit
git revert HEAD
git push
```

## Resources

- **Design System:** `<your-design-system-url>`
- **API Docs:** `<your-api-docs-url>`
- **Supabase Dashboard:** `<your-supabase-dashboard-url>`
- **Monitoring:** `<your-monitoring-url>`
- **Figma:** `<your-figma-url>`

## Team

- Ask @alice for design questions
- Ask @bob for database/backend
- Ask @charlie for DevOps/deployment

## Change Log

- **2026-03-10:** Migrated to Supabase from Firebase
- **2026-03-01:** Upgraded to Next.js 15 + React 19
- **2026-02-15:** Implemented real-time collaboration
- **2026-02-01:** Launched beta with 100 users
