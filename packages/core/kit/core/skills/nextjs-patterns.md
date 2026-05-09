---
name: nextjs-patterns
description: Next.js App Router patterns, best practices, and cache components guidance. Use when building or debugging App Router code, implementing Server Components and Actions, optimizing rendering modes, configuring caching strategies, or migrating to Cache Components. Covers file conventions, RSC boundaries, data patterns, metadata, route handlers, caching modes, partial prerendering, cache invalidation, and Next.js 16+ features.
triggers:
  - nextjs-patterns
  - patterns
---

# Next.js Patterns

Complete guidance for App Router development, best practices, and cache component strategies in Next.js.

## When to Apply

Reference this skill when:

- Building or debugging App Router code and needing concrete pattern selection
- Implementing Server Components, Server Actions, or Route Handlers
- Choosing between static, cached, and dynamic rendering modes
- Configuring metadata, caching strategies, or cache invalidation
- Working with Partial Prerendering (PPR) and Cache Components
- Migrating between Next.js versions or caching models
- Reviewing Next.js code for best practices and conventions

## App Router Foundations

### Rendering Modes

Choose the smallest App Router pattern that fits the route or component:

- **Server Components** (default): Pre-rendered at build time, can access databases and secrets
- **Dynamic Server Components**: Re-rendered on each request for fresh data
- **Client Components**: Interactive, use browser APIs, `'use client'` directive
- **Static Generation (SSG)**: Built once, cached forever
- **Incremental Static Regeneration (ISR)**: Time-based cache invalidation

### Client Boundaries

Keep client boundaries explicit and limited:

- Only mark components `'use client'` if they actually need interactivity
- Avoid marking parent layouts `'use client'` unnecessarily
- Pass serialized data to client components, not functions or classes
- Use Server Actions for mutations instead of API routes when possible

## File Conventions

### Special Files

- `layout.tsx` - Shared UI across routes
- `page.tsx` - Route segment content
- `route.ts` - API endpoint handler
- `error.tsx` - Error boundary for route segment
- `global-error.tsx` - Root error boundary
- `not-found.tsx` - 404 fallback
- `loading.tsx` - Suspense fallback UI
- `middleware.ts` - Request pipeline (v16: renamed to `proxy.ts`)

### Route Segments

- `[slug]` - Dynamic segment (e.g., `/posts/[slug]`)
- `[...slug]` - Catch-all segment (e.g., `/docs/[...slug]`)
- `[[...slug]]` - Optional catch-all
- `(group)` - Organize routes without affecting URL
- `@slot` - Parallel routes for modals

### Parallel and Intercepting Routes

Modal patterns with parallel routes:

- `@slot/layout.tsx` - Slot layout
- `(.)modal` - Intercept same level
- `(..)modal` - Intercept one level up
- `(..)(..)modal` - Intercept two levels up
- `[...catchAll]modal` - Intercept any level
- `default.tsx` - Fallback when slot is not matched
- Close modals correctly with `router.back()`

## App Router Patterns

### Server vs Server Action vs Route Handler

**Server Component** (default):
- Initial page load, static generation
- Access database, API keys directly
- Re-render on demand with cache invalidation

**Server Action** (`'use server'`):
- Form mutations, revalidation
- Called from client components or forms
- Automatic CSRF protection
- Use for most mutations

**Route Handler** (`route.ts`):
- When you need full HTTP request/response control
- Webhook endpoints, file uploads
- External API integrations
- Custom content types

### Data Patterns

**Avoiding Data Waterfalls:**

```typescript
// Bad: Sequential fetches
const user = await getUser();
const posts = await getPosts(user.id); // Waits for user

// Good: Parallel fetches
const [user, posts] = await Promise.all([
  getUser(),
  getPosts(userId),
]);

// Best: Use Suspense boundaries for streaming
<Suspense fallback={<Loading />}>
  <Posts />
</Suspense>
```

**Data Fetching Patterns:**

- Fetch in Server Components (no extra API layer needed)
- Use Suspense boundaries to stream partial content
- Preload critical data with `.then()` before returning JSX
- Use `cache()` for per-request deduplication
- Avoid data fetching in Client Components when possible

### Metadata

**Static Metadata:**

```typescript
export const metadata = {
  title: 'Page Title',
  description: 'Page description',
  openGraph: { url: 'https://...', type: 'website' },
};
```

**Dynamic Metadata:**

```typescript
export async function generateMetadata({ params }) {
  const post = await getPost(params.slug);
  return { title: post.title, description: post.excerpt };
}
```

**OG Image Generation:**

Use `next/og` for dynamic Open Graph images.

## RSC Boundaries (Server Component Constraints)

### Invalid Patterns

**Async Client Components** (INVALID):
```typescript
// DON'T: Can't make client component async
'use client';
export default async function Component() {}
```

**Non-Serializable Props** (INVALID):
```typescript
// DON'T: Can't pass functions or classes to client components
<ClientComponent callback={handleClick} /> // Functions break serialization
<ClientComponent date={new Date()} /> // Non-serializable objects fail
```

**Server Actions in Props** (VALID):
```typescript
// OK: Server Actions are serializable
'use client';
import { myAction } from '@/app/actions';
export default function Form() {
  return <form action={myAction}></form>;
}
```

## Async Patterns (Next.js 15+)

### Async `params` and `searchParams`

