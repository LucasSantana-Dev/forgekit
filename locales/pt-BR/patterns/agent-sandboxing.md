# Sandbox de Agents

Coding agents executam comandos reais. Agents de coding de produção, em algum ponto, tentarão fazer algo destrutivo — injeção de prompt intencional, `rm` alucinado, refatoração muito agressiva, exfiltração de dados via curl. Sandboxe o raio de impacto antes que importe, não depois.

> _Pattern informado pelo trabalho ai-jail de Fabio Akita ([akitaonrails.com](https://akitaonrails.com)), que evoluiu de um script shell bubblewrap de 170 linhas para um binário Rust com config por projeto e primitivas de sandbox multiplataforma._

## Quando sandboxar

Nem toda execução de agent precisa de um sandbox. Use essa heurística:

- **Sandbox obrigatório**: o agent pode executar shell, escrever arquivos fora do repo, abrir conexões de rede ou tocar qualquer caminho compartilhado com outros projetos.
- **Sandbox desejável**: o agent apenas lê o repo e emite texto (comentários de review, resumos).
- **Pular**: Q&A puro sem acesso a ferramentas.

O custo de sandboxing é latência de startup + configuração. O custo de não sandboxar é um prompt ruim a distância do impacto em produção. Padrão para "on" para qualquer sessão com autonomia ativada.

## O que um sandbox deve garantir

1. **Escopo do filesystem** — lista de permissão explícita de caminhos que o agent pode ler/escrever. Tudo fora é invisível (sem bind mount) ou read-only. Sem `$HOME` por padrão.
2. **Controle de egresso de rede** — negar tudo por padrão, lista de permissão dos registries + APIs que o agent realmente precisa.
3. **Isolamento de processos** — sem acesso ao `/proc` do host, `/dev` apenas com dispositivos necessários, sem namespace de PID do host.
4. **Estado de trabalho efêmero** — tmpfs para `/tmp` para que crashes/escapes não deixem traços.
5. **Firewall de credenciais** — `.env`, chaves SSH, arquivos de credenciais na nuvem **nunca** montados. Se o agent precisa de um secret, passe explicitamente via env var após uma decisão humana.

## Primitivas para construir em cima

- **Linux**: `bubblewrap` (user namespaces desaprivilegiados; o que Docker, Flatpak e ai-jail de Akita usam sob o capô). Mais rápido que Docker para sandboxes por invocação; sem daemon.
- **macOS**: `sandbox-exec` (deprecated mas ainda funcional) ou a API Seatbelt mais nova via bindings Swift/Rust. ai-jail de Akita envolve o sandbox nativo de macOS.
- **Docker/Podman**: viável mas pesado para execuções por comando; melhor quando o agent é um serviço de longa duração.
- **Cloud**: Firecracker microVMs, gVisor — overkill para dev-time, correto para agent hosting multi-tenant.

## Config declarativa por projeto

Arrays hardcoded em scripts shell não escalam. Mantenha política de sandbox em um arquivo versionado:

```toml
# .agent-sandbox.toml (conceitual)
[allow.fs]
  read_write = [".", "${HOME}/.cache/uv"]
  read_only  = ["/usr/lib", "/etc/ssl/certs"]

[allow.network]
  hosts = ["api.github.com", "registry.npmjs.org", "pypi.org"]

[deny]
  explicit = ["${HOME}/.ssh", "${HOME}/.aws", "${HOME}/.env*"]
```

Revise esse arquivo como parte de qualquer PR que toque autonomia do agent. É o artefato único que reviewers podem auditar para saber o pior alcance do agent.

## Checklist de vetores de escape

Antes de confiar em um sandbox, verifique se ele bloqueia:

- [ ] `cat /proc/self/mountinfo` não lista `$HOME` do host.
- [ ] `curl https://example.com` falha quando rede é negada.
- [ ] Escrever em `/usr/local/bin/malicious` retorna `EACCES` ou `EROFS`.
- [ ] `ls ~/.ssh` retorna "No such file or directory", não as chaves do host.
- [ ] Uma fork bomb dentro do sandbox não afeta processos do host.
- [ ] O sandbox sai limpamente quando o agent retorna (sem processos remanescentes, sem resíduos em `/tmp`).

Se qualquer verificação falhar, o sandbox é teatro.

## Integração com níveis de autonomia do agent

Mapeie rigidez de sandbox para nível de autonomia:

| Nível de autonomia | Perfil do sandbox | Exemplo |
|---|---|---|
| **Read-only** | Sem write mounts; rede negada | Code review, audit, análise |
| **Repo-scoped** | Write = apenas repo; rede = registries de pacotes | Sessão de dev padrão |
| **Multi-repo** | Write = múltiplos repos; rede = registries + GitHub | Refatoração cross-repo |
| **Próximo à produção** | Mesmo que multi-repo + audit logging de todo comando | Deploy prep, draft de migração |
| **Sem sandbox** | Nunca para um coding agent | — |

Veja [`patterns/permission-boundaries.md`](./permission-boundaries.md) para o modelo de permissão mais amplo.

## O que testar

Trate o sandbox em si como código de produção:

- **Unit-test vetores de escape** — um teste por item na checklist de vetores de escape acima. ai-jail de Akita vem com 124 testes desse tipo.
- **Teste entre plataformas** — bubblewrap de Linux e sandbox de macOS têm modos de falha diferentes. Execute a checklist em ambos.
- **Teste a dimensão "funciona para tarefas reais"** — um sandbox que bloqueia tudo é inútil; confirme que uma tarefa dev típica (instalar deps, rodar testes, commit) funciona dentro dele.

## Distribuição importa

Um sandbox de agent só é adotado se colegas conseguem instalar em minutos. Um binário Rust (~1 MB) instalável via `brew` / `cargo` / `go install` vence um script bash que só funciona na máquina do autor. Se está criando um, otimize para:

- Instalação como single-binary
- `<5` dependências
- Startup < 100 ms
- Mensagens de erro claras quando uma regra de sandbox bloqueia algo legítimo

## Anti-patterns

- **Confiar que o modelo se autorestringirá** — "Eu disse no prompt para não acessar `/etc`" não é um controle de segurança.
- **Rodar o agent como root** — mesmo em um sandbox. Sempre rode como usuário não-root dentro do sandbox; defense in depth.
- **Copy-paste do mesmo sandbox em todo repo** — drift é garantido. Use config central (`.agent-sandbox.toml`) ou ferramenta externa (ai-jail, firejail, script wrapper bwrap) referenciada por todo repo.
- **Desabilitar o sandbox quando está no caminho** — o friction geralmente revela uma entrada na allow-list faltando. Corrija a regra, não desabilite.

## Relacionado

- [`patterns/permission-boundaries.md`](./permission-boundaries.md) — o que o agent é permitido fazer em primeiro lugar
- [`best-practices/security.md`](../best-practices/security.md) — secrets hygiene fora do sandbox
- [`best-practices/ai-skill-stewardship.md`](../best-practices/ai-skill-stewardship.md) — camada de supervisão humana acima do sandbox
- [`patterns/prompting-discipline.md`](./prompting-discipline.md) — restrições explícitas em prompts complementam (mas não substituem) o sandbox
