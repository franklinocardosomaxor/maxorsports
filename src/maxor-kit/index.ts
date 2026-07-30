/**
 * MAXOR KIT — ponto único de importação para o CRM Maxor.
 *
 * O CRM (ou qualquer app do ecossistema) importa TUDO daqui:
 *
 *   import {
 *     Shell, CatalogPage, Aurora, SplashCursor, LogoLoop,
 *     brandLogos, maxorColors, ALL_PRODUCTS, useCart,
 *   } from "@/maxor-kit";
 *
 * Regras:
 *  - Efeitos WebGL (Aurora / SplashCursor) são client-only: renderize atrás
 *    de <ClientOnly> ou React.lazy no ambiente do CRM (SSR não tem WebGL).
 *  - As `*.functions` são server functions do TanStack Start e já aplicam
 *    RLS como o usuário logado (middleware requireSupabaseAuth).
 *  - Estilos: importe `src/styles.css` ou injete `maxorRootCss()`.
 */

/* ---------------------------------------------------------------- tokens */
export * from "./tokens";

/* ------------------------------------------------------- biblioteca de mídia */
export * from "./assets";

/* -------------------------------------------------------------- efeitos */
export { default as Aurora } from "@/components/site/Aurora";
export { default as SplashCursor } from "@/components/site/SplashCursor";
export { LogoLoop, type LogoItem } from "@/components/site/LogoLoop";
export { ProductMiniCard } from "@/components/site/ProductMiniCard";

/* ------------------------------------------------------------ estrutura */
export { Shell } from "@/components/site/Shell";
export {
  CatalogPage,
  type CatalogProduct,
  type CatalogTheme,
} from "@/components/site/CatalogPage";

/* ------------------------------------------------------- dados / catálogo */
export { MASCULINO, FEMININO, INFANTIL } from "@/components/site/catalog-data";
export { OFERTAS, PROMO_COMBOS, type PromoCombo } from "@/components/site/ofertas-data";
export { COLECAO_MASCULINA, COLECAO_FEMININA } from "@/components/site/colecao-data";
export {
  BRANDS,
  BRAND_PRODUCTS,
  getBrand,
  type Brand,
  type BrandAccent,
} from "@/components/site/brands-data";
export {
  ROUPAS,
  ROUPA_PRODUCTS,
  getRoupa,
  type RoupaCategory,
} from "@/components/site/roupas-data";
export {
  ALL_PRODUCTS,
  getProduct,
  getVariants,
  brl,
  type ProductWithSection,
} from "@/lib/catalog";

/* -------------------------------------------- catálogo público do CRM */
export {
  CRM_API_BASE_URL,
  CRM_CATALOG_URL,
  LOCAL_CATALOG_TABS,
  fetchCrmCatalog,
  loadCatalogTabs,
  normalizeProduct,
  type CatalogTabKey,
  type CatalogTabs,
} from "@/lib/crm-catalog";
export { useCrmCatalog } from "@/hooks/use-crm-catalog";

/* ---------------------------------------------------- estado do comprador */
export { CartProvider, useCart, type CartItem } from "@/lib/cart";

/* --------------------------------------------- server functions (CRM/site) */
export { getMyBuyerProfile, upsertMyBuyerProfile } from "@/lib/buyer.functions";
export {
  listMyFavorites,
  listMyFavoriteIds,
  toggleFavorite,
  removeFavorite,
  type FavoriteRow,
} from "@/lib/favorites.functions";
export { createLead, listContacts, recordNewsletterSignup } from "@/lib/crm.contacts.functions";
export { createDeal, moveDealStage, listDeals } from "@/lib/crm.deals.functions";
export { addActivity, listTimeline } from "@/lib/crm.activities.functions";
export { searchByName, searchByImage, type ProductHit } from "@/lib/crm.image-search.functions";
export { importLeadsCsv } from "@/lib/crm.import.functions";
export { sendTransactional } from "@/lib/crm.email.functions";
export { sendWhatsappTemplate } from "@/lib/crm.whatsapp.functions";
