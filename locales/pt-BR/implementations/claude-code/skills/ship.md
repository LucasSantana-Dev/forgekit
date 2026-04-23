---
name: ship
description: Fluxo completo de git - fazer commit das mudanças com mensagem convencional, enviar para o remoto e criar pull request
triggers:
  - create a PR
  - ship this code
  - commit and push
  - ready to merge
  - submit for review
---

# Enviar Código

Fluxo completo para fazer commit das mudanças, enviar para o remoto e criar um pull request.

## Pré-requisitos

Verifique o seguinte antes de enviar:
- [ ] Todas as mudanças são intencionais
- [ ] Os gates de qualidade passam (rode a skill `/verify`)
- [ ] Não há secrets no código
- [ ] A branch está atualizada com a branch base

## Entradas Necessárias

Antes de começar, reúna:
1. **Tipo de commit** (feat, fix, refactor, chore, docs, style, ci, test)
2. **Descrição curta** (o que mudou, <72 chars)
3. **Título do PR** (pode ser igual ao commit ou mais descritivo)
4. **Corpo do PR** (resumo das mudanças, plano de testes, breaking changes)

## Etapas

### 1. Verificar Estado Limpo

Confira o estado atual do git:

```bash
git status
```

**Verifique:**
- Não há conflitos de merge
- Você está na branch de feature correta (não `main`/`master`)
- Todos os arquivos pretendidos estão modificados

Se estiver em `main`/`master`:
```bash
# Crie a branch de feature primeiro
git checkout -b feature/your-feature-name
```

### 2. Revisar Mudanças

Mostre todas as mudanças prestes a serem commitadas:

```bash
# Ver diff de todas as mudanças
git diff

# Ver mudanças staged (se houver)
git diff --cached

# Ver status dos arquivos
git status --short
```

**Confira se há:**
- Mudanças não intencionais (logs de debug, código comentado)
- Secrets ou chaves de API
- Arquivos binários grandes
- Arquivos que deveriam estar no `.gitignore`

### 3. Rodar Gates de Qualidade

Antes de commitar, garanta a qualidade do código:

```bash
# Rodar verificação completa (ou usar a skill /verify)
npm run lint && npm run type-check && npm test && npm run build
```

**Se algum check falhar:**
- Pare e corrija os problemas primeiro
- Rode os gates de qualidade novamente
- Só prossiga quando tudo passar

### 4. Fazer Stage dos Arquivos

Adicione arquivos à área de stage:

```bash
# Fazer stage de arquivos específicos (preferido - explícito)
git add src/components/Button.tsx
git add src/hooks/useAuth.ts
git add src/lib/api.ts

# Ou fazer stage de todas as mudanças (use com cautela)
git add .
```

**Boa prática:** faça stage dos arquivos individualmente para evitar commitar sem querer:
- arquivos `.env`
- `node_modules/` ou outros artefatos de build
- arquivos de configuração da IDE
- arquivos temporários/de debug

### 5. Criar Commit Convencional

Formato: `<type>(<scope>): <description>`

**Tipos:**
- `feat`: Nova funcionalidade
- `fix`: Correção de bug
- `refactor`: Mudança de código que não corrige bug nem adiciona funcionalidade
- `chore`: Mudanças em build, dependências, tooling
- `docs`: Apenas mudanças de documentação
- `style`: Mudanças de estilo de código (formatação, semicolons ausentes etc.)
- `ci`: Mudanças em arquivos e scripts de configuração de CI
- `test`: Adição ou atualização de testes
- `perf`: Melhorias de performance
- `revert`: Reverte um commit anterior

**Scope (opcional):** componente/módulo afetado (ex.: `auth`, `ui`, `api`)

**Exemplos:**
```
feat(auth): add OAuth2 login flow
fix(ui): correct button alignment on mobile
refactor(api): simplify error handling logic
chore(deps): update dependencies to latest versions
docs(readme): add setup instructions for Windows
```

**Comando de commit:**

```bash
git commit -m "$(cat <<'EOF'
<type>(<scope>): <description>

<optional body with more details>

<optional footer with breaking changes, ticket refs>
EOF
)"
```

**Importante:**
- Use formato HEREDOC para mensagens multi-linha
- Não adicione linha de `Co-Authored-By`
- Mantenha a primeira linha com menos de 72 caracteres
- Adicione uma linha em branco entre assunto e corpo
- Faça wrap do corpo em 72 caracteres

**Formato para breaking changes:**
```
feat(api): change authentication endpoint

BREAKING CHANGE: /auth/login now requires email instead of username.
Update all API clients to send email field.
```

### 6. Enviar para o Remoto

Envie a branch de feature para o remoto:

```bash
# Primeira vez enviando esta branch
git push -u origin <branch-name>

# Envios seguintes
git push
```

**Se o push for rejeitado:**
```bash
# O remoto tem mudanças que você ainda não tem localmente
git pull --rebase origin <branch-name>

# Resolva eventuais conflitos se acontecerem
# Depois faça push novamente
git push
```

### 7. Criar Pull Request

Use GitHub CLI para criação consistente de PRs:

```bash
gh pr create \
  --title "feat(auth): add OAuth2 login flow" \
  --body "$(cat <<'EOF'
## Resumo
- Fluxo de autenticação OAuth2 implementado
- Handlers de login/logout adicionados
- Integração com Supabase Auth concluída

## Mudanças
- Componente `OAuthButton` adicionado
- Hook `useOAuth` criado
- Rotas de API de auth atualizadas

## Plano de Testes
- [ ] Teste manual com Google OAuth
- [ ] Testes unitários para handlers de auth (87% de cobertura)
- [ ] Teste E2E para o fluxo de login

## Mudanças Incompatíveis
Nenhuma

## Issues Relacionadas
Closes #42
Relates to #38
EOF
)"
```

**Diretrizes para o título do PR:**
- Igual à mensagem de commit (ou mais descritivo)
- Use formato de conventional commit
- Mantenha abaixo de 72 caracteres
- Descreva o que mudou, não como

**Seções do corpo do PR:**
- **Resumo:** 2-3 bullets sobre o que mudou
- **Mudanças:** detalhes técnicos das modificações
- **Plano de Testes:** como as mudanças foram verificadas
- **Mudanças Incompatíveis:** mudanças de API incompatíveis
- **Issues Relacionadas:** link para issues relevantes

### 8. Verificar se o PR Foi Criado

Confira se o PR foi criado com sucesso:

```bash
# Ver PR no navegador
gh pr view --web

# Ou obter detalhes do PR no terminal
gh pr view
```

**Verifique:**
- Título/corpo do PR estão corretos
- Checks de CI estão rodando
- Não há conflitos de merge
- Está vinculado às issues corretas
- Reviewers corretos foram atribuídos (se aplicável)

### 9. Monitorar CI

Acompanhe os resultados do pipeline de CI:

```bash
# Ver status do CI
gh pr checks
```
