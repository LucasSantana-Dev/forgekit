---
name: Preferências do Usuário
description: Preferências de workflow do desenvolvedor, estilo de código e padrões de comunicação
type: user
created: 2026-03-01
updated: 2026-03-15
---

# Preferências do Usuário

## Estilo de Comunicação
- Direto e conciso — sem rodeios, vá ao ponto
- Quer opiniões e contrapontos, não concordância cega
- Prefere "aqui está o que penso, e por quê" em vez de "o que você gostaria que eu fizesse?"
- Assume competência — explique edge cases, não o básico

## Workflow
- Faça commits constantes com valor: depois de cada etapa funcional, commit + push
- Qualidade em primeiro lugar: rode lint/security/tests com frequência, detecte issues cedo
- Filosofia: entregar rápido, falhar cedo, corrigir cedo
- Trabalhe com autonomia — confirme apenas ações realmente destrutivas/irreversíveis

## Preferências de Código
- TypeScript strict mode sempre habilitado
- Estilo funcional acima de OOP sempre que possível
- Sem abstração prematura — espere até o padrão aparecer 3+ vezes
- Tratamento de erros: explícito acima de implícito (sem falhas silenciosas)
- Prefira composição a herança
- Mantenha funções pequenas: <50 linhas, complexidade ciclomática <10

## Filosofia de Testes
- Meta de cobertura: >80% (sem falsos positivos)
- Teste lógica de negócio e valor para o usuário, NÃO getters/setters triviais
- Edge cases e condições de erro importam mais do que caminhos felizes
- Testes de integração > testes unitários para rotas de API
- Faça mock de dependências externas, não de módulos internos

## Tech Stack
- **Frontend**: React 19, TypeScript, Tailwind CSS, Radix UI
- **Backend**: Node.js, Express, PostgreSQL, Redis
- **Build**: Turborepo, tsup, esbuild
- **Deploy**: Vercel (frontend), Railway (backend)
- **Testing**: Vitest, Playwright
- **Linting**: ESLint 9, Prettier, TypeScript ESLint

## Anti-Patterns a Evitar
- Não adicione comentários explicando o que o código faz — escreva código autoexplicativo
- Não crie arquivos de documentação específicos de tarefa (STATUS.md, PROGRESS.md)
- Não use tipos `any` — use `unknown` e type guards
- Não engula erros — registre e propague ou trate explicitamente
- Não adicione dependências sem checar o impacto no bundle
