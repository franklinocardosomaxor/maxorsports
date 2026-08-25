# Maxor Sports — site + MaxorCRM

E-commerce/vitrine de artigos esportivos importados (tênis, chuteiras, roupas) operando
no modelo **agente**: o cliente escolhe no site, o fechamento acontece no WhatsApp com
pagamento por PIX, e a importação é feita sob demanda. Não há controle de estoque
tradicional.

O repositório contém **dois sistemas no mesmo projeto**, compartilhando o mesmo backend:

| Área | Rota | Função |
|---|---|---|
| Site público | `/` | Vitrine, catálogo, PDP, sacola, checkout WhatsApp/PIX |
| MaxorCRM | `/maxorcrm` | Cadastro de produtos (Fase 1), Vendas/Kanban (Fase 2), Fase 3 |
| Painel legado | `/admin` | Login e atalhos para os módulos do CRM |

> O sistema externo "Antigravity" foi **descontinuado**. Todo o CRM vive agora neste
> projeto, em `/maxorcrm`.

## Documentação

- [`docs/ARQUITETURA.md`](docs/ARQUITETURA.md) — rotas, design system, fluxo do catálogo, marcas, checkout
- [`docs/MAXORCRM.md`](docs/MAXORCRM.md) — módulos do CRM, cálculo de importação, banners, acessos
- [`docs/BANCO-DE-DADOS.md`](docs/BANCO-DE-DADOS.md) — tabelas, RLS, endpoints públicos, segredos
- [`CONTRATO-CRM-PRODUTOS.md`](CONTRATO-CRM-PRODUTOS.md) — contrato do payload de produtos
- [`GUIA-INTEGRACAO-CRM.md`](GUIA-INTEGRACAO-CRM.md) — integração e validação do kit
- [`src/maxor-kit/README.md`](src/maxor-kit/README.md) — design system e componentes compartilhados
- `docs/historico/` — documentos da fase Antigravity, mantidos apenas como histórico

## Stack

- **TanStack Start v1** (React 19, SSR, server functions) + **Vite 7**
- **Tailwind CSS v4** via `src/styles.css` (tokens em `@theme`, sem `tailwind.config.js`)
- **Lovable Cloud / Supabase** — Postgres, Auth, Storage, RLS
- shadcn/ui + Radix, TanStack Query, Zod

## Rodar localmente

```sh
npm i
npm run dev      # http://localhost:8080
```

Variáveis do cliente (`.env`, geradas automaticamente): `VITE_SUPABASE_URL`,
`VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_PROJECT_ID`.
Segredos de servidor nunca ficam no repositório — ver `docs/BANCO-DE-DADOS.md`.

## Mapa de diretórios

```text
src/
  routes/                 rotas (file-based routing do TanStack Router)
    index.tsx             home
    masculino|feminino|infantil|ofertas|lancamentos|categorias|catalogo
    marcas.index.tsx      diretório de marcas
    marcas.$brand.tsx     vitrine por marca
    produto.$id.tsx       PDP (SSR)
    checkout.tsx          checkout WhatsApp + PIX
    minha-conta.tsx       área do cliente (perfil, favoritos, pedidos)
    admin.index.tsx       login do painel
    admin.crm.tsx         painel legado com atalhos
    maxorcrm.tsx          shell do CRM
    maxorcrm/             fase-1 (estoque), fase-2 (vendas), fase-3
    api/public/crm/       ingestão de produtos e proxy de imagem
    api/public/webhooks/  stripe, whatsapp
  lib/
    catalog.ts            índice vivo do catálogo + gating (CRM soberano)
    brands.ts             FONTE ÚNICA de marcas
    cart.tsx              sacola (localStorage)
    *.functions.ts        server functions (RPC tipado)
    *.server.ts           helpers server-only
  components/
    site/                 Shell, CatalogPage, Aurora, SplashCursor, LogoLoop, ...
    maxorcrm/             telas do CRM (Fase1Catalog, vendas, banners)
    ui/                   shadcn/ui
  maxor-kit/              design system + API compartilhada (tokens, assets, index)
```

## Regras invioláveis do projeto

1. **Dark theme obrigatório** — fundo Navy `#0F1720` em todo o site. Nenhuma área branca.
2. **O CRM é soberano no catálogo** — o site exibe exclusivamente produtos do CRM com
   `site_visible = true`. Mocks, seeds, demos e imagens substitutas são proibidos.
3. **Marcas só em `src/lib/brands.ts`** — nunca hardcodar listas de marcas em componentes.
4. **`src/maxor-kit/` não muda de estrutura** sem autorização — o CRM depende dele.
5. **RLS sempre** — nenhuma query que contorne políticas; `GRANT` explícito por tabela.
6. **Checkout é WhatsApp + PIX** — não implementar Stripe como fluxo principal.

Built with [Lovable](https://lovable.dev). Alterações feitas no editor são commitadas
neste repositório e commits enviados para o branch conectado voltam para o editor.
