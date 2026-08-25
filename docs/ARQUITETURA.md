# Arquitetura — site Maxor Sports

## 1. Stack e convenções

- **TanStack Start v1** com file-based routing em `src/routes`. `src/routeTree.gen.ts`
  é gerado — nunca editar.
- Layout raiz em `src/routes/__root.tsx` (efeitos globais, `<Outlet />`, metadados).
- Lógica de servidor interna: `createServerFn` de `@tanstack/react-start`, em arquivos
  `*.functions.ts` (importáveis pelo cliente) e helpers `*.server.ts` (server-only).
- HTTP externo (webhooks, ingestão): rotas em `src/routes/api/public/*`, que ignoram o
  auth do site — a verificação do chamador é feita dentro do handler.
- Tailwind v4 via `src/styles.css`. Fontes carregadas por `<link>` no `__root`.

## 2. Design system

Tokens semânticos (`background`, `foreground`, `card`, `primary`, `muted`, `border`,
`offwhite`) definidos em `src/styles.css` e espelhados em `src/maxor-kit/tokens.ts`.

| Cor | Hex | Uso |
|---|---|---|
| Navy | `#0F1720` | fundo universal |
| Cyan | `#00BFC6` | primária, links, destaques |
| Mint | `#7EEBC1` | bordas de card |
| Lime | `#C7F500` | CTA / selos |
| Cream | `#F7F8F5` | texto sobre Navy |

Fontes: **Rajdhani** (display/títulos) e **Inter** (corpo).
Hover de botão: `brightness-110`. Nunca usar `bg-white`, `text-white` ou hex direto.

### Efeitos globais

| Componente | Onde | Observação |
|---|---|---|
| `SplashCursor` | navegação do site | **desativado** em `/admin` e `/maxorcrm` (evitava erro de DOM `removeChild`) |
| `Aurora` | apenas o cabeçalho | WebGL (`ogl`), client-only, cleanup defensivo do canvas |
| `LogoLoop` | faixa de marcas | carrossel infinito, arraste, pausa no hover, handle em forma de tênis |
| `CampaignModal` | abertura do site | banner/carrossel de campanha, fechável |
| `HowItWorksStrip` | acima do menu | timeline: escolhe → confirma no WhatsApp → verificamos estoque → paga → importamos → entrega |

`Shell.tsx` monta TopBar, Header sticky Navy (busca por texto e por imagem, conta,
favoritos, sacola), MegaNav, newsletter e footer.

## 3. Fluxo de dados do catálogo (regra de ouro)

```text
MaxorCRM (/maxorcrm/fase-1)
   ↓ grava em public.products
Supabase
   ↓ SELECT com site_visible = true  (src/lib/crm-db-catalog.ts)
setCrmProducts()  →  ALL_PRODUCTS (índice vivo, mutado in-place)
   ↓ subscribeCatalog / hooks
vitrines, menus, PDP, busca
```

Pontos essenciais de `src/lib/catalog.ts`:

- `ALL_PRODUCTS` é sempre a **mesma referência de array**; quem importou continua vendo
  dados atualizados.
- `subscribeCatalog`, `getCatalogVersion`, `isCatalogLoaded` para reatividade.
- **Gating estrito**: produto só aparece com `site_visible = true`, `status` publicado e
  tag/selo válido. Sem foto do CRM, o produto não é exibido — não existe placeholder
  fotográfico.
- `section` (`masculino | feminino | infantil | ofertas`) é derivada do cadastro do CRM.
- Selo "de/por" só aparece quando `old_price` foi preenchido manualmente — não há
  desconto calculado automaticamente.
- A PDP (`produto.$id.tsx`) usa SSR via `src/lib/product-page.server.ts` para funcionar
  em acesso direto e reload (sem 404).

## 4. Marcas — fonte única

`src/lib/brands.ts` é a única fonte. Contém `BRAND_DEFS` (slug, nome canônico, aliases,
`matchBy: "brand" | "category"`), `canonicalBrandName`, `brandSlug`,
`productMatchesBrand` e `buildBrandDirectory` (diretório vivo, só com marcas que têm
produtos visíveis). Menu, `/marcas`, `/marcas/$brand`, busca, LogoLoop e a API de
ingestão consomem daqui. Adicionar/renomear marca = mexer somente neste arquivo.

Casos `matchBy: "category"` (ex.: Chuteiras) aparecem como "marca" no menu mas filtram
por categoria do produto.

## 5. Listagens e visualização

`ViewModeToggle` (`src/components/site/view-mode.tsx`) oferece **lista**, **ícones
grandes** e **ícones pequenos** em todas as páginas de listagem, com persistência em
`localStorage`. `CatalogPage.tsx` centraliza grid, filtros, breadcrumbs e favoritos.

## 6. Sacola e checkout

- `src/lib/cart.tsx` — `CartProvider`/`useCart`, persistência em `localStorage`,
  overlay escuro ao adicionar item.
- Na PDP o cliente escolhe **cor** (todas as variações do modelo) e **tamanho**.
- `/checkout` coleta nome, telefone, e-mail, endereço e CEP, monta o resumo do pedido e
  abre a API do WhatsApp com a mensagem pronta.
- Pagamento: **chave PIX estática** `0010ef3f-7011-41f4-ae7d-43616eb08627` exibida na
  interface. Cartão de crédito é aceito via atendimento.
- Não há gestão de estoque: `vender_sem_estoque`/`backorder` permitem pedido por encomenda.

## 7. Área do cliente

`/minha-conta` — perfil (`buyer_profiles`), favoritos (`buyer_favorites`) e pedidos.
Cadastro exige confirmação de e-mail. Server functions com `requireSupabaseAuth`, então
o RLS aplica como o usuário logado.

## 8. Busca

- Busca textual sobre `ALL_PRODUCTS`.
- Busca por imagem: `src/lib/crm.image-search.functions.ts` (Gemini via Lovable AI).
- Quando nada é encontrado, o site mostra a mensagem "Mande uma imagem ou nome..." com
  link direto para o WhatsApp.

## 9. SEO

`head()` por rota com título/descrição/OG próprios, `sitemap.xml` gerado em
`src/routes/sitemap[.]xml.ts`, `robots.txt` em `public/`, H1 único por página,
lazy loading de imagens e canonical.

## 10. maxor-kit

`src/maxor-kit/` exporta tokens, assets, efeitos, componentes, dados e server functions
para reuso pelo CRM sem duplicar código. Efeitos WebGL são client-only. Ver
`src/maxor-kit/README.md`.
