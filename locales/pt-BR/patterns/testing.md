# Testes com IA

> IA acelera geração de testes. Ela não decide sozinha o que vale a pena testar.

## O Problema

Agentes escrevem muitos testes rapidamente, mas frequentemente escolhem alvos de baixo valor. Testes que fazem mock de detalhes internos, usam dados artificiais demais ou verificam implementação em vez de comportamento dão falsa confiança.

## O Pattern

Use IA para escalar cobertura depois que você estabelecer o padrão de qualidade:
- você escreve o primeiro teste “ouro”
- a IA gera variações de edge case, validação e regressão
- a revisão humana filtra testes frágeis ou irrelevantes
