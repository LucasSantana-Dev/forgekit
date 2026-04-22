# Implementação para Windsurf

Implementação de referência dos patterns do toolkit para Windsurf.

## Construção de Contexto

Windsurf lê `.windsurfrules` a partir da raiz do projeto e também pode consumir
arquivos de apoio de um diretório `.windsurf/`.

```bash
# a partir da raiz do repositório
cp rules/.windsurfrules your-project/.windsurfrules
```

## Roteamento Multi-Model

Use `forge-kit` para manter regras, skills, provedores e guidance de MCP do
Windsurf em um único fluxo portátil de instalação.

## Orquestração de Tarefas

Trate `forge-kit` como a camada de policy base e mantenha automações ou
overlays de orquestração específicos do Windsurf separados.

## Compatibilidade

Veja `oh-my-windsurf.md` para a divisão de ownership recomendada quando você
combinar `forge-kit` com uma camada de orquestração estilo oh-my.
