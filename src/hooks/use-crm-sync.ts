import { useEffect, useState } from "react";
import { setCrmProducts, subscribeCatalog, getCatalogVersion } from "@/lib/catalog";
import { CRM_API_BASE_URL, CRM_CONFIGURED } from "@/lib/crm-catalog";

/** URL da API de catálogo do CRM Maxor (configure VITE_CRM_API_URL no .env). */
export const CRM_API_URL = `${CRM_API_BASE_URL}/api/site/catalog`;

export type CrmSyncStatus = {
  /** true enquanto a requisição ao CRM está em andamento */
  loading: boolean;
  /** true quando o catálogo do CRM foi aplicado com sucesso */
  loaded: boolean;
  /** mensagem de erro amigável quando o CRM não respondeu */
  error: string | null;
};

/**
 * Sincroniza o catálogo do site com o CRM Maxor.
 * Só executa quando `VITE_CRM_API_URL` aponta para uma URL pública.
 * Sem isso, o site usa o catálogo local em silêncio (sem erro na tela).
 */
export function useCrmSync(): CrmSyncStatus {
  const [status, setStatus] = useState<CrmSyncStatus>({
    loading: CRM_CONFIGURED,
    loaded: false,
    error: null,
  });

  useEffect(() => {
    if (!CRM_CONFIGURED) {
      setStatus({ loading: false, loaded: false, error: null });
      return;
    }

    const ctrl = new AbortController();

    fetch(CRM_API_URL, { signal: ctrl.signal, headers: { accept: "application/json" } })
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        const products = data?.products ?? data?.tabs?.todos;
        if (data?.ok !== false && Array.isArray(products) && products.length > 0) {
          setCrmProducts(products);
          setStatus({ loading: false, loaded: true, error: null });
        } else {
          setStatus({
            loading: false,
            loaded: false,
            error: "O CRM respondeu sem produtos — exibindo o catálogo local.",
          });
        }
      })
      .catch((err) => {
        if (ctrl.signal.aborted) return;
        console.error("Erro ao sincronizar com o CRM Maxor:", err);
        setStatus({
          loading: false,
          loaded: false,
          error: "Não foi possível conectar ao CRM Maxor — exibindo o catálogo local.",
        });
      });

    return () => ctrl.abort();
  }, []);

  return status;
}

/** Re-renderiza o componente sempre que o catálogo é atualizado pelo CRM. */
export function useCatalogVersion() {
  const [v, setV] = useState(getCatalogVersion);
  useEffect(() => subscribeCatalog(() => setV(getCatalogVersion())), []);
  return v;
}
