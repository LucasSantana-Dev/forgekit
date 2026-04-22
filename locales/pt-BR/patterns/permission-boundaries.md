# Limites de Permissão

> Defina o que o agente pode tocar antes de ele começar. Não reaja ao dano depois do fato.

## O Problema

Um agente com acesso total vai acabar fazendo algo irreversível: apagar uma branch, dar push em `main`, derrubar uma tabela ou enviar uma mensagem para um cliente. Esses erros não vêm de prompts ruins — vêm do fato de o agente ter mais acesso do que a tarefa exige.

## O Pattern

Codifique permissões como um conjunto de restrições avaliado **antes** da chamada de ferramenta, não depois. Aplique o conjunto mínimo de ferramentas necessário para a tarefa. Coloque acessos mais amplos atrás de confirmação explícita.

### Três Camadas

```
Camada 1: Filtragem de ferramentas (o que o modelo consegue ver)
Camada 2: Bloqueio em runtime (o que é interceptado)
Camada 3: Portões de confirmação (o que exige aprovação explícita)
```

Cada camada é independente. Use as três em workflows de produção.
