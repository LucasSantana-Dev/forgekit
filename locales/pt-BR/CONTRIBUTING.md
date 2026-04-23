# Contribuição

Obrigado pelo interesse em melhorar o AI Dev Toolkit.

## O Que Estamos Procurando

- **Novos patterns** — patterns tool-agnostic de trabalho que você já validou em produção
- **Implementações de referência** — implementações concretas para Cursor, Windsurf, Copilot ou outras ferramentas
- **Adições de ferramentas** — ferramentas CLI que melhorem workflows assistidos por IA
- **Correções de bugs** — links quebrados, exemplos incorretos, nomes de modelos desatualizados

## Como Contribuir

1. Faça um fork do repositório
2. Crie uma branch: `feature/seu-pattern` ou `fix/link-quebrado`
3. Faça suas alterações
4. Abra um PR com uma descrição clara do que mudou e por quê

## Diretrizes

### Patterns
- Devem ser tool-agnostic, ou seja, o pattern precisa funcionar independentemente da ferramenta de IA usada
- Inclua anti-patterns, porque explicar o que NÃO fazer costuma ter bastante valor
- Inclua exemplos concretos, não apenas teoria
- Mantenha abaixo de 200 linhas; se passar disso, divida em vários patterns

### Templates de Regras
- Mantenha as regras acionáveis, como `"Functions < 50 lines"`, e não vagas, como `"Write clean code"`
- Teste com pelo menos uma ferramenta de IA antes de enviar
- As regras devem caber em uma tela; agentes costumam passar rápido por arquivos longos

### Implementações
- Referencie o pattern que está sendo implementado
- Inclua instruções de setup
- Explique como adaptar para outras ferramentas

### Scripts de Instalação
- Precisam ser idempotentes, ou seja, seguros para rodar duas vezes
- Teste em um sistema limpo
- Inclua tanto a instalação quanto a configuração pós-instalação

## Estilo de Código

- TypeScript para todo código de implementação
- Markdown para documentação, sem HTML a menos que seja realmente necessário
- Conventional commits: `feat:`, `fix:`, `docs:`, `refactor:`

## Dúvidas?

Abra uma issue com o rótulo `"question"`.
