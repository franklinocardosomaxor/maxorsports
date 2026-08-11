import { useCallback, useEffect, useRef, useState } from "react";
import { getCatalogVersion, subscribeCatalog, mergeCrmProducts } from "@/lib/catalog";
import { fetchDbProducts } from "@/lib/crm-db-catalog";
import { supabase } from "@/integrations/supabase/client";

/**
 * Sincronização com o banco compartilhado (Lovable Cloud / Supabase).
 *
 * O CRM Maxor grava em `public.products` com `site_visible = true` e o site
 * lê a MESMA tabela — não é necessária nenhuma chave/secret para exibir.
 * A chave `CRM_INGEST_SECRET` só é exigida quando o CRM envia produtos via
 * POST /api/public/crm/products.
 *
 * Fluxo automático:
 *  1. Carga inicial ao abrir o site.
 *  2. Realtime (postgres_changes) — novo produto aparece em segundos.
 *  3. Fallback: revalidação a cada 60s e ao voltar o foco para a aba.
 */
export const CRM_SYNC_ENABLED = true;

/** Intervalo do fallback de revalidação (ms). */
const POLL_MS = 60_000;

/** Mantido apenas por compatibilidade com o Maxor Kit. */
/** Endpoint de ingestão/leitura do catálogo (mesma origem do site). */
export const CRM_API_URL = "/api/public/crm/products";

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
  const aliveRef = useRef(true);
  const inFlightRef = useRef(false);

  const refresh = useCallback(async () => {
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    try {
      const rows = await fetchDbProducts();
      if (!aliveRef.current) return;
      // setCrmProducts garante a limpeza do estado anterior e aplicação das regras de gating
      mergeCrmProducts(rows);
      setStatus({ loading: false, loaded: true, error: null });
    } catch (err) {
      if (!aliveRef.current) return;
      console.warn("[Maxor] catálogo do CRM indisponível.", err);
      setStatus((s) => ({ loading: false, loaded: s.loaded, error: null }));
    } finally {
      inFlightRef.current = false;
    }
  }, []);

  useEffect(() => {
    aliveRef.current = true;
    void refresh();

    // 2. Realtime: qualquer INSERT/UPDATE/DELETE em products recarrega o catálogo.
    const channel = supabase
      .channel("maxor-products-sync")
      .on("postgres_changes", { event: "*", schema: "public", table: "products" }, () => {
        void refresh();
      })
      .subscribe();

    // 3. Fallback por tempo e por foco/visibilidade.
    const interval = setInterval(() => void refresh(), POLL_MS);
    const onVisible = () => {
      if (document.visibilityState === "visible") void refresh();
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onVisible);

    return () => {
      aliveRef.current = false;
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onVisible);
      supabase.removeChannel(channel);
    };
  }, [refresh]);

  return status;
}

/** Re-renderiza o componente sempre que o catálogo local muda. */
export function useCatalogVersion() {
  const [v, setV] = useState(getCatalogVersion);
  useEffect(() => subscribeCatalog(() => setV(getCatalogVersion())), []);
  return v;
}
