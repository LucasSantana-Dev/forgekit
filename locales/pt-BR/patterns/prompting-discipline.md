# Disciplina de Prompting

Como você faz uma pergunta ao modelo importa mais do que qual modelo você escolhe. Duas disciplinas evitam a maioria das falhas de codificação com IA antes delas começarem.

> _Este pattern destila publicações de Fabio Akita ([akitaonrails.com](https://akitaonrails.com)), que argumenta que o verdadeiro gargalo é a comunicação, não a qualidade do modelo._

## O Prompt de Quatro Blocos

Todo pedido não-trivial para um agent de codificação deve conter quatro blocos explícitos:

| Bloco | Pergunta que ele responde |
|---|---|
| **Goal** | Qual resultado eu quero? |
| **Method** | Aproximadamente como o agent deve abordar isso? |
| **Constraints** | O que ele NÃO deve fazer? |
| **Validation** | Como sabemos que funcionou? |

Um prompt que falta qualquer um desses produz output proporcional à vagueza. "Fix this bug" (arrume este bug) recebe um blob que parece um fix; "Fix this auth bug by extending the existing guard in `auth/session.ts`, do not add a new middleware, and verify by running `npm test -- auth/`" (arrume este bug de auth estendendo o guard existente em `auth/session.ts`, não adicione um novo middleware, e verifique rodando `npm test -- auth/`) recebe um patch que pode ser aplicado.

### Template

```
Goal: <uma frase>

Method: <1-3 frases descrevendo a abordagem — qual arquivo, qual pattern, qual layer>

Constraints:
- do NOT <abordagem banida 1>
- do NOT <abordagem banida 2>
- keep <contrato existente>

Validation:
- run <comando>
- check <observável>
```

### Quando relaxar

One-liners ("rename this var", "add a console.log") não precisam da estrutura completa. A disciplina de quatro blocos entra em ação quando o pedido pode ser entendido de forma incorreta ou quando pode causar retrabalho.

### Por que funciona

- **Goal** previne o agent de otimizar para um objetivo diferente do seu.
- **Method** ancora o agent nos idiomas do seu codebase em vez da média de dados de treinamento.
- **Constraints** são o bloco de maior impacto — eles proíbem os caminhos errados comuns que o modelo normalmente deixaria se desviar para.
- **Validation** transforma "pronto" em uma afirmação verificável, não uma sensação.

## Pair Programming, Não Fire-and-Forget

Longas execuções autônomas sem check-ins produzem output fora do alvo em escala industrial. Trate sessões de agent como real pair programming:

- **Fique na cadeira.** Submeter uma tarefa grande e sair fora economiza a coisa barata (tokens) para economizar a coisa cara (sua atenção) — mas você paga em retrabalho.
- **Interrompa em slop.** Se os status updates do agent pararem de bater com o trabalho, interrompa. Não deixe ele se debugar para um estado pior.
- **Re-estime em voo.** Pergunte "quanto você está avançado, e o que falta?" quando você sente drift. A resposta diagnostica se o plano ainda é válido.
- **Exija validação em voo.** "Antes de escrever a próxima função, mostre-me o teste que falhará e a assertion que passará." Isso força o agent a se comprometer com um passo verificável, não um especulativo.

### Indicadores de que você deve interromper

- O agent está rodando há >5 minutos em uma tarefa que ele originalmente estimou em 1.
- Tamanho do diff cruzou um threshold que você não aprovou (ex: arquivos fora do escopo que você descreveu).
- Mensagens de erro que o agent está "contornando" começam a se repetir.
- Você se pega esperando que ele descubra. Esse é o sinal.

## Anti-patterns

- **Goal vago, sem constraints** — "melhore a performance aqui" sem um alvo mensurável ou mudanças proibidas. Espere um rewrite que você não pediu.
- **Constraints implícitos** — assumindo que o agent conhece as convenções do seu codebase porque você conhece. Se não está no prompt ou no arquivo de rule, não é uma constraint.
- **Sem cláusula de validation** — deixando o agent se auto-declarar pronto. Sempre anexe uma verificação concreta que o humano (ou CI) possa rodar.
- **Delegação "me confie, só faça"** — aceitando mudanças grandes sem ler o diff. Slop em escala de AI se compõe se não monitorado.

## Relacionado

- [`code-review.md`](./code-review.md) — o que pegar ao ler um diff gerado por IA
- [`task-orchestration.md`](./task-orchestration.md) — dividindo trabalhos maiores em ranges onde prompts de quatro blocos ainda cabem
- [`kit/core/skills/plan.md`](../kit/core/skills/plan.md) — skill de planejamento que força fases explícitas + passos de verificação
- [`best-practices/ai-skill-stewardship.md`](../best-practices/ai-skill-stewardship.md) — mantendo a metade humana do pair afiada
