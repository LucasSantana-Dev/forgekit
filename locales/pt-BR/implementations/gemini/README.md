# Implementação para Gemini

Implementação de referência dos patterns do toolkit para Gemini CLI e Gemini Code Assist.

## O Que Continua Genérico

Antes de pensar em Gemini, a ideia central continua a mesma:

- use `rules/` para comportamento padrão
- use `patterns/` para workflow
- use `best-practices/` para o checklist operacional

Entre em `implementations/gemini/` apenas quando você realmente precisar de setup específico do Gemini.

## Gemini CLI

Gemini CLI é um agente de terminal com ferramentas embutidas, suporte a MCP, janelas grandes de contexto e arquivo de comportamento por projeto.

### Setup

```bash
npm install -g @google/gemini-cli
cp rules/GEMINI.md your-project/GEMINI.md
```

Autentique com um dos métodos suportados:

- login do Google para uso individual
- `GEMINI_API_KEY` para uso via API
- variáveis de ambiente do Vertex AI para uso corporativo

Depois inicie o Gemini no projeto:

```bash
cd your-project
gemini
```

## Contexto e Regras no Gemini

Use `GEMINI.md` como arquivo estável de instruções do projeto.

Guarde esta divisão:

- `GEMINI.md` para comportamento e expectativas
- prompts para ações concretas
- padrões duráveis no `GEMINI.md`
- contexto temporário em prompts ou arquivos de memória do projeto

## Gemini Code Assist no GitHub

No GitHub, a superfície principal de instrução é `.gemini/styleguide.md`.

Use esse arquivo para:

- padrões de código
- expectativas de teste
- heurísticas de review
- preferências de arquitetura e do repositório

O repositório também pode incluir `.gemini/config.yaml` quando você precisar de flags ou regras de ignore.

## Mapeamento Recomendado

- `rules/GEMINI.md` -> `GEMINI.md` na raiz do projeto
- `.gemini/styleguide.md` -> guidance de review do Gemini no GitHub
- `patterns/` -> playbooks de workflow
- `best-practices/` -> checklists curtos de operação

## Onde Ele Se Encaixa Melhor

Gemini funciona bem neste toolkit quando você quer:

- assistência de código terminal-first
- análise de codebase com contexto grande
- workflows conectados a MCP
- guidance de review no GitHub via `.gemini/styleguide.md`

## Arquivos Relacionados

- `rules/GEMINI.md`
- `.gemini/styleguide.md`
- `patterns/context-building.md`
- `patterns/task-orchestration.md`
- `patterns/testing.md`
