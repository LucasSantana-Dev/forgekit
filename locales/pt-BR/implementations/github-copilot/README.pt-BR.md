# Implementação para GitHub Copilot

Implementação de referência dos padrões do toolkit para GitHub Copilot.

## Como o Copilot Lê Instruções

GitHub Copilot usa duas superfícies principais de instrução no repositório:

- `.github/copilot-instructions.md`
- `.github/instructions/*.instructions.md` para guidance mais escopado

No toolkit, isso significa que as regras base podem ser adaptadas para essas superfícies sem mudar a filosofia central.

## Configuração

```bash
mkdir -p .github
cp ../../rules/COPILOT.md .github/copilot-instructions.md
```

Se você quiser guidance mais granular, divida o conteúdo em arquivos adicionais dentro de:

```bash
.github/instructions/
```

## O Que Esta Implementação Faz

Esta implementação mostra como traduzir o guidance do toolkit para o modelo operacional do Copilot:

- padrões de comportamento persistentes
- expectativas de qualidade e verificação
- disciplina de workflow e review
- regras de documentação e segurança

## Recomendações de Uso

Use o Copilot com a mesma hierarquia mental do restante do toolkit:

1. regras primeiro
2. patterns para workflow
3. best practices para disciplina operacional
4. implementações específicas quando a ferramenta exigir formato próprio

## Arquivos Relacionados

- `rules/COPILOT.md`
- `.github/copilot-instructions.md`
- `.github/instructions/*.instructions.md`
- `patterns/code-review.md`
- `patterns/testing.md`
- `patterns/context-building.md`

## Observação

Copilot não substitui o guidance do toolkit; ele apenas consome esse guidance por superfícies diferentes das usadas por Claude Code, Codex CLI ou Gemini.
