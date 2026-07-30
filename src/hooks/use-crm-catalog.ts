import { useEffect, useState } from "react";
import {
  LOCAL_CATALOG_TABS,
  loadCatalogTabs,
  type CatalogTabKey,
  type CatalogTabs,
} from "@/lib/crm-catalog";
import type { CatalogProduct } from "@/components/site/CatalogPage";

/**
 * Consome o catálogo público do CRM Maxor Sports com fallback local.
 * Uso: const { products, source } = useCrmCatalog("masculino");
 */
export function useCrmCatalog(tab?: CatalogTabKey) {
  const [tabs, setTabs] = useState<CatalogTabs>(LOCAL_CATALOG_TABS);
  const [source, setSource] = useState<"crm" | "local">("local");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ctrl = new AbortController();
    let alive = true;
    loadCatalogTabs(ctrl.signal).then((res) => {
      if (!alive) return;
      setTabs(res.tabs);
      setSource(res.source);
      setLoading(false);
    });
    return () => {
      alive = false;
      ctrl.abort();
    };
  }, []);

  const products: CatalogProduct[] = tab ? (tabs[tab] ?? []) : [];
  return { tabs, products, source, loading };
}
