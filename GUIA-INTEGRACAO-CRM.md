# Guia de Integração — MAXOR KIT no CRM Maxor

Guia único para o time do CRM (e para o Antigravity) plugar a camada visual e
funcional do site Maxor Sports dentro do ambiente do CRM, **sem duplicar código
e sem alterar o layout do site**.

---

## 1. O que é entregue

| Pacote | Caminho | Conteúdo |
|---|---|---|
| Kit | `src/maxor-kit/` | Ponto único de importação: tokens, mídia, efeitos, componentes, dados e server functions |
| Tarball | `maxor-kit.tgz` | Mesmo conteúdo + dependências do kit + `MANIFEST.txt` + `package.json` com peerDependencies |
| Validador | rota `/kit-validador` | Página que consome o kit exatamente como o CRM fará |

Gerar o tarball:

```bash
bash scripts/pack-maxor-kit.sh   # -> /mnt/documents/maxor-kit.tgz
```

---

## 2. Pré-requisitos no CRM

- TanStack Start v1 (React 19) — rotas em `src/routes/`
- Tailwind CSS v4 via `@tailwindcss/vite`
- Alias `@` → `src` (`vite-tsconfig-paths`)
- Lovable Cloud (Supabase) com os arquivos gerados em `src/integrations/supabase/*`
- `ogl` instalado (efeitos WebGL Aurora/SplashCursor)

Peer deps mínimas estão declaradas no `package.json` do tarball.

---

## 3. Instalação (5 passos)

```bash
# 1. descompactar dentro do repositório do CRM
tar -xzf maxor-kit.tgz -C /tmp && cp -R /tmp/maxor-kit/src/* ./src/

# 2. instalar as peer deps que faltarem
bun add ogl lucide-react sonner zod clsx tailwind-merge class-variance-authority

# 3. importar os estilos (Tailwind v4 + tokens) no root do CRM
#    src/routes/__root.tsx:  import "@/styles.css"

# 4. (alternativa ao passo 3, se o CRM já tem seu próprio CSS)
#    injetar apenas as variáveis da marca:  maxorRootCss()

# 5. validar
bun run dev   # abra /kit-validador
```

---

## 4. Import único

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

### Injetar a identidade sem trocar o CSS do CRM

```ts
import { maxorRootCss } from "@/maxor-kit";

const style = document.createElement("style");
style.textContent = maxorRootCss();
document.head.appendChild(style);
```

---

## 5. Regras obrigatórias

1. **Efeitos são client-only.** `Aurora` e `SplashCursor` usam WebGL. Renderize
   com `React.lazy` dentro de `<ClientOnly>`; nunca importe estaticamente numa
   rota com SSR. Veja `src/routes/kit-validador.tsx` como referência.
2. **Server functions aplicam RLS como o usuário logado** (`requireSupabaseAuth`).
   Chame de componente via `useServerFn` ou de loader sob `_authenticated`.
   Nunca de loader de rota pública — o prerender não tem sessão e retorna 401.
3. **`src/start.ts` do CRM precisa do `attachSupabaseAuth`** em
   `functionMiddleware`, senão as chamadas autenticadas vão sem bearer token.
4. **Nada de Edge Functions novas.** Toda lógica de servidor é `createServerFn`;
   webhooks externos ficam em `src/routes/api/public/*` com validação de
   assinatura antes de qualquer escrita.
5. **Fotos de produto não são versionadas.** Use `productPlaceholder(slug, label)`
   até o CRM cadastrar mídia real; depois basta preencher `CatalogProduct.img`
   com a URL pública — a tipagem não muda.
6. **`modelId`** deve ser preenchido no cadastro de produto para que
   `getVariants()` agrupe corretamente as variações de cor.

---

## 6. Trocar os seeds estáticos por dados do CRM

Os arrays `catalog-data.ts`, `ofertas-data.ts`, `brands-data.ts` e
`colecao-data.ts` são seeds. Substitua por `createServerFn` lendo
`products` + `product_media`, **mantendo exatamente o shape de `CatalogProduct`**:

```ts
// src/lib/crm.catalog.functions.ts
export const listCatalog = createServerFn({ method: "GET" }).handler(async () => {
  // SELECT id, slug, name, brand, price, model_id, category, launch, media_url
  // -> mapear para CatalogProduct { id, name, brand, price, img, modelId, ... }
});
```

Nenhum componente do kit precisa ser alterado.

---

## 7. Mapa do banco usado pelo kit

| Tabela | Uso no kit |
|---|---|
| `organizations`, `user_roles` | multi-tenant + papéis (`has_role`, `is_org_member`) |
| `contacts` | `createLead`, `recordNewsletterSignup`, `importLeadsCsv` |
| `deals`, `pipelines`, `stages` | `createDeal`, `moveDealStage`, `listDeals` |
| `activities` | `addActivity`, `listTimeline`, webhook WhatsApp |
| `buyer_profiles` | área do cliente (`getMyBuyerProfile`, `upsertMyBuyerProfile`) |
| `buyer_favorites` | favoritos (`listMyFavorites`, `toggleFavorite`) |

Todas com RLS por `org_id` (CRM) ou `user_id` (comprador).

---

## 8. Checklist de aceite no CRM

- [ ] `/kit-validador` abre e mostra todas as verificações em **OK**
- [ ] Paleta e fontes Maxor aplicadas (fundo Navy, sem áreas brancas)
- [ ] Logos e ícones carregam da `MAXOR_ASSET_LIBRARY`
- [ ] `LogoLoop` roda com arraste e pausa no hover
- [ ] `Aurora`/`SplashCursor` só montam no cliente (sem erro de SSR)
- [ ] Sacola (`useCart`) persiste no `localStorage`
- [ ] Server functions autenticadas retornam dados do usuário logado
- [ ] `bun run build` e typecheck sem erros
