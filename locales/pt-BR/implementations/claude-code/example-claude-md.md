# TaskFlow - SaaS de Gestão de Projetos

## Referência Rápida

**Stack:**
- Frontend: Next.js 15, React 19, TypeScript 5.7, TailwindCSS
- Backend: Next.js API Routes, Supabase (PostgreSQL, Auth, Realtime)
- Estado: TanStack Query, Zustand
- Testes: Vitest, Playwright, React Testing Library
- Build: Turbo, pnpm workspaces

**Comandos:**
```bash
pnpm dev              # Inicia o servidor dev (localhost:3000)
pnpm build            # Build de produção
pnpm test             # Roda testes unitários
pnpm test:e2e         # Roda testes E2E
pnpm lint             # Verificação ESLint
pnpm type-check       # Verificação TypeScript
pnpm db:push          # Envia schema para o Supabase
pnpm db:seed          # Popula dados de desenvolvimento
```

**Caminhos Principais:**
- `apps/web/` - app Next.js
- `packages/ui/` - componentes React compartilhados
- `packages/db/` - schema e migrations do Supabase
- `packages/api/` - cliente de API e tipos

## Arquitetura

TaskFlow é um monorepo usando Turborepo para orquestração de tarefas. A arquitetura segue os princípios de Feature-Sliced Design:

```
apps/web/src/
  app/              # páginas App Router do Next.js
  features/         # módulos de funcionalidades (tasks, projects, teams)
  entities/         # entidades de negócio (user, workspace)
  shared/           # utilitários, hooks e componentes compartilhados
  widgets/          # blocos compostos de UI
```

**Fluxo de Dados:**
1. Componentes de UI chamam hooks do React Query
2. Os hooks usam o cliente de API de `@taskflow/api`
3. As rotas de API validam com schemas Zod
4. O Supabase RLS aplica permissões
5. Subscriptions Realtime para atualizações ao vivo

**Autenticação:**
- Supabase Auth com SSR (server components + middleware)
- Políticas Row-Level Security (RLS) em todas as tabelas
- Sessão armazenada em cookies httpOnly

**Gerenciamento de Estado:**
- Estado do servidor: TanStack Query (cache + sync)
- Estado do cliente: Zustand (toggles de UI, filtros)
- Estado de formulário: React Hook Form + Zod

**Principais Decisões de Design:**
- Server Components por padrão, Client Components só quando necessário
- Atualizações otimistas para todas as mutations
- Subscriptions em tempo real para funcionalidades colaborativas
- Geração estática para páginas de marketing, ISR para dashboard

## Padrões de Código

### Regras Gerais

- **Tamanho de função:** Máx. 50 linhas por função
- **Complexidade ciclomática:** Máx. 10 por função
- **Largura de linha:** Máx. 100 caracteres
- **Sem comentários** a menos que expliquem lógica de negócio complexa ou restrições externas
- **Early returns:** prefira guard clauses a condicionais aninhadas

### TypeScript

```typescript
// ✅ FAÇA: Tipos de retorno explícitos para APIs públicas
export async function fetchTasks(
  workspaceId: string
): Promise<Task[]> {
  // ...
}

// ✅ FAÇA: Use branded types para IDs
type TaskId = string & { readonly brand: unique symbol };

// ✅ FAÇA: Prefira unknown a any
function parseJson(str: string): unknown {
  return JSON.parse(str);
}

// ❌ NÃO FAÇA: Use any
function process(data: any) { }

// ❌ NÃO FAÇA: any implícito em parâmetros de função
function calculate(a, b) { }
```

### React

```tsx
// ✅ FAÇA: Componentes funcionais com TypeScript
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

// ✅ FAÇA: Use React Server Components por padrão
// app/tasks/page.tsx
export default async function TasksPage() {
  const tasks = await fetchTasks(); // Busca de dados direta
  return <TaskList tasks={tasks} />;
}

// ✅ FAÇA: Marque Client Components explicitamente
'use client';
export function TaskFilters() {
  const [filter, setFilter] = useState('all');
  // ...
}

// ❌ NÃO FAÇA: Use default exports para componentes
export default function MyComponent() { } // Evite

// ❌ NÃO FAÇA: Buscar dados em Client Components
'use client';
export function Tasks() {
  useEffect(() => {
    fetch('/api/tasks'); // Use React Query em vez disso
  }, []);
}
```

### Rotas de API

