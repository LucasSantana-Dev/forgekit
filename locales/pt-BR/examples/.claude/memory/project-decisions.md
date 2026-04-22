---
name: Decisões do Projeto
description: Principais decisões arquiteturais e sua justificativa
type: project
created: 2026-02-15
updated: 2026-03-14
---

# Decisões do Projeto

## 1. Monorepo com Turborepo (2026-02-15)

### Por quê
- Compartilhar configs de TypeScript, regras de ESLint e utilitários entre 3 apps
- Commits atômicos entre frontend + backend para desenvolvimento de features
- Pipeline único de CI, processo de deploy unificado
- O time é pequeno (4 devs) — o overhead de coordenação é mínimo

### Como Aplicar
- Novos packages entram em `packages/` (código compartilhado) ou `apps/` (apps implantáveis)
- Use workspace protocol para dependências internas: `"@company/utils": "workspace:*"`
- Rode tasks a partir da raiz: `pnpm turbo lint test build`
- Cada package tem seu próprio `package.json` e `tsconfig.json`, estendendo as configs da raiz

### Consequências
- Tempo de CI um pouco maior (todos os packages são verificados em cada PR)
- Exige gestão cuidadosa de dependências para evitar circular deps
- O tooling precisa suportar monorepos (Vercel e Railway suportam)

---

## 2. PostgreSQL em vez de MongoDB (2026-02-20)

### Por quê
- O modelo de dados tem relações claras (usuários → times → projetos)
- Precisamos de garantias ACID para billing e permissões
- Tipagem forte via schema do Prisma
- O time tem mais experiência com SQL do que com NoSQL

### Como Aplicar
- Use Prisma para schema + migrations + client type-safe
- Índices em foreign keys e colunas consultadas com frequência
- Use `SELECT` com colunas explícitas, não `SELECT *`
- Use transações para operações em múltiplas tabelas (ex.: criar time + atribuir owner)

### Consequências
- Mudanças de schema exigem migrations (menos flexível do que schemaless)
- É preciso connection pooling para serverless (usando PgBouncer no Railway)
- Joins podem ficar caros — desnormalize tabelas com muita leitura, se necessário

---

## 3. Feature Flags com Tabela no Banco (2026-03-01)

### Por quê
- Precisamos ativar/desativar features por usuário e por organização
- Já tentamos variáveis de ambiente — granularidade grosseira demais (tudo ou nada)
- LaunchDarkly/Unleash é excesso para uma beta com 50 usuários
- Uma tabela simples `feature_flags` + cache em Redis = rápido + flexível

### Como Aplicar
- Schema: `feature_flags(id, key, enabled, scope, scope_id)` em que `scope` é `global|user|org`
- Verificação de flag: `await isFeatureEnabled('new-dashboard', { userId: '123' })`
- Faça cache no Redis com TTL de 5min para evitar hits no banco em toda request
- Adicione novas flags via migration, não via SQL manual

### Consequências
- Complexidade de invalidação de cache — é preciso limpar o Redis ao atualizar flags
- Sem A/B testing embutido (apenas on/off) — migraremos para uma plataforma adequada com 1000+ usuários
- Exige disciplina de cleanup de flags (remover após rollout completo)

---

## 4. Rastreamento de Erros no Client com Sentry (2026-03-10)

### Por quê
- Usuários relatando "não funciona" sem detalhes
- Browser DevTools não acessível em produção
- Precisamos de stack traces + contexto do usuário + breadcrumbs
- O tier gratuito do Sentry cobre o tráfego da beta (<5k eventos/mês)

### Como Aplicar
- Inicialize o Sentry em `_app.tsx` com tags `environment`, `release`, `userId`
- Envolva chamadas de API em try-catch e envie para o Sentry com contexto:
  ```ts
  try {
    await apiCall();
  } catch (err) {
    Sentry.captureException(err, { tags: { endpoint: '/api/users' } });
    throw err; // relança depois de registrar
  }
  ```
- Use `Sentry.setUser()` após a autenticação para rastrear erros por usuário
- Filtre erros conhecidos de scripts de terceiros (ads, extensões)

### Consequências
- Preocupação com PII — sanitize os dados do usuário antes de enviar ao Sentry
- Ruído de erro gerado por bots — filtre por user agent
- Limite do tier gratuito — precisará de plano pago em escala
