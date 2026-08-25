# MaxorCRM — painel de gestão (`/maxorcrm`)

O CRM roda **dentro deste projeto** (o antigo sistema externo "Antigravity" foi
descontinuado) e usa o mesmo backend do site. Shell em `src/routes/maxorcrm.tsx`,
telas em `src/components/maxorcrm/`.

| Rota | Módulo |
|---|---|
| `/maxorcrm` | painel inicial: métricas, gerenciador de banner de campanha |
| `/maxorcrm/fase-1` | Estoque / cadastro de produtos (`Fase1Catalog.tsx`) |
| `/maxorcrm/fase-2` | Vendas — Kanban de negócios, contatos, atividades |
| `/maxorcrm/fase-3` | Fase 3 |
| `/admin` | login; redireciona para `/maxorcrm` |
| `/admin/crm` | painel legado com métricas reais e atalhos (Produtos, Vendas, Financeiro) |

Efeito `SplashCursor` desativado em `/admin` e `/maxorcrm`; essas áreas são marcadas
`notranslate` para evitar interferência de tradutores no DOM.

## Fase 1 — Cadastro de produtos (4 blocos)

1. **Dados** — `id_produto`/`sku`, `name_prod`, `marca_prod` (canonizada por
   `src/lib/brands.ts`), `categoria_prod`, `tipo_prod`, `genero`, `descricao`,
   `color_variant`, `model_group` (agrupa cores do mesmo modelo), `slug`.
2. **Preço e custos** — `cost_supplier`, `shipping_cost`, `margin_percent`, `price`,
   `old_price`/`discount_price`.
3. **Estoque** — `qtde_est`, `vender_sem_estoque`/`backorder`, faixa de numeração
   (`num_cal_min`/`num_cal_max`), `sizes`.
4. **Vitrine / SEO** — `site_visible`, `brand_visible`, `section`, `status`, `tag`,
   `badge_text`, `launch`, `foto_principal`, `images`/`imagens`.

### Cálculo do imposto de importação

Logo após o valor de compra (VA), o formulário mostra o imposto estimado em reais e um
checkbox para incluí-lo ou não no custo:

```text
imposto = ceil( (VA × 0,60) / 0,83 + 15 )
          VA × 60% + ICMS 17% "por dentro" + R$ 15, arredondado para cima
```

Implementado em `src/components/maxorcrm/Fase1Catalog.tsx` (`importTaxFor`). Persistido
em `products.import_cost` e `products.import_cost_included`. Vale para todos os
cadastros, novos e existentes.

### Regras de exibição no site

Um produto só chega à vitrine com `site_visible = true`, `status` publicado, tag/selo
válido e ao menos uma foto vinda do CRM. Sem foto, o produto fica oculto — o site nunca
usa imagem substituta. O selo "de/por" só aparece se `old_price` for preenchido
manualmente.

## Fase 2 — Vendas

- Kanban de negócios com **Realtime** (`pipelines` → `stages` → `deals`).
- Vínculo de produtos ao negócio, contatos (`contacts`) e timeline (`activities`).
- Server functions: `src/lib/crm.deals.functions.ts`, `crm.contacts.functions.ts`,
  `crm.activities.functions.ts`, `crm.email.functions.ts`, `crm.whatsapp.functions.ts`,
  `crm.import.functions.ts` (CSV).

## Banner de campanha

Tabela `site_campaign` (`active`, `title`, `subtitle`, `cta_label`, `cta_url`,
`images[]`). Gerenciada no painel inicial do CRM: upload/visualização das imagens (até 3,
em carrossel) e chave para exibir ou não. Quando ativo, aparece como modal na abertura do
site e o cliente fecha para navegar. Leitura pública; escrita só para admin
(`src/lib/campaign.functions.ts`, políticas `site_campaign_admin_*`).

## Acessos

- Papéis em `public.user_roles` (enum `app_role`), **nunca** no perfil do usuário.
- Verificação via função security definer no schema `private` (`private.has_role`,
  `private.is_org_member`) usada pelas políticas de RLS.
- Contas super-admin, com `admin` + `super_admin` em todas as organizações:
  - `maxortecnologia@gmail.com`
  - `franklinocardoso@gmail.com`
- Multi-tenant: tudo é escopado por `org_id`; membros leem apenas a própria organização.

> O painel do CRM e as regras de acesso estão **travados** por pedido do cliente:
> alterar somente quando solicitado explicitamente.

## Ingestão externa de produtos

`POST /api/public/crm/products` com header `x-maxor-key` = segredo de ingestão faz upsert
por SKU; `GET` lista os produtos publicados. Contrato do payload em
`CONTRATO-CRM-PRODUTOS.md`. Proxy de imagem em `/api/public/crm/image/*`.

`/kit-validador` roda o checklist de validação do maxor-kit e da integração.
