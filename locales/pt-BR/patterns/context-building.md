# Construção de Contexto

> A ação mais impactante que você pode tomar em desenvolvimento assistido por IA é dar ao agente o contexto certo antes que ele escreva uma única linha de código.

## O Problema

Agentes de IA são tão bons quanto o contexto que recebem. Um modelo poderoso com zero contexto de projeto gera código genérico. Um modelo mediano com excelente contexto produz código que se encaixa perfeitamente no seu projeto.

## O Pattern

Todo projeto deveria ter uma **camada de contexto** — um conjunto de arquivos que qualquer agente de IA lê antes de começar a trabalhar. Os nomes dos arquivos variam por ferramenta, mas o pattern de conteúdo é universal.

### Mapeamento de Arquivos de Contexto

| Ferramenta | Arquivo principal | Arquivo secundário |
|------|-------------|----------------|
| Claude Code | `CLAUDE.md` | — |
| OpenCode | `AGENTS.md` | `CLAUDE.md` |
| Cursor | `.cursorrules` | `.cursor/rules/*.mdc` |
| GitHub Copilot | `COPILOT.md` | `.github/copilot-instructions.md` |
| Windsurf | `.windsurfrules` | — |
| Qualquer ferramenta | `CONVENTIONS.md` | — |

### O que incluir

**Sempre inclua (alto sinal):**

```markdown
# Nome do Projeto

## Referência Rápida
- Build: `npm run build`
- Teste: `npm test`
- Lint: `npm run lint`
- Dev: `npm run dev`

## Arquitetura
- Descrição breve da estrutura do projeto
- Diretórios principais e seu propósito
- Stack técnica (framework, banco, deploy)

## Padrões de Código
- Convenções de linguagem (funcional vs OOP, naming)
- Limites de tamanho de linha e de função
- Ordem de imports, organização de arquivos

## Workflow
- Convenção de nomes de branch
- Formato das mensagens de commit
- Processo de PR
```

**Nunca inclua (ruído):**
- Documentação completa da API (o agente pode ler o código)
- Listas de dependências (o agente lê `package.json`)
- Changelog histórico (o agente lê `git log`)
- Explicações em estilo tutorial

### A Regra 80/20

80% do valor do contexto vem de:
1. **Como rodar as coisas** — comandos de build, teste e lint
2. **Onde as coisas estão** — estrutura do projeto, diretórios-chave
3. **O que não fazer** — gotchas, anti-patterns e erros passados

## Contexto Progressivo

Não despeje tudo em um único arquivo. Faça camadas de contexto:

```
Raiz do projeto/
  CLAUDE.md          ← Regras globais do projeto (sempre carregadas)
  src/
    api/
      CLAUDE.md      ← Convenções específicas de API (carregadas ao trabalhar em api/)
    frontend/
      CLAUDE.md      ← Patterns específicos de frontend
```

## Sistemas de Memória

Arquivos de contexto são a camada **estática**. Para contexto **dinâmico** (o que foi feito, o que vem a seguir, decisões tomadas), use:

1. **Memória baseada em arquivo** — `.claude/memory/`, `.serena/memories/`
2. **Persistência de sessão** — ferramentas que salvam/restauram o estado da sessão
3. **Histórico do Git** — mensagens de commit como contexto (escreva bons commits)

Veja: [Sistemas de Memória](memory-systems.md)

## Anti-Patterns

- **Sobrecarga de contexto**: arquivos de regras com 500 linhas que o agente passa por cima
- **Contexto desatualizado**: regras que descrevem como o projeto funcionava 6 meses atrás
- **Contexto duplicado**: as mesmas regras em `CLAUDE.md`, `.cursorrules` e `README`
- **Contexto vago**: “escreva código limpo” não ensina nada; “funções <50 linhas, sem comentários a menos que peçam” ensina

## Como medir a qualidade do contexto

Seu contexto está funcionando quando:
- A primeira tentativa do agente é utilizável em 80%+ dos casos
- Você raramente precisa explicar convenções do projeto no meio da sessão
- Sessões novas não repetem erros de sessões antigas
- O agente faz as mesmas escolhas arquiteturais que você faria
