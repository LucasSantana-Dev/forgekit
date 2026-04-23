---
status: published
audience: technical
primitive: hook
---

# Hooks: Portais de Momento de Edição

Três hooks portáveis e opcionais que executam em momentos de edição. **Recurso assinatura** — nenhum repositório público os oferece.

---

## Os Três Hooks

### 1. post-edit-format.sh
**Quando**: Imediatamente após você Write ou Edit um arquivo  
**O Que**: Executa o formatador do seu repo (`npm run format`, `make format`, `black`, etc.)  
**Saída**: Arquivo formatado; aviso se mudanças foram feitas  
**Padrão**: OFF (opt-in)

```bash
# No seu repo, executa automaticamente após editar:
$ claude "refactor this function"
[Claude writes code]
[Hook runs: npm run format]
[Console]: "✓ Formatted 3 files"
```

### 2. post-edit-typecheck.sh
**Quando**: Depois de Write / Edit  
**O Que**: Executa verificador de tipo (`tsc --noEmit`, `mypy`, `go vet`)  
**Saída**: Erros de tipo listados; bloqueia se em modo strict  
**Padrão**: OFF (opt-in, modo advisory)

```bash
$ claude "add async timeout"
[Claude writes code]
[Hook runs: tsc --noEmit]
[Console]: "⚠ Type error in line 42: Property 'timeout' not found"
```

### 3. evaluate-response.sh
**Quando**: Depois que Claude termina uma resposta (PostToolUse)  
**O Que**: Escaneia saída por padrões lazy (`// TODO implement`, `pass`, funções vazias)  
**Saída**: Avisos registrados; nunca bloqueia  
**Padrão**: OFF, gated por env (`RAG_HOOKS_EVALUATE=1`)

```bash
$ RAG_HOOKS_EVALUATE=1 claude "write the service"
[Claude writes code]
[Hook runs: evaluate-response]
[Console]: "⚠ Detected placeholder: '// TODO implement auth'"
```

---

## Instalação

### Opção A: Setup Por Projeto

```bash
cd your-project
bash /path/to/ai-dev-toolkit/ai-dev-toolkit-setup/scripts/install-rag.sh --with-hooks
```

Isso:
- Copia hooks para `~/.claude/hooks/`
- Conecta em `settings.json`
- Cria `.claude.local/hooks.json` com toggles por projeto

### Opção B: Setup Global

```bash
bash install-rag.sh --with-hooks --global
```

Hooks se aplicam a todos os projetos. Overrides por projeto via `.claude.local/`.

---

## Opt-In por Ambiente

Cada hook respeita uma variável de ambiente:

```bash
# Abilitar hooks específicos para uma sessão:
export RAG_HOOKS_FORMAT=1        # post-edit-format
export RAG_HOOKS_TYPECHECK=1     # post-edit-typecheck
export RAG_HOOKS_EVALUATE=1      # evaluate-response

# Ou desabilitar:
export RAG_HOOKS_FORMAT=0
```

**Padrão**: Todos OFF a menos que explicitamente habilitados.

---

## Por Que "Recurso Assinatura"?

**Nenhum outro toolkit de IA dev público oferece hooks de momento de edição.** A maioria das soluções confiam em:
- Prompting manual "você rodou o lint?"
- Verificações de CI pós-sessão (feedback tardio)
- Nenhum feedback automatizado

Nossos hooks executam **imediatamente**, **opcionalmente**, **sem bloquear**. Eles são:
- ✓ Seguros em governança (sem execução, sem segredos)
- ✓ Portáveis (funcionam com qualquer formatador / verificador de tipo)
- ✓ Silenciosos por padrão (zero surpresa na primeira instalação)
- ✓ Compostos (empilhe múltiplos hooks sem conflito)

---

## Implementação

Hooks são scripts shell em `kit/hooks/`:

```bash
kit/hooks/
├── post-edit-format.sh
├── post-edit-typecheck.sh
└── evaluate-response.sh
```

Cada script:
1. **Verifica pré-requisitos** (`command -v npm >/dev/null || exit 0`)
2. **Executa a ferramenta** (formatador, verificador de tipo, ou analisador)
3. **Registra saída** (sempre para console, nunca silencioso)
4. **Retorna 0** (nunca bloqueia, mesmo em falha em modo advisory)

---

## Troubleshooting

**P: Hook não executou depois que editei um arquivo.**  
R: Verifique se o hook está habilitado em `settings.json`. Também verifique se a ferramenta existe (`npm run format` deve funcionar manualmente primeiro).

**P: Estou recebendo falsos positivos do evaluate-response.**  
R: `evaluate-response` marca placeholders comuns (`// TODO`, `pass`, `...`). Se seu projeto usa legitimamente estes, configure `RAG_HOOKS_EVALUATE=0`.

**P: Posso escrever meu próprio hook?**  
R: Sim. Copie o template de `kit/hooks/TEMPLATE.sh` e solte em `~/.claude/hooks/`. Ele será auto-descoberto.

---

## Relacionado

- **Hooks na taxonomia de primitivas**: [Primitivas](./primitives.md)
- **Arquitetura completa de hooks**: `kit/hooks/README.md`
- **Segurança e governança**: [Governança](./governance.md)
