# AI Dev Toolkit

Toolkit reutilizável para desenvolvimento assistido por IA: patterns, regras, skills portáteis, configuração multi-ferramenta e implementações de referência para fazer agentes de código trabalharem com mais contexto, mais consistência e menos supervisão manual.

## Comece Por Aqui

Se você quer entender o repositório em um único arquivo, leia primeiro:

- [Resumo do AI Dev Toolkit](./docs/AI_ASSISTED_DEVELOPMENT_SUMMARY.pt-BR.md)

Se você quer usar o toolkit no seu projeto o mais rápido possível:

1. copie um arquivo de `rules/` para a raiz do seu projeto
2. comece por `CLAUDE`, `AGENTS`, `COPILOT`, `GEMINI` ou `ANTIGRAVITY`, de acordo com a ferramenta
3. leia `patterns/context-building.md`
4. leia `patterns/task-orchestration.md`
5. adicione `patterns/code-review.md` e `patterns/testing.md`
6. instale `forge-kit` apenas quando precisar sincronizar tudo entre várias ferramentas

No começo, você pode ignorar `companies/`, `training/`, ecossistemas de plugins e bootstrap de máquina.

## O Que O Repo Entrega

- `rules/`: instrucoes prontas para Claude Code, Codex, GitHub Copilot, Gemini, Cursor, Windsurf e Antigravity
- `patterns/`: playbooks tool-agnostic para contexto, memoria, testes, revisao, routing, permissoes e orquestracao
- `best-practices/`: versao curta e operacional dos principios mais importantes
- `kit/`: `forge-kit`, o instalador/configurador do toolkit
- `kit/core/skills/`: 29 skills portateis
- `implementations/`: guias especificos por ferramenta, incluindo GitHub Copilot, Gemini e Antigravity
- `companies/`: organizacoes prontas de agentes especialistas
- `examples/`: exemplos de memoria, contexto e superficies de instrucao
- `tools/`: stack recomendada de CLIs, plugins e utilitarios
- `training/`: captura e fine-tuning opcional

## Modelo Mental do Repo

Este repositório fica mais fácil quando você separa as camadas:

- `rules/` definem o comportamento padrão do agente
- `patterns/` explicam o porquê de cada workflow
- `kit/core/skills/` ensinam micro-processos reutilizáveis
- `implementations/` mostram setup específico de ferramenta
- `companies/` agrupam times reutilizáveis de agentes
- `kit/` instala e sincroniza esse sistema

Se você entender essa separação, fica muito mais fácil saber por onde começar e o que pode ignorar.

## Sobre o `ai-dev-toolkit-setup`

O repositório companheiro `ai-dev-toolkit-setup` existe para preparar uma máquina nova com shell, tmux, bootstrap de OpenCode, autenticação guiada, helpers de release e ambiente base para agentes.

Use:

- `ai-dev-toolkit` para guidance reutilizavel dentro de projetos
- `ai-dev-toolkit-setup` para bootstrap da maquina

O setup consome uma release pinada do toolkit e instala os helpers canônicos quando está online.

## Escopo da Versão em Português

Esta frente em PT-BR está priorizando primeiro os materiais de onboarding e navegação:

- README
- resumo geral do repositório
- guias mais importantes para começar

Arquivos mais específicos, avançados ou voltados diretamente para a máquina ainda podem continuar em inglês por algum tempo. A ideia é traduzir primeiro o que ajuda uma pessoa a entender e adotar o toolkit sem se perder.

## Quando Este Repo Faz Mais Sentido

Use este repositório quando você quer:

- reduzir improviso no uso de IA para desenvolvimento
- dar contexto consistente para agentes
- criar workflows repetíveis de planejamento, execução, review e verificação
- usar várias ferramentas de IA sem reescrever guidance toda hora
- melhorar segurança, qualidade e continuidade entre sessões

## Proximo Passo

Se quiser a versão em inglês, use o [README original](./README.md).
