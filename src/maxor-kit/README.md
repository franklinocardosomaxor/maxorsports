# MAXOR KIT — biblioteca de imagem, funcionalidades e efeitos

Pacote interno (`src/maxor-kit`) que expõe **toda** a camada visual e
funcional do site Maxor Sports para ser reutilizada dentro do ambiente do
**CRM Maxor**, sem duplicar código e sem alterar o layout do site.

## Como importar

```ts
import {
  Shell, CatalogPage, ProductMiniCard,
  Aurora, SplashCursor, LogoLoop,
  brandLogos, categoryIcons, brandMedia, MAXOR_ASSET_LIBRARY, productPlaceholder,
  maxorColors, maxorFonts, maxorGradients, maxorRootCss,
  ALL_PRODUCTS, BRANDS, ROUPAS, getProduct, getVariants, brl,
  CartProvider, useCart,
  createLead, createDeal, listDeals, listTimeline, searchByImage,
} from "@/maxor-kit";
```

## O que vem dentro

| Grupo | Conteúdo |
|---|---|
| **Tokens** (`tokens.ts`) | Paleta Navy/Cyan/Mint/Lime/Cream, fontes Rajdhani+Inter, gradientes da marca, mapa de variáveis CSS e `maxorRootCss()` para injetar no shell do CRM. |
| **Imagens** (`assets.ts`) | 17 logos de marca (SVG), 4 ícones de categoria (chuteiras, academia, futebol, diversas), monograma, capas masculino/feminino e o vídeo do hero (CDN). `MAXOR_ASSET_LIBRARY` lista tudo com `key/url/kind/label` — pronto para uma tela de biblioteca de mídia no CRM. |
| **Efeitos** | `Aurora` (WebGL/ogl, cabeçalho), `SplashCursor` (fluido no cursor), `LogoLoop` (carrossel infinito com arraste, pausa no hover e scrollbar Cyan). |
| **Componentes** | `Shell` (header Navy + MegaNav + newsletter + footer), `CatalogPage` (grid com filtros, breadcrumbs e favoritos), `ProductMiniCard`. |
| **Dados** | `ALL_PRODUCTS` (vindo do CRM), `PROMO_COMBOS`, `BRANDS`, `ROUPAS`. Não existem catálogos locais. |
| **Funcionalidades** | Sacola (`CartProvider`/`useCart`, localStorage), favoritos, perfil do comprador, leads/deals/atividades do CRM, busca por nome e por imagem (Gemini), importação CSV, e-mail transacional e WhatsApp. |

## Regras de uso no CRM

1. **Efeitos são client-only.** `Aurora` e `SplashCursor` usam WebGL — renderize
   dentro de `<ClientOnly>` ou via `React.lazy`; nunca importe estaticamente
   em rota com SSR.
2. **Estilos.** Importe `src/styles.css` (Tailwind v4 + tokens) ou, se o CRM
   tiver o próprio pipeline, injete `maxorRootCss()` no `:root`.
3. **Server functions.** Tudo que termina em `.functions` roda no servidor com
   `requireSupabaseAuth` → o RLS aplica como o usuário logado. Não chame de
   loader de rota pública.
4. **Fotos de produto.** Não existem binários de produto no repositório. Use
   `productPlaceholder(slug, label)` até o CRM cadastrar mídia real; depois
   basta preencher `CatalogProduct.img` com a URL pública (Storage/CDN) — a
   tipagem não muda.
5. **Agrupamento de cores.** `getVariants()` usa `modelId ?? img` como chave de
   modelo. Ao cadastrar produtos no CRM, preencha `modelId` para que as
   variações de cor agrupem corretamente.

## Substituindo os seeds por dados do CRM

Fluxo único: CRM → `public.products` (`site_visible = true`) → `setCrmProducts()`
→ vitrines. Os agrupamentos promocionais (`ofertas-data.ts`) devem virar `createServerFn` que leem
`products` + `product_media`, **mantendo exatamente o shape de
`CatalogProduct`**. Nenhum componente do kit precisa ser alterado.
