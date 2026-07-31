import { LOCAL_CATALOG_TABS, type CatalogTabKey, type CatalogTabs } from "@/lib/crm-catalog";
import type { CatalogProduct } from "@/components/site/CatalogPage";
import { getSectionProducts } from "@/lib/catalog";
import { useCatalogVersion } from "@/hooks/use-crm-sync";

/**
 * Catálogo por aba, já mesclado com os produtos publicados pelo CRM
 * (tabela compartilhada `public.products` com `site_visible = true`).
 */
export function useCrmCatalog(tab?: CatalogTabKey) {
  const version = useCatalogVersion();
  void version;

  const tabs: CatalogTabs = {
    ...LOCAL_CATALOG_TABS,
    masculino: getSectionProducts("masculino") as unknown as CatalogProduct[],
    feminino: getSectionProducts("feminino") as unknown as CatalogProduct[],
    infantil: getSectionProducts("infantil") as unknown as CatalogProduct[],
  };

  const products: CatalogProduct[] = tab ? (tabs[tab] ?? []) : [];
  return { tabs, products, source: "db" as const, loading: false };
}
