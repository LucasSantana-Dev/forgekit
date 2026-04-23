# Compatibilidade forge-kit com oh-my-claudecode

Este arquivo é uma ponte opcional para setups mistos em que `forge-kit` e
[oh-my-claudecode](https://github.com/Yeachan-Heo/oh-my-claudecode) são usados juntos.

Use este fluxo:

1. Mantenha `~/.claude/CLAUDE.md` gerenciado por `forge-kit`.
2. Mantenha roteamento e settings de orquestração específicos do oh-my nos arquivos de config do oh-my.
3. Não duplique a mesma policy em dois lugares.

Divisão de ownership recomendada:

- `forge-kit`: regras globais, skills portáveis, baseline de MCP, seção de execução durável.
- `oh-my-claudecode`: orquestração de agentes, roteamento por categoria, estratégia de fallback de modelos.

Se ambos os sistemas definirem o mesmo comportamento, prefira uma única fonte de verdade e apague a outra.