```typescript
// Next.js 15+ requires async context
export default async function Page({ params, searchParams }) {
  const { slug } = await params;
  const { page } = await searchParams;
}
```

### Async Cookies and Headers

```typescript
import { cookies, headers } from 'next/headers';

export default async function Page() {
  const cookieStore = await cookies();
  const headersList = await headers();
}
```

## Caching Strategy

### Cache Components (Next.js 16+)

**Content Model:**

- **Static**: Never changes, cache forever
- **Cached**: Changes infrequently, use `use cache`
- **Dynamic**: Changes frequently, re-rendered per request

**Use Cache Directive:**

```typescript
'use cache';

export default async function Page() {
  const data = await fetchData(); // Cached based on cacheLife
  return <div>{data}</div>;
}
```

**Cache Profiles:**

Define profiles in `next.config.ts`:

```typescript
cacheProfiles: {
  default: { maxAge: 3600 },
  short: { maxAge: 60 },
  long: { maxAge: 86400 },
}
```

**Partial Prerendering (PPR):**

Combine static and dynamic content:

```typescript
// Static shell rendered at build time
// <Suspense fallback /> becomes dynamic content
<Suspense fallback={<Skeleton />}>
  <DynamicContent />
</Suspense>
```

### Cache Invalidation

**On-Demand Revalidation:**

```typescript
import { revalidatePath, revalidateTag } from 'next/cache';

// In Server Action
export async function updatePost(id, data) {
  await db.posts.update(id, data);
  revalidatePath(`/posts/${id}`);
  revalidateTag('posts'); // Revalidate all posts
}
```

**Time-Based Revalidation (ISR):**

```typescript
export const revalidate = 60; // Revalidate every 60 seconds

export default async function Page() {
  const data = await fetchData();
  return <div>{data}</div>;
}
```

**Cache Tags for Grouped Invalidation:**

```typescript
const response = await fetch(url, {
  next: { tags: ['posts', `post-${id}`] },
});
```

## Common Patterns and Solutions

### Route Handlers

**GET Handler:**

```typescript
export async function GET(request: Request) {
  return Response.json({ message: 'Hello' });
}
```

**POST Handler with Server Action:**

Use Server Actions for most mutations instead of route handlers.

**GET Handler Conflicts:**

If both `route.ts` GET and `page.tsx` exist in the same segment, `route.ts` takes precedence.

### Image Optimization

- Always use `next/image` over `<img>`
- Configure `images.remotePatterns` for external URLs
- Use responsive `sizes` attribute
- Add blur placeholders for perceived performance
- Set `priority={true}` for LCP images

### Font Optimization

- Use `next/font` for Google Fonts or local fonts
- Preload font subsets
- Integrate with Tailwind CSS via CSS variables

### Error Handling

**Error Boundary:**
```typescript
// error.tsx
'use client';
export default function Error({ error, reset }) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={() => reset()}>Try again</button>
    </div>
  );
}
```

**Not Found:**
```typescript
import { notFound } from 'next/navigation';

if (!post) notFound();
```

**Server-Side Redirects:**
```typescript
import { redirect, permanentRedirect } from 'next/navigation';

redirect('/login'); // Temporary (307)
permanentRedirect('/new-url'); // Permanent (308)
```

### Scripts and Third-Party Code

- Use `next/script` for external scripts
- Use `@next/third-parties` for Google Analytics
- Set appropriate `strategy` (beforeInteractive, afterInteractive, lazyOnload)

### Hydration Error Debugging

**Common Causes:**
- Browser APIs used during render (window, document)
- Date rendering differences
- Invalid HTML (e.g., `<div>` inside `<p>`)
- Non-deterministic renders

**Fix:**
```typescript
'use client';
import { useEffect, useState } from 'react';

export default function Component() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  
  if (!mounted) return null;
  return <div>{new Date().toISOString()}</div>;
}
```

### Suspense Boundaries

**With `useSearchParams` or `usePathname`:**

These hooks cause Client-Side Rendering (CSR) bailout. Wrap in Suspense:

```typescript
import { Suspense } from 'react';
import { SearchResults } from './search-results';

export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <SearchResults />
    </Suspense>
  );
}
```

## Best Practices

### Architecture

1. Default to Server Components unless interactivity is required
2. Keep client boundaries as small and deep as possible
3. Use Suspense boundaries for progressive enhancement
4. Define clear data fetching strategy upfront

### Performance

1. Minimize JavaScript shipped to client
2. Use dynamic imports for heavy components
3. Preload critical resources
4. Optimize images with `next/image` and blur placeholders

### Bundle and Bundling

- Avoid barrel imports (import directly from source)
- Use dynamic imports for code-splitting
- Defer third-party scripts to after hydration
- Tree-shake unused dependencies

### Self-Hosting

- Use `output: 'standalone'` for Docker deployments
- Configure cache handlers for multi-instance ISR
- Ensure `/public` and `.next/static` are served correctly

### Outputs / Evidence

- Return the concrete App Router pattern or implementation guidance requested
- Include clear rendering and caching implications
- Note any route, metadata, or client-boundary constraints that must be preserved

### Failure / Stop Conditions

- Do not default to client components when a server-first pattern fits
- Do not mix rendering or caching modes without explaining the consequence
- Do not leave metadata or route-handler behavior implicit when SEO or APIs are involved

## Memory Hooks

- Read memory when the workspace already has Next.js conventions or prior routing constraints
- Write memory only when the session establishes a durable App Router or caching policy
