---
name: verify
description: Rodar a suíte completa de gates de qualidade (lint, type-check, test, build) para verificar o código antes de commit ou PR
triggers:
  - verify code quality
  - run quality gates
  - check before commit
  - validate changes
  - pre-commit checks
---

# Verificar Qualidade do Código

Roda checks abrangentes de qualidade para garantir que o código atenda aos padrões do projeto antes de commitar ou criar um PR.

## Pré-requisitos

Confira se as seguintes ferramentas estão disponíveis:
- Linter (ESLint, Ruff, golangci-lint etc.)
- Type checker (TypeScript, mypy etc.)
- Test runner (Jest, Vitest, pytest etc.)
- Ferramenta de build (tsc, webpack, vite, cargo, go build etc.)

## Etapas

### 1. Verificar Status do Git

Primeiro, confira o estado atual:

```bash
git status
```

**Verifique:**
- Está na branch correta
- Não há mudanças inesperadas
- Não há conflitos de merge

Se houver mudanças não commitadas, tudo bem, estamos testando justamente isso.

### 2. Instalar Dependências

Garanta que todas as dependências estejam atualizadas:

```bash
# Para projetos Node.js
if [ -f package-lock.json ]; then
  npm ci
elif [ -f yarn.lock ]; then
  yarn install --frozen-lockfile
elif [ -f pnpm-lock.yaml ]; then
  pnpm install --frozen-lockfile
fi

# Para projetos Python
if [ -f requirements.txt ]; then
  pip install -r requirements.txt
elif [ -f pyproject.toml ]; then
  pip install -e .
fi

# Para projetos Go
if [ -f go.mod ]; then
  go mod download
fi

# Para projetos Rust
if [ -f Cargo.toml ]; then
  cargo fetch
fi
```

### 3. Rodar o Linter

Confira estilo de código e erros comuns:

```bash
# Node.js / TypeScript
npm run lint

# Python (Ruff)
ruff check .

# Python (Flake8)
flake8 .

# Go
golangci-lint run

# Rust
cargo clippy -- -D warnings
```

**Critérios de sucesso:**
- Zero erros de lint
- Zero warnings (ou apenas warnings aceitáveis documentados em `CLAUDE.md`)

**Se encontrar erros:**
1. Revise a saída
2. Corrija manualmente ou rode auto-fix:
   - `npm run lint -- --fix`
   - `ruff check --fix .`
   - `eslint --fix .`
3. Rode o linter novamente para confirmar
4. Faça commit das correções separadamente se forem mudanças grandes

### 4. Rodar o Type Checker

Verifique segurança de tipos (para linguagens estaticamente tipadas):

```bash
# TypeScript
npm run type-check
# ou
tsc --noEmit

# Python (mypy)
mypy .

# Go (embutido no compilador)
go build ./...

# Rust (embutido no compilador)
cargo check
```

**Critérios de sucesso:**
- Zero erros de tipo

**Se encontrar erros:**
1. Revise os erros de tipo
2. Corrija os problemas
3. Rode o type checker novamente
4. Considere se as mudanças exigem atualizar definições de tipos

### 5. Rodar os Testes

Execute a suíte de testes com cobertura:

```bash
# Node.js (Jest)
npm test -- --coverage

# Node.js (Vitest)
npm run test:coverage

# Python (pytest)
pytest --cov

# Go
go test ./... -cover

# Rust
cargo test
```

**Critérios de sucesso:**
- Todos os testes passam
- Cobertura atinge o limiar (tipicamente >80%, confira em `CLAUDE.md`)
- Nada de testes flaky (rode duas vezes se houver suspeita)

**Se os testes falharem:**
1. Revise as falhas, são bugs legítimos ou testes ruins?
2. Se forem bugs legítimos:
   - Corrija o código
   - Rode os testes novamente
3. Se forem testes ruins:
   - Corrija a lógica do teste
   - Garanta que os testes reflitam os requisitos reais
4. Se forem testes flaky:
   - Documente em `MEMORY.md`
   - Corrija race conditions ou problemas de timing
   - Considere marcar como skip com ticket

### 6. Rodar o Build

Verifique se o projeto builda com sucesso:

```bash
# Node.js (TypeScript)
npm run build

# Python (build do pacote)
python -m build

# Go
go build ./...

# Rust
cargo build --release
```

**Critérios de sucesso:**
- O build termina sem erros
- Não há warnings sobre arquivos ausentes ou imports quebrados
- Os artefatos de saída são gerados nos locais esperados

**Se o build falhar:**
1. Revise a saída para erros específicos
2. Problemas comuns:
   - Definições de tipo ausentes
   - Imports quebrados
   - Configuração inválida de `tsconfig`/`cargo`/`go.mod`
