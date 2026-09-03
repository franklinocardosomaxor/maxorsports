# Exportar / transferir o projeto para outro perfil (empresa)

Guia para levar este repositório — código, banco e segredos — para o perfil/conta
da empresa, com segurança.

## 1. Transferir o repositório no GitHub

1. No GitHub, abra `Settings` → `General` → `Danger Zone` → `Transfer ownership`.
2. Informe o perfil/organização de destino da empresa.
3. Confirme. O histórico de commits e branches é preservado.

> Alternativa sem transferir ownership: faça um *fork* ou `git push` para um novo
> repositório vazio criado no perfil da empresa.

## 2. Reconectar o Lovable / Lovable Cloud

1. No Lovable, crie (ou abra) o projeto vinculado à conta da empresa.
2. Conecte o repositório já transferido em `Settings → GitHub`.
3. Reative o **Lovable Cloud (Supabase gerenciado)** — isso provisiona um novo
   projeto Supabase para a empresa. Ele **não** herda dados do projeto antigo.

## 3. Banco de dados

O schema (tabelas, RLS, policies) fica versionado em `supabase/migrations/` e é
reaplicado automaticamente ao conectar um Supabase novo. Os **dados** (produtos,
pedidos, contatos) não migram sozinhos:

- Para migrar dados: exportar via `pg_dump` do projeto antigo e restaurar no novo
  (ou usar a ferramenta de migração do Supabase Dashboard).
- Se o projeto Supabase for apenas transferido de dono (mesma instância, novo
  billing/organização), os dados permanecem — não é necessário dump.

## 4. Variáveis de ambiente e segredos

Nenhum segredo fica hardcoded no código (auditado — todos lidos via `process.env`).
Ao criar o ambiente novo, configure:

| Variável | Onde é usada |
|---|---|
| `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_*` | cliente + SSR (auto ao conectar Lovable Cloud) |
| `SUPABASE_SERVICE_ROLE_KEY` | `client.server.ts`, `crm-images.server.ts`, proxy de imagem (auto) |
| `LOVABLE_API_KEY` | busca por imagem / IA (`crm.image-search.functions.ts`, `crm.email.functions.ts`) — auto |
| `RESEND_API_KEY` | envio de e-mail do CRM |
| `STRIPE_WEBHOOK_SECRET` | `api/public/webhooks/stripe.ts` — manual |
| `WHATSAPP_VERIFY_TOKEN`, `WHATSAPP_APP_SECRET` | `api/public/webhooks/whatsapp.ts` — manual |
| `CRM_INGEST_SECRET`, `MAXOR_CRM_INGEST_KEY` | ingestão de produtos do CRM — manual |

Use `.env.example` como referência local para desenvolvimento (nunca commite `.env`
com valores reais).

## 5. Checklist de segurança antes de transferir

- [ ] Girar/revogar as chaves antigas (`SUPABASE_SERVICE_ROLE_KEY`, `LOVABLE_API_KEY`,
      `STRIPE_WEBHOOK_SECRET`, `WHATSAPP_APP_SECRET`, `CRM_INGEST_SECRET`) no Supabase
      antigo, caso ele continue existindo separado do novo.
- [ ] Confirmar que `.env` real não foi commitado (`.gitignore` já cobre `.env` e `.env.*`).
- [ ] Recriar todos os segredos da tabela acima no novo ambiente antes do primeiro deploy.
- [ ] Revisar acessos de usuários do MaxorCRM (`/maxorcrm`) — contas antigas não devem
      manter acesso ao ambiente da empresa sem revisão.

## 6. Domínio e deploy

- Se o site usa domínio próprio, refazer o apontamento DNS para o novo projeto Lovable
  em `Settings → Domains`.
- Publicar (`Publish`) após confirmar que as variáveis de ambiente estão configuradas.
