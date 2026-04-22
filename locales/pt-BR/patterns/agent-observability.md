# Observabilidade de Agentes

> Se você não consegue ver o que seu agente fez, não consegue corrigir o que ele faz de errado.

## O Problema

Agentes de coding com IA produzem saídas que parecem corretas, mas falham de maneiras sutis:
- nomes de função alucinados que passam em review mas quebram em runtime
- sequências de chamadas de ferramenta que funcionam uma vez e regridem sob outras entradas
- mudanças de prompt que melhoram um caso e silenciosamente pioram outro

Logs tradicionais capturam comandos, não raciocínio. Você precisa de traces — a cadeia completa desde a entrada do usuário, passando por todas as chamadas de ferramenta, até a saída final.
