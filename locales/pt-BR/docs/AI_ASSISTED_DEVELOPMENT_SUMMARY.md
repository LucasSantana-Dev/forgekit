# Resumo do AI Dev Toolkit

Este repositório é um toolkit para desenvolvimento assistido por IA. Ele não é um app e não é um framework para ser importado no código de produção. O objetivo é ajudar agentes de programação a trabalhar com mais contexto, padrões mais seguros, fluxos mais claros e resultados mais repetíveis.

## O Jeito Mais Rápido de Tirar Valor

Se você está chegando agora, faça o caminho mais simples:

1. Descubra qual superfície de instrução o seu agente já lê.
2. Copie um arquivo-base de regras para o seu projeto.
3. Só depois adicione patterns de contexto, review e testes.

Depois traduza isso para a ferramenta que você usa:

- `rules/CLAUDE.md` para Claude Code e ferramentas compatíveis
- `rules/AGENTS.md` para Codex CLI
- `rules/COPILOT.md` para GitHub Copilot
- `rules/GEMINI.md` para Gemini CLI e superfícies relacionadas do Gemini
- `rules/ANTIGRAVITY.md` para Antigravity
- os arquivos específicos para Cursor e Windsurf

Copie o arquivo certo para a raiz do seu projeto. Isso já dá ao agente uma base de identidade, padrões de código, workflow, testes, segurança e entrega antes do primeiro prompt.

Você não precisa instalar tudo para se beneficiar do repositório. No primeiro dia, você também pode ignorar `companies/`, `training/`, ecossistemas de plugins e bootstrap de máquina.

## O Que Existe Aqui Dentro

### 1. Regras

O diretório `rules/` contém arquivos prontos para diferentes ferramentas de IA.

Use essas regras quando você quiser que o agente respeite automaticamente:

- seus padrões de código
- workflow trunk-based
- gates de teste e verificação
- regras de documentação
- limites de segurança
- expectativa de execução durável

Pense em regras como a camada de comportamento sempre carregada.

### 2. Patterns

O diretório `patterns/` contém playbooks de workflow. Eles explicam como usar IA direito, não apenas o que mandar para o modelo.

### 3. Best Practices

`best-practices/` é a camada curta e operacional em cima dos `patterns`.

### 4. forge-kit

`kit/` contém o `forge-kit`, o sistema de instalação e configuração do toolkit.
