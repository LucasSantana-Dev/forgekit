---
name: tdd
description: Desenvolvimento orientado a testes — escreva testes primeiro, implemente depois, refatore por último
triggers:
  - tdd
  - teste primeiro
  - escrever testes
  - test driven
  - red green refactor
---

# TDD

Escreva o teste antes da implementação. Sempre.

## Cycle

```text
RED    → Escreva um teste falhando que capture o comportamento esperado
GREEN  → Escreva o código mínimo para fazê-lo passar
REFACTOR → Limpe o código mantendo os testes verdes
```

## Steps

1. Entenda o requisito
2. Escreva um teste falhando para o caminho feliz
3. Rode-o — confirme que falha pelo motivo certo
4. Escreva a implementação mínima para passar
5. Rode novamente — confirme que ficou verde
6. Refatore se necessário (os testes devem permanecer verdes)
7. Adicione testes de edge case depois que o caminho feliz funcionar

## Rules

- Nunca escreva implementação antes de o teste existir
- Teste comportamento, não detalhes de implementação
- Um foco de assert por teste
- Se você não consegue escrever um teste, esclareça o requisito primeiro
- Faça mock de dependências externas; não faça mock da lógica interna
- Cobertura é um sinal, não uma meta — teste valor de negócio
