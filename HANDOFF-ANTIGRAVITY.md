# HANDOFF — Maxor Sports (Site + CRM)
**Documento para importar no Google Antigravity / IDE de escolha**
Autoria técnica: **Helena (DBA sênior)** · **Felipe (Full-Stack & Cyber)**
Cliente: **Franklin — Maxor Importação LTDA**

---

## 1. Visão geral

Duas frentes no mesmo projeto Lovable:

| Frente | Público | Rotas | Autenticação |
|---|---|---|---|
| **Site e-commerce** (público) | Compradores finais | `/`, `/masculino`, `/feminino`, `/infantil`, `/marcas/*`, `/roupas/*`, `/ofertas`, `/produto/$id`, `/checkout`, `/login`, `/minha-conta` | Opcional — comprador pode fechar via WhatsApp sem cadastro |
| **CRM interno** (gestão) | Franklin + equipe | (a implementar em `/_authenticated/crm/*`) | Obrigatória. **Só usuários cadastrados via CRM entram.** Alterações estruturais/administrativas: **apenas** `maxortecnologia@gmail.com` e `franklinocardoso@gmail.com` (papel `super_admin`, concedido só após confirmação de e-mail). |

**Stack**: TanStack Start v1 + React 19 + Vite 7 + Tailwind v4 + Lovable Cloud (Supabase Postgres) · deploy em Cloudflare Workers.

**Identidade visual**: Navy `#0F1720` · Cyan `#00BFC6` · Mint `#7EEBC1` · Lime `#C7F500` · Cream `#F7F8F5` · fontes Rajdhani + Inter.

---

## 2. Arquitetura de código

```
src/
├── routes/
│   ├── __root.tsx              # head/meta global + providers
│   ├── index.tsx               # Home (hero + carrosséis)
│   ├── masculino|feminino|infantil.tsx
│   ├── marcas.index.tsx / marcas.$brand.tsx
│   ├── roupas.index.tsx / roupas.$category.tsx
│   ├── ofertas.tsx             # inclui Combo MX Deals
│   ├── produto.$id.tsx         # PDP c/ galeria + variantes de cor + tamanhos
│   ├── checkout.tsx            # PIX + WhatsApp com dados completos
│   ├── login.tsx / minha-conta.tsx
│   ├── _authenticated/         # gate gerenciado (ssr:false, redirect /auth)
│   └── api/public/webhooks/
│       ├── stripe.ts           # HMAC t=,v1= (SHA-256 timing-safe)
│       └── whatsapp.ts         # HMAC x-hub-signature-256 + GET challenge
├── lib/
│   ├── crm.contacts.functions.ts        # createServerFn (contatos)
│   ├── crm.deals.functions.ts           # createServerFn (deals)
│   ├── crm.image-search.functions.ts    # busca visual via Lovable AI (Gemini)
│   ├── buyer.functions.ts               # perfil do comprador logado
│   ├── catalog.ts                       # agrupa variantes de cor por modelId
│   └── cart.tsx                         # sacola (localStorage)
├── components/site/
│   ├── Shell.tsx               # Header Navy + MegaNav + Newsletter + Footer
│   ├── brands-data.ts / roupas-data.ts
│   └── ...
├── integrations/supabase/      # AUTO-GEN — nunca editar
├── server.ts                   # entry Worker + cabeçalhos de segurança
├── start.ts                    # middleware (bearer Supabase)
└── styles.css                  # Tailwind v4 + tokens semânticos
```

**Regras de ouro**
- **Server logic**: `createServerFn` (`@tanstack/react-start`). **Nunca criar Edge Function nova.**
- **HTTP público** (webhooks/cron): `src/routes/api/public/*` com verificação de assinatura.
- **Segredos**: `process.env.*` **dentro do handler**, nunca no topo do módulo.
- **Admin client** (`client.server`): `await import(...)` dentro do handler, jamais em rota/componente.

---

## 3. Schema do banco (público)

### Enums
```sql
app_role: 'admin' | 'manager' | 'sales' | 'viewer' | 'super_admin'
```

### Tabelas

