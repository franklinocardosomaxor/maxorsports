## Objetivo
Executar toda a infra e conexões do CRM Maxor Sports conforme o HANDOFF, sem alterar o layout atual do site.

## Fase 1 — Backend base (Lovable Cloud)
1. Habilitar Lovable Cloud (Supabase gerenciado).
2. Habilitar autenticação: e-mail/senha + Google OAuth + HIBP leaked-password check.
3. Provisionar `LOVABLE_API_KEY` (AI Gateway) — auto para IA de enriquecimento.

## Fase 2 — Schema do CRM (migração única)
Criar tabelas + `GRANT` + RLS + policies + índices:
- `organizations`
- Enum `app_role` + `user_roles` (papéis SEPARADOS de profiles)
- Função `public.has_role(_uid, _role)` SECURITY DEFINER
- `contacts`, `deals`, `pipelines`, `stages`, `activities`
- Trigger `handle_new_user` para criar org + role admin no signup
- Policies por `org_id` via helper `public.current_org_id()` (SECURITY DEFINER, evita recursão)
- Índices em `org_id`, `owner_id`, `stage_id`, `contact_id`

## Fase 3 — Conectores e secrets
- **Stripe**: usar built-in Lovable Payments (recomendado) → segredos gerenciados; webhook em `/api/public/webhooks/stripe`.
- **Resend**: linkar via `standard_connectors--connect` (gateway). Instrução ao usuário para verificar domínio (SPF/DKIM/DMARC).
- **WhatsApp Cloud API (Meta)**: sem connector pronto → `add_secret` para `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_VERIFY_TOKEN`, `WHATSAPP_APP_SECRET`. Antes de pedir, entregar as URLs de webhook prontas para colar no painel Meta.

## Fase 4 — Rotas HTTP públicas (webhooks)
Criar apenas os endpoints (sem UI):
- `src/routes/api/public/webhooks/stripe.ts` — POST, valida assinatura HMAC, escreve `deals` via `supabaseAdmin` (dentro do handler).
- `src/routes/api/public/webhooks/whatsapp.ts` — GET (verify challenge) + POST (valida `x-hub-signature-256`, insere `activities` kind='whatsapp').

## Fase 5 — Server functions internas
`createServerFn` + `requireSupabaseAuth` em `src/lib/*.functions.ts`:
- `crm.contacts.functions.ts` — createLead, listContacts, getContact.
- `crm.deals.functions.ts` — createDeal, moveDealStage.
- `crm.activities.functions.ts` — addActivity, listTimeline.
- `crm.import.functions.ts` — importLeadsCsv (bulk insert com validação).
- `crm.whatsapp.functions.ts` — sendTemplate via Meta Graph API.
- `crm.email.functions.ts` — sendTransactional via Resend gateway.

## Fase 6 — Ligações site ↔ CRM (server-side, sem tocar UI)
- Hook interno `recordNewsletterSignup` → insere `contact` com tag `newsletter` (o formulário atual do site chama esse server fn sem mudança visual).
- Webhook Stripe → cria/atualiza `contact` + `deal` stage `ganho`.

## O que fica FORA deste plano (por pedido: não mexer no layout)
- Nenhuma tela nova: dashboard, leads, pipeline, contato, importação CSV → ficam para próxima etapa, quando você pedir a UI do portal.
- Nenhuma alteração no `src/routes/index.tsx` ou componentes visuais existentes.

## Detalhes técnicos
- Todas as tabelas em schema `public` recebem `GRANT ... TO authenticated` e `GRANT ALL ... TO service_role` na MESMA migração antes de `ENABLE RLS`.
- `supabaseAdmin` só é importado DENTRO de handlers (`await import('@/integrations/supabase/client.server')`), nunca em module scope de `.functions.ts` ou rotas.
- Webhooks públicos ficam em `/api/public/*` e SEMPRE validam assinatura antes de qualquer escrita.
- Segredos lidos com `process.env.*` DENTRO do handler.
- Zero mudança em `src/styles.css`, `src/routes/__root.tsx`, `src/routes/index.tsx` e assets.

## Ordem de execução e pontos que precisam de você
1. Eu habilito Cloud + auth + schema + rotas de webhook + server fns.
2. **Você precisa decidir agora**:
   - (a) Stripe: uso o **Lovable Payments built-in** (recomendado, sem conta Stripe própria) ou você quer conectar sua própria conta Stripe?
   - (b) WhatsApp Cloud API: você já tem app criado no Meta for Developers? Se não, eu deixo o endpoint pronto e você configura depois.
   - (c) Resend: tem domínio próprio para verificar (ex.: `maxorsports.com.br`)? Sem domínio verificado só dá para mandar e-mail para você mesmo.
3. Depois que você responder, eu executo Fase 1→6 de uma vez.