3. Corrija e rode o build novamente

### 7. Varredura de Segurança (Opcional, mas Recomendada)

Rode checks de segurança se estiverem disponíveis:

```bash
# Node.js (npm audit)
npm audit --audit-level=high

# Python (pip-audit)
pip-audit

# Go (gosec)
gosec ./...

# Rust (cargo-audit)
cargo audit

# Geral (Trivy)
trivy fs .
```

**Critérios de sucesso:**
- Nenhuma vulnerabilidade high ou critical
- Vulnerabilidades conhecidas low/medium documentadas em `MEMORY.md`

**Se encontrar vulnerabilidades:**
1. Revise a severidade
2. Para high/critical: precisa corrigir antes do PR
3. Para medium/low: documente e planeje a correção
4. Atualize dependências se houver patches disponíveis

### 8. Relatório de Resumo

Depois que todos os checks terminarem, forneça um resumo:

```
✅ Resultados dos Gates de Qualidade
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✓ Linting       - Passou
✓ Tipagem       - Passou
✓ Testes        - Passou (428/428, 87% de cobertura)
✓ Build         - Passou
✓ Segurança     - Passou (0 high/critical)

Todos os checks passaram! Seguro para commit/PR.
```

Se algum check falhar:

```
❌ Resultados dos Gates de Qualidade
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✓ Linting       - Passou
✗ Tipagem       - Falhou (3 errors)
✓ Testes        - Passou (428/428, 87% de cobertura)
✗ Build         - Falhou
- Segurança     - Ignorado (build falhou)

Corrija os erros acima antes de commitar.
```

## Próximos Passos

### Se todos os checks passaram:

1. **Commitar mudanças:**
   ```bash
   git add .
   git commit -m "feat: your conventional commit message"
   ```

2. **Enviar para o remoto:**
   ```bash
   git push origin <branch-name>
   ```

3. **Criar PR** (se estiver pronto):
   - Use a skill `/ship`, ou
   - `gh pr create --title "..." --body "..."`

### Se os checks falharam:

1. Corrija os problemas um por vez
2. Rode `/verify` novamente após as correções
3. Não faça commit até tudo passar

## Configuração

### Gates Específicos do Projeto

Projetos podem ter gates adicionais de qualidade. Confira `CLAUDE.md` para:
- comandos de teste customizados
- limiares específicos de cobertura
- scripts adicionais de validação
- checks específicos do framework (ex.: Lighthouse para web, load tests)

### Opções de Skip (Use com Moderação)

Para correções emergenciais ou exceções documentadas:

```bash
# Pular checks específicos (não recomendado)
SKIP_LINT=1 npm run verify
SKIP_TESTS=1 npm run verify

# Pular todos os checks (use apenas para docs/config)
git commit --no-verify
```

**AVISO:** só pule checks quando:
- as mudanças forem apenas documentação
- as mudanças forem apenas arquivos de configuração sem código
- você tiver aprovação explícita do líder da equipe
- documentar o motivo na mensagem de commit

## Solução de Problemas

### Erros de "Command not found"

Instale as ferramentas ausentes:

```bash
# ESLint
npm install --save-dev eslint

# TypeScript
npm install --save-dev typescript

# Jest
npm install --save-dev jest

# Ruff
pip install ruff

# Pytest
pip install pytest pytest-cov
```

### Testes passam localmente, mas falham no CI

Causas comuns:
1. **Diferenças de ambiente:**
   - Confira se a versão de Node.js/Python bate com a do CI
   - Confira variáveis de ambiente no CI
   - Confira caminhos de arquivo (absoluto vs relativo)

2. **Problemas de timing:**
   - Aumente timeouts em testes flaky
   - Use padrões corretos de async/await
   - Faça mock de funções dependentes de tempo

3. **Dependências ausentes:**
   - Garanta que `package-lock.json` esteja commitado
   - Confira se o CI instala todas as dev dependencies

### Build funciona, mas há erros em runtime

Rode checks adicionais:
```bash
# Para apps web, suba o servidor dev e teste manualmente
npm run dev

# Para CLIs, teste a execução real
./dist/cli.js --help

# Para libs, teste em um projeto consumidor
npm link && cd ../test-project && npm link your-lib
```

## Critérios de Sucesso

**Esta skill tem sucesso quando:**
- Todos os gates de qualidade passam
- Não há erros nem warnings críticos
- A cobertura atinge o limiar
- Os artefatos de build são válidos
- O relatório final mostra todos os checks verdes

**Esta skill falha quando:**
- Qualquer gate de qualidade falha
- Vulnerabilidades críticas são encontradas
- A cobertura fica abaixo do limiar
- O build produz artefatos inválidos

Relate tanto o status final quanto os checks específicos que falharam para facilitar a correção.
