import { useEffect, useState } from "react";
import { getCatalogVersion, subscribeCatalog } from "@/lib/catalog";
import { CRM_API_BASE_URL } from "@/lib/crm-catalog";

/**
 * MODO MOCK — a integração com o CRM está desativada.
 *
 * O site funciona 100% com o catálogo local (`src/components/site/catalog-data.ts`
 * e `ofertas-data.ts`), sem exigir nenhuma secret, URL de API ou banco.
 * Para reativar, restaure a busca em `fetchDbProducts()` / `CRM_API_URL`.
 */
export const CRM_SYNC_ENABLED = false;

/** Mantido apenas por compatibilidade com o Maxor Kit. */
export const CRM_API_URL = `${CRM_API_BASE_URL}/api/site/catalog`;

export type CrmSyncStatus = {
  loading: boolean;
  loaded: boolean;
  error: string | null;
};

/** No-op: retorna sempre "pronto", usando o catálogo local. */
export function useCrmSync(): CrmSyncStatus {
  return { loading: false, loaded: false, error: null };
}

/** Re-renderiza o componente sempre que o catálogo local muda. */
export function useCatalogVersion() {
  const [v, setV] = useState(getCatalogVersion);
  useEffect(() => subscribeCatalog(() => setV(getCatalogVersion())), []);
  return v;
}