| Tabela | Chaves & campos-chave | Observação |
|---|---|---|
| `organizations` | `id`, `name` | Criada no signup pelo trigger. Seed automático de pipeline. |
| `user_roles` | `user_id`, `org_id`, `role`, **unique(user_id,org_id,role)** | RLS: leitura própria/mesma org; escrita só admin/super_admin. |
| `pipelines` | `org_id`, `name`, `is_default` | 1 pipeline default por org (seed). |
| `stages` | `pipeline_id`, `org_id`, `name`, `order`, `color` | 6 etapas iniciais. |
| `contacts` | `org_id`, `name`, `email`, `phone_e164`, `tags[]`, `owner_id`, `source` | Unique parcial por (org, email) e (org, phone). |
| `deals` | `org_id`, `contact_id`, `pipeline_id`, `stage_id`, `title`, `value_brl`, `probability`, `status`, `expected_close`, `external_ref` | |
| `activities` | `org_id`, `entity_type`, `entity_id`, `kind`, `body`, `owner_id` | Append-only; grava mudanças de papel automaticamente. |
| `buyer_profiles` | `user_id` (unique), `full_name`, `phone`, `email`, `country`, `state`, `city`, `address`, `zip` | Comprador do site (isolado do CRM). RLS: só o dono. |

### Índices criados (Helena)
Todas as FKs (`org_id`, `contact_id`, `pipeline_id`, `stage_id`, `owner_id`), `contacts(lower(email))`, `contacts(phone_e164)`, `activities(entity_type, entity_id)`, `activities(created_at DESC)`, unique parciais em contacts.

### Funções (SECURITY DEFINER, search_path=public)
| Função | Uso |
|---|---|
| `has_role(uuid, app_role)` | Base do RBAC. `authenticated` only. |
| `is_org_member(uuid)` | Filtro RLS multi-tenant. `authenticated` only. |
| `current_org_id()` | Retorna org do usuário logado. |
| `is_super_admin(uuid)` | Checagem para operações críticas. |
| `handle_new_user()` | **Trigger** `AFTER INSERT auth.users`: cria org + role admin. |
| `grant_super_admin_for_authorized_email()` | **Trigger** `AFTER INSERT/UPDATE OF email_confirmed_at auth.users`: concede `super_admin` **apenas** para os 2 e-mails autorizados e **apenas** após verificação. |
| `seed_default_pipeline()` | **Trigger** `AFTER INSERT organizations`: cria pipeline + 6 stages. |
| `audit_user_roles()` | **Trigger** em `user_roles`: log em `activities`. |
| `set_updated_at()` | **Trigger** BEFORE UPDATE em contacts/deals/buyer_profiles. |

### RLS — regra de escrita (contacts/deals)
- **Leitura**: todo membro da organização.
- **INSERT/UPDATE**: `sales | manager | admin | super_admin`.
- **DELETE**: só `admin | super_admin`.
- **pipelines/stages**: escrita **só** `admin | super_admin`.
- **user_roles**: escrita **só** `admin | super_admin` da mesma org (previne escalonamento).

---

## 4. Segurança implementada

### Aplicação (`src/server.ts`)
Cabeçalhos aplicados a toda resposta:
```
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(self), microphone=(), geolocation=(), payment=(self), usb=(), interest-cohort=()
Cross-Origin-Opener-Policy: same-origin-allow-popups
X-Frame-Options: DENY                                    ← produção
Content-Security-Policy: frame-ancestors 'none'          ← produção (anti-clonagem)
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
```
Preview `*.lovable.app` fica com `frame-ancestors 'self' https://*.lovable.app https://*.lovable.dev` para o editor funcionar.

### Auth (Lovable Cloud / Supabase)
- **HIBP ligado**: senhas vazadas em vazamentos são recusadas.
- Confirmação de e-mail obrigatória.
- Anonymous sign-in desligado.

### Banco
- Todas as tabelas com RLS ativo.
- Helpers RLS revogados de `anon`; triggers internos revogados de todos.
- `user_roles` blindado contra escalonamento.
- `super_admin` só é possível para os 2 e-mails **e** só depois de confirmar o e-mail.
- Auditoria automática de mudanças de papel em `activities`.

### Webhooks
- **Stripe**: HMAC-SHA256 com `t=,v1=` (timing-safe compare).
- **WhatsApp/Meta**: HMAC-SHA256 com `x-hub-signature-256` + endpoint GET para challenge.

---

## 5. Integrações

| Integração | Onde | Segredos necessários |
|---|---|---|
| **Lovable AI Gateway** (Gemini vision) | `crm.image-search.functions.ts` — busca por imagem | `LOVABLE_API_KEY` (auto) |
| **Stripe** | `api/public/webhooks/stripe` → cria contact + deal | `STRIPE_WEBHOOK_SECRET` |
| **WhatsApp Cloud API** | `api/public/webhooks/whatsapp` → cria contact + activity | `WHATSAPP_VERIFY_TOKEN`, `WHATSAPP_APP_SECRET` |
| **Correios** | Link direto para `rastreamento.correios.com.br` | — |
| **PIX** | Chave aleatória `0010ef3f-7011-41f4-ae7d-43616eb08627` — copiada no checkout | — |

---

## 6. Fluxo do checkout (WhatsApp + PIX)

