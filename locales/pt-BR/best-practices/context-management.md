# Gestão de Contexto para Coding com IA

> Desperdício de tokens é o imposto silencioso de toda sessão assistida por IA. Gerencie isso ativamente.

## Otimização de Tokens

### Carregamento Progressivo
Não leia arquivos inteiros logo de cara. Construa contexto de forma incremental:
1. Comece pela estrutura do projeto (`glob`, `ls`)
2. Leia funções específicas (`grep` em assinaturas e depois linhas direcionadas)
3. Carregue arquivos completos só quando for editá-los

### Higiene de Contexto
- Limpe o contexto entre tarefas não relacionadas (`/compact`, `/clear` ou começando uma nova sessão)
- Referencie arquivos por caminho (`@arquivo`) em vez de colar conteúdo no chat
- Rode `/compact` quando o uso de contexto estiver em **60-70%**
- Quebre sessões longas em blocos focados
