# Administração de Habilidades em Era de IA

Agents de codificação amplificam o que você já é. Eles não substituem o que você não é.

> _"Um exoesqueleto amplifica força. Uma muleta só tenta esconder fraqueza." — Fabio Akita, [akitaonrails.com](https://akitaonrails.com)_

## O risco que este doc endereça

Codificação assistida por IA é rápida o suficiente para que ela esconda uma responsabilidade composta: desenvolvedores com fundamentos pobres enviam em escala industrial, e a dívida chega em escala industrial também. Individualmente, isso parece over-reliance; em escala de time, é atrofia de habilidade; em escala de org, é um codebase frágil que nenhum humano consegue mais raciocinar sobre.

Esta é a contra-prática.

## O princípio

**Exoesqueletos requerem esqueletos.** As pessoas que usam IA melhor entendem as layers que a IA está escrevendo para: operating systems, databases, networking, data structures, compilers, computer architecture, profiling, debugging, concurrency, consistency, security, e cost. Sem esse esqueleto, output do agent é aceito sem crítica — e é aí que o envio fica mais lento, não mais rápido, conforme decisões ruins se acumulam.

As práticas abaixo mantêm o esqueleto afiado.

## Práticas

### 1. Trabalho deliberado sem assistência

Designe algum trabalho como "sem agent." Escolha uma tarefa por sprint — um refactor tricky, um teste que você não entende totalmente ainda, uma sessão de debugging, uma pequena migration — e complete-a manualmente. Não para provar um ponto, mas para manter os músculos que você depende para review.

Regra de ouro: se você não consegue explicar o output que o agent produziu, você não consegue pegar quando está errado. Trabalho periódico sem assistência é como você fica apto a explicar.

### 2. Leia o diff antes de aceitar

Isto é não-negociável e ainda a prática mais violada. "Skim the diff" significa:

- Cada arquivo que o agent tocou — abra-o, role a mudança.
- Cada dependência nova — justifique-a contra opções existentes.
- Cada linha deletada — confirme que estava morta, não load-bearing.
- Cada TODO ou stub — decida imediatamente consertar ou file uma issue.

Se um PR é muito grande para ler, é muito grande para fazer merge. Divida-o antes de revisar, não depois.

### 3. Onboarding com fundamentos primeiro

Para novo teammates (junior ou senior-em-uma-nova-stack), priorize o esqueleto antes do exoesqueleto:

- Primeira semana: sem agents. Leia o codebase, leia standards, envie uma pequena mudança manualmente.
- Semana 2+: introduza o agent, mas exija disciplina explícita de pair-programming (veja [`patterns/prompting-discipline.md`](../patterns/prompting-discipline.md)).
- Em andamento: exija que o novo hire ocasionalmente revise output do agent **sem** rodá-lo — só lendo. Se eles não conseguem avaliar, eles ainda não conseguem se beneficiar disso.

### 4. Resista à sedução do volume

Agents podem produzir mais código por dia do que qualquer humano consegue ler cuidadosamente. Essa razão é a armadilha. Cap-se a si mesmo: não mais PRs por dia do que você consegue defender em review para um colega cético. Volume não é produtividade se o time não consegue verificar.

### 5. Peça explicitamente o que o modelo pula

Agents geram o happy path confiantemente e omitem silenciosamente código defensivo: CORS headers, timeout handling, auth refresh flows, WebSocket keep-alive, input validation em trust boundaries, error telemetry. Não espere "seguro por default" — peça explicitamente:

- "List the security-sensitive paths in this change and how each is protected."
- "What happens if each network call in this diff times out?"
- "Where could a malicious user break this?"

Isto preenche as gaps previsíveis sem precisar saber antecipadamente qual gap morderá.

### 6. Escreva o spec, não só o prompt

Para qualquer coisa além de uma mudança one-shot, escreva um short spec — goal, constraints, test plan — antes de promptar. O ato de escrever força a pergunta de fundamentos ("o que estou realmente construindo, e por quê?") por um caminho que o agent não consegue atalho para você.

Use [`kit/core/skills/ticket.md`](../kit/core/skills/ticket.md) ou o flow `docs/specs/` para persistir o spec.

### 7. Rastreie a proveniência

Saiba qual código foi gerado por IA e qual não foi. No mínimo:

- Commits que incluem código gerado por IA usam uma scope tag (ex: `feat(auth, ai-assisted): ...`) OU o PR body nota.
- Testes gerados por IA recebem um comment marker (`// ai-generated — reviewed <date>`).
- Nunca co-assine um agent como commit author; o humano é accountable.

Quando algo quebra seis meses depois, proveniência diz onde olhar primeiro.

## Sinais de alerta de que a prática está afrouxando

- Você se pega aceitando diffs sem lê-los.
- Você não consegue mais explicar o que uma função faz sem re-promptar.
- Primeiros envios de novo teammates são indistinguíveis de envios senior — significando que ninguém está aprendendo no pace rápido.
- Tempo de review por PR cai mais rápido do que defect rate.
- "Por que isso está aqui?" respostas de blameless-review defaultam para "o agent adicionou."

## Relacionado

- [`patterns/prompting-discipline.md`](../patterns/prompting-discipline.md) — o prompt de quatro blocos e disciplina de pair-programming
- [`patterns/code-review.md`](../patterns/code-review.md) — o que pegar ao ler um diff gerado por IA
- [`best-practices/security.md`](./security.md) — mínimo secrets e auth hygiene
- [`kit/core/skills/ticket.md`](../kit/core/skills/ticket.md) — flow de spec por-feature