1. PDP `/produto/$id` → seletor de cor + tamanho → **Comprar agora** / **Adicionar à sacola**.
2. `/checkout` coleta: Nome, Telefone, E-mail, País, Estado, Cidade, Endereço, CEP.
3. Botão gera mensagem estruturada e abre WhatsApp (`whatsapp://` mobile, `web.whatsapp.com` desktop, fallback `wa.me`) no número **+55 77 99959-9009**.
4. Cliente copia a chave PIX aleatória (`0010ef3f-7011-41f4-ae7d-43616eb08627`) e envia comprovante pelo mesmo WhatsApp.
5. Comprador cadastrado tem os dados pré-preenchidos e vê rastreio em `/minha-conta`.

---

## 7. Como o CRM se pluga

- CRM vive **dentro do mesmo projeto** sob `_authenticated/` (gate gerenciado; `ssr:false`; redirect `/auth`).
- Toda função `createServerFn` de CRM usa `.middleware([requireSupabaseAuth])` → RLS aplica automaticamente como o usuário logado.
- Contatos e deals gerados pelo site (webhooks / newsletter / busca por imagem) já entram na org existente.
- **Regra de acesso pedida pelo cliente**: apenas usuários cadastrados via CRM logam; apenas os 2 e-mails têm poder de alteração estrutural (garantido no banco pelo papel `super_admin` + políticas RLS).

Telas mínimas a construir no CRM:
1. **Dashboard** — funil, receita, tarefas do dia.
2. **Leads / Contatos** — DataTable com filtros por tag/origem.
3. **Kanban do Pipeline** — drag entre stages.
4. **Timeline do contato** — atividades ordenadas por data.
5. **Configurações** — só `super_admin`: gerir papéis, pipelines, integrações.

---

## 8. Migrations executadas (ordem)

1. Schema inicial CRM (organizations, user_roles, pipelines, stages, contacts, deals, activities) + RLS + `has_role`, `is_org_member`, `current_org_id`, `handle_new_user`.
2. `buyer_profiles` + RLS por dono.
3. Endurecimento: revoke de anon nos helpers, policies admin-only em `user_roles`.
4. `ALTER TYPE app_role ADD VALUE 'super_admin'` (isolada — Postgres exige commit do enum).
5. **Helena** (esta migração):
   - trigger `on_auth_user_created` (faltava!)
   - trigger `on_auth_user_confirmed_grant_super` (2 e-mails autorizados)
   - `is_super_admin()`
   - triggers `updated_at`
   - índices em todas as FKs + unique parciais
   - `seed_default_pipeline()` + trigger
   - `audit_user_roles()` + trigger
   - RLS granular por papel em contacts/deals/pipelines/stages/activities

---

## 9. Variáveis de ambiente

| Nome | Contexto | Origem |
|---|---|---|
| `VITE_SUPABASE_URL` / `VITE_SUPABASE_PUBLISHABLE_KEY` / `VITE_SUPABASE_PROJECT_ID` | Cliente (browser) | Auto (Lovable) |
| `SUPABASE_URL` / `SUPABASE_PUBLISHABLE_KEY` / `SUPABASE_SERVICE_ROLE_KEY` | Server (Worker) | Auto (Lovable) |
| `LOVABLE_API_KEY` | Gateway de IA | Auto |
| `STRIPE_WEBHOOK_SECRET` | Webhook Stripe | Manual |
| `WHATSAPP_VERIFY_TOKEN` / `WHATSAPP_APP_SECRET` | Webhook Meta | Manual |

Nunca ler segredos no topo do módulo. Nunca expor `SERVICE_ROLE` no browser.

---

## 10. Checklist para replicar no Antigravity

- [ ] Criar projeto TanStack Start v1 + Vite 7 + React 19 + Tailwind v4.
- [ ] Configurar Supabase (self-host ou managed) e rodar as migrations desta ordem.
- [ ] Copiar `src/routes/`, `src/lib/`, `src/components/site/`, `src/styles.css`, `src/server.ts`, `src/start.ts`.
- [ ] Adicionar cabeçalhos de segurança em `src/server.ts` (seção 4).
- [ ] Configurar Auth: HIBP on, e-mail obrigatório, anon off.
- [ ] Cadastrar os 2 e-mails autorizados; confirmar via link → `super_admin` sai automático.
- [ ] Publicar; configurar webhooks Stripe/WhatsApp apontando para `/api/public/webhooks/*`.
- [ ] Construir telas do CRM sob `_authenticated/crm/*`.

---

**Contato do cliente**
Maxor Importação LTDA · CNPJ 68.105.594/0001-39 · PIX (CNPJ) · maxortecnologia@gmail.com · WhatsApp (77) 99959-9009
