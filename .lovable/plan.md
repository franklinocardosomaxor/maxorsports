# Pós-réplica: segredos de ingestão + contas super-admin

## Objetivo
Deixar o ambiente pronto após a réplica: confirmar que os segredos de ingestão do CRM estão íntegros e garantir que as 2 contas super-admin existam com o papel correto.

## Estado atual (verificado no banco)
- `franklinocardoso@gmail.com` — já existe, e-mail confirmado, papéis `admin` + `super_admin` na organização. Nada a fazer.
- `maxortecnologia@gmail.com` — **não existe** no auth. Precisa ser criado.
- Segredos `CRM_INGEST_SECRET` e `MAXOR_CRM_INGEST_KEY` — já configurados. Decisão do Franklin: **manter os valores como estão**.

## O que será feito

### 1. Verificação dos segredos (sem alterar valores)
- Conferir se o endpoint de ingestão `src/routes/api/public/crm/products.ts` lê `CRM_INGEST_SECRET` / `MAXOR_CRM_INGEST_KEY` dentro do handler (padrão correto: `process.env` dentro do handler, nunca no topo do módulo).
- Apenas leitura/validação — nenhum valor de segredo será alterado ou exposto.

### 2. Criar a conta maxortecnologia@gmail.com
Sequência segura (respeita os triggers existentes):
1. Criar o usuário via API administrativa do backend (`supabaseAdmin.auth.admin.createUser`) **sem confirmar o e-mail ainda**, com a senha fornecida pelo Franklin.
   - Nesse momento o trigger `handle_new_user` cria a organização dele e o papel `admin` em `user_roles`.
2. Confirmar o e-mail via API administrativa (`updateUserById` com `email_confirm: true`).
   - O trigger `grant_super_admin_for_authorized_email` dispara no UPDATE, encontra a organização já criada e concede `super_admin` automaticamente (o e-mail está na lista autorizada do banco).
   - A ordem importa: criar já confirmado faria o trigger de concessão rodar antes de existir a organização, e o `super_admin` não seria concedido.
3. Implementação: função de servidor temporária (uma execução) usando o cliente administrativo apenas dentro do handler; o arquivo é removido logo após o uso. Nenhuma senha fica gravada no código.

### 3. Validação final
- Consulta ao banco confirmando: as 2 contas existem, com `email_confirmed_at` preenchido e papel `super_admin` em `user_roles`.
- Teste de fumaça: login em `/admin` com `maxortecnologia@gmail.com` e acesso ao painel `/maxorcrm` (o layout só libera super-admins).

## Fora de escopo
- Nenhuma alteração de layout, catálogo ou Fases 1–3.
- Nenhuma alteração nos valores dos segredos existentes.
- Nenhum insert manual no schema `auth` — tudo via API oficial de administração de usuários.

## Detalhes técnicos
- Triggers envolvidos (já existentes, não serão modificados): `handle_new_user` (AFTER INSERT em auth.users) e `grant_super_admin_for_authorized_email` (AFTER INSERT/UPDATE em auth.users, lista autorizada contém os 2 e-mails).
- A função temporária usa `await import('@/integrations/supabase/client.server')` dentro do handler e é apagada depois da execução, sem deixar superfície de ataque.