```typescript
// ✅ FAÇA: Valide com Zod
import { z } from 'zod';

const createTaskSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  dueDate: z.string().datetime().optional(),
});

export async function POST(request: Request) {
  const body = await request.json();
  const data = createTaskSchema.parse(body); // Lança em caso inválido
  // ...
}

// ✅ FAÇA: Use respostas de erro consistentes
return NextResponse.json(
  { error: 'Task not found' },
  { status: 404 }
);

// ✅ FAÇA: Verifique auth em todas as rotas protegidas
const session = await getServerSession();
if (!session) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

### Banco de Dados (Supabase)

```sql
-- ✅ FAÇA: Habilite RLS em todas as tabelas
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- ✅ FAÇA: Crie políticas para cada papel
CREATE POLICY "Users can view tasks in their workspace"
  ON tasks FOR SELECT
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid()
    )
  );

-- ✅ FAÇA: Use índices adequados
CREATE INDEX idx_tasks_workspace_id ON tasks(workspace_id);
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);

-- ❌ NÃO FAÇA: Use SELECT * no código da aplicação
-- Use listas explícitas de colunas
```

### Testes

```typescript
// ✅ FAÇA: Teste lógica de negócio e interações do usuário
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

// ❌ NÃO FAÇA: Teste detalhes de implementação
it('updates state correctly', () => {
  const { result } = renderHook(() => useState(0));
  act(() => result.current[1](1)); // Testando internals do React
});
```

## Fluxo de Trabalho

### Estratégia de Branches

Desenvolvimento trunk-based com branches curtas de feature:

```bash
# Branch de feature (máx. 1-3 dias)
git checkout -b feature/task-filters

# Correção de bug
git checkout -b fix/date-picker-timezone

# Refactor
git checkout -b refactor/api-client

# Chore (deps, config)
git checkout -b chore/update-dependencies
```

**Nome da branch:** `<type>/<short-kebab-description>`

### Mensagens de Commit

Siga Conventional Commits:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Tipos:** feat, fix, refactor, chore, docs, style, ci, test, perf

**Exemplos:**
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

### Processo de Pull Request

1. **Crie a feature branch** a partir de `main`
2. **Implemente a funcionalidade** com testes
3. **Rode os gates de qualidade:**
   ```bash
   pnpm lint && pnpm type-check && pnpm test && pnpm build
   ```
4. **Faça commit das mudanças** no formato convencional
5. **Envie a branch** e crie o PR
6. **Espere o CI** (todos os checks precisam passar)
7. **Peça review** (mínimo de 1 aprovação)
8. **Trate o feedback** e envie atualizações
9. **Faça squash merge** para `main`
10. **Delete a branch** após o merge

**Template de PR:**

```markdown
## Resumo
- Resumo em tópicos das mudanças

## Mudanças
- Detalhes técnicos
- Arquivos modificados
- Dependências adicionadas/removidas

## Plano de Testes
- [ ] Testes unitários adicionados/atualizados
- [ ] Testes E2E passam
- [ ] Teste manual concluído
- [ ] Testado em mobile/desktop

## Capturas de Tela
[Se houver mudanças de UI]

## Mudanças Incompatíveis
[Se houver]

## Issues Relacionadas
Closes #123
```

### Workflow de Desenvolvimento

**Workflow diário:**
```bash
# 1. Início do dia
git checkout main
git pull
pnpm install  # Atualiza dependências

# 2. Cria branch de feature
git checkout -b feature/my-feature

# 3. Inicia servidor dev
pnpm dev

# 4. Faz mudanças, testa localmente
# 5. Roda checks de qualidade com frequência
pnpm test

# 6. Commita com frequência (commits pequenos e focados)
git add .
git commit -m "feat: add X"

# 7. Antes do PR
pnpm lint
pnpm type-check
pnpm test
pnpm test:e2e
pnpm build

# 8. Cria PR
git push -u origin feature/my-feature
gh pr create
```

**Ao trocar de tarefa:**
```bash
# Commita o trabalho em progresso
git add .
git commit -m "wip: partial implementation"

# Troca para outra tarefa
git checkout -b feature/other-task

# Volta depois
git checkout feature/my-feature
```

## Estratégia de Testes

### Metas de Cobertura

- **Geral:** >80%
- **Lógica de negócio:** >90%
- **Componentes de UI:** >70%
- **Utils/helpers:** 100%

### O Que Testar

**TESTE:**
- Workflows do usuário (E2E)
- Funções de lógica de negócio
- Validação de rotas de API
- Condições de erro
- Edge cases (arrays vazios, valores null, condições de borda)
- Pontos de integração (cliente de API, chamadas ao Supabase)
- Acessibilidade (navegação por teclado, labels para leitor de tela)

**NÃO TESTE:**
- Getters/setters triviais
- Internals de bibliotecas de terceiros
- Detalhes de estilo/layout da UI
- Recursos do framework (React, Next.js)

### Organização dos Testes

```
src/
  features/
    tasks/
      __tests__/
        TaskList.test.tsx        # Testes de componente
        useTaskMutations.test.ts # Testes de hook
        task-utils.test.ts       # Testes unitários
      TaskList.tsx
      useTaskMutations.ts
      task-utils.ts
