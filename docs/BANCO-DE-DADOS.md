# Banco de dados — Maxor Sports (Lovable Cloud / Supabase)

Postgres gerenciado, acessado pela Data API (PostgREST) e por server functions.
**Toda** tabela em `public` tem RLS habilitado e `GRANT` explícito.

Clientes:
- navegador → `src/integrations/supabase/client.ts` (chave publishable, RLS como usuário)
- server function autenticada → middleware `requireSupabaseAuth`, usa `context.supabase`
- privilegiado (raro) → `src/integrations/supabase/client.server.ts`, importado dentro do
  handler, depois de verificar o chamador

Arquivos gerados que não devem ser editados: `client.ts`, `client.server.ts`,
`auth-middleware.ts`, `auth-attacher.ts`, `types.ts`, `previewAuthStorage.ts`, `.env`.

## Tabelas

### `organizations`
`id`, `name`, `created_at` — raiz do multi-tenant.
RLS: membros leem a própria org; authenticated pode criar; admins atualizam.

### `user_roles`
`id`, `user_id`, `org_id`, `role` (enum `app_role`), `created_at`.
Papéis vivem **só aqui** (nunca em perfil/usuário), para evitar escalonamento de
privilégio. RLS: usuário lê os próprios papéis; admins inserem/atualizam/removem papéis
na própria org.

### `products`
Catálogo soberano do CRM. Colunas principais:

- identificação: `id`, `org_id`, `sku`, `id_produto`, `slug`, `model_group`
- descrição: `name`, `name_prod`, `brand`, `marca_prod`, `category`, `categoria_prod`,
  `tipo_prod`, `type`, `genero`, `gender`, `section`, `description`, `descricao`,
  `color_variant`, `colors[]`, `sizes[]`
- preço/custos: `price`, `old_price`, `discount_price`, `valor_dec`, `cost_supplier`,
  `shipping_cost`, `margin_percent`, `import_cost`, `import_cost_included`
- estoque: `stock`, `qtde_est`, `backorder`, `vender_sem_estoque`, `num_cal_min`,
  `num_cal_max`
- vitrine: `site_visible`, `brand_visible`, `status`, `tag`, `badge_text`, `launch`,
  `img`, `foto_principal`, `images[]`, `imagens` (jsonb)

RLS (política por perfil, sem sobreposição):
- `products_anon_read` (anon): apenas produtos da vitrine — `site_visible = true`,
  publicados e com tag válida. Visitante não alcança custo/margem de itens ocultos.
- `products_authenticated_read` (authenticated): a mesma vitrine **ou** acesso completo
  (incluindo custos e margens) quando o usuário é membro da `org_id` do produto.
- `products_org_insert` / `products_org_update` / `products_org_delete`: só membros da org.

### `contacts`, `deals`, `pipelines`, `stages`, `activities`
CRM comercial, tudo escopado por `org_id`.
- leitura: membros da org
- escrita: papel de vendas (`sales`) para contatos/negócios; admins para
  pipelines/stages e para todos os `DELETE`
- `activities` registra a timeline (`entity_type`, `entity_id`, `kind`, `body`)

### `buyer_profiles`, `buyer_favorites`
Dados do cliente final da loja. RLS estritamente por `user_id = auth.uid()` (select,
insert, update, delete próprios). Nenhum acesso anônimo.

### `site_campaign`
Banner/carrossel de abertura: `active`, `title`, `subtitle`, `cta_label`, `cta_url`,
`images[]`. Leitura pública (anon + authenticated); insert/update/delete só admin.

## Funções

- `private.has_role(user_id, role)` / `private.is_org_member(org_id)` — `SECURITY DEFINER`
  no schema `private`, usadas pelas políticas de RLS (evita recursão).
- `public.has_role` — `SECURITY INVOKER` (executa com as permissões do chamador); usada
  por `src/lib/campaign.functions.ts`.

Nenhum objeto deve ser criado nos schemas `auth`, `storage`, `realtime`,
`supabase_functions` ou `vault`.

## Endpoints HTTP públicos

| Rota | Método | Segurança |
|---|---|---|
| `/api/public/crm/products` | GET | lista produtos publicados |
| `/api/public/crm/products` | POST | header `x-maxor-key` = segredo de ingestão; upsert por SKU |
| `/api/public/crm/image/*` | GET | proxy de imagem do CRM |
| `/api/public/webhooks/stripe` | POST | validação de assinatura |
| `/api/public/webhooks/whatsapp` | POST | verificação do token do provedor |

O prefixo `/api/public/*` ignora o auth do site — a verificação do chamador acontece
sempre dentro do handler, com Zod validando o payload.

URLs estáveis para serviços externos:
`project--<project-id>.lovable.app` (produção) e `project--<project-id>-dev.lovable.app`.

## Segredos (apenas nomes — valores nunca no repositório)

| Nome | Uso |
|---|---|
| `CRM_INGEST_SECRET` | header `x-maxor-key` da ingestão de produtos |
| `MAXOR_CRM_INGEST_KEY` | chave de integração do CRM |
| `LOVABLE_API_KEY` | Lovable AI Gateway (busca por imagem, IA) |
| `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY` | leitura SSR em `product-page.server.ts` |

`SUPABASE_SERVICE_ROLE_KEY` e a senha do banco não são acessíveis neste ambiente e não
devem ser logados, retornados ou reproduzidos em código.

## Segurança aplicada

- RLS em todas as tabelas, com `GRANT` por papel; políticas de `SELECT` sem sobreposição.
- Confirmação de e-mail no cadastro do cliente; sem cadastro anônimo.
- Headers de segurança (CSP, HSTS) e proteções anti-clonagem no shell do site.
- Papéis fora da tabela de perfil; verificação sempre no servidor.
