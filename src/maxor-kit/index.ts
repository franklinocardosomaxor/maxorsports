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
export { PROMO_COMBOS, type PromoCombo } from "@/components/site/ofertas-data";
export {
  BRANDS,
  getBrand,
  type Brand,
  type BrandAccent,
} from "@/components/site/brands-data";
export {
  ROUPAS,
  getRoupa,
  type RoupaCategory,
} from "@/components/site/roupas-data";
export {
  ALL_PRODUCTS,
  isPublished,
  normalizeProduct,
  getBrandProducts,
  getCategoryProducts,
  brandSlug,
  setCrmProducts,
  mergeCrmProducts,
  getSectionProducts,
  subscribeCatalog,

  getProduct,
  getVariants,
  brl,
  type ProductWithSection,
} from "@/lib/catalog";

export { useCrmSync, useCatalogVersion, CRM_API_URL, type CrmSyncStatus } from "@/hooks/use-crm-sync";
export { CrmSyncBanner } from "@/components/site/CrmSyncBanner";


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

export { fetchDbProducts, type DbProduct } from "@/lib/crm-db-catalog";
