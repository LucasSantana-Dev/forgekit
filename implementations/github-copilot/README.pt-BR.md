# Implementação para GitHub Copilot

Implementação de referência dos patterns do toolkit para GitHub Copilot.

## O Que Continua Genérico

Antes de falar de Copilot, a lógica continua a mesma:

- `rules/` definem comportamento
- `patterns/` explicam workflow
- `best-practices/` resumem guardrails operacionais

Entre nesta pasta quando quiser adaptar o toolkit ao Copilot, não quando estiver tentando entender o toolkit pela primeira vez.

## Superfícies de Instrução

GitHub Copilot pode usar várias camadas de instrução dentro do repositório:

- `.github/copilot-instructions.md` para instruções gerais do repositório
- `.github/instructions/*.instructions.md` para guidance por caminho
- `AGENTS.md`, `CLAUDE.md` ou `GEMINI.md` quando a superfície do Copilot suportar arquivos nesse estilo

Use `rules/COPILOT.md` como template reutilizável. Use `.github/copilot-instructions.md` como arquivo efetivo de instruções do repositório.

## Setup Recomendado

```bash
mkdir -p .github
cp rules/COPILOT.md .github/copilot-instructions.md
```

Para guidance por caminho:

```bash
mkdir -p .github/instructions
cat > .github/instructions/testing.instructions.md <<'EOF'
---
applyTo: "**/*.{test,spec}.{js,ts,tsx,py}"
---
- Prefira testes focados em comportamento
- Evite asserts presos a detalhes de implementação
- Cubra erros e edge cases
EOF
```

## Como Usar o Toolkit com Copilot

- mantenha regras gerais em `.github/copilot-instructions.md`
- use `AGENTS.md` ou `CLAUDE.md` se quiser um estilo mais agentic em superfícies compatíveis
- use `patterns/` para decidir o workflow, não apenas a redação das instruções
- use `best-practices/` como camada curta de operação
