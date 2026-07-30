import { LOCAL_CATALOG_TABS, type CatalogTabKey, type CatalogTabs } from "@/lib/crm-catalog";
import type { CatalogProduct } from "@/components/site/CatalogPage";

/**
 * MODO MOCK — sempre devolve o catálogo local, sem chamadas de rede.
 * Uso: const { products } = useCrmCatalog("masculino");
 */
export function useCrmCatalog(tab?: CatalogTabKey) {
  const tabs: CatalogTabs = LOCAL_CATALOG_TABS;
  const products: CatalogProduct[] = tab ? (tabs[tab] ?? []) : [];
  return { tabs, products, source: "local" as const, loading: false };
}
