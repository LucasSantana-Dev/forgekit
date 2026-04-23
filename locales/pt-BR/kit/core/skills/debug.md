---
name: debug
description: Análise sistemática de causa raiz para bugs, erros e comportamento inesperado
triggers:
  - debug this
  - por que isso está falhando
  - root cause
  - investigar
  - ultradebug
---

# Debug

Debug em 7 etapas. Não adivinhe — rastreie.

## Steps

1. **Reproduce** — obtenha uma reprodução mínima e confiável
2. **Locate** — encontre o arquivo, a linha e o call path exatos onde quebra
3. **Hypothesize** — liste 2-3 explicações concorrentes
4. **Evidence** — para cada hipótese: o que a confirmaria ou descartaria
5. **Test** — rode primeiro o teste mais rápido para confirmar/descartar
6. **Fix** — mude exatamente o que as evidências apontam
7. **Verify** — confirme que a correção resolve o issue e rode a suíte completa

## Rules

- Nunca altere código antes de saber a causa raiz
- Leia a mensagem real de erro — não passe por cima
- Verifique pressupostos: o valor é mesmo o que você imagina? Adicione um log
- Diferencie "sintoma" de "causa" — corrija a causa
- Se travar depois de 3 hipóteses, adicione instrumentação antes de continuar adivinhando

## Output

```text
Root cause: <uma frase>
Location:   <file>:<line>
Fix:        <o que mudar e por quê>
```
