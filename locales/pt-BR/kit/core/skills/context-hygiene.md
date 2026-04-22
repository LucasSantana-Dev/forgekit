---
name: context-hygiene
description: Mantenha sessões focadas e eficientes — descarte saídas obsoletas, preserve o estado ativo e recomende compactação
triggers:
  - limpar contexto
  - sessão inchada
  - contexto muito longo
  - podar sessão
  - trocar de tarefa
---

# Context Hygiene

Identifique o que deve permanecer ativo, marque conteúdo obsoleto para remoção e decida se deve compactar ou iniciar uma sessão nova.

## Steps

1. **Identify active state** — tarefa atual, arquivos, decisões que precisam ser preservadas
2. **Mark stale content** — threads concluídas, perguntas resolvidas, saídas antigas de ferramentas
3. **Decide action** — compactar a sessão atual ou recomendar uma sessão nova
4. **Preserve explicitly** — anote o estado ativo da tarefa antes de qualquer poda

## Output

```text
Keep:    <tarefa ativa, arquivos-chave, decisões em aberto>
Prune:   <saídas obsoletas, threads resolvidas>
Action:  compact | fresh session
```

## Rules

- Nunca compacte e apague o estado da tarefa ativa
- Nunca preserve conversa histórica irrelevante
- Escreva explicitamente o estado ativo antes de recomendar uma sessão nova
- Prefira compactação quando a tarefa ativa ainda estiver em andamento
