# Orquestração por Streaming

> Loops de turno orientados a eventos permitem observar e controlar a execução do agente em tempo real.

## O Problema

Você envia um prompt e espera. Não sabe se o agente travou, está alucinando ou queimando tokens na tarefa errada. Quando algo dá errado, você não consegue ver onde. Estouro de orçamento acontece em silêncio.

## O Pattern

Substitua “disparar e esperar” por um **fluxo tipado de eventos**. Toda transição relevante de estado emite um evento estruturado. Seu harness consome eventos, aplica budgets, compacta histórico e interrompe com limpeza quando os limites são atingidos.