```

### Padrões de Teste

**Testes de componente:**
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

**Testes de API:**
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

**Testes E2E:**
```typescript
import { test, expect } from '@playwright/test';

test('user can create and complete task', async ({ page }) => {
  // Login
  await page.goto('/login');
  await page.fill('[name=email]', 'test@example.com');
  await page.fill('[name=password]', 'password');
  await page.click('button[type=submit]');

  // Criar tarefa
  await page.click('text=New Task');
  await page.fill('[name=title]', 'Buy groceries');
  await page.click('button:has-text("Create")');

  // Verificar criação
  await expect(page.locator('text=Buy groceries')).toBeVisible();

  // Concluir tarefa
  await page.click('text=Buy groceries');
  await page.check('[aria-label="Mark complete"]');

  // Verify completed
  await expect(page.locator('text=Buy groceries')).toHaveClass(/completed/);
});
```

## Armadilhas Comuns

### Supabase

1. **Políticas RLS precisam bater com os filtros do cliente**
   ```typescript
   // ❌ O filtro do cliente não funciona se o RLS bloquear
   const { data } = await supabase
     .from('tasks')
     .select('*')
     .eq('workspace_id', 'other-workspace'); // RLS bloqueia isso

   // ✅ Consulte apenas dados permitidos pelo RLS
   const { data } = await supabase
     .from('tasks')
     .select('*'); // RLS filtra automaticamente para os workspaces do usuário
   ```

2. **Renovação de sessão no middleware**
   - Sessões do Supabase expiram após 1 hora
   - O middleware precisa chamar `supabase.auth.getSession()` para renovar
   - Redirecione para login se o refresh falhar

3. **Subscriptions Realtime exigem auth**
   ```typescript
   // ✅ Passe o client autenticado para a subscription
   const channel = supabase
     .channel('tasks')
     .on('postgres_changes', {
       event: '*',
       schema: 'public',
       table: 'tasks'
     }, handler)
     .subscribe();

   // Limpeza no unmount
   return () => { channel.unsubscribe(); };
   ```

### Next.js

1. **Server Components não podem usar hooks**
   ```tsx
   // ❌ Erro: não pode usar useState em Server Component
   export default function Page() {
     const [count, setCount] = useState(0);
     return <div>{count}</div>;
   }

   // ✅ Marque como Client Component
   'use client';
   export default function Page() {
     const [count, setCount] = useState(0);
     return <div>{count}</div>;
   }
   ```

2. **Cookies em Server Actions**
   ```typescript
   // ✅ Use cookies() de next/headers
   import { cookies } from 'next/headers';

   export async function updateUser() {
     'use server';
     const cookieStore = cookies();
     const session = cookieStore.get('session');
   }
   ```

3. **Variáveis de ambiente**
   - `NEXT_PUBLIC_*` → expostas ao navegador
   - As demais → apenas no servidor
   - Nunca coloque secrets em `NEXT_PUBLIC_*`

### TypeScript

1. **Tipos inferidos do Supabase**
   ```typescript
   // ✅ Gere tipos a partir do banco
   // pnpm supabase gen types typescript --local > packages/db/types.ts

   import type { Database } from '@taskflow/db';

   type Task = Database['public']['Tables']['tasks']['Row'];
   ```

2. **Tipagem de form data**
   ```typescript
   // ✅ Use Zod para validação em runtime + inferência de tipos
   const schema = z.object({
     title: z.string(),
     dueDate: z.string().datetime().optional(),
   });

   type FormData = z.infer<typeof schema>;
   ```

### Testing

1. **Mock do client Supabase**
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

2. **Isolamento de testes E2E**
   - Cada teste usa um estado de banco limpo
   - Popule dados em `beforeEach`
   - Limpe em `afterEach`
   ```typescript
   beforeEach(async () => {
     await db.seed(); // Popula workspace + user de teste
   });

   afterEach(async () => {
     await db.reset(); // Limpa todos os dados de teste
   });
   ```

3. **Evite testes flaky**
   - Use `waitFor` em vez de `sleep`
   - Faça mock de funções dependentes do tempo
   - Defina timeouts explícitos para operações assíncronas

### pnpm Workspace

1. **Imports entre pacotes**
   ```json
   // apps/web/package.json
   {
     "dependencies": {
       "@taskflow/ui": "workspace:*",
       "@taskflow/api": "workspace:*"
     }
   }
   ```

2. **Dependências compartilhadas**
   - Instale deps compartilhadas na raiz: `pnpm add -w <package>`
   - Instale deps específicas do pacote: `pnpm add --filter web <package>`

3. **A ordem de build importa**
   ```json
   // turbo.json
   {
     "pipeline": {
       "build": {
         "dependsOn": ["^build"] // Buildar dependências primeiro
       }
     }
   }
   ```

## Segurança

### Autenticação

- **Nunca confie no estado de auth do client-side**
- Sempre verifique a sessão no servidor (rotas de API, Server Components)
- Use RLS do Supabase para autorização
- Faça rotação de secrets mensalmente

### Validação de Entrada

```typescript
// ✅ Valide toda entrada do usuário com Zod
const userInput = createUserSchema.parse(body); // Lança em caso inválido

