import { useEffect, useState } from "react";
import { getCatalogVersion, subscribeCatalog, mergeCrmProducts } from "@/lib/catalog";
import { CRM_API_BASE_URL } from "@/lib/crm-catalog";
import { fetchDbProducts } from "@/lib/crm-db-catalog";

/**
 * Sincronização com o banco compartilhado (Lovable Cloud / Supabase).
 *
 * O CRM Maxor grava em `public.products` com `site_visible = true` e o site
 * lê a MESMA tabela — não é necessária nenhuma chave/secret para exibir.
 * A chave `CRM_INGEST_SECRET` só é exigida quando o CRM envia produtos via
 * POST /api/public/crm/products.
 */
export const CRM_SYNC_ENABLED = true;

/** Mantido apenas por compatibilidade com o Maxor Kit. */
export const CRM_API_URL = `${CRM_API_BASE_URL}/api/site/catalog`;

export type CrmSyncStatus = {
  loading: boolean;
  loaded: boolean;
  error: string | null;
};

export function useCrmSync(): CrmSyncStatus {
  const [status, setStatus] = useState<CrmSyncStatus>({
    loading: true,
    loaded: false,
    error: null,
  });

  useEffect(() => {
    let alive = true;
    fetchDbProducts()
      .then((rows) => {
        if (!alive) return;
        mergeCrmProducts(rows);
        setStatus({ loading: false, loaded: true, error: null });
      })
      .catch((err) => {
        if (!alive) return;
        console.warn("[Maxor] catálogo do CRM indisponível — usando dados locais.", err);
        setStatus({ loading: false, loaded: false, error: null });
      });
    return () => {
      alive = false;
    };
  }, []);

  return status;
}

/** Re-renderiza o componente sempre que o catálogo local muda. */
export function useCatalogVersion() {
  const [v, setV] = useState(getCatalogVersion);
  useEffect(() => subscribeCatalog(() => setV(getCatalogVersion())), []);
  return v;
}
