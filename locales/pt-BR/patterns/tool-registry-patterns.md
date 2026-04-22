# Patterns de Registro de Ferramentas

> Separe quais ferramentas existem de como invocá-las. Registre uma vez, filtre em qualquer lugar.

## O Problema

À medida que o número de ferramentas cresce, você bate em três problemas:

1. **Acoplamento**: listas de ferramentas ficam hardcoded em prompts ou configs. Adicionar uma ferramenta exige mexer em vários arquivos.
2. **Testes**: você não consegue testar lógica de roteamento sem invocar ferramentas reais.
3. **Limites de confiança**: você quer conjuntos diferentes de ferramentas em contextos diferentes (modo read-only de auditoria vs. modo full execution) sem duplicar código.

## O Pattern

Mantenha um **registro de ferramentas** — um mapa central `name → metadata`. Carregue uma vez no startup. Filtre por contexto. Passe apenas o subconjunto permitido para o modelo.