// ✅ Higienize HTML ao renderizar conteúdo do usuário
import DOMPurify from 'isomorphic-dompurify';
const clean = DOMPurify.sanitize(userHtml);

// ❌ Nunca confie em entrada do usuário
const query = `SELECT * FROM users WHERE id = ${req.body.id}`; // SQL injection!
```

### Gestão de Secrets

1. **Nunca commite secrets**
   - Adicione `.env` ao `.gitignore`
   - Use `.env.example` como template
   - Armazene secrets na Vercel/ambiente

2. **Varredura de secrets**
   - GitGuardian no CI
   - Hooks de pre-commit verificam padrões
   - Faça rotação imediatamente se houver vazamento

3. **Privilégio mínimo**
   - Usuários de banco com permissões mínimas
   - Chaves de API escopadas para recursos específicos
   - Service accounts apenas para CI/CD

### Segurança de Conteúdo

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

### Segurança de Dependências

```bash
# Rode audit em todo PR
pnpm audit --audit-level=high

# Atualize dependências vulneráveis
pnpm update

# Verifique pacotes desatualizados
pnpm outdated
```

## Performance

### Banco de Dados

- Use índices em colunas consultadas com frequência
- Limite conjuntos de resultado (paginação)
- Use `select()` com colunas explícitas, não `SELECT *`
- Habilite connection pooling do Postgres (o Supabase já faz isso)

### React Query

```typescript
// ✅ Padrão stale-while-revalidate
const { data } = useQuery({
  queryKey: ['tasks', workspaceId],
  queryFn: () => fetchTasks(workspaceId),
  staleTime: 30_000, // 30s
  gcTime: 5 * 60 * 1000, // 5min
});

// ✅ Atualizações otimistas
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
// ✅ Use Static Generation para páginas de marketing
export const dynamic = 'force-static';

// ✅ Use ISR para dados que mudam com frequência
export const revalidate = 60; // Revalida a cada 60s

// ✅ Lazy load de componentes pesados
const Chart = dynamic(() => import('./Chart'), {
  loading: () => <Skeleton />,
  ssr: false,
});

// ✅ Otimize imagens
import Image from 'next/image';

<Image
  src="/hero.png"
  alt="Hero"
  width={800}
  height={600}
  priority // Acima da dobra
/>
```

### Tamanho de Bundle

- Monitore o bundle com `@next/bundle-analyzer`
- Faça lazy load de código não crítico
- Faça tree-shake de exports não usados
- Mantenha o bundle total <300KB (gzipped)

## Deploy

**Plataforma:** Vercel

**Ambientes:**
- Produção: branch `main` → `https://your-app.vercel.app`
- Preview: todos os PRs → `https://your-app-git-<branch>.vercel.app`

**Variáveis de ambiente:**
- Definidas no dashboard da Vercel
- Valores separados para produção/preview
- Nunca commite `.env` no git

**Processo de Deploy:**
1. Faça merge do PR em `main`
2. A Vercel faz deploy automático
3. Roda build + testes
4. Faz deploy se tudo passar
5. Notifica no Slack

**Rollback:**
```bash
# Via Vercel CLI
vercel rollback

# Ou redeploy do commit anterior
git revert HEAD
git push
```

## Recursos

- **Sistema de Design:** `<your-design-system-url>`
- **API Docs:** `<your-api-docs-url>`
- **Supabase Dashboard:** `<your-supabase-dashboard-url>`
- **Monitoramento:** `<your-monitoring-url>`
- **Figma:** `<your-figma-url>`

## Equipe

- Pergunte à @alice sobre design
- Pergunte ao @bob sobre banco/backend
- Pergunte ao @charlie sobre DevOps/deploy

## Histórico de Mudanças

- **2026-03-10:** Migração de Firebase para Supabase
- **2026-03-01:** Upgrade para Next.js 15 + React 19
- **2026-02-15:** Implementação de colaboração em tempo real
- **2026-02-01:** Lançamento beta com 100 usuários
